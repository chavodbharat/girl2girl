import type { NotificationConvo } from './notification-convo';
import type { NotificationResponse } from './notification-response';
import type { NotificationUser } from './notification-user';

export type Notification = {
    _id: string,
    convo: NotificationConvo,
    date: string,
    response?: NotificationResponse,
    user: NotificationUser,
    was_read: boolean,
    type: number,
};
