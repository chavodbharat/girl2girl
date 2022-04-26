export type SessionUser = {
    _id: string,
    birth_date: string,
    country: {
        _id: string,
        alpha_3: string,
        name: string,
    },
    email: string,
    is_following: boolean,
    name_first: string,
    photo_url?: string,
    state?: {
        _id: string,
        abbreviation: string,
        name: string,
    },
    username: string,
};
