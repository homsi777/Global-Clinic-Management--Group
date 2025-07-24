'use client';

import { useClinicContext } from '@/components/app-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DoorClosed, DoorOpen, User, Forward } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/locale-provider';
import type { Room } from '@/lib/types';

export default function ClinicRooms() {
  const { rooms } = useClinicContext();
  const { locale } = useLocale();

  const handleRoomClick = (roomId: string) => {
    window.open(`/rooms/${roomId}`, '_blank');
  };
  
  const getRoomCardStyle = (status: Room['currentStatus']) => {
      switch(status) {
          case 'Available': return 'border-green-500';
          case 'Assigned': return 'border-orange-500';
          case 'Occupied': return 'border-red-500';
          default: return 'border-border';
      }
  }

  const getRoomIcon = (status: Room['currentStatus']) => {
      switch(status) {
          case 'Available': return <DoorOpen className="h-5 w-5 text-green-500" />;
          case 'Assigned': return <Forward className="h-5 w-5 text-orange-500" />;
          case 'Occupied': return <DoorClosed className="h-5 w-5 text-red-500" />;
          default: return <DoorOpen className="h-5 w-5 text-muted-foreground" />;
      }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight mb-4">
        {locale === 'ar' ? 'حالة غرف العيادة' : 'Clinic Rooms Status'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {rooms.map((room) => (
          <Card
            key={room._id}
            onClick={() => handleRoomClick(room.roomNumber.toString())}
            className={cn(
              'interactive-element cursor-pointer border-2',
              getRoomCardStyle(room.currentStatus)
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {locale === 'ar' ? 'غرفة' : 'Room'} {room.roomNumber}
              </CardTitle>
              {getRoomIcon(room.currentStatus)}
            </CardHeader>
            <CardContent>
              {room.currentStatus !== 'Available' ? (
                <>
                  <div className="text-lg font-bold">
                    {locale === 'ar' ? (room.currentStatus === 'Occupied' ? 'مشغولة' : 'مخصصة') : (room.currentStatus)}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                    <User className="h-3 w-3" />
                    <span>{room.patientName}</span>
                  </div>
                </>
              ) : (
                <div className="text-lg font-bold text-green-600">
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
