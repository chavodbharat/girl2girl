import type { NotificationResponseTo } from './notification-response-to';
import type { NotificationUser } from './notification-user';

export type NotificationResponse = {
    _id: string,
    in_response_to?: NotificationResponseTo,
    user: NotificationUser,
};
