package com.missoandfriends.jsonapi.models;

import java.util.Date;

import com.google.gson.annotations.SerializedName;

public class ConvoWithoutResponsesModel {
	
	@SerializedName("_id")
	private String id;
	
	private Date date;
	
	private Date lastUpdate;
	
	@SerializedName("has_responded")
	private boolean hasResponded;
	
	@SerializedName("has_followers")
	private boolean hasFollowers;
	
	@SerializedName("is_following")
	private boolean isFollowing;
	
	@SerializedName("num_followers")
	private int numFollowers;
	
	@SerializedName("num_responses")
	private int numResponses;
	
	private long diff;
	
	private ShortUserModel user;
	
	private ShortGroupModel group;
	private String text;

	public long getDiff() {
		return diff;
	}
	public void setDiff(long diff) {
		this.diff = diff;
	}
	public Date getLastUpdate() {
		return lastUpdate;
	}
	public void setLastUpdate(Date lastUpdate) {
		this.lastUpdate = lastUpdate;
	}
	public boolean isFollowing() {
		return isFollowing;
	}
	public void setFollowing(boolean isFollowing) {
		this.isFollowing = isFollowing;
	}
	public int getNumResponses() {
		return numResponses;
	}
	public void setNumResponses(int numResponses) {
		this.numResponses = numResponses;
	}
	public ShortGroupModel getGroup() {
		return group;
	}
	public void setGroup(ShortGroupModel group) {
		this.group = group;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public boolean isHasResponded() {
		return hasResponded;
	}
	public void setHasResponded(boolean hasResponded) {
		this.hasResponded = hasResponded;
	}
	public boolean isHasFollowers() {
		return hasFollowers;
	}
	public void setHasFollowers(boolean hasFollowers) {
		this.hasFollowers = hasFollowers;
	}
	public int getNumFollowers() {
		return numFollowers;
	}
	public void setNumFollowers(int numFollowers) {
		this.numFollowers = numFollowers;
	}
	public ShortUserModel getUser() {
		return user;
	}
	public void setUser(ShortUserModel user) {
		this.user = user;
	}
	
	
}
