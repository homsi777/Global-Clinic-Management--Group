'use client';

import { useParams, useRouter } from 'next/navigation';
import { useClinicContext } from '@/components/app-provider';
import { useLocale } from '@/components/locale-provider';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Megaphone } from 'lucide-react';
import { cn } from '@/lib/utils';


export default function RoomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { rooms } = useClinicContext();
    const { locale } = useLocale();

    const roomId = typeof params.roomId === 'string' ? params.roomId : '';
    const room = rooms.find(r => r._id === roomId);

    if (!room) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{locale === 'ar' ? 'الغرفة غير موجودة.' : 'Room not found.'}</p>
            </div>
        );
    }
    
    return (
        <div className="flex flex-col gap-6">
            <header className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className={cn(locale === 'ar' && 'transform rotate-180')} />
                </Button>
                <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    {locale === 'ar' ? `غرفة رقم ${room.roomNumber}` : `Room ${room.roomNumber}`}
                </h1>
                <p className={cn("text-lg", room.isOccupied ? 'text-red-500' : 'text-green-500')}>
                    {room.isOccupied ? 
                        (locale === 'ar' ? `مشغولة بـ: ${room.patientName}` : `Occupied by: ${room.patientName}`) :
                        (locale === 'ar' ? 'متاحة' : 'Available')
                    }
                </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <Card>
                        <CardHeader>
                            <CardTitle>{locale === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" disabled={room.isOccupied}>
                                <Megaphone className="mr-2" />
                                {locale === 'ar' ? 'استدعاء المريض التالي' : 'Call Next Patient'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>{locale === 'ar' ? 'سجل المرضى لهذه الغرفة' : 'Patient History for this Room'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-16">
                                <div className="flex flex-col items-center gap-1 text-center">
                                    <h3 className="text-2xl font-bold tracking-tight">
                                        {locale === 'ar' ? 'سجل الزيارات قيد الإنشاء' : 'Visit History is Under Construction'}
                                    </h3>
                                    <p className="text-sm text-muted-foreground">
                                        {locale === 'ar' ? 'سيتم عرض المرضى الذين زاروا هذه الغرفة هنا.' : 'Patients who visited this room will be shown here.'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
