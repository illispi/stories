// @refresh reload
import { MetaProvider, Title } from '@solidjs/meta';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { edenTreaty } from '@elysiajs/eden';
import { clientEnv } from '~/utils/env/client';
import type { App } from './routes/api';
import './app.css';
import { Suspense } from 'solid-js';

export const app = edenTreaty<App>(clientEnv.HOST_URL);

export default function App() {
  const queryClient = new QueryClient();
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Title>Schizophrenia poll</Title>
          <QueryClientProvider client={queryClient}>
            <Suspense>{props.children}</Suspense>
          </QueryClientProvider>
        </MetaProvider>
      )}>
      <FileRoutes />
    </Router>
  );
}
