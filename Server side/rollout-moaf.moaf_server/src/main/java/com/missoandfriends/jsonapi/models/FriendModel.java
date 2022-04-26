package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class FriendModel {
	
	@SerializedName("_id")
	private String id;
	
	@SerializedName("username")
	private String username;
	
	@SerializedName("photo_url")
	private String photoUrl;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPhotoUrl() {
		return photoUrl;
	}

	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
	}
	
}
