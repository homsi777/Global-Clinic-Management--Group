'use client';

import { useClinicContext } from '@/components/app-provider';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/components/locale-provider';
import { ArrowUpDown, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { Transaction } from '@/lib/types';


export default function FinancialsTable({ transactions }: { transactions?: Transaction[] }) {
  const { transactions: allTransactions } = useClinicContext();
  const { locale } = useLocale();
  
  const displayTransactions = transactions || allTransactions;

  const typeTranslations = {
    'Payment': { en: 'Payment', ar: 'دفعة' },
    'Charge': { en: 'Charge', ar: 'رسوم' }
  };

  const statusTranslations = {
      'Paid': { en: 'Paid', ar: 'مدفوع' },
      'Pending': { en: 'Pending', ar: 'معلق' }
  }


  return (
    <Card>
       <CardHeader>
        <CardTitle>{locale === 'ar' ? 'سجل المعاملات' : 'Transaction History'}</CardTitle>
        <CardDescription>{locale === 'ar' ? 'قائمة بالمعاملات المالية الأخيرة.' : 'A list of recent financial transactions.'}</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {!transactions && <TableHead>{locale === 'ar' ? 'المريض' : 'Patient'}</TableHead>}
              <TableHead>
                 <Button variant="ghost" className='px-1'>
                    {locale === 'ar' ? 'الحالة' : 'Status'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>{locale === 'ar' ? 'الوصف' : 'Description'}</TableHead>
              <TableHead>{locale === 'ar' ? 'النوع' : 'Type'}</TableHead>
              <TableHead>
                <Button variant="ghost" className='px-1'>
                  {locale === 'ar' ? 'التاريخ' : 'Date'}
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="text-right">{locale === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayTransactions.map(tx => (
              <TableRow key={tx._id}>
                {!transactions && (
                    <TableCell>
                        <div className="font-medium">{tx.patientName}</div>
                        <div className="text-sm text-muted-foreground">{tx.patientId}</div>
                    </TableCell>
                )}
                <TableCell>
                  <Badge variant={tx.status === 'Paid' ? 'secondary' : 'destructive'} className={tx.status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}>
                    {statusTranslations[tx.status][locale]}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                    {tx.description}
                </TableCell>
                <TableCell>
                   <Badge variant={tx.type === 'Payment' ? 'secondary' : 'outline'} className={tx.type === 'Payment' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}>
                    {typeTranslations[tx.type][locale]}
                  </Badge>
                </TableCell>
                 <TableCell className="text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {locale === 'ar' ? `ل.س ${tx.amount.toFixed(2)}` : `SYP ${tx.amount.toFixed(2)}`}
                </TableCell>
                 <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{locale === 'ar' ? 'الإجراءات' : 'Actions'}</DropdownMenuLabel>
                      <DropdownMenuItem>{locale === 'ar' ? 'عرض تفاصيل المعاملة' : 'View transaction details'}</DropdownMenuItem>
                      <DropdownMenuItem>{locale === 'ar' ? 'إرسال إيصال' : 'Send receipt'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
