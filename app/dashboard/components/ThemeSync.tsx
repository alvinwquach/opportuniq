"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

interface ThemeSyncProps {
  savedTheme?: "light" | "dark" | "auto" | null;
}

/**
 * ThemeSync - Syncs the user's saved theme preference from the database
 * with next-themes on mount. This ensures the theme is applied when
 * the user loads the dashboard after login.
 */
export function ThemeSync({ savedTheme }: ThemeSyncProps) {
  const { setTheme, theme } = useTheme();

  useEffect(() => {
    if (savedTheme && savedTheme !== "auto") {
      // User has a specific preference saved
      if (theme !== savedTheme) {
        setTheme(savedTheme);
      }
    } else if (savedTheme === "auto" && theme !== "system") {
      // User wants system preference
      setTheme("system");
    }
    // If no savedTheme, keep whatever next-themes defaults to (system)
  }, [savedTheme, setTheme, theme]);

  return null;
}
