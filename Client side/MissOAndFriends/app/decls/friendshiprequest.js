import type { NotificationUser } from './notification-user';

export type FriendshipRequest = {
    _id: string,
    notification_type: number,
    request_id: string,
    date: string,
    user: NotificationUser,
    was_read: boolean,
    is_friend: boolean
};