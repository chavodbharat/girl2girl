package com.missoandfriends.jsonapi.models;

import java.util.List;

public class FriendshipRequestNotificationsModel {
	
	private List<FriendshipRequestNotificationModel> notifications;
	
	public FriendshipRequestNotificationsModel() {}
	public FriendshipRequestNotificationsModel(final List<FriendshipRequestNotificationModel> notifications) {
		this.notifications = notifications;
	}

	public List<FriendshipRequestNotificationModel> getNotifications() {
		return notifications;
	}

	public void setNotifications(List<FriendshipRequestNotificationModel> notifications) {
		this.notifications = notifications;
	}
	
}
