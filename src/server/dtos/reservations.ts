import { type User } from './user';
import { type Reservation } from '@prisma/client';

export type ReservationWithAuthor = Reservation & {
    author: User;
};
