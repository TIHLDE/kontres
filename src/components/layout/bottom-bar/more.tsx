import { Button } from '@/components/ui/button';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';

// Temporary type
import { Code } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type Dispatch, type SetStateAction } from 'react';

// import { type DetailedItem } from '@/utils/apis/types'; // TODO: Fix this import

type DetailedItem = any; // Temporary type

interface MoreProps {
    items?: DetailedItem[];
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const More = ({ items, open, setOpen }: MoreProps) => {
    const router = useRouter();

    const goToCalendar = (uuid?: string) => {
        setOpen(false);
        router.push(`/calendar/${uuid}`);
    };

    const generateMailTo = () => {
        const emailTo = 'index@tihlde.org';
        const subject =
            '[Tema angående kontres eller andre indexrelaterte ting]';
        const emailBody =
            'Hei, ærede Indexere! %0d%0a' +
            'Jeg har vært på kontres, og... (Skriv det du vil her) %0d%0a %0d%0a' +
            'Med vennlig hilsen %0d%0a' +
            '*Fyll inn navnet ditt her*';
        router.push(
            'mailto:' + emailTo + '?subject=' + subject + '&body=' + emailBody,
        );
    };

    return (
        <Drawer open={open} onOpenChange={(open) => setOpen(open)}>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Hva ønsker du å gjøre?</DrawerTitle>
                </DrawerHeader>

                <div className="flex flex-col gap-2 p-4">
                    {!items || items?.length === 0 ? (
                        <p className="mx-auto text-foreground">
                            Det er ingen gjenstander å reservere
                        </p>
                    ) : undefined}
                    {items?.map((item, _i) => (
                        <Button
                            variant={'outline'}
                            key={_i}
                            onClick={() => goToCalendar(item.id)}
                        >
                            Reserver {item.name}
                        </Button>
                    ))}
                    <Separator />
                    <Button
                        variant={'outline'}
                        className="flex gap-2 items-center"
                        onClick={generateMailTo}
                    >
                        <span>Kontakt index</span> <Code className="w-4 h-4" />
                    </Button>
                </div>
                <DrawerFooter>
                    <DrawerClose asChild>
                        <Button
                            className="w-full"
                            onClick={() => setOpen(false)}
                        >
                            Lukk
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default More;
