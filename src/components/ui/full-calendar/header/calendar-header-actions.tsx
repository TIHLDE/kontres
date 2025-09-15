'use client';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useCalendarContext } from '../calendar-provider';
import { Mode, calendarModes } from '../calendar-types';
import { cn } from '@/lib/utils';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Columns2, List } from 'lucide-react';
import { Plus } from 'lucide-react';

export function CalendarHeaderActions({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex md:justify-start justify-between items-center gap-2">
            {children}
        </div>
    );
}

const calendarModeIconMap: Record<Mode, React.ReactNode> = {
    day: <List />,
    week: <Columns2 />,
};

export function CalendarHeaderActionsMode() {
    const { mode, setMode } = useCalendarContext();

    return (
        <LayoutGroup>
            <ToggleGroup
                className="flex gap-0 -space-x-px rounded-sm border overflow-hidden shadow-sm shadow-black/5 rtl:space-x-reverse"
                type="single"
                variant="outline"
                value={mode}
                onValueChange={(value) => {
                    if (value) setMode(value as Mode);
                }}
            >
                {calendarModes.map((modeValue) => {
                    const isSelected = mode === modeValue;
                    return (
                        <motion.div
                            key={modeValue}
                            layout
                            className="flex-1 flex divide-x"
                            animate={{ flex: isSelected ? 1.6 : 1 }}
                            transition={{
                                flex: {
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 30,
                                },
                            }}
                        >
                            <ToggleGroupItem
                                value={modeValue}
                                className={cn(
                                    'w-full rounded-none shadow-none focus-visible:z-10 text-base flex items-center justify-center gap-2 relative border-none',
                                    isSelected && 'z-10',
                                )}
                            >
                                <motion.div
                                    layout
                                    className="flex items-center justify-center gap-2 py-2 px-3"
                                    initial={false}
                                    animate={{
                                        scale: isSelected ? 1 : 0.95,
                                    }}
                                    transition={{
                                        scale: {
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 30,
                                        },
                                        layout: {
                                            type: 'spring',
                                            stiffness: 400,
                                            damping: 30,
                                        },
                                    }}
                                >
                                    <motion.div
                                        layout="position"
                                        initial={false}
                                        animate={{
                                            scale: isSelected ? 0.9 : 1,
                                        }}
                                        transition={{
                                            scale: {
                                                type: 'spring',
                                                stiffness: 400,
                                                damping: 30,
                                            },
                                        }}
                                    >
                                        {calendarModeIconMap[modeValue]}
                                    </motion.div>
                                    <AnimatePresence mode="popLayout">
                                        {isSelected && (
                                            <motion.p
                                                layout="position"
                                                key={`text-${modeValue}`}
                                                className="font-medium origin-left whitespace-nowrap"
                                                initial={{
                                                    opacity: 0,
                                                    x: -2,
                                                    scale: 0.95,
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    x: 0,
                                                    scale: 1,
                                                    transition: {
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                        opacity: {
                                                            duration: 0.15,
                                                        },
                                                    },
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    x: -2,
                                                    scale: 0.95,
                                                    transition: {
                                                        type: 'spring',
                                                        stiffness: 400,
                                                        damping: 30,
                                                        opacity: {
                                                            duration: 0.1,
                                                        },
                                                    },
                                                }}
                                            >
                                                {modeValue
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    modeValue.slice(1)}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            </ToggleGroupItem>
                        </motion.div>
                    );
                })}
            </ToggleGroup>
        </LayoutGroup>
    );
}

export function CalendarHeaderActionsAdd() {
    return <></>;
    return (
        <Button
            className="flex items-center gap-1 bg-primary text-background"
            // onClick={() => setNewEventDialogOpen(true)}
        >
            <Plus />
            Add Event
        </Button>
    );
}
