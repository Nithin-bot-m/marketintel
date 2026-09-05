import { NextResponse } from "next/server";
import { getSnapshot } from "@/lib/yahoo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/market — live exchange snapshot (NSE/BSE quotes via Yahoo Finance).
// All figures are real market data; `stale: true` signals last-good-cache fallback.
export async function GET() {
  try {
    const snapshot = await getSnapshot();
    return NextResponse.json(snapshot, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "upstream feed unavailable",
        detail: err instanceof Error ? err.message : String(err),
        ts: Date.now(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
