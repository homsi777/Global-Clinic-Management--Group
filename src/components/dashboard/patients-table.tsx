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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PatientsTable() {
  const { patients } = useClinicContext();

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Patient Name</TableHead>
              <TableHead>Patient ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Session Progress</TableHead>
              <TableHead className="text-right">Start Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map(patient => (
              <TableRow key={patient._id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={patient.avatarUrl} alt={patient.patientName} data-ai-hint="person portrait" />
                      <AvatarFallback>
                        {patient.patientName
                          .split(' ')
                          .map(n => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{patient.patientName}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {patient.patientId}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{patient.currentStatus}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={
                        (patient.completedSessions / patient.totalSessions) * 100
                      }
                      className="w-24"
                    />
                    <span className="text-xs text-muted-foreground">
                      {patient.completedSessions}/{patient.totalSessions}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(patient.startDate).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
