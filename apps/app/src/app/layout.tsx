import '@/app/globals.css';
import { ClientProvider } from '@/components/shared/providers/client-provider';
import { siteConfig } from '@/config/site';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { Toaster } from '@saas-boilerplate/ui/components/sonner';
import { TooltipProvider } from '@saas-boilerplate/ui/components/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <TooltipProvider>
          <ClientProvider>{children}</ClientProvider>
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
