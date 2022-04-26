package com.missoandfriends.jsonapi.models.templates;

public class FriendRequestTemplate implements HtmlTemplate {

	@Override
	public String getNativeTemplateName() {
		return "friendrequest.html";
	}
	
	private String follower;
	private String following;
	private String host;
	public String getFollower() {
		return follower;
	}
	public void setFollower(String follower) {
		this.follower = follower;
	}
	public String getFollowing() {
		return following;
	}
	public void setFollowing(String following) {
		this.following = following;
	}
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
}
