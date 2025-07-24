'use client';

import { useClinicContext } from '@/components/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorClosed, DoorOpen, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/locale-provider';

export default function ClinicRooms() {
  const { rooms } = useClinicContext();
  const { locale } = useLocale();

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">
        {locale === 'ar' ? 'حالة غرف العيادة' : 'Clinic Rooms Status'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <Card
            key={room._id}
            className={cn('transition-colors', {
              'bg-green-100 dark:bg-green-900/30 border-green-500': !room.isOccupied,
              'bg-red-100 dark:bg-red-900/30 border-red-500': room.isOccupied,
            })}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'غرفة' : 'Room'} {room.roomNumber}
              </CardTitle>
              {room.isOccupied ? (
                <DoorClosed className="h-5 w-5 text-red-600 dark:text-red-400" />
              ) : (
                <DoorOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
            </CardHeader>
            <CardContent>
              {room.isOccupied ? (
                <>
                  <div className="text-lg font-bold text-red-800 dark:text-red-200">
                    {locale === 'ar' ? 'محجوزة' : 'Occupied'}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                    <User className="h-3 w-3" />
                    <span>{room.patientName}</span>
                  </div>
                </>
              ) : (
                <div className="text-lg font-bold text-green-800 dark:text-green-200">
                  {locale === 'ar' ? 'متاحة' : 'Available'}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
