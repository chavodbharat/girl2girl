package com.missoandfriends.jsonapi.models;

import java.util.ArrayList;
import java.util.List;

public class NotificationsModel {
	private List<NotificationModel> notifications = new ArrayList<>();

	public List<NotificationModel> getNotifications() {
		return notifications;
	}

	public void setNotifications(List<NotificationModel> notifications) {
		this.notifications = notifications;
	}
}
