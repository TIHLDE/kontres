import { type User } from './user';
import { type Reservation, type BookableItem } from '@prisma/client';

export type ReservationWithAuthor = Reservation & {
    author: User;
};

export type ReservationWithAuthorAndItem = Reservation & {
    author: User;
    bookableItem: BookableItem;
};
