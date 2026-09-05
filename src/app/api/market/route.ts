import { NextResponse } from "next/server";
import { TICKER_BASE, walkTicker, type Ticker } from "@/lib/market-data";

// In-memory session state so the random-walk evolves rather than resets.
let liveTickers: Ticker[] = TICKER_BASE.map((t) => ({ ...t }));

export async function GET() {
  liveTickers = liveTickers.map((t) => walkTicker(t));
  return NextResponse.json(
    {
      ts: Date.now(),
      tickers: liveTickers,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
