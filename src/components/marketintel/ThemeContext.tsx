"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type MarketTheme = "cyberpunk" | "obsidian" | "matrix" | "light" | "dark";

interface ThemeContextValue {
  theme: MarketTheme;
  setTheme: (theme: MarketTheme) => void;
  isDark: boolean;
  toggleTheme: () => void;
  scanlines: boolean;
  toggleScanlines: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MarketTheme>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("marketintel_theme") as MarketTheme | null;
        if (saved && ["cyberpunk", "obsidian", "matrix", "light", "dark"].includes(saved)) {
          return saved;
        }
      } catch {
        /* ignore */
      }
    }
    return "obsidian";
  });
  const [scanlines, setScanlines] = useState<boolean>(true);

  const isDark = theme !== "light";

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    } else {
      const dataTheme = theme === "dark" ? "obsidian" : theme;
      root.setAttribute("data-theme", dataTheme);
      root.classList.add("dark");
      root.classList.remove("light");
      root.style.colorScheme = "dark";
    }
  }, [theme]);

  const setTheme = (newTheme: MarketTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("marketintel_theme", newTheme);
    } catch {
      /* ignore storage errors */
    }
  };

  const toggleTheme = () => {
    const next: MarketTheme = isDark ? "light" : "obsidian";
    setTheme(next);
  };

  const toggleScanlines = () => {
    setScanlines((s) => !s);
  };

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, isDark, toggleTheme, scanlines, toggleScanlines }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useMarketTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: "obsidian" as MarketTheme,
      setTheme: () => {},
      isDark: true,
      toggleTheme: () => {},
      scanlines: true,
      toggleScanlines: () => {},
    };
  }
  return context;
}
