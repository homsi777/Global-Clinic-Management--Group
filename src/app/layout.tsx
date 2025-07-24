import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/components/app-provider";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider, useLocale } from "@/components/locale-provider";
import { LocaleLayout } from "@/components/locale-layout";


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
    <AppProvider>
      <ThemeProvider>
        <LocaleProvider>
            <LocaleLayout>
              {children}
              <Toaster />
            </LocaleLayout>
        </LocaleProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
