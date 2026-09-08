"use client";

import { useEffect, useRef } from "react";
import type { CandleBar, MarketStatus } from "@/lib/types";
import { useMarketTheme, type MarketTheme } from "./ThemeContext";

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

const POLL_MS = 20_000;
const BAR_MS = 60_000; // 1-minute bars

function getChartColors(theme: MarketTheme) {
  if (theme === "cyberpunk") {
    return {
      up: "#00ff66",
      down: "#ff0055",
      upStroke: "rgba(0,255,102,0.8)",
      downStroke: "rgba(255,0,85,0.8)",
      upFill1: "rgba(0,255,102,0.95)",
      upFill2: "rgba(5,200,85,0.85)",
      downFill1: "rgba(255,0,85,0.95)",
      downFill2: "rgba(200,0,65,0.85)",
      volUp: "rgba(0,255,102,",
      volDown: "rgba(255,0,85,",
      emaGrad: ["rgba(0,240,255,0)", "rgba(0,240,255,0.45)", "rgba(0,240,255,0.95)"],
      emaShadow: "rgba(0,240,255,0.75)",
      tagBorder: "rgba(0,240,255,0.6)",
      tagText: "#00f0ff",
      crosshairBorder: "rgba(252,238,10,0.85)",
      crosshairText: "#fcee0a",
      pulseStrokeUp: "rgba(0,255,102,",
      pulseStrokeDown: "rgba(255,0,85,",
      priceTagTextUp: "#6ee7b7",
      priceTagTextDown: "#fda4af",
    };
  }
  if (theme === "matrix") {
    return {
      up: "#00ff66",
      down: "#ff3366",
      upStroke: "rgba(0,255,102,0.8)",
      downStroke: "rgba(255,51,102,0.8)",
      upFill1: "rgba(0,255,102,0.95)",
      upFill2: "rgba(16,185,129,0.85)",
      downFill1: "rgba(255,51,102,0.95)",
      downFill2: "rgba(200,20,60,0.85)",
      volUp: "rgba(0,255,102,",
      volDown: "rgba(255,51,102,",
      emaGrad: ["rgba(56,189,248,0)", "rgba(56,189,248,0.4)", "rgba(56,189,248,0.95)"],
      emaShadow: "rgba(56,189,248,0.7)",
      tagBorder: "rgba(0,255,102,0.6)",
      tagText: "#00ff66",
      crosshairBorder: "rgba(0,255,102,0.85)",
      crosshairText: "#00ff66",
      pulseStrokeUp: "rgba(0,255,102,",
      pulseStrokeDown: "rgba(255,51,102,",
      priceTagTextUp: "#6ee7b7",
      priceTagTextDown: "#fda4af",
    };
  }
  return {
    up: "#10b981",
    down: "#f43f5e",
    upStroke: "rgba(16,185,129,0.7)",
    downStroke: "rgba(244,63,94,0.7)",
    upFill1: "rgba(52,211,153,0.95)",
    upFill2: "rgba(5,150,105,0.85)",
    downFill1: "rgba(251,113,133,0.95)",
    downFill2: "rgba(225,29,72,0.85)",
    volUp: "rgba(16,185,129,",
    volDown: "rgba(244,63,94,",
    emaGrad: ["rgba(245,181,74,0)", "rgba(245,181,74,0.38)", "rgba(245,181,74,0.95)"],
    emaShadow: "rgba(245,181,74,0.55)",
    tagBorder: "rgba(245,181,74,0.6)",
    tagText: "#fcd34d",
    crosshairBorder: "rgba(245,181,74,0.6)",
    crosshairText: "#fcd34d",
    pulseStrokeUp: "rgba(16,185,129,",
    pulseStrokeDown: "rgba(244,63,94,",
    priceTagTextUp: "#6ee7b7",
    priceTagTextDown: "#fda4af",
  };
}

function fontStack(): string {
  if (typeof window === "undefined") return "monospace";
  const v = getComputedStyle(document.body).getPropertyValue("--font-data").trim();
  return v ? `${v}, monospace` : "monospace";
}

function fmtPrice(v: number): string {
  return Math.round(v).toLocaleString("en-IN");
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function makeIstClock(): (t: number) => string {
  try {
    const f = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return (t) => f.format(new Date(t));
  } catch {
    return (t) => new Date(t).toISOString().slice(11, 16);
  }
}

interface LiveCandle extends CandleBar {
  born: number; // performance.now() when first seen (fade-in)
}

/**
 * Cinematic candlestick tape fed by REAL exchange data.
 * - Seeds from /api/candles (1-minute NSE bars) and re-polls every 20s.
 * - While the market is open the tape glides with the clock, exactly like a
 *   terminal: the forming 1-minute bar drifts left as the minute ages.
 * - When closed, the last real session holds with a gentle camera sway.
 * - No synthetic prices — every bar is an actual OHLC record.
 */
export default function CandleChart({ symbol = "^NSEI", status, onTick, className }: Props) {
  const { theme } = useMarketTheme();
  const themeRef = useRef(theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onTickRef = useRef(onTick);
  const statusRef = useRef<MarketStatus | null>(null);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    statusRef.current = status ?? null;
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const wrap = canvas.parentElement as HTMLElement;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const istClock = makeIstClock();
    const mono = fontStack();

    /* ---------------- data state ---------------- */
    let candles: LiveCandle[] = [];
    let prevClose = 0;
    let sessionBars = 0; // true bar count from the feed payload
    let feedState: "loading" | "ready" | "error" = "loading";
    let lastPayloadAt = 0;

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

    /* ---------------- pointer ---------------- */
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
    let ppx = 0;
    let ppy = 0;
    let lastEmit = 0;

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      /* ---- loading / error screens ---- */
      if (feedState !== "ready") {
        const dots = ".".repeat(1 + (Math.floor(t / 450) % 3));
        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.font = `600 12px ${mono}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          feedState === "loading"
            ? `ESTABLISHING LIVE FEED${dots}`
            : `FEED RETRYING${dots}`,
          w / 2,
          h / 2,
        );
        const sweep = (t / 2400) % 1;
        const g = ctx.createLinearGradient(w * 0.25, 0, w * 0.75, 0);
        g.addColorStop(0, "rgba(245,181,74,0)");
        g.addColorStop(sweep, "rgba(245,181,74,0.55)");
        g.addColorStop(1, "rgba(245,181,74,0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(w * 0.25, h / 2 + 26);
        ctx.lineTo(w * 0.75, h / 2 + 26);
        ctx.stroke();
        return;
      }

      /* ---- geometry ---- */
      const rightPad = Math.min(96, Math.max(70, w * 0.075));
      const spacing = Math.max(8, Math.min(15, w / 58)); // px per 1-min bar
      const pxPerMs = spacing / BAR_MS;
      const anchorX = w - rightPad - spacing * 1.3;
      const plotTop = h * 0.16;
      const plotBottom = h * 0.85;
      const bodyW = Math.max(3, spacing * 0.52);

      const st = statusRef.current;
      const isOpen = st?.state === "open";

      // virtual "now" in market time — glides when open, sways when closed
      const lastT = candles[candles.length - 1]?.t ?? 0;
      let viewT = lastT + BAR_MS;
      if (isOpen) viewT = Math.max(viewT, Date.now());
      else if (!reduced) viewT += Math.sin(t / 5200) * 9000; // ±9s camera sway

      const xOf = (c: LiveCandle) => anchorX - (viewT - c.t) * pxPerMs;

      /* ---- prune + visible slice ---- */
      if (candles.length > 260) {
        const minT = viewT - (280 * BAR_MS);
        candles = candles.filter((c) => c.t >= minT);
      }
      let visMin = Infinity;
      let visMax = -Infinity;
      let maxVol = 0;
      for (const c of candles) {
        const x = xOf(c);
        if (x < -spacing * 2 || x > anchorX + spacing * 2) continue;
        if (c.l < visMin) visMin = c.l;
        if (c.h > visMax) visMax = c.h;
        if (c.v > maxVol) maxVol = c.v;
      }
      if (!isFinite(visMin)) return;
      const pad = (visMax - visMin) * 0.16 + 4;
      const tMin = visMin - pad;
      const tMax = visMax + pad;
      if (!scaleInit) {
        scaleMin = tMin;
        scaleMax = tMax;
        scaleInit = true;
      } else {
        scaleMin += (tMin - scaleMin) * 0.07;
        scaleMax += (tMax - scaleMax) * 0.07;
      }
      const range = scaleMax - scaleMin || 1;
      const yOf = (v: number) => plotTop + ((scaleMax - v) / range) * (plotBottom - plotTop);

      /* ---- parallax ---- */
      const tx = reduced || mx < 0 ? 0 : (mx / w - 0.5) * 20;
      const ty = reduced || my < 0 ? 0 : (my / h - 0.5) * 12;
      ppx += (tx - ppx) * 0.045;
      ppy += (ty - ppy) * 0.045;

      ctx.save();
      ctx.translate(ppx, ppy);

      /* ---- horizontal grid + right price labels ---- */
      ctx.font = `500 10px ${mono}`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      const gridN = 5;
      for (let g = 0; g <= gridN; g++) {
        const gy = plotTop + ((plotBottom - plotTop) * g) / gridN;
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, Math.round(gy) + 0.5);
        ctx.lineTo(w - rightPad + 6, Math.round(gy) + 0.5);
        ctx.stroke();
        const gv = scaleMax - (range * g) / gridN;
        ctx.fillStyle = "rgba(255,255,255,0.26)";
        ctx.fillText(fmtPrice(gv), w - rightPad + 14, gy);
      }

      /* ---- real session-time gridlines (every 15 min) ---- */
      ctx.textAlign = "center";
      for (const c of candles) {
        const x = xOf(c);
        if (x < 0 || x > w - rightPad) continue;
        const minute = new Date(c.t).getMinutes();
        if (minute % 15 !== 0) continue;
        ctx.strokeStyle = "rgba(255,255,255,0.028)";
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, plotTop - 18);
        ctx.lineTo(Math.round(x) + 0.5, h * 0.97);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.20)";
        ctx.fillText(istClock(c.t), x, h * 0.985);
      }
      ctx.textAlign = "left";

      const last = candles.length - 1;
      const emaK = 2 / 10;

      const pal = getChartColors(themeRef.current);

      /* ---- volume bars (real turnover; hidden when the index has none) ---- */
      if (maxVol > 0) {
        const volBase = h * 0.985;
        const volMax = h * 0.075;
        for (let i = 0; i < candles.length; i++) {
          const c = candles[i];
          const x = xOf(c);
          if (x < -spacing || x > w - rightPad) continue;
          const upC = c.c >= c.o;
          const alpha = i === last ? 0.38 : 0.18;
          ctx.fillStyle = upC ? `${pal.volUp}${alpha})` : `${pal.volDown}${alpha})`;
          const vh = (c.v / maxVol) * volMax;
          ctx.fillRect(x - bodyW / 2, volBase - vh, bodyW, vh);
        }
      }

      /* ---- candles ---- */
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = xOf(c);
        if (x < -spacing || x > w - rightPad) continue;
        const upC = c.c >= c.o;
        const col = upC ? pal.up : pal.down;
        const fadeIn = Math.min(1, (t - c.born) / 240);
        const yO = yOf(c.o);
        const yC = yOf(c.c);
        const yH = yOf(c.h);
        const yL = yOf(c.l);

        ctx.globalAlpha = fadeIn;

        ctx.strokeStyle = upC ? pal.upStroke : pal.downStroke;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, yH);
        ctx.lineTo(Math.round(x) + 0.5, yL);
        ctx.stroke();

        const bTop = Math.min(yO, yC);
        const bH = Math.max(2, Math.abs(yO - yC));
        if (i >= last - 2) {
          ctx.shadowColor = col;
          ctx.shadowBlur = 14;
        }
        if (upC) {
          const g = ctx.createLinearGradient(0, bTop, 0, bTop + bH);
          g.addColorStop(0, pal.upFill1);
          g.addColorStop(1, pal.upFill2);
          ctx.fillStyle = g;
        } else {
          const g = ctx.createLinearGradient(0, bTop, 0, bTop + bH);
          g.addColorStop(0, pal.downFill1);
          g.addColorStop(1, pal.downFill2);
          ctx.fillStyle = g;
        }
        roundRect(ctx, x - bodyW / 2, bTop, bodyW, bH, 1.5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      /* ---- EMA-9 (neon glow) ---- */
      const pts: { x: number; y: number }[] = [];
      let ema = candles[0]?.c ?? 0;
      for (let i = 0; i < candles.length; i++) {
        ema = i === 0 ? candles[i].c : candles[i].c * emaK + ema * (1 - emaK);
        const x = xOf(candles[i]);
        if (x < -spacing || x > w - rightPad) continue;
        pts.push({ x, y: yOf(ema) });
      }
      if (pts.length > 2) {
        const g = ctx.createLinearGradient(pts[0].x, 0, pts[pts.length - 1].x, 0);
        g.addColorStop(0, pal.emaGrad[0]);
        g.addColorStop(0.55, pal.emaGrad[1]);
        g.addColorStop(1, pal.emaGrad[2]);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = pal.emaShadow;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const mxp = (pts[i].x + pts[i + 1].x) / 2;
          const myp = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, mxp, myp);
        }
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* ---- last price line + tag + pulsing dot ---- */
      const cur = candles[last];
      const curUp = cur.c >= cur.o;
      const curCol = curUp ? pal.up : pal.down;
      const yPrice = yOf(cur.c);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = curUp ? `${pal.pulseStrokeUp}0.45)` : `${pal.pulseStrokeDown}0.45)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(yPrice) + 0.5);
      ctx.lineTo(w - rightPad + 6, Math.round(yPrice) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      const pulse = reduced ? 0 : (Math.sin(t / 320) + 1) / 2;
      ctx.fillStyle = curCol;
      ctx.beginPath();
      ctx.arc(xOf(cur), yPrice, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = curUp
        ? `${pal.pulseStrokeUp}${0.6 * (1 - pulse)})`
        : `${pal.pulseStrokeDown}${0.6 * (1 - pulse)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(xOf(cur), yPrice, 4 + pulse * 9, 0, Math.PI * 2);
      ctx.stroke();

      const tagW = rightPad - 16;
      const tagH = 20;
      const tagY = Math.min(plotBottom - tagH / 2, Math.max(plotTop, yPrice)) - tagH / 2;
      ctx.fillStyle = "rgba(9,13,22,0.94)";
      roundRect(ctx, w - rightPad + 10, tagY, tagW, tagH, 5);
      ctx.fill();
      ctx.strokeStyle = curUp ? `${pal.pulseStrokeUp}0.65)` : `${pal.pulseStrokeDown}0.65)`;
      ctx.lineWidth = 1;
      roundRect(ctx, w - rightPad + 10, tagY, tagW, tagH, 5);
      ctx.stroke();
      ctx.fillStyle = curUp ? pal.priceTagTextUp : pal.priceTagTextDown;
      ctx.font = `700 10.5px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(fmtPrice(cur.c), w - rightPad + 10 + tagW / 2, tagY + tagH / 2 + 0.5);

      ctx.restore(); // end parallax

      /* ---- crosshair (screen-locked) ---- */
      const inCanvas = mx >= 0 && mx <= w && my >= 0 && my <= h * 0.97 && !reduced;
      if (inCanvas) {
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = "rgba(255,255,255,0.28)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(mx) + 0.5, plotTop - 18);
        ctx.lineTo(Math.round(mx) + 0.5, h * 0.97);
        ctx.stroke();
        if (my < plotBottom + 14) {
          ctx.beginPath();
          ctx.moveTo(0, Math.round(my) + 0.5);
          ctx.lineTo(w - rightPad + 6, Math.round(my) + 0.5);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        const pv = scaleMax - ((my - plotTop) / (plotBottom - plotTop)) * range;
        if (my >= plotTop - 14 && my <= plotBottom + 14) {
          ctx.fillStyle = "rgba(9,13,22,0.94)";
          roundRect(ctx, w - rightPad + 10, my - 10, rightPad - 16, 20, 5);
          ctx.fill();
          ctx.strokeStyle = pal.crosshairBorder;
          roundRect(ctx, w - rightPad + 10, my - 10, rightPad - 16, 20, 5);
          ctx.stroke();
          ctx.fillStyle = pal.crosshairText;
          ctx.font = `700 10.5px ${mono}`;
          ctx.textAlign = "center";
          ctx.fillText(fmtPrice(pv), w - rightPad + 10 + (rightPad - 16) / 2, my + 0.5);
        }

        let best: LiveCandle | null = null;
        let bestD = Infinity;
        for (const c of candles) {
          const d = Math.abs(xOf(c) - mx);
          if (d < bestD) {
            bestD = d;
            best = c;
          }
        }
        if (best && bestD < spacing && w > 640) {
          const upB = best.c >= best.o;
          const pillW = 168;
          const pillH = 44;
          let px0 = mx + 16;
          if (px0 + pillW > w - rightPad) px0 = mx - pillW - 16;
          const py0 = Math.min(h * 0.88, Math.max(8, my - 56));
          ctx.fillStyle = "rgba(9,13,22,0.92)";
          roundRect(ctx, px0, py0, pillW, pillH, 7);
          ctx.fill();
          ctx.strokeStyle = upB ? "rgba(16,185,129,0.45)" : "rgba(244,63,94,0.45)";
          roundRect(ctx, px0, py0, pillW, pillH, 7);
          ctx.stroke();
          ctx.font = `600 9.5px ${mono}`;
          ctx.textBaseline = "middle";
          ctx.textAlign = "left";
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          ctx.fillText(istClock(best.t) + " IST", px0 + 12, py0 + 11);
          const r1 = [
            ["O", fmtPrice(best.o)],
            ["H", fmtPrice(best.h)],
          ] as const;
          const r2 = [
            ["L", fmtPrice(best.l)],
            ["C", fmtPrice(best.c)],
          ] as const;
          r1.forEach(([k, v], i) => {
            const cx0 = px0 + 12 + i * 78;
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillText(k, cx0, py0 + 25);
            ctx.fillStyle = "rgba(255,255,255,0.82)";
            ctx.fillText(v, cx0 + 10, py0 + 25);
          });
          r2.forEach(([k, v], i) => {
            const cx0 = px0 + 12 + i * 78;
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillText(k, cx0, py0 + 37);
            ctx.fillStyle = i === 1 ? (upB ? "#6ee7b7" : "#fda4af") : "rgba(255,255,255,0.82)";
            ctx.fillText(v, cx0 + 10, py0 + 37);
          });
        }
      }

      /* ---- left edge fade ---- */
      const fade = ctx.createLinearGradient(0, 0, w * 0.3, 0);
      fade.addColorStop(0, "rgba(5,7,13,0.85)");
      fade.addColorStop(1, "rgba(5,7,13,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w * 0.3, h);

      /* ---- emit real quote to HUD ---- */
      if (onTickRef.current && t - lastEmit > 250) {
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
  }, [symbol]);

  return (
    <div className={className ?? "absolute inset-0"} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
