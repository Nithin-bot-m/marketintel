"use client";

import { useEffect, useRef } from "react";

export interface CandleTick {
  price: number;
  changePct: number;
  count: number;
}

interface Candle {
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  born: number;
  seq: number;
}

interface Props {
  onTick?: (t: CandleTick) => void;
  className?: string;
}

const CANDLE_MS = 1350; // one candle completes every 1.35s
const TICK_MS = 110; // price ticks 9x per second
const MAX_CANDLES = 150;
const SESSION_OPEN = 24700;
const UP_C = "#10b981";
const DOWN_C = "#f43f5e";
const GOLD = "#f5b54a";
const BG = "#05070d";

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

function seqToClock(seq: number): string {
  const total = 9 * 60 + 15 + seq; // session starts 09:15, 1 candle = 1 min market time
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/**
 * Cinematic streaming candlestick chart.
 * Candles form live, the tape glides left continuously, EMA glows,
 * crosshair tracks the cursor — pure 2D canvas, no WebGL blocks.
 */
export default function CandleChart({ onTick, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onTickRef = useRef(onTick);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const wrap = canvas.parentElement as HTMLElement;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- engine state ---------------- */
    let price = 24655;
    let momentum = 0.4;
    let seq = 0;
    const candles: Candle[] = [];
    let lastCandleAt = 0;
    let lastTickAt = 0;
    let lastEmit = 0;

    const stepPrice = (drift: number) => {
      momentum = momentum * 0.965 + (Math.random() - 0.5) * 0.9;
      const reversion = (24830 - price) * 0.0011;
      const shock = Math.random() < 0.04 ? (Math.random() - 0.5) * 11 : 0;
      price += momentum + reversion + drift + shock;
    };

    // seed ~64 candles of history with a gentle upward arc
    (function seed() {
      const now = performance.now();
      price = 24655;
      for (let i = 64; i >= 0; i--) {
        const o = price;
        let h = o;
        let l = o;
        for (let k = 0; k < 12; k++) {
          stepPrice(0.5);
          h = Math.max(h, price);
          l = Math.min(l, price);
        }
        candles.push({
          o,
          h,
          l,
          c: price,
          v: 0.28 + Math.random() * 0.55,
          born: now - i * CANDLE_MS,
          seq: seq++,
        });
      }
      lastCandleAt = now;
    })();

    const spawn = (t: number) => {
      candles.push({ o: price, h: price, l: price, c: price, v: 0.2, born: t, seq: seq++ });
      lastCandleAt = t;
      if (candles.length > MAX_CANDLES) candles.splice(0, candles.length - MAX_CANDLES);
    };

    const tick = () => {
      const cur = candles[candles.length - 1];
      if (!cur) return;
      stepPrice(0);
      cur.c = price;
      if (price > cur.h) cur.h = price;
      if (price < cur.l) cur.l = price;
      cur.v = Math.min(1, cur.v + 0.045);
    };

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
    let ppx = 0; // parallax lerped
    let ppy = 0;
    const mono = fontStack();

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);

      // catch-up guards (tab hidden)
      if (t - lastCandleAt > CANDLE_MS * 3) lastCandleAt = t - CANDLE_MS;
      while (t - lastCandleAt >= CANDLE_MS) spawn(lastCandleAt + CANDLE_MS);
      if (t - lastTickAt >= TICK_MS) {
        tick();
        lastTickAt = t;
      }
      if (onTickRef.current && t - lastEmit > 240) {
        onTickRef.current({
          price,
          changePct: ((price - SESSION_OPEN) / SESSION_OPEN) * 100,
          count: candles.length,
        });
        lastEmit = t;
      }

      /* geometry */
      const rightPad = Math.min(96, Math.max(70, w * 0.075));
      const spacing = Math.max(8, Math.min(17, w / 64));
      const pxPerMs = spacing / CANDLE_MS;
      const spawnX = w - rightPad - spacing;
      const plotTop = h * 0.16;
      const plotBottom = h * 0.85;
      const bodyW = Math.max(3, spacing * 0.52);

      const xOf = (c: Candle) => spawnX - (t - c.born) * pxPerMs;

      /* visible slice */
      let visMin = Infinity;
      let visMax = -Infinity;
      for (const c of candles) {
        if (xOf(c) < -spacing * 2) continue;
        if (c.l < visMin) visMin = c.l;
        if (c.h > visMax) visMax = c.h;
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

      /* parallax */
      const tx = reduced || mx < 0 ? 0 : ((mx / w - 0.5) * 20);
      const ty = reduced || my < 0 ? 0 : ((my / h - 0.5) * 12);
      ppx += (tx - ppx) * 0.045;
      ppy += (ty - ppy) * 0.045;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      /* chart scene (parallaxed) */
      ctx.save();
      ctx.translate(ppx, ppy);

      /* horizontal grid + right price labels */
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

      /* vertical session-time gridlines */
      for (const c of candles) {
        if (c.seq % 10 !== 0) continue;
        const x = xOf(c);
        if (x < 0 || x > w - rightPad) continue;
        ctx.strokeStyle = "rgba(255,255,255,0.028)";
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, plotTop - 18);
        ctx.lineTo(Math.round(x) + 0.5, h * 0.97);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,255,255,0.18)";
        ctx.textAlign = "center";
        ctx.fillText(seqToClock(c.seq), x, h * 0.985);
        ctx.textAlign = "left";
      }

      const last = candles.length - 1;
      const emaK = 2 / 10;

      /* volume bars */
      const volBase = h * 0.985;
      const volMax = h * 0.075;
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = xOf(c);
        if (x < -spacing || x > w - rightPad) continue;
        const upC = c.c >= c.o;
        const alpha = i === last ? 0.34 : 0.16;
        ctx.fillStyle = upC
          ? `rgba(16,185,129,${alpha})`
          : `rgba(244,63,94,${alpha})`;
        const vh = c.v * volMax;
        ctx.fillRect(x - bodyW / 2, volBase - vh, bodyW, vh);
      }

      /* candles */
      for (let i = 0; i < candles.length; i++) {
        const c = candles[i];
        const x = xOf(c);
        if (x < -spacing || x > w - rightPad) continue;
        const upC = c.c >= c.o;
        const col = upC ? UP_C : DOWN_C;
        const age = t - c.born;
        const fadeIn = Math.min(1, age / 240);
        const yO = yOf(c.o);
        const yC = yOf(c.c);
        const yH = yOf(c.h);
        const yL = yOf(c.l);

        ctx.globalAlpha = fadeIn;

        // wick
        ctx.strokeStyle = upC ? "rgba(16,185,129,0.7)" : "rgba(244,63,94,0.7)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, yH);
        ctx.lineTo(Math.round(x) + 0.5, yL);
        ctx.stroke();

        // body
        const bTop = Math.min(yO, yC);
        const bH = Math.max(2, Math.abs(yO - yC));
        if (i >= last - 2) {
          ctx.shadowColor = col;
          ctx.shadowBlur = 13;
        }
        if (upC) {
          const g = ctx.createLinearGradient(0, bTop, 0, bTop + bH);
          g.addColorStop(0, "rgba(52,211,153,0.95)");
          g.addColorStop(1, "rgba(5,150,105,0.85)");
          ctx.fillStyle = g;
        } else {
          const g = ctx.createLinearGradient(0, bTop, 0, bTop + bH);
          g.addColorStop(0, "rgba(251,113,133,0.95)");
          g.addColorStop(1, "rgba(225,29,72,0.85)");
          ctx.fillStyle = g;
        }
        roundRect(ctx, x - bodyW / 2, bTop, bodyW, bH, 1.5);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      /* EMA line */
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
        g.addColorStop(0, "rgba(245,181,74,0)");
        g.addColorStop(0.55, "rgba(245,181,74,0.38)");
        g.addColorStop(1, "rgba(245,181,74,0.95)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.shadowColor = "rgba(245,181,74,0.55)";
        ctx.shadowBlur = 9;
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

      /* last price line + tag + pulsing dot */
      const cur = candles[last];
      const curUp = cur.c >= cur.o;
      const curCol = curUp ? UP_C : DOWN_C;
      const yPrice = yOf(cur.c);
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = curUp ? "rgba(16,185,129,0.42)" : "rgba(244,63,94,0.42)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(yPrice) + 0.5);
      ctx.lineTo(w - rightPad + 6, Math.round(yPrice) + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // pulsing dot on the forming candle
      const pulse = reduced ? 0 : (Math.sin(t / 320) + 1) / 2;
      ctx.fillStyle = curCol;
      ctx.beginPath();
      ctx.arc(xOf(cur), yPrice, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = curUp
        ? `rgba(16,185,129,${0.55 * (1 - pulse)})`
        : `rgba(244,63,94,${0.55 * (1 - pulse)})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(xOf(cur), yPrice, 4 + pulse * 9, 0, Math.PI * 2);
      ctx.stroke();

      // price tag
      const tagW = rightPad - 16;
      const tagH = 20;
      const tagY = Math.min(plotBottom - tagH / 2, Math.max(plotTop, yPrice)) - tagH / 2;
      ctx.fillStyle = "rgba(9,13,22,0.94)";
      roundRect(ctx, w - rightPad + 10, tagY, tagW, tagH, 5);
      ctx.fill();
      ctx.strokeStyle = curUp ? "rgba(16,185,129,0.55)" : "rgba(244,63,94,0.55)";
      ctx.lineWidth = 1;
      roundRect(ctx, w - rightPad + 10, tagY, tagW, tagH, 5);
      ctx.stroke();
      ctx.fillStyle = curUp ? "#6ee7b7" : "#fda4af";
      ctx.font = `700 10.5px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(fmtPrice(cur.c), w - rightPad + 10 + tagW / 2, tagY + tagH / 2 + 0.5);

      ctx.restore(); // end parallax

      /* crosshair (screen-locked) */
      const inCanvas =
        mx >= 0 && mx <= w && my >= 0 && my <= h * 0.97 && !reduced;
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

        // price at cursor
        const pv = scaleMax - ((my - plotTop) / (plotBottom - plotTop)) * range;
        if (my >= plotTop - 14 && my <= plotBottom + 14) {
          ctx.fillStyle = "rgba(9,13,22,0.94)";
          roundRect(ctx, w - rightPad + 10, my - 10, rightPad - 16, 20, 5);
          ctx.fill();
          ctx.strokeStyle = "rgba(245,181,74,0.6)";
          roundRect(ctx, w - rightPad + 10, my - 10, rightPad - 16, 20, 5);
          ctx.stroke();
          ctx.fillStyle = "#fcd34d";
          ctx.font = `700 10.5px ${mono}`;
          ctx.textAlign = "center";
          ctx.fillText(fmtPrice(pv), w - rightPad + 10 + (rightPad - 16) / 2, my + 0.5);
        }

        // snap to nearest candle → OHLC pill
        let best: Candle | null = null;
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
          const pillW = 152;
          const pillH = 40;
          let px0 = mx + 16;
          if (px0 + pillW > w - rightPad) px0 = mx - pillW - 16;
          const py0 = Math.min(h * 0.88, Math.max(8, my - 52));
          ctx.fillStyle = "rgba(9,13,22,0.92)";
          roundRect(ctx, px0, py0, pillW, pillH, 7);
          ctx.fill();
          ctx.strokeStyle = upB ? "rgba(16,185,129,0.45)" : "rgba(244,63,94,0.45)";
          roundRect(ctx, px0, py0, pillW, pillH, 7);
          ctx.stroke();
          ctx.font = `600 9.5px ${mono}`;
          ctx.textBaseline = "middle";
          const r1 = [
            ["O", fmtPrice(best.o)],
            ["H", fmtPrice(best.h)],
          ] as const;
          const r2 = [
            ["L", fmtPrice(best.l)],
            ["C", fmtPrice(best.c)],
          ] as const;
          r1.forEach(([k, v], i) => {
            const cx0 = px0 + 12 + i * 74;
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillText(k, cx0, py0 + 13);
            ctx.fillStyle = "rgba(255,255,255,0.82)";
            ctx.fillText(v, cx0 + 10, py0 + 13);
          });
          r2.forEach(([k, v], i) => {
            const cx0 = px0 + 12 + i * 74;
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(255,255,255,0.4)";
            ctx.fillText(k, cx0, py0 + 27);
            ctx.fillStyle = i === 1 ? (upB ? "#6ee7b7" : "#fda4af") : "rgba(255,255,255,0.82)";
            ctx.fillText(v, cx0 + 10, py0 + 27);
          });
        }
      }

      /* left edge fade into the void */
      const fade = ctx.createLinearGradient(0, 0, w * 0.3, 0);
      fade.addColorStop(0, "rgba(5,7,13,0.85)");
      fade.addColorStop(1, "rgba(5,7,13,0)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w * 0.3, h);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className={className ?? "absolute inset-0"} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
