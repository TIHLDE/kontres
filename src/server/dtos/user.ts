export type User = {
    user_id: string;
    first_name: string;
    last_name: string;
    image: string;
    email: string;
    gender: number;
    study: string;
    studyyear: string;
    allergy: string;
    tool: string;
    public_event_registrations: boolean;
    unread_notifications: string;
    unanswered_evaluations_count: string;
    number_of_strikes: string;
    slack_user_id: string;
    allows_photo_by_default: boolean;
    accepts_event_rules: boolean;
    bio: UserBio;
};

export type UserBio = {
    id: number;
    description: string;
    gitHub_link: string;
    linkedIn_link: string;
};
