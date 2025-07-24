'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MonitorPlay, Settings, CreditCard, Moon, Sun, Globe } from 'lucide-react';
import { Logo } from '@/components/icons/logo';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';
import { useLocale } from '@/components/locale-provider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarInset>
          <SidebarHeader>
            <div className="flex h-10 items-center gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 font-semibold text-primary"
              >
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-lg font-bold group-data-[collapsible=icon]:hidden">
                  OrthoFlow
                </span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/')}
                  tooltip={{ children: 'Dashboard' }}
                >
                  <Link href="/">
                    <Home />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/patients')}
                  tooltip={{ children: 'Patients' }}
                >
                  <Link href="/patients">
                    <Users />
                    <span>Patients</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/financials')}
                  tooltip={{ children: 'Financials' }}
                >
                  <Link href="/financials">
                    <CreditCard />
                    <span>Financials</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/waiting-room')}
                  tooltip={{ children: 'Waiting Room Screen' }}
                >
                  <Link href="/waiting-room" target="_blank">
                    <MonitorPlay />
                    <span>Waiting Room</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="items-center justify-center group-data-[collapsible=icon]:gap-4">
             <div className="flex w-full flex-col gap-2 group-data-[collapsible=icon]:items-center">
              <div className="flex w-full gap-2 group-data-[collapsible=icon]:flex-col">
                 <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    <span className="group-data-[collapsible=icon]:hidden">
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <Globe className="size-4" />
                         <span className="group-data-[collapsible=icon]:hidden">{locale.toUpperCase()}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setLocale('en')}>
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLocale('ar')}>
                        العربية
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Settings className="size-4" />
                <span className="group-data-[collapsible=icon]:hidden">Settings</span>
              </Button>
            </div>
            <SidebarTrigger className="self-end justify-self-end group-data-[collapsible=icon]:self-center group-data-[collapsible=icon]:justify-self-center [&_svg]:size-5" />
          </SidebarFooter>
        </SidebarInset>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </Sidebar>
    </SidebarProvider>
  );
}
