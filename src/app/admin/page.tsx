import { SideBarNavigationButton } from './layout';
import { CalendarIcon, ExternalLinkIcon, ShapesIcon } from 'lucide-react';
import Link from 'next/link';

export default async function Admin() {
    // Get the user

    // Set default values for searchParams if none is defined

    return (
        <div className="flex p-20 flex-col gap-5 h-full">
            <div className="flex flex-col">
                <h1 className="scroll-m-20 text-4xl font-normal tracking-tight lg:text-5xl">
                    Admin
                </h1>
                <h2 className="scroll-m-20 text-2xl font-normal tracking-tight opacity-50">
                    Hva ønsker du å se?
                </h2>
            </div>
            <div className="w-full flex flex-col">
                <SideBarNavigationButton
                    route="/admin/reservations"
                    className="w-full justify-start gap-5"
                    link={{
                        className: 'w-full',
                    }}
                >
                    <CalendarIcon size={20} />
                    Reservasjoner
                </SideBarNavigationButton>
                <SideBarNavigationButton
                    link={{
                        className: 'w-full',
                    }}
                    route="/admin/items"
                    className="w-full justify-start gap-5"
                >
                    <ShapesIcon size={20} />
                    Gjenstander
                </SideBarNavigationButton>
            </div>
            <div className="h-full flex items-end">
                <Link
                    href="https://tihlde.org/tilbakemelding/"
                    className="flex gap-2 hover:underline"
                >
                    <span className="opacity-50 flex items-center gap-2">
                        Trøbbel? Bugs? Ikke gidd å si ifra til Index, vi gjør nok ikke noe med det
                        <ExternalLinkIcon size={16} />
                    </span>
                </Link>
            </div>
        </div>
    );
}
