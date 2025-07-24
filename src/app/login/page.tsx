
'use client';

import { Logo } from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from '@/components/locale-provider';
import Link from 'next/link';

export default function LoginPage() {
  const { locale } = useLocale();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-3 text-center">
        <Logo className="h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">
          {locale === 'ar'
            ? 'العالمية جروب لانظمة وادارة عيادات'
            : 'Al-Alamia Group Clinic Management Systems'}
        </h1>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">
            {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
          </CardTitle>
          <CardDescription>
            {locale === 'ar'
              ? 'أدخل بياناتك للوصول إلى لوحة التحكم'
              : 'Enter your credentials to access your dashboard'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">
                {locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={
                  locale === 'ar' ? 'm@example.com' : 'm@example.com'
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">
                  {locale === 'ar' ? 'كلمة المرور' : 'Password'}
                </Label>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Link href="/" className="w-full">
              <Button className="w-full">
                {locale === 'ar' ? 'تسجيل الدخول' : 'Login'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
