import { type User } from './user';
import { type Reservation as PrismaReservation, type BookableItem } from '@prisma/client';

// Omitted from queries by default, see src/server/db.ts.
export type Reservation = Omit<PrismaReservation, 'soberWatchImage'>;

export type ReservationWithAuthor = Reservation & {
    author: User;
};

export type ReservationWithAuthorAndItem = Reservation & {
    author: User;
    bookableItem: BookableItem;
};
