package com.missoandfriends.jsonapi.models.payloads;

import java.util.List;

import com.google.gson.annotations.SerializedName;

public class NotificationIdsModel {
	@SerializedName("notification_ids")
	private List<String> notificationIds;

	public List<String> getNotificationIds() {
		return notificationIds;
	}

	public void setNotificationIds(List<String> notificationIds) {
		this.notificationIds = notificationIds;
	}
	
}
