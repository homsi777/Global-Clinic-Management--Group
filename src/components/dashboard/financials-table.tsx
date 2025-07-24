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

export default function FinancialsTable() {
  const { transactions } = useClinicContext();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
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
                  {new Date(tx.date).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground">
                    {tx.description}
                </TableCell>
                <TableCell>
                   <Badge variant={tx.type === 'Payment' ? 'secondary' : 'outline'} className={tx.type === 'Payment' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : ''}>
                    {tx.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={tx.status === 'Paid' ? 'default' : 'destructive'} className={tx.status === 'Paid' ? 'bg-green-500 hover:bg-green-600' : ''}>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${tx.amount.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
