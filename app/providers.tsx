"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeProvider as HybridThemeProvider } from "@/lib/theme-context";
import { PostHogProvider } from "posthog-js/react";
import { useState } from "react";
import posthog from "@/lib/posthog/client";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is fresh for 1 minute
            staleTime: 60 * 1000,
            // Keep unused data in cache for 5 minutes
            gcTime: 5 * 60 * 1000,
            // Retry failed requests once
            retry: 1,
            // Refetch on window focus
            refetchOnWindowFocus: true,
          },
          mutations: {
            // Retry failed mutations once
            retry: 1,
          },
        },
      })
  );

  return (
    <PostHogProvider client={posthog}>
      <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
        <HybridThemeProvider>
          <QueryClientProvider client={queryClient}>
            {children}
            {/* Show React Query DevTools in development */}
            {process.env.NODE_ENV === "development" && (
              <ReactQueryDevtools initialIsOpen={false} />
            )}
          </QueryClientProvider>
        </HybridThemeProvider>
      </NextThemesProvider>
    </PostHogProvider>
  );
}
