'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Search } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { useLocale } from '@/components/locale-provider';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import type { Invoice } from '@/lib/types';

export default function InvoicesTable() {
  const { locale } = useLocale();
  const [searchQuery, setSearchQuery] = React.useState('');

  const invoices = useLiveQuery(async () => {
    if (searchQuery) {
      return db.invoices
        .where('patientName')
        .startsWithIgnoreCase(searchQuery)
        .or('invoiceNumber')
        .startsWithIgnoreCase(searchQuery)
        .toArray();
    }
    return db.invoices.toArray();
  }, [searchQuery]);
  
  const getStatusBadge = (status: Invoice['status']) => {
      switch(status) {
          case 'Paid': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
          case 'Pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
          case 'Partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
          case 'Canceled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
          default: return 'bg-gray-100';
      }
  }
  
  const statusTranslations: {[key in Invoice['status']]: {en: string, ar: string}} = {
      'Paid': {en: 'Paid', ar: 'مدفوع'},
      'Pending': {en: 'Pending', ar: 'معلق'},
      'Partial': {en: 'Partial', ar: 'جزئي'},
      'Canceled': {en: 'Canceled', ar: 'ملغي'}
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{locale === 'ar' ? 'سجل الفواتير' : 'Invoice History'}</CardTitle>
        <CardDescription>
          {locale === 'ar'
            ? 'عرض وإدارة جميع فواتير المرضى.'
            : 'View and manage all patient invoices.'}
        </CardDescription>
        <div className="relative pt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground rtl:left-auto rtl:right-3" />
          <Input
            placeholder={
              locale === 'ar'
                ? 'ابحث برقم الفاتورة أو اسم المريض...'
                : 'Search by invoice number or patient name...'
            }
            className="pl-10 rtl:pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'ar' ? 'رقم الفاتورة' : 'Invoice #'}</TableHead>
              <TableHead>{locale === 'ar' ? 'المريض' : 'Patient'}</TableHead>
              <TableHead>{locale === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead>{locale === 'ar' ? 'الاستحقاق' : 'Due Date'}</TableHead>
              <TableHead>{locale === 'ar' ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="text-right">{locale === 'ar' ? 'الإجمالي' : 'Total'}</TableHead>
              <TableHead className="text-right">{locale === 'ar' ? 'المستحق' : 'Due'}</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices?.map((invoice) => (
              <TableRow key={invoice._id}>
                <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                <TableCell>{invoice.patientName}</TableCell>
                <TableCell>
                  {new Date(invoice.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </TableCell>
                <TableCell>
                  {new Date(invoice.dueDate).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </TableCell>
                 <TableCell>
                  <Badge variant="secondary" className={getStatusBadge(invoice.status)}>
                    {statusTranslations[invoice.status][locale]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">SYP {invoice.totalAmount.toFixed(2)}</TableCell>
                <TableCell className="text-right text-destructive">SYP {invoice.outstandingAmount.toFixed(2)}</TableCell>
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
                      <DropdownMenuItem>{locale === 'ar' ? 'عرض الفاتورة' : 'View Invoice'}</DropdownMenuItem>
                      <DropdownMenuItem>{locale === 'ar' ? 'تعديل' : 'Edit'}</DropdownMenuItem>
                      <DropdownMenuItem>{locale === 'ar' ? 'إرسال إيصال' : 'Send Receipt'}</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
             {invoices?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {locale === 'ar' ? 'لم يتم العثور على فواتير.' : 'No invoices found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
