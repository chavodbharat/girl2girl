package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class ShortNotificationUserModel {
	
	@SerializedName("_id")
	private String id;
	@SerializedName("is_sponsor")
	private boolean isSponsor;
	
	private String username;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public boolean isSponsor() {
		return isSponsor;
	}

	public void setSponsor(boolean isSponsor) {
		this.isSponsor = isSponsor;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
}
