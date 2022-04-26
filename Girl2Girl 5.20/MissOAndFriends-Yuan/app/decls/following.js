const FOLLOWING_TYPES = {
    GROUP: 0,
    USER: 1,
    CONVO: 2,
};

export { FOLLOWING_TYPES };

export type Following = {
    _id: string,
    follower_id: string,
    following_id: string,
    following_type: number,
};
