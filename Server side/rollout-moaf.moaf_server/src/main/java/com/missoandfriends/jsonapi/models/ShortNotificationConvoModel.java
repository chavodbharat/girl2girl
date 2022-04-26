package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class ShortNotificationConvoModel {
	
	@SerializedName("_id")
	private String id;
	
	private String text;
	
	private ShortNotificationUserModel user = new ShortNotificationUserModel();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getText() {
		return text;
	}

	public void setText(String text) {
		this.text = text;
	}

	public ShortNotificationUserModel getUser() {
		return user;
	}

	public void setUser(ShortNotificationUserModel user) {
		this.user = user;
	}
	
}
