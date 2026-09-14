"use client";

import { useEffect, useState } from "react";
import { useMarketTheme } from "./ThemeContext";
import { Shield, Zap, Terminal, Globe, Cpu } from "lucide-react";

export default function CyberTelemetryBar() {
  const { theme } = useMarketTheme();
  const [latency, setLatency] = useState(14);
  const [clock, setClock] = useState("09:15:00 IST");

  useEffect(() => {
    const updateTime = () => {
      try {
        const ist = new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).format(new Date());
        setClock(`${ist} IST`);
      } catch {
        /* fallback */
      }
    };
    updateTime();
    const tId = setInterval(updateTime, 1000);

    // subtle latency jitter between 11ms and 19ms
    const lId = setInterval(() => {
      setLatency(Math.floor(12 + Math.random() * 8));
    }, 4000);

    return () => {
      clearInterval(tId);
      clearInterval(lId);
    };
  }, []);

  return (
    <div
      className={`relative z-40 border-b transition-colors duration-500 font-data text-[10px] tracking-wider uppercase ${
        theme === "cyberpunk"
          ? "border-cyan-500/25 bg-[#030509]/90 text-cyan-400"
          : theme === "matrix"
          ? "border-emerald-500/25 bg-[#010904]/90 text-emerald-400"
          : "border-white/10 bg-[#05070d]/90 text-muted-foreground"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1 sm:px-6 lg:px-8">
        {/* Left: Terminal Node Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="relative flex h-2 w-2">
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                  theme === "cyberpunk"
                    ? "bg-cyan-400"
                    : theme === "matrix"
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  theme === "cyberpunk"
                    ? "bg-cyan-400"
                    : theme === "matrix"
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
            </span>
            <span className="tracking-widest">
              {theme === "cyberpunk"
                ? "CYBER.INTEL // v3.2"
                : theme === "matrix"
                ? "MATRIX.NEURAL // T1"
                : "MARKETINTEL.FX // LIVE"}
            </span>
          </div>

          <span className="hidden opacity-35 sm:inline">|</span>

          <div className="hidden items-center gap-1.5 opacity-80 md:flex">
            <Globe className="h-3 w-3" />
            <span>NODE: IN-BOM-01</span>
          </div>

          <span className="hidden opacity-35 md:inline">|</span>

          <div className="hidden items-center gap-1.5 opacity-80 lg:flex">
            <Cpu className="h-3 w-3" />
            <span>CIPHER: AES-256</span>
          </div>
        </div>

        {/* Center / Right: Feed Protocol, Latency, Clock */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="hidden sm:inline">LATENCY:</span>
            <span className="font-bold text-foreground">{latency}ms</span>
          </div>

          <span className="opacity-35">|</span>

          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-emerald-400" />
            <span className="hidden md:inline">FEED:</span>
            <span className="font-semibold text-foreground">T1-OFFICIAL</span>
          </div>

          <span className="opacity-35">|</span>

          <div className="font-bold text-foreground tracking-widest">{clock}</div>
        </div>
      </div>
    </div>
  );
}
