package com.missoandfriends.jsonapi.models;

import java.util.Date;

import com.google.gson.annotations.SerializedName;

public class ResponseModel {
	
	@SerializedName("_id")
	private String id;
	@SerializedName("convo_id")
	private String convoId;
	
	private String status;
	
	private Date date;
	private String text;
	private ShortUserModel user;
	
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getConvoId() {
		return convoId;
	}
	public void setConvoId(String convoId) {
		this.convoId = convoId;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public ShortUserModel getUser() {
		return user;
	}
	public void setUser(ShortUserModel shortUser) {
		this.user = shortUser;
	}
	
}
