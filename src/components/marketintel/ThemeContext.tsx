"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type MarketTheme = "cyberpunk" | "obsidian" | "matrix";

interface ThemeContextValue {
  theme: MarketTheme;
  setTheme: (theme: MarketTheme) => void;
  scanlines: boolean;
  toggleScanlines: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MarketTheme>("cyberpunk");
  const [scanlines] = useState<boolean>(true);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = (newTheme: MarketTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("marketintel_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {
      /* ignore storage errors */
    }
  };

  const toggleScanlines = () => {};

  return (
    <ThemeContext.Provider value={{ theme, setTheme, scanlines, toggleScanlines }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useMarketTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "cyberpunk" as MarketTheme,
      setTheme: () => {},
      scanlines: true,
      toggleScanlines: () => {},
    };
  }
  return context;
}
