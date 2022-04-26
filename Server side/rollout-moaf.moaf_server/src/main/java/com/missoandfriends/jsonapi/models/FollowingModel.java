package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.models.enums.FollowingTypeEnum;

public class FollowingModel {
	
	@SerializedName("_id")
	private String id;
	
	@SerializedName("follower_id")
	private String followerId;
	
	@SerializedName("following_id")
	private String followingId;
	
	@SerializedName("following_type")
	private FollowingTypeEnum followingType;

	public FollowingModel() {}
	
	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getFollowerId() {
		return followerId;
	}

	public void setFollowerId(String followerId) {
		this.followerId = followerId;
	}

	public String getFollowingId() {
		return followingId;
	}

	public void setFollowingId(String followingId) {
		this.followingId = followingId;
	}

	public FollowingTypeEnum getFollowingType() {
		return followingType;
	}

	public void setFollowingType(FollowingTypeEnum followingType) {
		this.followingType = followingType;
	}
	
}
