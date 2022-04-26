import type { ShortUser } from './short-user';

export type Response = {
    _id: string;
    convo_id: string;
    date: string;
    text: string;
    user: ShortUser;
    status: string;
	in_replay_to: string;
};
