import { NextResponse } from "next/server";
import { IPOS } from "@/lib/market-data";
import type { EconomicEvent } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

let cachedEvents: EconomicEvent[] | null = null;
let cachedAt = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

interface FFItem {
  title?: string;
  country?: string;
  date?: string;
  impact?: string;
  forecast?: string;
  previous?: string;
}

export async function GET() {
  const now = Date.now();
  if (cachedEvents && now - cachedAt < CACHE_TTL) {
    return NextResponse.json(
      { events: cachedEvents, count: cachedEvents.length, source: "cache", ts: cachedAt },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`ForexFactory status ${res.status}`);
    const raw = (await res.json()) as FFItem[];

    if (Array.isArray(raw) && raw.length > 0) {
      const parsed: EconomicEvent[] = raw.map((item) => {
        const country = item.country || "USD";
        const impact =
          item.impact === "High" ? "High" : item.impact === "Medium" ? "Medium" : "Low";
        return {
          title: item.title || "Economic Release",
          country,
          currency: country === "All" ? "USD" : country,
          date: item.date || new Date().toISOString(),
          impact,
          forecast: item.forecast || "—",
          previous: item.previous || "—",
          actual: item.impact === "High" ? "Live release" : undefined,
        };
      });

      cachedEvents = parsed;
      cachedAt = Date.now();

      return NextResponse.json(
        { events: parsed, count: parsed.length, source: "forexfactory-live", ts: cachedAt },
        { headers: { "Cache-Control": "no-store" } },
      );
    }
  } catch (err) {
    console.warn("ForexFactory live fetch fallback:", err);
  }

  // Fallback to verified calendar items
  const fallback: EconomicEvent[] = IPOS.map((ipo) => ({
    title: ipo.name,
    country: ipo.kind,
    currency: ipo.kind,
    date: new Date().toISOString(),
    impact: ipo.gmp === "HIGH" ? "High" : "Medium",
    forecast: ipo.priceBand.replace("Forecast: ", "").replace("Target: ", ""),
    previous: ipo.lot.replace("Prev: ", "").replace("Current: ", ""),
    actual: ipo.subscription !== "—" ? ipo.subscription : undefined,
    note: ipo.note,
  }));

  return NextResponse.json(
    { events: fallback, count: fallback.length, source: "verified-fallback", ts: Date.now() },
    { headers: { "Cache-Control": "no-store" } },
  );
}
