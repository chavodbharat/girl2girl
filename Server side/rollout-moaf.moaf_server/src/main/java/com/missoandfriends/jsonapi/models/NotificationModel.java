package com.missoandfriends.jsonapi.models;

import java.util.Date;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.enums.NotificationTypeEnum;

public class NotificationModel {
	
	@SerializedName("_id")
	private String id;
	private ShortNotificationConvoModel convo = new ShortNotificationConvoModel();
	private Date date;
	private ShortNotificationResponseModel response = new ShortNotificationResponseModel();
	private ShortNotificationUserModel user = new ShortNotificationUserModel();
	@SerializedName("was_read")
	private boolean wasRead;
	
	@SerializedName("type")
	private NotificationTypeEnum type;

	public String getId() {
		return id;
	}
	
	public NotificationTypeEnum getType() {
		return type;
	}

	public void setType(NotificationTypeEnum type) {
		this.type = type;
	}

	public void setType(final String type) throws ValidationException {
		this.type = NotificationTypeEnum.fromString(type);
	}

	public void setId(String id) {
		this.id = id;
	}

	public ShortNotificationConvoModel getConvo() {
		return convo;
	}

	public void setConvo(ShortNotificationConvoModel convo) {
		this.convo = convo;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public ShortNotificationResponseModel getResponse() {
		return response;
	}

	public void setResponse(ShortNotificationResponseModel response) {
		this.response = response;
	}

	public ShortNotificationUserModel getUser() {
		return user;
	}

	public void setUser(ShortNotificationUserModel user) {
		this.user = user;
	}

	public boolean isWasRead() {
		return wasRead;
	}

	public void setWasRead(boolean wasRead) {
		this.wasRead = wasRead;
	}
}
