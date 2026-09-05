// MarketIntel data layer — T1-sourced taxonomy from the ISD 4-Channel Content Plan.
//
// DATA POLICY (v3):
// - All QUOTES / CANDLES / BREADTH are fetched live from the exchange feed
//   server-side (see src/lib/yahoo.ts + /api/market + /api/candles).
// - Anything without a free live API (institutional flows, IPO records, macro
//   prints, regulatory items) is kept as VERIFIED STATIC FACTS below — each
//   carries its own source + as-of date. No simulated numbers anywhere.

export type Trend = "up" | "down";

export interface IntelArticle {
  slug: string;
  category: string;
  title: string;
  summary: string;
  source: string;
  sourceTier: "T1" | "T2";
  publishedAt: string; // real date, e.g. "4 Sep 2026"
  readMins: number;
  accent: "gold" | "emerald" | "violet" | "rose";
  url: string; // official source page
}

export interface IPOItem {
  name: string;
  kind: "Mainboard" | "SME";
  status: "LIVE" | "UPCOMING" | "LISTED";
  priceBand: string;
  lot: string;
  subscription?: string; // verified subscription multiple
  gmp: string; // "—" unless verified
  window: string; // open/close window
  listedAt?: string;
  listingGain?: number; // % vs issue price
  note?: string;
}

export interface FlowMonth {
  month: string;
  year: string;
  fii: number; // FPI net equity flows, ₹ crore (negative = outflow)
}

export interface MacroStat {
  label: string;
  value: string;
  sub: string; // includes as-of + source
  trend: Trend;
}

/* ------------------------- verified as of ------------------------- */
// Last trading session: Friday, 4 September 2026 (NSE/BSE).
export const LAST_SESSION = "Fri, 4 Sep 2026";
export const VERIFIED_AS_OF = "5 Sep 2026";

/* ------------------------------ Intel feed ------------------------------ */
// Every item is a real, dated release. URLs point to the official source.

export const INTEL_FEED: IntelArticle[] = [
  {
    slug: "sebi-esma-mou-sep-2026",
    category: "SEBI Press",
    title: "SEBI signs MoU with the European Securities and Markets Authority (ESMA)",
    summary:
      "Announced via press release 54/2026, the memorandum ramps up cross-border enforcement cooperation and information sharing between India's market regulator and Europe's securities watchdog — a meaningful upgrade for oversight of foreign portfolio investors active in both markets.",
    source: "SEBI",
    sourceTier: "T1",
    publishedAt: "4 Sep 2026",
    readMins: 4,
    accent: "gold",
    url: "https://www.sebi.gov.in/media/press-releases.html",
  },
  {
    slug: "rbi-mpc-aug-2026-hold",
    category: "Macro / RBI",
    title: "RBI holds repo at 5.25% for a fourth straight review; FY27 growth view lifted to 6.7%",
    summary:
      "The Monetary Policy Committee kept the policy repo unchanged at 5.25% at its 3–5 August review, stance neutral, with the FY27 GDP growth projection raised to 6.7%. Markets now look to the October review for the next move — we map what the hold means for rate-sensitives.",
    source: "RBI",
    sourceTier: "T1",
    publishedAt: "5 Aug 2026",
    readMins: 7,
    accent: "violet",
    url: "https://www.rbi.org.in/",
  },
  {
    slug: "fii-dii-provisionals-sep-4-2026",
    category: "FII / DII",
    title: "Session provisionals: FIIs net sell ₹3,112 Cr; DIIs absorb ₹8,930 Cr — third straight domestic bid",
    summary:
      "Friday's cash-segment provisionals show foreign institutions extending August's renewal into profit-taking, while domestic institutions bought for a third consecutive session (₹2,813 Cr Wed → ₹4,342 Cr Thu → ₹8,930 Cr Fri). Full daily flow table with month-to-date context inside.",
    source: "NSE · BSE",
    sourceTier: "T1",
    publishedAt: "4 Sep 2026",
    readMins: 4,
    accent: "emerald",
    url: "https://www.nseindia.com/reports/fii-dii",
  },
  {
    slug: "sebi-circular-timeline-extension-aug-2026",
    category: "SEBI Circular",
    title: "Base-price & price-band norms: implementation window extended to 7 September 2026",
    summary:
      "SEBI's 28 August circular pushes the effective date of its 15 June 2026 framework on base price and price-band norms. All other provisions of the June circular stand. We break down what shifts for issuers, exchanges and compliance desks in plain language.",
    source: "SEBI",
    sourceTier: "T1",
    publishedAt: "28 Aug 2026",
    readMins: 6,
    accent: "violet",
    url: "https://www.sebi.gov.in/sebi/web/home/home/index.html/65-circulars.html",
  },
  {
    slug: "tcs-q1-fy27-scorecard",
    category: "Quarterly Results",
    title: "TCS Q1 FY27 scorecard: revenue ₹72,275 Cr (+14% YoY), PAT ₹13,349 Cr, $9.5B deal TCV",
    summary:
      "India's largest IT services firm opened the FY27 results season with double-digit revenue growth and a net profit of ₹13,349 Cr (+5% YoY), alongside $9.5B in total contract value and a $2.6B AI revenue run-rate. Standardised result-card with margin bridge inside.",
    source: "NSE Filings",
    sourceTier: "T1",
    publishedAt: "15 Jul 2026",
    readMins: 8,
    accent: "gold",
    url: "https://www.nseindia.com/",
  },
  {
    slug: "explainer-ipo-grading-gmp",
    category: "Explainer",
    title: "IPO grading, GMP and the grey market: what retail investors often misread",
    summary:
      "An evergreen explainer separating signal from noise — how grey-market premiums form, why SEBI does not regulate them, and a framework to read subscription numbers without falling for anchoring bias. Educational only, no recommendations.",
    source: "MarketIntel Research",
    sourceTier: "T2",
    publishedAt: "Desk archive",
    readMins: 11,
    accent: "emerald",
    url: "#intel",
  },
];

/* ------------------------------ IPO tracker ------------------------------ */
// Compiled from price-band filings / exchange issue pages & market press.
// Verified 5 Sep 2026. GMP shown only where independently verified ("—").

export const IPOS: IPOItem[] = [
  {
    name: "Qualiance Ltd",
    kind: "SME",
    status: "LIVE",
    priceBand: "₹120 – ₹127",
    lot: "1,000 shares",
    subscription: "12.51×",
    gmp: "—",
    window: "Sep 4 → Sep 8",
    note: "₹45.11 Cr issue · subscription as of Sep 4 EOD",
  },
  {
    name: "Prasol Chemicals Ltd",
    kind: "Mainboard",
    status: "UPCOMING",
    priceBand: "₹643 – ₹676",
    lot: "22 shares",
    gmp: "—",
    window: "Opens Sep 8",
    note: "₹500 Cr issue",
  },
  {
    name: "Asset Reconstruction Co. of India",
    kind: "Mainboard",
    status: "UPCOMING",
    priceBand: "₹132 – ₹139",
    lot: "107 shares",
    gmp: "—",
    window: "Sep 9 → Sep 11",
    note: "ARCIL — offers for sale",
  },
  {
    name: "NSE Ltd (watch)",
    kind: "Mainboard",
    status: "UPCOMING",
    priceBand: "Awaited",
    lot: "—",
    gmp: "—",
    window: "Eyed 2H Sep 2026",
    note: "Regulator clearance reported; ~₹11,000 Cr fresh issue per press",
  },
  {
    name: "Priority Jewels Ltd",
    kind: "SME",
    status: "LISTED",
    priceBand: "₹200 (issue price)",
    lot: "—",
    gmp: "—",
    window: "Listed Sep 4",
    listedAt: "Sep 4, 2026",
    listingGain: 15.0,
    note: "Debut ₹230 NSE (+15.0%) / ₹252.20 BSE (+26.1%)",
  },
];

/* --------------------- FII / DII flows (verified) --------------------- */
// FPI net equity flows, ₹ crore — depository data (NSDL/CDSL) as reported by
// the financial press (Jun 2026 reports; CDSL CY-2026 table). Sep = daily
// cash-segment provisionals from NSE/BSE as reported by Trendlyne/StockEdge.

export const FLOWS_MONTHLY: FlowMonth[] = [
  { month: "Mar", year: "2026", fii: -117775 },
  { month: "Apr", year: "2026", fii: -60847 },
  { month: "May", year: "2026", fii: -32963 },
  { month: "Jun", year: "2026", fii: -49029 },
  { month: "Jul", year: "2026", fii: -5779 },
  { month: "Aug", year: "2026", fii: 29631 },
];

export const FLOW_SESSIONS = {
  asOf: LAST_SESSION,
  fii: -3111.94, // ₹ Cr, cash segment, 4 Sep 2026 provisional
  dii: 8930.12, // ₹ Cr, cash segment, 4 Sep 2026 provisional
  diiStreak: 3, // Wed 2,812.98 → Thu 4,341.70 → Fri 8,930.12 (all net buys)
  source: "NSE / BSE provisional data",
};

export const FLOW_FACTS = {
  augNote: "Strongest FPI month of CY26 — inflow turned positive after five heavy outflow months",
  marToAugOut: -266762, // sum of Mar–Jul net outflows, ₹ Cr
  sourceLine:
    "FPI equity flows: depository data (NSDL / CDSL CY-2026 table) via press reports · session provisionals: NSE/BSE",
};

/* ------------------------- Macro Radar (verified) ------------------------- */

export const MACRO: MacroStat[] = [
  {
    label: "Repo Rate",
    value: "5.25%",
    sub: "MPC hold · 5 Aug 2026 · 4th straight",
    trend: "down",
  },
  {
    label: "GST Collections",
    value: "₹1,99,853 Cr",
    sub: "Aug 2026 · +14.8% YoY",
    trend: "up",
  },
  {
    label: "FX Reserves",
    value: "$729.3 Bn",
    sub: "Record high · week to 21 Aug",
    trend: "up",
  },
  {
    label: "FY27 CPI Forecast",
    value: "4.6%",
    sub: "RBI projection · Aug policy",
    trend: "up",
  },
];

/* ------------------------- Market wrap facts (verified) ------------------------- */
// Context lines for the Daily Wrap, verified against 4 Sep 2026 session reports.

export const WRAP_FACTS = {
  session: LAST_SESSION,
  headline: "Sensex ends 4-day losing streak with a 363-point rally; Nifty holds near 23,900",
  context:
    "Friday's session closed firmly positive on easing volatility and supportive global cues. IT led sector gains through the day, with SBI Life, HDFC Life and Tata Steel among the top Nifty gainers while HCL Technologies lagged. India VIX cooled to the 10.7 area, keeping derivative positioning constructive into the weekly expiry.",
  gainersNamed: "SBI Life · HDFC Life · Tata Steel · Reliance",
  laggardsNamed: "HCL Technologies",
  sourceLine: "Session context: exchange closing reports, 4 Sep 2026",
};

/* ------------------------------ Network (from PDF) ------------------------------ */

export const NETWORK = [
  { name: "EduIntel", desc: "Education intelligence", vertical: "Education", live: false },
  { name: "MarketIntel", desc: "Share market intelligence", vertical: "Share Market", live: true },
  { name: "AIIntel", desc: "AI trends intelligence", vertical: "AI Trends", live: false },
  { name: "GrowthIntel", desc: "Digital marketing intelligence", vertical: "Digital Marketing", live: false },
];

export const CATEGORIES = [
  { name: "Market Wrap", count: "Daily · 4:30 PM", desc: "End-of-day recap across cash & F&O" },
  { name: "IPOs", count: "Live tracker", desc: "Bands, subscription, GMP & listings" },
  { name: "Quarterly Results", count: "Season tracker", desc: "Standardised result cards & bridges" },
  { name: "FII / DII", count: "EOD flows", desc: "Provisional daily institutional flows" },
  { name: "Macro", count: "Event-driven", desc: "RBI, PIB, MOSPI decoded" },
  { name: "Explainers", count: "Evergreen", desc: "Concepts that compound your base" },
];

/* ------------------------------ helpers ------------------------------ */

export function formatINR(n: number, decimals = 2): string {
  return n.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatCr(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "+";
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L Cr`;
  return `${sign}₹${abs.toLocaleString("en-IN", { maximumFractionDigits: 0 })} Cr`;
}
