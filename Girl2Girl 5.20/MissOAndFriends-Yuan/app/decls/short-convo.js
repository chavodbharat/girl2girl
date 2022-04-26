import type { ShortGroup } from './short-group';
import type { ShortUser } from './short-user';

export type ShortConvo = {
    _id: string,
	convo_id: string,
    date: string,
    group: ShortGroup,
    has_responded: boolean,
    is_following: boolean,
    num_followers: number,
    num_responses: number,
    text: string,
	title: string, 
    user: ShortUser,
    lastUpdate: string
};
