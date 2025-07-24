'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MonitorPlay, Settings, CreditCard, Moon, Sun, Globe, FileText, ShoppingCart, User, Users2 } from 'lucide-react';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useClinicContext } from '@/components/app-provider';
import type { UserRole } from '@/lib/types';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (path: string) => pathname === path;
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { currentUser, users, setCurrentUser } = useClinicContext();


  const navItems = [
      { href: '/', icon: <Home />, label: 'Dashboard', labelAr: 'الشاشة الرئيسية', roles: ['Admin', 'Nurse', 'DoctorAssistant'] as UserRole[] },
      { href: '/patients', icon: <Users />, label: 'Patients', labelAr: 'المرضى', roles: ['Admin', 'Nurse', 'DoctorAssistant'] as UserRole[] },
      { href: '/financials', icon: <CreditCard />, label: 'Financials', labelAr: 'المالية', roles: ['Admin'] as UserRole[] },
      { href: '/reports', icon: <FileText />, label: 'Reports', labelAr: 'التقارير', roles: ['Admin', 'DoctorAssistant'] as UserRole[] },
      { href: '/expenses', icon: <ShoppingCart />, label: 'Expenses', labelAr: 'المصاريف', roles: ['Admin'] as UserRole[] },
      { href: '/waiting-room', icon: <MonitorPlay />, label: 'Waiting Room', labelAr: 'شاشة الانتظار', target: '_blank', roles: ['Admin', 'Nurse'] as UserRole[] },
  ]

  const visibleNavItems = navItems.filter(item => item.roles.includes(currentUser.role));


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
                  العالمية جروب
                </span>
              </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
                {visibleNavItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={{ children: locale === 'ar' ? item.labelAr : item.label }}
                        >
                        <Link href={item.href} target={item.target}>
                            {item.icon}
                            <span>{locale === 'ar' ? item.labelAr : item.label}</span>
                        </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="items-center justify-center group-data-[collapsible=icon]:gap-4">
             <div className="flex w-full flex-col gap-2 group-data-[collapsible=icon]:items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full">
                        <User className="size-4" />
                         <span className="group-data-[collapsible=icon]:hidden">{currentUser.name}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Switch Role</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {users.map(user => (
                             <DropdownMenuItem key={user._id} onClick={() => setCurrentUser(user)}>
                                {user.name} ({user.role})
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

              <div className="flex w-full gap-2 group-data-[collapsible=icon]:flex-col">
                 <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  >
                    {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                    <span className="group-data-[collapsible=icon]:hidden">
                      {locale === 'ar' ? (theme === 'dark' ? 'وضع فاتح' : 'وضع داكن') : (theme === 'dark' ? 'Light Mode' : 'Dark Mode')}
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

              <Link href="/settings" className="w-full">
                 <Button variant="outline" size="sm" className="w-full">
                    <Settings className="size-4" />
                    <span className="group-data-[collapsible=icon]:hidden">
                        {locale === 'ar' ? 'الإعدادات' : 'Settings'}
                    </span>
                </Button>
              </Link>
            </div>
            <SidebarTrigger className="self-end justify-self-end group-data-[collapsible=icon]:self-center group-data-[collapsible=icon]:justify-self-center [&_svg]:size-5" />
          </SidebarFooter>
        </SidebarInset>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </Sidebar>
    </SidebarProvider>
  );
}
