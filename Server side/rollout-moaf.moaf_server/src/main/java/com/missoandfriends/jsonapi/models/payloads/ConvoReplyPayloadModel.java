package com.missoandfriends.jsonapi.models.payloads;

import java.util.Date;

import com.google.gson.annotations.SerializedName;

import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class ConvoReplyPayloadModel {
	
	@SerializedName("date")
	private Date date = new Date();
	
	@SerializedName("convo_id")
	@NotNull(message="field convo_id is null")
	@NotEmpty(message="field convo_id is empty")
	private String convoId;
	
	@NotNull(message="field text is null")
	@NotEmpty(message="field text is empty")
	private String text;
	
	@NotNull(message="field user_id is null")
	@NotEmpty(message="field user_id is empty")
	@SerializedName("user_id")
	private String userId;

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public String getConvoId() {
		return convoId;
	}

	public void setConvoId(String convoId) {
		this.convoId = convoId;
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
