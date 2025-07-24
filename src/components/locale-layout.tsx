'use client';

import { useLocale } from './locale-provider';
import { cn } from "@/lib/utils";
import React from 'react';

export function LocaleLayout({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
       <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased",
          locale === 'ar' && 'font-arabic'
        )}
      >
        {children}
      </body>
    </html>
  );
}
