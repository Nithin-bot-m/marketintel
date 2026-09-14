"use client";

import { useMarketTheme } from "./ThemeContext";

/**
 * Site-wide cinematic cyberpunk / retro-futuristic backdrop.
 * Features 3D perspective cyber grid floor, CRT scanlines, drifting aurora glows, dot grid, film grain.
 */
export default function BackdropFX() {
  const { theme } = useMarketTheme();
  const isLight = theme === "light";

  return (
    <>
      {/* Permanent CRT Scanlines Filter Overlay (disabled in light mode) */}
      {!isLight && (
        <div
          aria-hidden
          className="cyber-scanlines pointer-events-none fixed inset-0 z-[60] opacity-35"
        />
      )}

      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* 3D Perspective Cyber Grid Floor */}
        <div className="perspective-grid">
          <div className="perspective-grid-plane" />
        </div>

        {/* Ambient Aurora Glows */}
        {theme === "cyberpunk" ? (
          <>
            <div className="aurora w-[46vw] h-[46vw] -right-[10vw] -top-[14vw] bg-[radial-gradient(circle,rgba(0,240,255,0.18),transparent_65%)] animate-[drift-a_24s_ease-in-out_infinite_alternate]" />
            <div className="aurora w-[42vw] h-[42vw] -left-[12vw] top-[24vh] bg-[radial-gradient(circle,rgba(255,0,85,0.14),transparent_65%)] animate-[drift-b_28s_ease-in-out_infinite_alternate]" />
            <div className="aurora w-[44vw] h-[44vw] left-[20vw] -bottom-[18vw] bg-[radial-gradient(circle,rgba(252,238,10,0.10),transparent_65%)] animate-[drift-c_34s_ease-in-out_infinite_alternate]" />
          </>
        ) : theme === "matrix" ? (
          <>
            <div className="aurora w-[46vw] h-[46vw] -right-[10vw] -top-[14vw] bg-[radial-gradient(circle,rgba(0,255,102,0.16),transparent_65%)] animate-[drift-a_24s_ease-in-out_infinite_alternate]" />
            <div className="aurora w-[42vw] h-[42vw] -left-[12vw] top-[24vh] bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_65%)] animate-[drift-b_28s_ease-in-out_infinite_alternate]" />
            <div className="aurora w-[44vw] h-[44vw] left-[20vw] -bottom-[18vw] bg-[radial-gradient(circle,rgba(0,240,255,0.10),transparent_65%)] animate-[drift-c_34s_ease-in-out_infinite_alternate]" />
          </>
        ) : isLight ? (
          <>
            <div className="aurora w-[46vw] h-[46vw] -right-[10vw] -top-[14vw] bg-[radial-gradient(circle,rgba(217,119,6,0.08),transparent_65%)] animate-[drift-a_28s_ease-in-out_infinite_alternate]" />
            <div className="aurora w-[40vw] h-[40vw] -left-[12vw] top-[24vh] bg-[radial-gradient(circle,rgba(37,99,235,0.05),transparent_65%)] animate-[drift-b_32s_ease-in-out_infinite_alternate]" />
          </>
        ) : (
          <>
            <div className="aurora aurora-gold" />
            <div className="aurora aurora-violet" />
            <div className="aurora aurora-emerald" />
          </>
        )}

        {/* Tactical Dot Grid & Film Grain Layer */}
        <div
          className={`dot-grid absolute inset-0 ${
            isLight ? "opacity-15" : "opacity-[0.25]"
          } [mask-image:radial-gradient(ellipse_at_50%_0%,black_5%,transparent_60%)]`}
        />
        <div className="noise-layer absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-[var(--background)]/85 to-transparent" />
      </div>
    </>
  );
}
