import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/components/app-provider";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";


export const metadata: Metadata = {
  title: "العالمية جروب لادارة عيادات",
  description: "حل متكامل لإدارة عياداتكم.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-body antialiased"
        )}
      >
        <ThemeProvider>
          <LocaleProvider>
            <AppProvider>
              {children}
              <Toaster />
            </AppProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
