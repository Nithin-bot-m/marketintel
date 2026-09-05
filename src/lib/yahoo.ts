// Server-only live market data client — Yahoo Finance chart/spark endpoints.
import type { LiveQuote, MarketSnapshot, Ticker } from "@/lib/types";

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const HOSTS = ["https://query1.finance.yahoo.com", "https://query2.finance.yahoo.com"];
let hostIdx = 0;

/* ------------------------- cookie handshake ------------------------- */

let cookieStr = "";
let cookieAt = 0;

function mergeSetCookie(headers: Headers) {
  const raw = headers.getSetCookie?.() ?? [];
  for (const line of raw) {
    const kv = line.split(";")[0];
    const [name] = kv.split("=");
    const re = new RegExp(`(^|;\\s*)${name}=[^;]*`);
    if (re.test(cookieStr)) cookieStr = cookieStr.replace(re, `$1${kv}`);
    else cookieStr = cookieStr ? `${cookieStr}; ${kv}` : kv;
  }
}

async function ensureCookies(force = false) {
  if (!force && cookieStr && Date.now() - cookieAt < 25 * 60_000) return;
  try {
    const res = await fetch("https://fc.yahoo.com", {
      headers: { "User-Agent": UA, Accept: "text/html" },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    mergeSetCookie(res.headers);
  } catch {
    /* non-fatal — some IPs get cookies from the query hosts themselves */
  }
  cookieAt = Date.now();
}

/* ------------------------------ fetch ------------------------------ */

let lastRequestAt = 0;
const MIN_GAP_MS = 350; // gentle pacing between upstream calls

async function pace() {
  const gap = Date.now() - lastRequestAt;
  if (gap < MIN_GAP_MS) await new Promise((r) => setTimeout(r, MIN_GAP_MS - gap));
  lastRequestAt = Date.now();
}

async function fetchYahooJSON(path: string): Promise<unknown> {
  await ensureCookies();
  for (let attempt = 0; attempt < 2; attempt++) {
    await pace();
    const host = HOSTS[hostIdx % HOSTS.length];
    const res = await fetch(`${host}${path}`, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://finance.yahoo.com/",
        ...(cookieStr ? { Cookie: cookieStr } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });
    if (res.status === 429 || res.status === 401 || res.status === 403) {
      // refresh cookies, flip host, back off, retry once
      hostIdx++;
      cookieStr = "";
      await ensureCookies(true);
      await new Promise((r) => setTimeout(r, 1500 + attempt * 1500));
      continue;
    }
    if (!res.ok) throw new Error(`yahoo ${res.status} for ${path.slice(0, 60)}`);
    return res.json();
  }
  throw new Error(`yahoo exhausted retries for ${path.slice(0, 60)}`);
}

/* ------------------------------ caching ------------------------------ */

interface Entry {
  data?: unknown;
  at: number;
  failAt?: number;
  inflight?: Promise<unknown>;
}
const store = new Map<string, Entry>();
const FAIL_BACKOFF_MS = 45_000;

async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
): Promise<{ data: T; stale: boolean }> {
  const now = Date.now();
  const e = store.get(key) ?? { at: 0 };

  if (e.data && now - e.at < ttlMs) return { data: e.data as T, stale: false };
  // failing upstream + we have old data → serve stale, back off
  if (e.data && e.failAt && now - e.failAt < FAIL_BACKOFF_MS)
    return { data: e.data as T, stale: true };
  if (e.inflight) {
    try {
      return { data: (await e.inflight) as T, stale: false };
    } catch {
      if (e.data) return { data: e.data as T, stale: true };
      throw e.inflight;
    }
  }

  const inflight = load();
  store.set(key, { ...e, inflight });
  try {
    const data = await inflight;
    store.set(key, { data, at: Date.now() });
    return { data, stale: false };
  } catch (err) {
    store.set(key, { ...(store.get(key) ?? { at: 0 }), failAt: Date.now() });
    if (e.data) return { data: e.data as T, stale: true };
    throw err;
  } finally {
    const cur = store.get(key);
    if (cur?.inflight) delete cur.inflight;
  }
}

/* ---------------------------- parsers ---------------------------- */

interface RawChart {
  chart?: {
    result?: Array<{
      meta?: Record<string, number | string | undefined>;
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
  };
}

export interface ParsedChart {
  symbol: string;
  name: string;
  price: number;
  prevClose: number;
  change: number;
  changePct: number;
  dayHigh?: number;
  dayLow?: number;
  fiftyTwoHigh?: number;
  fiftyTwoLow?: number;
  asOf?: number;
  candles: { t: number; o: number; h: number; l: number; c: number; v: number }[];
}

function num(v: unknown): number {
  return typeof v === "number" && isFinite(v) ? v : 0;
}

export function parseChart(json: RawChart, symbol: string): ParsedChart {
  const r = json.chart?.result?.[0];
  if (!r || !r.meta) throw new Error(`no chart data for ${symbol}`);
  const m = r.meta;
  const price = num(m.regularMarketPrice);
  const prevClose = num(m.chartPreviousClose) || num(m.previousClose) || price;
  const ts = m.regularMarketTime as number | undefined;

  const q = r.indicators?.quote?.[0] ?? {};
  const candles: ParsedChart["candles"] = [];
  const tsArr = r.timestamp ?? [];
  for (let i = 0; i < tsArr.length; i++) {
    const o = q.open?.[i];
    const h = q.high?.[i];
    const l = q.low?.[i];
    const c = q.close?.[i];
    if (o == null || h == null || l == null || c == null) continue;
    candles.push({
      t: tsArr[i] * 1000,
      o,
      h,
      l,
      c,
      v: q.volume?.[i] ?? 0,
    });
  }

  return {
    symbol,
    name: (m.longName as string) || (m.shortName as string) || symbol,
    price,
    prevClose,
    change: price - prevClose,
    changePct: prevClose ? ((price - prevClose) / prevClose) * 100 : 0,
    dayHigh: num(m.regularMarketDayHigh) || undefined,
    dayLow: num(m.regularMarketDayLow) || undefined,
    fiftyTwoHigh: num(m.fiftyTwoWeekHigh) || undefined,
    fiftyTwoLow: num(m.fiftyTwoWeekLow) || undefined,
    asOf: ts ? ts * 1000 : undefined,
    candles,
  };
}

/* --------------------------- public API --------------------------- */

const enc = encodeURIComponent;

export async function getChart(
  symbol: string,
  interval: "1m" | "5m" | "1d",
  range: "1d" | "5d" | "1mo",
): Promise<{ chart: ParsedChart; stale: boolean }> {
  const ttl = interval === "1m" ? 60_000 : interval === "5m" ? 150_000 : 900_000;
  const { data, stale } = await cached(
    `chart:${symbol}:${interval}:${range}`,
    ttl,
    async () => {
      const json = (await fetchYahooJSON(
        `/v8/finance/chart/${enc(symbol)}?interval=${interval}&range=${range}&includePrePost=false`,
      )) as RawChart;
      return parseChart(json, symbol);
    },
  );
  return { chart: data, stale };
}

/** Spark: up to 20 symbols in one call — meta + close series. */
interface SparkRow {
  price: number;
  prevClose: number;
  name: string;
  asOf?: number;
  closes: number[];
}
async function sparkBatch(
  symbols: string[],
  range = "1d",
  interval = "15m",
): Promise<{ data: Record<string, SparkRow>; stale: boolean }> {
  return cached(`spark:${symbols.join(",")}:${range}:${interval}`, 45_000, async () => {
    const json = (await fetchYahooJSON(
      `/v7/finance/spark?symbols=${symbols.map(enc).join(",")}&range=${range}&interval=${interval}`,
    )) as {
      spark?: {
        result?: Array<{
          symbol: string;
          response?: Array<{
            meta?: Record<string, number | string | undefined>;
            timestamp?: number[];
            indicators?: { quote?: Array<{ close?: (number | null)[] }> };
          }>;
        }>;
      };
    };
    const out: Record<string, SparkRow> = {};
    for (const r of json.spark?.result ?? []) {
      const resp = r.response?.[0];
      const m = resp?.meta;
      if (!m) continue;
      const price = num(m.regularMarketPrice);
      const prevClose = num(m.chartPreviousClose) || num(m.previousClose) || price;
      if (!price) continue;
      const closes = (resp?.indicators?.quote?.[0]?.close ?? []).filter(
        (v): v is number => typeof v === "number" && isFinite(v),
      );
      out[r.symbol] = {
        price,
        prevClose,
        name: (m.longName as string) || (m.shortName as string) || r.symbol,
        asOf: m.regularMarketTime ? num(m.regularMarketTime) * 1000 : undefined,
        closes,
      };
    }
    return out;
  });
}

/* ------------------------- instrument maps ------------------------- */

const INDEX_SYMS: { sym: string; symbol: string; name: string }[] = [
  { sym: "^NSEI", symbol: "NIFTY 50", name: "NSE Benchmark" },
  { sym: "^BSESN", symbol: "SENSEX", name: "BSE Benchmark" },
  { sym: "^NSEBANK", symbol: "NIFTY BANK", name: "Banking Pack" },
  { sym: "^CNXIT", symbol: "NIFTY IT", name: "Tech Pack" },
];

const SECTOR_SYMS: { sym: string; label: string }[] = [
  { sym: "^CNXAUTO", label: "Auto" },
  { sym: "^CNXPHARMA", label: "Pharma" },
  { sym: "^CNXFMCG", label: "FMCG" },
  { sym: "^CNXMETAL", label: "Metal" },
  { sym: "^CNXMEDIA", label: "Media" },
  { sym: "^CNXPSUBANK", label: "PSU Bank" },
];

const TAPE_STOCKS: { sym: string; name: string }[] = [
  { sym: "RELIANCE.NS", name: "Reliance Industries" },
  { sym: "HDFCBANK.NS", name: "HDFC Bank" },
  { sym: "TCS.NS", name: "Tata Consultancy" },
  { sym: "INFY.NS", name: "Infosys" },
  { sym: "ICICIBANK.NS", name: "ICICI Bank" },
  { sym: "BHARTIARTL.NS", name: "Bharti Airtel" },
  { sym: "ITC.NS", name: "ITC Ltd" },
  { sym: "SBIN.NS", name: "State Bank of India" },
  { sym: "LT.NS", name: "Larsen & Toubro" },
  { sym: "AXISBANK.NS", name: "Axis Bank" },
  { sym: "HINDALCO.NS", name: "Hindalco" },
  { sym: "TATASTEEL.NS", name: "Tata Steel" },
  { sym: "SUNPHARMA.NS", name: "Sun Pharma" },
  { sym: "TRENT.NS", name: "Trent" },
];

const GLOBAL_SYMS: { sym: string; symbol: string; name: string }[] = [
  { sym: "INR=X", symbol: "USD/INR", name: "US Dollar / INR" },
  { sym: "BZ=F", symbol: "BRENT", name: "Brent Crude (bbl)" },
  { sym: "GC=F", symbol: "GOLD", name: "Gold (COMEX, oz)" },
  { sym: "^INDIAVIX", symbol: "INDIA VIX", name: "Volatility Index" },
];

/** NIFTY-50 basket for breadth + movers (3 spark batches of ≤20). */
const BASKET = [
  "RELIANCE.NS", "HDFCBANK.NS", "ICICIBANK.NS", "INFY.NS", "TCS.NS",
  "BHARTIARTL.NS", "ITC.NS", "LT.NS", "SBIN.NS", "AXISBANK.NS",
  "KOTAKBANK.NS", "M&M.NS", "MARUTI.NS", "TITAN.NS", "ASIANPAINT.NS",
  "HINDUNILVR.NS", "BAJFINANCE.NS", "BAJFINSV.NS", "HCLTECH.NS", "WIPRO.NS",
  "ULTRACEMCO.NS", "SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "NESTLEIND.NS",
  "HINDALCO.NS", "TATASTEEL.NS", "JSWSTEEL.NS", "COALINDIA.NS", "NTPC.NS",
  "POWERGRID.NS", "ONGC.NS", "ADANIENT.NS", "ADANIPORTS.NS", "APOLLOHOSP.NS",
  "BAJAJ-AUTO.NS", "BRITANNIA.NS", "DIVISLAB.NS", "EICHERMOT.NS", "GRASIM.NS",
  "HEROMOTOCO.NS", "INDUSINDBK.NS", "TECHM.NS", "TATACONSUM.NS", "TRENT.NS",
  "SHRIRAMFIN.NS", "BEL.NS", "JIOFIN.NS", "LTIM.NS", "SBILIFE.NS",
];

function shortName(sym: string): string {
  return sym.replace(".NS", "").replace("&", "&");
}

/* --------------------------- market status --------------------------- */

function istParts(d = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return {
    time: `${get("hour")}:${get("minute")}:${get("second")}`,
    date: `${get("weekday")}, ${get("day")} ${get("month")} ${get("year")}`,
    weekday: get("weekday"),
    minutes: parseInt(get("hour")) * 60 + parseInt(get("minute")),
  };
}

function nextOpenLabel(weekday: string): string {
  return weekday === "Sat" ? "Opens Mon 9:15 AM IST" : "Opens tomorrow 9:15 AM IST";
}

export function marketStatus(now = new Date()) {
  const p = istParts(now);
  const weekend = p.weekday === "Sat" || p.weekday === "Sun";
  if (weekend)
    return {
      state: "closed" as const,
      label: "MARKET CLOSED",
      detail: nextOpenLabel(p.weekday),
      istTime: p.time,
      istDate: p.date,
    };
  if (p.minutes >= 540 && p.minutes < 555)
    return {
      state: "preopen" as const,
      label: "PRE-OPEN",
      detail: "Session begins 9:15 AM IST",
      istTime: p.time,
      istDate: p.date,
    };
  if (p.minutes >= 555 && p.minutes <= 930)
    return {
      state: "open" as const,
      label: "MARKET LIVE",
      detail: "Closes 3:30 PM IST",
      istTime: p.time,
      istDate: p.date,
    };
  return {
    state: "closed" as const,
    label: "MARKET CLOSED",
    detail: nextOpenLabel(p.weekday),
    istTime: p.time,
    istDate: p.date,
  };
}

/* --------------------------- snapshot --------------------------- */

async function buildTapeAndIndices() {
  // batch 1: 4 indices + 6 sectors + 4 globals = 14 symbols (one call)
  const batch1 = [
    ...INDEX_SYMS.map((i) => i.sym),
    ...SECTOR_SYMS.map((s) => s.sym),
    ...GLOBAL_SYMS.map((g) => g.sym),
  ];
  const stockBatches: string[][] = [
    TAPE_STOCKS.slice(0, 14).map((s) => s.sym),
  ];

  const [b1, b2] = await Promise.all([sparkBatch(batch1), sparkBatch(stockBatches[0])]);
  const all = { ...b1.data, ...b2.data };

  const toQuote = (sym: string, symbol: string, name: string): LiveQuote | null => {
    const d = all[sym];
    if (!d) return null;
    return {
      symbol,
      name,
      price: d.price,
      prevClose: d.prevClose,
      change: d.price - d.prevClose,
      changePct: d.prevClose ? ((d.price - d.prevClose) / d.prevClose) * 100 : 0,
      asOf: d.asOf,
    };
  };

  const indices = INDEX_SYMS.map((i) => toQuote(i.sym, i.symbol, i.name)).filter(
    Boolean,
  ) as LiveQuote[];

  const sectors = SECTOR_SYMS.map((s) => {
    const q = toQuote(s.sym, s.sym, s.label);
    return q ? { symbol: s.sym, label: s.label, price: q.price, changePct: q.changePct } : null;
  }).filter(Boolean) as { symbol: string; label: string; price: number; changePct: number }[];

  const vixRaw = all["^INDIAVIX"];
  const vix = vixRaw
    ? {
        price: vixRaw.price,
        changePct: vixRaw.prevClose ? ((vixRaw.price - vixRaw.prevClose) / vixRaw.prevClose) * 100 : 0,
      }
    : null;

  const tickers: Ticker[] = [];
  for (const s of TAPE_STOCKS) {
    const q = toQuote(s.sym, shortName(s.sym), s.name);
    if (q) tickers.push({ ...q, trend: q.changePct >= 0 ? "up" : "down" });
  }
  for (const g of GLOBAL_SYMS) {
    const q = toQuote(g.sym, g.symbol, g.name);
    if (q) tickers.push({ ...q, trend: q.changePct >= 0 ? "up" : "down" });
  }

  return { indices, sectors, vix, tickers };
}

async function buildBreadth() {
  const batches = [BASKET.slice(0, 20), BASKET.slice(20, 40), BASKET.slice(40)];
  const res = await Promise.all(batches.map((b) => sparkBatch(b, "5d", "1d")));
  const all = Object.assign({}, ...res.map((r) => r.data)) as Record<string, SparkRow>;
  // For range=5d/interval=1d, meta prevClose points ~4 sessions back —
  // derive the true day change from the close series instead.
  const rows = Object.entries(all)
    .map(([sym, d]) => {
      const n = d.closes.length;
      if (n < 2) return null;
      const price = d.closes[n - 1];
      const prev = d.closes[n - 2];
      if (!price || !prev) return null;
      return { sym, name: d.name, price, changePct: ((price - prev) / prev) * 100 };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  if (!rows.length) return null;

  const advancers = rows.filter((r) => r.changePct > 0.001).length;
  const decliners = rows.filter((r) => r.changePct < -0.001).length;
  const unchanged = rows.length - advancers - decliners;
  const sorted = [...rows].sort((a, b) => b.changePct - a.changePct);
  const toMover = (r: (typeof rows)[number]) => ({
    symbol: shortName(r.sym),
    name: r.name,
    changePct: r.changePct,
    price: r.price,
  });

  return {
    breadth: {
      advancers,
      decliners,
      unchanged,
      total: rows.length,
      universe: "NIFTY 50 large caps",
    },
    movers: {
      gainers: sorted.slice(0, 4).map(toMover),
      losers: sorted.slice(-4).reverse().map(toMover),
    },
  };
}

export async function getSnapshot(): Promise<MarketSnapshot> {
  const { data: tape, stale: tapeStale } = await cached(
    "snapshot-core",
    45_000,
    buildTapeAndIndices,
  );
  let breadthBlock: Awaited<ReturnType<typeof buildBreadth>> = null;
  try {
    breadthBlock = (await cached("snapshot-breadth", 300_000, buildBreadth)).data;
  } catch {
    /* breadth is optional */
  }

  return {
    ts: Date.now(),
    stale: tapeStale,
    status: marketStatus(),
    indices: tape.indices,
    vix: tape.vix,
    sectors: tape.sectors,
    tickers: tape.tickers,
    breadth: breadthBlock?.breadth ?? null,
    movers: breadthBlock?.movers ?? null,
  };
}
