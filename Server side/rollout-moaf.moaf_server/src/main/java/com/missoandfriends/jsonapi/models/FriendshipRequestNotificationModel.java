package com.missoandfriends.jsonapi.models;

import java.util.Date;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.models.enums.FriendshipNotificationType;

public class FriendshipRequestNotificationModel {
	
	@SerializedName("_id")
	private String id;
	
	@SerializedName("notification_type")
	private FriendshipNotificationType notificationType;
	
	@SerializedName("request_id")
	private String requestId;
	
	@SerializedName("was_read")
	private boolean wasRead;
	
	@SerializedName("is_friend")
	private boolean isFriend;
	
	private ShortUserModel user;
	
	private Date date;

	public boolean isFriend() {
		return isFriend;
	}

	public void setFriend(boolean isFriend) {
		this.isFriend = isFriend;
	}

	public boolean isWasRead() {
		return wasRead;
	}

	public void setWasRead(boolean wasRead) {
		this.wasRead = wasRead;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}
	
	public FriendshipNotificationType getNotificationType() {
		return notificationType;
	}

	public void setNotificationType(FriendshipNotificationType notificationType) {
		this.notificationType = notificationType;
	}

	public ShortUserModel getUser() {
		return user;
	}

	public void setUser(ShortUserModel user) {
		this.user = user;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public String getRequestId() {
		return requestId;
	}

	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}
	
}
