package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class LoggedInUserModelFollowings extends LoggedInUserModel {
	@SerializedName("is_following")
	private Boolean isFollowing;

	public Boolean isFollowing() {
		return isFollowing;
	}

	public void setFollowing(Boolean isFollowing) {
		this.isFollowing = isFollowing;
	}
}
