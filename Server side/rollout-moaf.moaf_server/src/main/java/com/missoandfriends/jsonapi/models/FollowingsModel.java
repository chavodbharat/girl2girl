package com.missoandfriends.jsonapi.models;

import java.util.List;

public class FollowingsModel {
	
	private List<FollowingModel> followings;

	public List<FollowingModel> getFollowings() {
		return followings;
	}

	public void setFollowings(List<FollowingModel> followings) {
		this.followings = followings;
	}
	
}
