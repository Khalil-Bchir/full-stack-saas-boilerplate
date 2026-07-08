'use client';

import { ThemeProvider } from '@/components/shared/providers/theme-provider';
import { Spinner } from '@/components/shared/spinner';
import { persistor, store } from '@/lib/store';
import type React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

export function ClientProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="bg-background flex h-screen items-center justify-center">
            <Spinner />
          </div>
        }
        persistor={persistor}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
