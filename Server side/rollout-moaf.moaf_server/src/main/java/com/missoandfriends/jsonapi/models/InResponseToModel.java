package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class InResponseToModel {
	
	@SerializedName("_id")
	private String id;
	
	private ShortNotificationUserModel user = new ShortNotificationUserModel();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public ShortNotificationUserModel getUser() {
		return user;
	}

	public void setUser(ShortNotificationUserModel user) {
		this.user = user;
	}
	
}
