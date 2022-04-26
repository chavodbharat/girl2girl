import type { Response } from './response';
import type { ShortGroup } from './short-group';
import type { ShortUser } from './short-user';

export type Convo = {
    _id: string,
    date: string,
    group: ShortGroup,
    has_responded: boolean,
    is_following: boolean,
    num_followers: number,
    responses: Array<Response>,
    text: string,
    user: ShortUser,
};
