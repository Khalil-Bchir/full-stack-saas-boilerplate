'use client';

import { Spinner } from '@/components/common/spinner';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { AuthProvider } from '@/context/AuthContext';
import { persistor, store } from '@/services/store';
import type React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
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
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </PersistGate>
    </Provider>
  );
};

export default ClientProvider;
