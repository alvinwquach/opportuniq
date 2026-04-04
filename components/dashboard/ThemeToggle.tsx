"use client";

import { useEffect, useState } from "react";
import { IoMoon, IoSunny } from "react-icons/io5";
import { cn } from "@/lib/utils";

/**
 * Theme Toggle
 *
 * Dark/Light mode toggle for the dashboard.
 * Landing page is dark-only, so this is dashboard-only.
 *
 * Persists preference to localStorage and system preference.
 */

type Theme = "dark" | "light";

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  // Load theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else if (systemPrefersDark) {
       
      setTheme("dark");
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
       
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
        theme === "dark"
          ? "bg-[#1f1f1f] hover:bg-[#2a2a2a] text-[#888] hover:text-white"
          : "bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900",
        className
      )}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <IoSunny className="w-4 h-4" />
      ) : (
        <IoMoon className="w-4 h-4" />
      )}
    </button>
  );
}

/**
 * Theme Provider Hook
 *
 * For components that need to know the current theme.
 */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
       
      setTheme(systemPrefersDark ? "dark" : "light");
    }

    // Listen for changes
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute("data-theme") as Theme;
      if (current) setTheme(current);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return theme;
}
