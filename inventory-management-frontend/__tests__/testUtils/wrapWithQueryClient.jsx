import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function wrapWithQueryClient(children) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}