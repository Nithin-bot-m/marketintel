"use client";

import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

interface OHLC {
  o: number;
  h: number;
  l: number;
  c: number;
}

/** Deterministic pseudo-OHLC derived from a close series (stable across renders). */
function buildOHLC(data: number[]): OHLC[] {
  return data.map((c, i) => {
    const o = i === 0 ? c * 0.9975 : data[i - 1];
    const seed = Math.abs(Math.sin(i * 12.9898 + c * 0.13) * 43758.5453) % 1;
    const seed2 = Math.abs(Math.sin(i * 78.233 + c * 0.31) * 24634.6345) % 1;
    const wickBase = Math.abs(c - o) + c * 0.0035;
    const h = Math.max(o, c) + wickBase * (0.35 + seed * 0.65);
    const l = Math.min(o, c) - wickBase * (0.35 + seed2 * 0.65);
    return { o, h, l, c };
  });
}

/**
 * Compact animated candlestick chart — candles rise in sequence when the
 * card scrolls into view, then the last candle "breathes" with a soft glow.
 */
export default function MiniCandles({
  data,
  up,
  className,
}: {
  data: number[];
  up: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inView = useInView(wrapRef, { once: true, margin: "-40px" });
  const inViewRef = useRef(false);

  useEffect(() => {
    inViewRef.current = inView;
  }, [inView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ohlc = buildOHLC(data);
    const n = ohlc.length;
    const UP = "#10b981";
    const DOWN = "#f43f5e";
    const col = up ? UP : DOWN;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    let raf = 0;
    const t0 = performance.now();
    const STAGGER = 75;
    const GROW = 480;

    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!inViewRef.current || w < 4 || h < 4) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      let min = Infinity;
      let max = -Infinity;
      for (const c of ohlc) {
        if (c.l < min) min = c.l;
        if (c.h > max) max = c.h;
      }
      const pad = (max - min) * 0.18 || 1;
      min -= pad;
      max += pad;
      const range = max - min || 1;

      const spacing = w / n;
      const bodyW = Math.max(2.5, spacing * 0.5);
      const top = h * 0.1;
      const bottom = h * 0.94;
      const yOf = (v: number) => top + ((max - v) / range) * (bottom - top);

      // baseline gridline
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, Math.round(bottom) + 0.5);
      ctx.lineTo(w, Math.round(bottom) + 0.5);
      ctx.stroke();

      const liveT = (t - t0) / 1000;

      for (let i = 0; i < n; i++) {
        const c = ohlc[i];
        const x = i * spacing + spacing / 2;
        const p = reduced
          ? 1
          : Math.min(1, Math.max(0, (t - t0 - i * STAGGER) / GROW));
        if (p <= 0) continue;
        const e = easeOut(p);
        const isLast = i === n - 1;

        // breathing on last candle after entrance
        let cLive = c.c;
        if (isLast && p >= 1 && !reduced) {
          cLive = c.c + Math.sin(liveT * 2.2 + i) * range * 0.016;
        }

        const yO = yOf(c.o);
        const yC = yOf(cLive);
        const yH = yOf(c.o + (c.h - c.o) * e);
        const yL = yOf(c.o + (c.l - c.o) * e);

        ctx.globalAlpha = 0.35 + 0.65 * e;

        // wick
        ctx.strokeStyle = up ? "rgba(16,185,129,0.65)" : "rgba(244,63,94,0.65)";
        ctx.beginPath();
        ctx.moveTo(Math.round(x) + 0.5, yH);
        ctx.lineTo(Math.round(x) + 0.5, yL);
        ctx.stroke();

        // body (grows from open toward close)
        const bTop = Math.min(yO, yC);
        const bH = Math.max(1.8, Math.abs(yO - yC));
        if (isLast) {
          ctx.shadowColor = col;
          ctx.shadowBlur = 10 + (p >= 1 && !reduced ? Math.sin(liveT * 2.2) * 3 : 0);
        }
        ctx.fillStyle = col;
        ctx.fillRect(x - bodyW / 2, bTop, bodyW, bH);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // pulsing dot on last close
      if (!reduced) {
        const lastC = ohlc[n - 1];
        const pulse = (Math.sin(liveT * 2.6) + 1) / 2;
        const x = (n - 1) * spacing + spacing / 2;
        const y = yOf(lastC.c);
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x, y, 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = up
          ? `rgba(16,185,129,${0.5 * (1 - pulse)})`
          : `rgba(244,63,94,${0.5 * (1 - pulse)})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(x, y, 3 + pulse * 7, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [data, up]);

  return (
    <div ref={wrapRef} className={className} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
