import { NextRequest, NextResponse } from "next/server";
import { getChart } from "@/lib/yahoo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const INTERVALS = new Set(["1m", "5m", "1d"]);
const RANGES = new Set(["1d", "5d", "1mo"]);
// Symbol whitelist: letters, digits, dot, dash, caret, =
const SAFE_SYM = /^[A-Za-z0-9.\-^=]{1,15}$/;

// GET /api/candles?symbol=GC=F&interval=1m&range=1d
// Real OHLC bars from the interbank/futures feed (Yahoo Finance). No synthetic data.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const symbol = sp.get("symbol") ?? "GC=F";
  const interval = (sp.get("interval") ?? "1m") as "1m" | "5m" | "1d";
  const range = (sp.get("range") ?? "1d") as "1d" | "5d" | "1mo";

  if (!SAFE_SYM.test(symbol)) {
    return NextResponse.json({ error: "invalid symbol" }, { status: 400 });
  }
  if (!INTERVALS.has(interval) || !RANGES.has(range)) {
    return NextResponse.json({ error: "invalid interval/range" }, { status: 400 });
  }

  try {
    const { chart, stale } = await getChart(symbol, interval, range);
    return NextResponse.json(
      {
        symbol: chart.symbol,
        name: chart.name,
        interval,
        prevClose: chart.prevClose,
        candles: chart.candles,
        asOf: chart.asOf ?? Date.now(),
        stale,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return NextResponse.json(
      {
        error: "candle feed unavailable",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
