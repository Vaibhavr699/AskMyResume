'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1, // Retry failed queries once
            refetchOnWindowFocus: false, // Disable refetch on window focus
            staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
          },
          mutations: {
            retry: 1, // Retry failed mutations once
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

 
 
 
 