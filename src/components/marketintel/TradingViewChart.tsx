"use client";

import { useEffect, useRef, memo } from "react";
import { useMarketTheme } from "./ThemeContext";

interface Props {
  symbol?: string;
  interval?: string;
  className?: string;
}

function TradingViewChartComponent({
  symbol = "OANDA:XAUUSD",
  interval = "1",
  className = "w-full h-full",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isDark } = useMarketTheme();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget
    container.innerHTML = "";

    const widgetDiv = document.createElement("div");
    widgetDiv.className = "tradingview-widget-container__widget";
    widgetDiv.style.height = "100%";
    widgetDiv.style.width = "100%";
    container.appendChild(widgetDiv);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval,
      timezone: "Etc/UTC",
      theme: isDark ? "dark" : "light",
      style: "1", // 1 = Candles
      locale: "en",
      enable_publishing: false,
      backgroundColor: isDark ? "rgba(5, 7, 13, 0.95)" : "rgba(248, 250, 252, 0.98)",
      gridColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(15, 23, 42, 0.06)",
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, interval, isDark]);

  return (
    <div className={`tradingview-widget-container ${className}`} ref={containerRef} style={{ height: "100%", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

export default memo(TradingViewChartComponent);
