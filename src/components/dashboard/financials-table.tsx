'use client';

import { useClinicContext } from '@/components/app-provider';
import { Card, CardContent } from '@/components/ui/card';
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

export default function FinancialsTable() {
  const { transactions } = useClinicContext();
  const { locale } = useLocale();

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
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'ar' ? 'المريض' : 'Patient'}</TableHead>
              <TableHead>{locale === 'ar' ? 'التاريخ' : 'Date'}</TableHead>
              <TableHead>{locale === 'ar' ? 'الوصف' : 'Description'}</TableHead>
              <TableHead>{locale === 'ar' ? 'النوع' : 'Type'}</TableHead>
              <TableHead>{locale === 'ar' ? 'الحالة' : 'Status'}</TableHead>
              <TableHead className="text-right">{locale === 'ar' ? 'المبلغ' : 'Amount'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map(tx => (
              <TableRow key={tx._id}>
                <TableCell>
                  <div className="font-medium">{tx.patientName}</div>
                  <div className="text-sm text-muted-foreground">{tx.patientId}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(tx.date).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US')}
                </TableCell>
                <TableCell className="text-muted-foreground">
                    {tx.description}
                </TableCell>
                <TableCell>
                   <Badge variant={tx.type === 'Payment' ? 'secondary' : 'outline'} className={tx.type === 'Payment' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : ''}>
                    {typeTranslations[tx.type][locale]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={tx.status === 'Paid' ? 'default' : 'destructive'} className={tx.status === 'Paid' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {statusTranslations[tx.status][locale]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {locale === 'ar' ? `ل.س ${tx.amount.toFixed(2)}` : `SYP ${tx.amount.toFixed(2)}`}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
