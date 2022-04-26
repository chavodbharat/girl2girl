package com.missoandfriends.jsonapi.models.payloads;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.enums.FollowingTypeEnum;

import net.sf.oval.constraint.Assert;
import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class FollowingsPayloadModel {
	
	@NotNull(message="field follower_id is null")
	@NotEmpty(message="field follower_id is empty")
	@SerializedName("follower_id")
	private String followerId;
	
	@NotNull(message="field following_id is null")
	@NotEmpty(message="field following_id is empty")
	@SerializedName("following_id")
	@Assert(expr="_value != _this.followerId", message="follower can not follow himself or herself", lang="js")
	private String followingId;
	
	@NotNull(message="field following_type is null")
	@NotEmpty(message="field following_type is empty")
	@SerializedName("following_type")
	private String followingType;
	
	public FollowingTypeEnum getFollowingTypeEnum () throws ValidationException {
		return FollowingTypeEnum.fromString(this.followingType);
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

	public String getFollowingType() {
		return followingType;
	}

	public void setFollowingType(String followingType) {
		this.followingType = followingType;
	}
	
	
	
}
