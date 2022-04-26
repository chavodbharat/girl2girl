export type RegisterUser = {
    birth_date: string,
    country: {
        alpha_3: string,
        name: string,
    },
    email: string,
    name_first: string,
    password: string,
    photo?: any,
    state?: {
        abbreviation: string,
        name: string,
    },
    username: string,
};
