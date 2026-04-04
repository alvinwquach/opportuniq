"use client";

import { createContext, useContext } from "react";

export const DarkModeContext = createContext(false);

export function useDarkMode() {
  return useContext(DarkModeContext);
}
