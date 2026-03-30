"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type ThemeMode = "hybrid" | "dark" | "light";

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  isDark: boolean;
  isHybrid: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("hybrid");

  useEffect(() => {
    // Load saved preference
    const saved = localStorage.getItem("opportuniq-theme-mode") as ThemeMode | null;
    if (saved && ["hybrid", "dark", "light"].includes(saved)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(saved);
    }
  }, []);

  useEffect(() => {
    // Save preference
    localStorage.setItem("opportuniq-theme-mode", mode);

    // Update document class for global styling
    document.documentElement.classList.remove("theme-hybrid", "theme-dark", "theme-light");
    document.documentElement.classList.add(`theme-${mode}`);
  }, [mode]);

  const value: ThemeContextType = {
    mode,
    setMode,
    isDark: mode === "dark",
    isHybrid: mode === "hybrid",
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
