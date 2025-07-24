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
            className={cn('transition-all duration-300', {
              'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-700': !room.isOccupied,
              'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-700': room.isOccupied,
            })}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'غرفة' : 'Room'} {room.roomNumber}
              </CardTitle>
              {room.isOccupied ? (
                <DoorClosed className="h-5 w-5 text-red-500" />
              ) : (
                <DoorOpen className="h-5 w-5 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              {room.isOccupied ? (
                <>
                  <div className="text-lg font-bold text-red-700 dark:text-red-300">
                    {locale === 'ar' ? 'مشغولة' : 'Occupied'}
                  </div>
                  <div className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 truncate">
                    <User className="h-3 w-3" />
                    <span>{room.patientName}</span>
                  </div>
                </>
              ) : (
                <div className="text-lg font-bold text-green-700 dark:text-green-300">
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
