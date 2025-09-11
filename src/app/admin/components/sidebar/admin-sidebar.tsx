'use client';

import { Card, CardContent } from '@/components/ui/card';

import { SideBarNavigationButton } from '../../layout';
import { CalendarIcon, Shapes } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <Card className="h-fit min-w-72 md:sticky top-24 z-50">
            <CardContent className="pt-6">
                <div className="flex flex-col">
                    <SideBarNavigationButton
                        icon={<CalendarIcon size={16} />}
                        route="/admin/reservations"
                        highlighted={pathname === '/admin/reservations'}
                    >
                        Reservasjoner
                    </SideBarNavigationButton>
                    <SideBarNavigationButton
                        route="/admin/items"
                        icon={<Shapes size={16} />}
                        highlighted={pathname === '/admin/items'}
                    >
                        Gjenstander
                    </SideBarNavigationButton>
                </div>
            </CardContent>
        </Card>
    );
}
