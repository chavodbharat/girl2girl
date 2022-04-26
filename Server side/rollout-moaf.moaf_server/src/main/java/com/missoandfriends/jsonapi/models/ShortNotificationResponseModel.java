package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class ShortNotificationResponseModel {
	
	@SerializedName("_id")
	private String id;
	@SerializedName("in_reponse_to")
	private InResponseToModel inRepsonseTo = new InResponseToModel();
	private ShortNotificationUserModel user = new ShortNotificationUserModel();
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public InResponseToModel getInRepsonseTo() {
		return inRepsonseTo;
	}
	public void setInRepsonseTo(InResponseToModel inRepsonseTo) {
		this.inRepsonseTo = inRepsonseTo;
	}
	public ShortNotificationUserModel getUser() {
		return user;
	}
	public void setUser(ShortNotificationUserModel user) {
		this.user = user;
	}
	
}
