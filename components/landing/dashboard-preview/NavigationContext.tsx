"use client";

import { createContext, useContext } from "react";
import type { ViewType } from "./types";

interface NavigationContextType {
  navigate: (view: ViewType) => void;
}

export const NavigationContext = createContext<NavigationContextType | null>(null);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
