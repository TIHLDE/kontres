import { type User } from './user';

// Lepton API response types
export type LeptonBookableItem = {
    id: string;
    created_at: string;
    updated_at: string;
    image?: string;
    image_alt?: string;
    name: string;
    description: string;
    allows_alcohol: boolean;
};

export type LeptonGroup = {
    name: string;
    slug: string;
    type?: string;
    viewer_is_member?: boolean;
    image?: string;
    image_alt?: string;
    fines_activated?: boolean;
    contact_email?: string;
    leader?: string;
    description?: string;
    permissions?: unknown;
    fines_admin?: unknown;
    fine_info?: unknown;
};

export type LeptonReservation = {
    id: string; // UUID
    bookable_item: string; // UUID
    bookable_item_detail: LeptonBookableItem;
    group: string; // slug
    group_detail: LeptonGroup;
    author: string;
    author_detail: User;
    sober_watch?: string;
    sober_watch_detail?: User;
    approved_by_detail?: User;
    created_at: string;
    updated_at: string;
    start_time: string;
    end_time: string;
    state: 'PENDING' | 'APPROVED' | 'REJECTED';
    description: string;
    accepted_rules: boolean;
    serves_alcohol: boolean;
    approved_by?: string;
};
