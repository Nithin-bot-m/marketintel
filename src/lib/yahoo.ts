// Server-only live market data client — Yahoo Finance chart/spark endpoints + OANDA live feed.
import type { LiveQuote, MarketSnapshot, Ticker } from "@/lib/types";
import { fetchOandaQuotes } from "./oanda";

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

export function normalizeSymbol(s: string): string {
  const up = s.toUpperCase().trim();
  if (up === "XAUUSD" || up === "XAUUSD=X" || up === "GOLD" || up === "XAU") return "GC=F";
  if (up === "XAGUSD" || up === "XAGUSD=X" || up === "SILVER" || up === "XAG") return "SI=F";
  if (up === "DXY" || up === "USDX") return "DX-Y.NYB";
  return up;
}

export async function getChart(
  rawSymbol: string,
  interval: "1m" | "5m" | "1d",
  range: "1d" | "5d" | "1mo",
): Promise<{ chart: ParsedChart; stale: boolean }> {
  const symbol = normalizeSymbol(rawSymbol);
  const ttl = interval === "1m" ? 45_000 : interval === "5m" ? 120_000 : 900_000;
  
  const { data, stale } = await cached(
    `chart:${symbol}:${interval}:${range}`,
    ttl,
    async () => {
      // For 1m interval, if range=1d returns 0 bars (e.g. weekend close), fall back to range=5d
      let fetchRange = range;
      let json = (await fetchYahooJSON(
        `/v8/finance/chart/${enc(symbol)}?interval=${interval}&range=${fetchRange}&includePrePost=false`,
      )) as RawChart;

      let parsed = parseChart(json, symbol);
      if (interval === "1m" && range === "1d" && parsed.candles.length === 0) {
        // Fall back to 5d to fetch the last active session's bars
        const fbJson = (await fetchYahooJSON(
          `/v8/finance/chart/${enc(symbol)}?interval=1m&range=5d&includePrePost=false`,
        )) as RawChart;
        parsed = parseChart(fbJson, symbol);
        // Slice the most recent active session (up to 360 bars = 6 hours of 1m trading)
        if (parsed.candles.length > 360) {
          parsed.candles = parsed.candles.slice(-360);
        }
      } else if (parsed.candles.length > 400) {
        parsed.candles = parsed.candles.slice(-400);
      }

      // Display name and OANDA spot calibration
      if (symbol === "GC=F" || symbol.includes("XAU")) {
        try {
          const oanda = await fetchOandaQuotes();
          const xau = oanda["OANDA:XAUUSD"];
          if (xau && parsed.candles.length > 0) {
            // Detect and remove any end-of-day futures settlement jump (>10 points)
            let refClose = parsed.candles[parsed.candles.length - 1].c;
            for (let i = parsed.candles.length - 1; i >= Math.max(0, parsed.candles.length - 6); i--) {
              const bar = parsed.candles[i];
              const prev = parsed.candles[i - 1];
              if (prev && Math.abs(bar.c - prev.c) > 8) {
                refClose = prev.c;
                parsed.candles = parsed.candles.slice(0, i);
                break;
              }
            }

            if (refClose > 0) {
              const ratio = xau.price / refClose;
              parsed.candles = parsed.candles.map((c) => ({
                ...c,
                o: Number((c.o * ratio).toFixed(2)),
                h: Number((c.h * ratio).toFixed(2)),
                l: Number((c.l * ratio).toFixed(2)),
                c: Number((c.c * ratio).toFixed(2)),
              }));
              // Append a live candle at exact OANDA spot price
              const lastC = parsed.candles[parsed.candles.length - 1];
              if (lastC) {
                parsed.candles.push({
                  t: lastC.t + 60_000,
                  o: lastC.c,
                  h: Number(Math.max(lastC.c, xau.price + 0.25).toFixed(2)),
                  l: Number(Math.min(lastC.c, xau.price - 0.25).toFixed(2)),
                  c: xau.price,
                  v: 42,
                });
              }
              parsed.prevClose = xau.prevClose || Number((parsed.prevClose * ratio).toFixed(2));
            }
          }
        } catch {
          // keep parsed as is if oanda fails
        }
        parsed.name = "Gold Spot / US Dollar (OANDA:XAUUSD)";
      } else if (symbol === "SI=F") {
        parsed.name = "Silver Spot / US Dollar (XAG/USD)";
      }

      return parsed;
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

/* ------------------------- instrument maps (Forex & Gold) ------------------------- */

export const MAJOR_PAIRS: { sym: string; symbol: string; name: string; precision: number }[] = [
  { sym: "GC=F", symbol: "XAU/USD", name: "Gold Spot (oz)", precision: 2 },
  { sym: "EURUSD=X", symbol: "EUR/USD", name: "Euro / US Dollar", precision: 4 },
  { sym: "GBPUSD=X", symbol: "GBP/USD", name: "British Pound / USD", precision: 4 },
  { sym: "USDJPY=X", symbol: "USD/JPY", name: "US Dollar / Japanese Yen", precision: 2 },
];

export const SECONDARY_PAIRS: { sym: string; label: string; name: string; precision: number }[] = [
  { sym: "AUDUSD=X", label: "AUD/USD", name: "Australian Dollar", precision: 4 },
  { sym: "USDCAD=X", label: "USD/CAD", name: "Canadian Dollar", precision: 4 },
  { sym: "USDCHF=X", label: "USD/CHF", name: "Swiss Franc", precision: 4 },
  { sym: "NZDUSD=X", label: "NZD/USD", name: "New Zealand Dollar", precision: 4 },
  { sym: "EURGBP=X", label: "EUR/GBP", name: "Euro / Pound Cross", precision: 4 },
  { sym: "GBPJPY=X", label: "GBP/JPY", name: "Pound / Yen Cross", precision: 2 },
];

export const TAPE_SYMBOLS: { sym: string; symbol: string; name: string; precision: number }[] = [
  { sym: "GC=F", symbol: "XAU/USD", name: "Gold Spot", precision: 2 },
  { sym: "EURUSD=X", symbol: "EUR/USD", name: "Euro / USD", precision: 4 },
  { sym: "GBPUSD=X", symbol: "GBP/USD", name: "Cable", precision: 4 },
  { sym: "USDJPY=X", symbol: "USD/JPY", name: "Dollar / Yen", precision: 2 },
  { sym: "SI=F", symbol: "XAG/USD", name: "Silver Spot", precision: 3 },
  { sym: "AUDUSD=X", symbol: "AUD/USD", name: "Aussie / USD", precision: 4 },
  { sym: "USDCAD=X", symbol: "USD/CAD", name: "Dollar / CAD", precision: 4 },
  { sym: "USDCHF=X", symbol: "USD/CHF", name: "Dollar / Swissie", precision: 4 },
  { sym: "NZDUSD=X", symbol: "NZD/USD", name: "Kiwi / USD", precision: 4 },
  { sym: "EURJPY=X", symbol: "EUR/JPY", name: "Euro / Yen", precision: 2 },
  { sym: "GBPJPY=X", symbol: "GBP/JPY", name: "Pound / Yen", precision: 2 },
  { sym: "EURGBP=X", symbol: "EUR/GBP", name: "Euro / Pound", precision: 4 },
  { sym: "CL=F", symbol: "WTI CRUDE", name: "Crude Oil (bbl)", precision: 2 },
  { sym: "DX-Y.NYB", symbol: "DXY", name: "US Dollar Index", precision: 2 },
  { sym: "BTC-USD", symbol: "BTC/USD", name: "Bitcoin / USD", precision: 2 },
  { sym: "ETH-USD", symbol: "ETH/USD", name: "Ethereum / USD", precision: 2 },
];

export const GLOBAL_SYMS: { sym: string; symbol: string; name: string; precision: number }[] = [
  { sym: "DX-Y.NYB", symbol: "DXY", name: "US Dollar Index", precision: 2 },
  { sym: "^VIX", symbol: "VIX", name: "Volatility Index", precision: 2 },
  { sym: "GC=F", symbol: "GOLD", name: "Gold (COMEX oz)", precision: 2 },
  { sym: "BZ=F", symbol: "BRENT", name: "Brent Crude", precision: 2 },
];

/** Basket of 20 major/cross pairs + metals for breadth & movers */
export const BASKET = [
  "EURUSD=X", "GBPUSD=X", "USDJPY=X", "AUDUSD=X", "USDCAD=X",
  "USDCHF=X", "NZDUSD=X", "EURJPY=X", "GBPJPY=X", "EURGBP=X",
  "AUDJPY=X", "CADJPY=X", "CHFJPY=X", "EURAUD=X", "EURCAD=X",
  "GBPAUD=X", "GBPCAD=X", "AUDNZD=X", "GC=F", "SI=F",
];

function shortName(sym: string): string {
  if (sym === "GC=F") return "XAU/USD";
  if (sym === "SI=F") return "XAG/USD";
  if (sym === "DX-Y.NYB") return "DXY";
  if (sym === "CL=F") return "WTI";
  if (sym === "BZ=F") return "BRENT";
  if (sym === "^VIX") return "VIX";
  return sym.replace("=X", "").replace("-USD", "/USD");
}

/* --------------------------- 24/5 Forex market status --------------------------- */

export function marketStatus(now = new Date()) {
  const day = now.getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  const hour = now.getUTCHours();
  const min = now.getUTCMinutes();
  const utcMins = hour * 60 + min;

  const fmtTime = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(now.getUTCSeconds()).padStart(2, "0")} GMT`;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = `${days[day]}, ${now.getUTCDate()} ${months[now.getUTCMonth()]} ${now.getUTCFullYear()}`;

  // Weekend check: Friday 22:00 GMT to Sunday 21:00 GMT
  const isFridayAfterClose = day === 5 && utcMins >= 22 * 60;
  const isSaturday = day === 6;
  const isSundayBeforeOpen = day === 0 && utcMins < 21 * 60;
  const isWeekend = isFridayAfterClose || isSaturday || isSundayBeforeOpen;

  if (isWeekend) {
    return {
      state: "closed" as const,
      label: "WEEKEND CLOSE",
      detail: "Opens Sun 5:00 PM EST (Wellington / Sydney)",
      activeSessions: [],
      gmtTime: fmtTime,
      gmtDate: fmtDate,
      sessionTime: fmtTime,
    };
  }

  // Determine active sessions
  const activeSessions: string[] = [];
  // Sydney: 22:00 - 07:00 GMT
  if (utcMins >= 22 * 60 || utcMins < 7 * 60) activeSessions.push("Sydney");
  // Tokyo: 00:00 - 09:00 GMT
  if (utcMins >= 0 && utcMins < 9 * 60) activeSessions.push("Tokyo");
  // London: 08:00 - 17:00 GMT
  if (utcMins >= 8 * 60 && utcMins < 17 * 60) activeSessions.push("London");
  // New York: 13:00 - 22:00 GMT
  if (utcMins >= 13 * 60 && utcMins < 22 * 60) activeSessions.push("New York");

  let label = "MARKET LIVE";
  let detail = "Interbank FX Active";

  if (activeSessions.includes("London") && activeSessions.includes("New York")) {
    label = "LONDON · NY OVERLAP";
    detail = "Peak Global Interbank Liquidity";
  } else if (activeSessions.includes("Tokyo") && activeSessions.includes("London")) {
    label = "TOKYO · LONDON OVERLAP";
    detail = "European Open & Asian Session";
  } else if (activeSessions.includes("London")) {
    label = "LONDON SESSION";
    detail = "European Trading Active";
  } else if (activeSessions.includes("New York")) {
    label = "NEW YORK SESSION";
    detail = "Americas Interbank Active";
  } else if (activeSessions.includes("Tokyo")) {
    label = "ASIAN SESSION (TOKYO)";
    detail = "Asia-Pacific Trading Active";
  } else if (activeSessions.includes("Sydney")) {
    label = "SYDNEY SESSION";
    detail = "Pacific Market Open";
  }

  return {
    state: "open" as const,
    label,
    detail,
    activeSessions,
    gmtTime: fmtTime,
    gmtDate: fmtDate,
    sessionTime: fmtTime,
  };
}

/* --------------------------- snapshot --------------------------- */

async function buildTapeAndIndices() {
  const batch1 = [
    ...MAJOR_PAIRS.map((i) => i.sym),
    ...SECONDARY_PAIRS.map((s) => s.sym),
    ...GLOBAL_SYMS.map((g) => g.sym),
  ];
  const batch2 = TAPE_SYMBOLS.map((s) => s.sym);

  const [b1, b2] = await Promise.all([sparkBatch(batch1), sparkBatch(batch2)]);
  const all = { ...b1.data, ...b2.data };

  const toQuote = (sym: string, symbol: string, name: string, precision = 4): LiveQuote | null => {
    const d = all[sym];
    if (!d) return null;
    return {
      symbol,
      name,
      price: d.price,
      prevClose: d.prevClose,
      change: d.price - d.prevClose,
      changePct: d.prevClose ? ((d.price - d.prevClose) / d.prevClose) * 100 : 0,
      precision,
      asOf: d.asOf,
    };
  };

  let oandaQuotes: Record<string, any> = {};
  try {
    oandaQuotes = await fetchOandaQuotes();
  } catch {}

  const indices = MAJOR_PAIRS.map((i) => {
    let oandaKey = "";
    if (i.symbol === "XAU/USD") oandaKey = "OANDA:XAUUSD";
    else if (i.symbol === "EUR/USD") oandaKey = "OANDA:EURUSD";
    else if (i.symbol === "GBP/USD") oandaKey = "OANDA:GBPUSD";
    else if (i.symbol === "USD/JPY") oandaKey = "OANDA:USDJPY";

    if (oandaKey && oandaQuotes[oandaKey]) {
      const oq = oandaQuotes[oandaKey];
      return {
        ...oq,
        symbol: i.symbol,
        name: i.name,
      };
    }
    return toQuote(i.sym, i.symbol, i.name, i.precision);
  }).filter(Boolean) as LiveQuote[];

  const sectors = SECONDARY_PAIRS.map((s) => {
    const q = toQuote(s.sym, s.label, s.name, s.precision);
    return q ? { symbol: s.label, label: s.label, price: q.price, changePct: q.changePct } : null;
  }).filter(Boolean) as { symbol: string; label: string; price: number; changePct: number }[];

  const dxyRaw = all["DX-Y.NYB"];
  const dxy = dxyRaw
    ? {
        price: dxyRaw.price,
        changePct: dxyRaw.prevClose ? ((dxyRaw.price - dxyRaw.prevClose) / dxyRaw.prevClose) * 100 : 0,
      }
    : null;

  const vixRaw = all["^VIX"];
  const vix = vixRaw
    ? {
        price: vixRaw.price,
        changePct: vixRaw.prevClose ? ((vixRaw.price - vixRaw.prevClose) / vixRaw.prevClose) * 100 : 0,
      }
    : null;

  const tickers: Ticker[] = [];
  for (const s of TAPE_SYMBOLS) {
    let oandaKey = "";
    if (s.symbol === "XAU/USD") oandaKey = "OANDA:XAUUSD";
    else if (s.symbol === "EUR/USD") oandaKey = "OANDA:EURUSD";
    else if (s.symbol === "GBP/USD") oandaKey = "OANDA:GBPUSD";
    else if (s.symbol === "USD/JPY") oandaKey = "OANDA:USDJPY";

    let q: LiveQuote | null = null;
    if (oandaKey && oandaQuotes[oandaKey]) {
      const oq = oandaQuotes[oandaKey];
      q = { ...oq, symbol: s.symbol, name: s.name };
    } else {
      q = toQuote(s.sym, s.symbol, s.name, s.precision);
    }
    if (q) tickers.push({ ...q, trend: q.changePct >= 0 ? "up" : "down" });
  }

  return { indices, sectors, dxy, vix, tickers };
}

async function buildBreadth() {
  const res = await sparkBatch(BASKET, "5d", "1d");
  const all = res.data;
  
  const rows = Object.entries(all)
    .map(([sym, d]) => {
      const n = d.closes.length;
      if (n < 2) return null;
      const price = d.closes[n - 1];
      const prev = d.closes[n - 2];
      if (!price || !prev) return null;
      return {
        sym,
        name: d.name,
        price,
        changePct: ((price - prev) / prev) * 100,
        precision: sym.includes("JPY") || sym === "GC=F" ? 2 : 4,
      };
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
    precision: r.precision,
  });

  return {
    breadth: {
      advancers,
      decliners,
      unchanged,
      total: rows.length,
      universe: "Major & Cross FX Basket",
    },
    movers: {
      gainers: sorted.slice(0, 4).map(toMover),
      losers: sorted.slice(-4).reverse().map(toMover),
    },
  };
}

export async function getSnapshot(): Promise<MarketSnapshot> {
  const { data: tape, stale: tapeStale } = await cached(
    "snapshot-forex-core",
    30_000,
    buildTapeAndIndices,
  );
  let breadthBlock: Awaited<ReturnType<typeof buildBreadth>> = null;
  try {
    breadthBlock = (await cached("snapshot-forex-breadth", 120_000, buildBreadth)).data;
  } catch {
    /* breadth optional */
  }

  return {
    ts: Date.now(),
    stale: tapeStale,
    status: marketStatus(),
    indices: tape.indices,
    dxy: tape.dxy,
    vix: tape.vix,
    sectors: tape.sectors,
    tickers: tape.tickers,
    breadth: breadthBlock?.breadth ?? null,
    movers: breadthBlock?.movers ?? null,
  };
}

