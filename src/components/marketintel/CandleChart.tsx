import { useEffect, useRef } from "react";
import type { CandleBar, MarketStatus } from "@/lib/types";
import { useMarketTheme } from "./ThemeContext";

export interface CandleTick {
  price: number;
  changePct: number;
  count: number;
  live: boolean;
  asOf?: number;
}

interface Props {
  symbol?: string;
  status?: MarketStatus | null;
  onTick?: (t: CandleTick) => void;
  className?: string;
}

const POLL_MS = 15_000;
const BAR_MS = 60_000; // 1-minute bars

// TradingView Canonical Dark & Light Theme Palettes harmonized with page theme
const TV_DARK = {
  bg: "#05070d",
  gutterBg: "#05070d",
  border: "rgba(255, 255, 255, 0.08)",
  grid: "rgba(255, 255, 255, 0.04)",
  up: "#089981", // TradingView Pine Teal
  down: "#f23645", // TradingView Pine Red
  textMuted: "#787b86",
  textLight: "#d1d4dc",
  crosshair: "rgba(117, 134, 150, 0.7)",
  crosshairPill: "#1e222d",
  watermark: "rgba(255, 255, 255, 0.025)",
  volUp: "rgba(8, 153, 129, 0.22)",
  volDown: "rgba(242, 54, 69, 0.22)",
};

const TV_LIGHT = {
  bg: "#f8fafc",
  gutterBg: "#f8fafc",
  border: "rgba(15, 23, 42, 0.08)",
  grid: "rgba(15, 23, 42, 0.04)",
  up: "#089981",
  down: "#f23645",
  textMuted: "#64748b",
  textLight: "#0f172a",
  crosshair: "rgba(100, 116, 139, 0.6)",
  crosshairPill: "#0f172a",
  watermark: "rgba(15, 23, 42, 0.025)",
  volUp: "rgba(8, 153, 129, 0.16)",
  volDown: "rgba(242, 54, 69, 0.16)",
};

const TV_FONT =
  "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif";

function fmtPrice(v: number, sym = "XAUUSD"): string {
  if (isNaN(v) || v == null) return "—";
  const isGold = sym.includes("GC") || sym.includes("XAU") || sym.includes("GOLD");
  if (isGold || v > 1000) {
    return v.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (sym.includes("JPY") || (v > 50 && v < 1000)) {
    return v.toFixed(2);
  }
  return v.toFixed(4);
}

function formatTVTime(t: number): string {
  try {
    const d = new Date(t);
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(d);
  } catch {
    return new Date(t).toISOString().slice(11, 16);
  }
}

function formatTVDate(t: number): string {
  try {
    const d = new Date(t);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      hour12: true,
    }).format(d);
  } catch {
    return new Date(t).toISOString().slice(0, 16);
  }
}

interface LiveCandle extends CandleBar {
  born: number;
}

export default function CandleChart({
  symbol = "XAUUSD",
  status,
  onTick,
  className,
}: Props) {
  const { isDark } = useMarketTheme();
  const TV = isDark ? TV_DARK : TV_LIGHT;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const statusRef = useRef(status);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    statusRef.current = status;
    onTickRef.current = onTick;
  }, [status, onTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement ?? canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let candles: LiveCandle[] = [];
    let prevClose = 0;
    let feedState: "loading" | "ready" | "error" = "loading";
    let lastPayloadAt = 0;
    let sessionBars = 0;

    /* ---------------- data fetch ---------------- */
    async function loadFeed() {
      try {
        const res = await fetch(
          `/api/candles?symbol=${encodeURIComponent(symbol)}&interval=1m&range=1d`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          candles: CandleBar[];
          prevClose: number;
        };
        if (!Array.isArray(data.candles)) throw new Error("bad payload");
        const now = performance.now();
        const bornMap = new Map<number, number>();
        for (const c of candles) bornMap.set(c.t, c.born);
        candles = data.candles.map((c) => ({
          ...c,
          born: bornMap.get(c.t) ?? now,
        }));
        prevClose = data.prevClose || prevClose;
        if (candles.length) {
          sessionBars = data.candles.length;
          feedState = "ready";
          lastPayloadAt = Date.now();
        }
      } catch {
        if (!candles.length) feedState = "error";
      }
    }

    void loadFeed();
    const pollId = setInterval(() => {
      if (document.visibilityState === "visible") void loadFeed();
    }, POLL_MS);

    /* ---------------- sizing ---------------- */
    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = wrap.offsetWidth;
      h = wrap.offsetHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    /* ---------------- mouse interaction ---------------- */
    let mx = -1;
    let my = -1;
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mx = (e.clientX - rect.left) * (w / Math.max(1, rect.width));
      my = (e.clientY - rect.top) * (h / Math.max(1, rect.height));
    };
    const onLeave = () => {
      mx = -1;
      my = -1;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);

    /* ---------------- render loop ---------------- */
    let raf = 0;
    let scaleMin = 0;
    let scaleMax = 1;
    let scaleInit = false;
    let lastEmit = 0;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // TradingView authentic dark canvas background
      ctx.fillStyle = TV.bg;
      ctx.fillRect(0, 0, w, h);

      if (feedState !== "ready") {
        const dots = ".".repeat(1 + (Math.floor(t / 400) % 3));
        ctx.fillStyle = TV.textMuted;
        ctx.font = `500 13px ${TV_FONT}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`Loading TradingView Chart${dots}`, w / 2, h / 2);
        return;
      }

      /* ---- layout dimensions (TradingView standard) ---- */
      const axisW = 82; // Right price scale width
      const timeH = 26; // Bottom time scale height
      const plotW = w - axisW;
      const plotH = h - timeH;
      const plotTop = Math.max(70, Math.min(110, h * 0.12));
      const plotBottom = plotH - 10;

      const spacing = Math.max(7, Math.min(14, plotW / 52)); // px per 1-min bar
      const pxPerMs = spacing / BAR_MS;
      const anchorX = plotW - spacing * 2.5; // current candle anchor
      const bodyW = Math.max(4, spacing * 0.65);

      const st = statusRef.current;
      const isOpen = st?.state === "open";

      // Camera time tracking
      const lastT = candles[candles.length - 1]?.t ?? 0;
      let viewT = lastT + BAR_MS;
      if (isOpen) viewT = Math.max(viewT, Date.now());

      const xOf = (c: LiveCandle) => anchorX - (viewT - c.t) * pxPerMs;

      /* ---- visible bounds calculation ---- */
      let visMin = Infinity;
      let visMax = -Infinity;
      let maxVol = 0;
      for (const c of candles) {
        const x = xOf(c);
        if (x < -spacing * 2 || x > plotW + spacing * 2) continue;
        if (c.l < visMin) visMin = c.l;
        if (c.h > visMax) visMax = c.h;
        if (c.v > maxVol) maxVol = c.v;
      }
      if (!isFinite(visMin)) return;

      const vRange = visMax - visMin || 1;
      const pad = vRange * 0.12 + 1;
      const tMin = visMin - pad;
      const tMax = visMax + pad;

      if (!scaleInit) {
        scaleMin = tMin;
        scaleMax = tMax;
        scaleInit = true;
      } else {
        scaleMin += (tMin - scaleMin) * 0.08;
        scaleMax += (tMax - scaleMax) * 0.08;
      }
      const range = scaleMax - scaleMin || 1;
      const yOf = (v: number) =>
        plotTop + ((scaleMax - v) / range) * (plotBottom - plotTop);

      /* ---- horizontal price gridlines ---- */
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = TV.grid;
      ctx.lineWidth = 1;
      const gridN = 6;
      for (let g = 0; g <= gridN; g++) {
        const gy = Math.round(plotTop + ((plotBottom - plotTop) * g) / gridN) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(plotW, gy);
        ctx.stroke();
      }
      ctx.restore();

      /* ---- vertical time gridlines ---- */
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = TV.grid;
      ctx.lineWidth = 1;
      for (const c of candles) {
        const x = Math.round(xOf(c)) + 0.5;
        if (x < 0 || x > plotW) continue;
        const mins = new Date(c.t).getMinutes();
        if (mins % 15 === 0) {
          ctx.beginPath();
          ctx.moveTo(x, plotTop - 10);
          ctx.lineTo(x, plotH);
          ctx.stroke();
        }
      }
      ctx.restore();

      /* ---- volume histogram (bottom of plot) ---- */
      if (maxVol > 0) {
        const volBase = plotBottom;
        const volMaxH = (plotBottom - plotTop) * 0.16;
        for (const c of candles) {
          const x = xOf(c);
          if (x < -spacing || x > plotW) continue;
          const upC = c.c >= c.o;
          ctx.fillStyle = upC ? TV.volUp : TV.volDown;
          const vh = (c.v / maxVol) * volMaxH;
          ctx.fillRect(x - bodyW / 2, volBase - vh, bodyW, vh);
        }
      }

      /* ---- candlesticks (TradingView authentic crisp rendering) ---- */
      const last = candles.length - 1;
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = xOf(c);
        if (x < -spacing || x > plotW + spacing) continue;

        const upC = c.c >= c.o;
        const col = upC ? TV.up : TV.down;

        const yO = yOf(c.o);
        const yC = yOf(c.c);
        const yH = yOf(c.h);
        const yL = yOf(c.l);

        const cx = Math.floor(x) + 0.5;

        // Wick: 1px crisp center stroke
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, Math.round(yH));
        ctx.lineTo(cx, Math.round(yL));
        ctx.stroke();

        // Body: Crisp flat fill + outline
        const bTop = Math.round(Math.min(yO, yC));
        const bH = Math.max(1, Math.round(Math.abs(yO - yC)));
        const bLeft = Math.floor(x - bodyW / 2);

        ctx.fillStyle = col;
        ctx.fillRect(bLeft, bTop, Math.floor(bodyW), bH);
        ctx.strokeRect(bLeft + 0.5, bTop + 0.5, Math.floor(bodyW) - 1, Math.max(0, bH - 1));
      }

      /* ---- current price line across chart ---- */
      const cur = candles[last];
      const curUp = cur ? cur.c >= cur.o : true;
      const curCol = curUp ? TV.up : TV.down;
      const yPrice = cur ? Math.round(yOf(cur.c)) + 0.5 : plotH / 2;

      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = curCol;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, yPrice);
      ctx.lineTo(plotW, yPrice);
      ctx.stroke();
      ctx.restore();

      /* ---- right price scale sidebar (Y-axis gutter) ---- */
      ctx.fillStyle = TV.gutterBg;
      ctx.fillRect(plotW, 0, axisW, h);

      // Separator line
      ctx.strokeStyle = TV.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(plotW + 0.5, 0);
      ctx.lineTo(plotW + 0.5, plotH);
      ctx.stroke();

      // Price scale tick labels
      ctx.font = `11px ${TV_FONT}`;
      ctx.fillStyle = TV.textMuted;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";

      for (let g = 0; g <= gridN; g++) {
        const gy = plotTop + ((plotBottom - plotTop) * g) / gridN;
        const gv = scaleMax - (range * g) / gridN;
        ctx.fillText(fmtPrice(gv, symbol), w - 10, gy);
      }

      // Live price tag on right axis (TradingView signature badge)
      if (cur) {
        const tagH = 20;
        const tagY = Math.round(yPrice - tagH / 2);

        ctx.fillStyle = curCol;
        ctx.fillRect(plotW, tagY, axisW, tagH);

        ctx.fillStyle = "#ffffff";
        ctx.font = `bold 11px ${TV_FONT}`;
        ctx.textAlign = "right";
        ctx.fillText(fmtPrice(cur.c, symbol), w - 10, tagY + tagH / 2);
      }

      /* ---- bottom time scale bar (X-axis gutter) ---- */
      ctx.fillStyle = TV.gutterBg;
      ctx.fillRect(0, plotH, w, timeH);

      // Separator line
      ctx.strokeStyle = TV.border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, plotH + 0.5);
      ctx.lineTo(w, plotH + 0.5);
      ctx.stroke();

      // Bottom time scale ticks
      ctx.font = `11px ${TV_FONT}`;
      ctx.fillStyle = TV.textMuted;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      for (const c of candles) {
        const x = xOf(c);
        if (x < 20 || x > plotW - 20) continue;
        const mins = new Date(c.t).getMinutes();
        if (mins % 15 === 0) {
          ctx.fillText(formatTVTime(c.t), x, plotH + timeH / 2);
        }
      }

      /* ---- corner spacer square (bottom right junction) ---- */
      ctx.fillStyle = TV.gutterBg;
      ctx.fillRect(plotW, plotH, axisW, timeH);

      /* ---- interactive crosshair ---- */
      const inPlot = mx >= 0 && mx <= plotW && my >= 0 && my <= plotH;
      let hoveredCandle: LiveCandle | null = null;

      if (inPlot) {
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = TV.crosshair;
        ctx.lineWidth = 1;

        // Vertical line
        ctx.beginPath();
        ctx.moveTo(Math.floor(mx) + 0.5, 0);
        ctx.lineTo(Math.floor(mx) + 0.5, plotH);
        ctx.stroke();

        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(0, Math.floor(my) + 0.5);
        ctx.lineTo(plotW, Math.floor(my) + 0.5);
        ctx.stroke();
        ctx.restore();

        // Price badge on right axis
        const hoverPrice = scaleMax - ((my - plotTop) / (plotBottom - plotTop)) * range;
        const hoverTagY = Math.round(my - 10);

        ctx.fillStyle = TV.crosshairPill;
        ctx.fillRect(plotW, hoverTagY, axisW, 20);
        ctx.strokeStyle = TV.border;
        ctx.strokeRect(plotW + 0.5, hoverTagY + 0.5, axisW - 1, 19);

        ctx.fillStyle = "#ffffff";
        ctx.font = `11px ${TV_FONT}`;
        ctx.textAlign = "right";
        ctx.fillText(fmtPrice(hoverPrice, symbol), w - 10, hoverTagY + 10);

        // Find nearest candle
        let bestDist = Infinity;
        for (const c of candles) {
          const d = Math.abs(xOf(c) - mx);
          if (d < bestDist) {
            bestDist = d;
            hoveredCandle = c;
          }
        }

        // Time badge on bottom axis
        if (hoveredCandle) {
          const timeText = formatTVDate(hoveredCandle.t);
          ctx.font = `11px ${TV_FONT}`;
          const tw = ctx.measureText(timeText).width + 16;
          const tx0 = Math.max(4, Math.min(plotW - tw - 4, mx - tw / 2));

          ctx.fillStyle = TV.crosshairPill;
          ctx.fillRect(tx0, plotH, tw, timeH);
          ctx.strokeStyle = TV.border;
          ctx.strokeRect(tx0 + 0.5, plotH + 0.5, tw - 1, timeH - 1);

          ctx.fillStyle = "#ffffff";
          ctx.textAlign = "center";
          ctx.fillText(timeText, tx0 + tw / 2, plotH + timeH / 2);
        }
      }



      /* ---- emit quote to HUD ---- */
      if (cur && onTickRef.current && t - lastEmit > 300) {
        onTickRef.current({
          price: cur.c,
          changePct: prevClose ? ((cur.c - prevClose) / prevClose) * 100 : 0,
          count: sessionBars,
          live: isOpen,
          asOf: lastPayloadAt,
        });
        lastEmit = t;
      }
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(pollId);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [symbol, isDark]);

  return (
    <div className={className ?? "absolute inset-0"} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
