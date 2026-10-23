'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './alert-dialog';

interface SoberWatchNoticeProps {
    open: boolean;
    onClose: () => void;
}

export default function SoberWatchNotice({
    open,
    onClose,
}: SoberWatchNoticeProps) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Bytte av edruvakt</AlertDialogTitle>
                    <AlertDialogDescription>
                        Jeg bekrefter at bytte av edruvakt skal varsles om til
                        NTNU i god tid før bookingen
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={onClose}>
                        Jeg forstår
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
