"use client";

import { MindWeatherProvider } from "@/hooks/useMindWeather";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } }));
  return (
    <QueryClientProvider client={queryClient}>
      <MindWeatherProvider>{children}</MindWeatherProvider>
    </QueryClientProvider>
  );
}
