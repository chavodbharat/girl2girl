package com.missoandfriends.jsonapi.models.payloads;

import java.util.Date;

import com.google.gson.annotations.SerializedName;

import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class ConvoPayloadModel {
	
	private Date date = new Date();
	
	@SerializedName("group_id")
	@NotNull(message="field group_id is null")
	@NotEmpty(message="field group_id is empty")
	private String groupId;
	
	@SerializedName("title")
	@NotNull(message="field title is null")
	private String title = "";
	
	@NotNull(message="field text is null")
	@NotEmpty(message="field text is empty")
	private String text;
	
	@NotNull(message="field user_id is null")
	@NotEmpty(message="field user_id is empty")
	@SerializedName("user_id")
	private String userId;
	
	public String getSlugTitle () {
		return this.title.toLowerCase().replace(" ", "-");
	}
	
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public String getGroupId() {
		return groupId;
	}
	public void setGroupId(String groupId) {
		this.groupId = groupId;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	
}
