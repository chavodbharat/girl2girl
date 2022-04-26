import type { NotificationUser } from './notification-user';

export type NotificationConvo = {
    _id: string,
    text: string,
    user: NotificationUser,
};
