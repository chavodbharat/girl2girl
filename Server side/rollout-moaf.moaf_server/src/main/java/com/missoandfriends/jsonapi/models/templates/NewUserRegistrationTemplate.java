package com.missoandfriends.jsonapi.models.templates;

import com.missoandfriends.jsonapi.models.CreateUserModel;

public class NewUserRegistrationTemplate implements HtmlTemplate {

	private String username;
	private String timeCreated;
	
	private CreateUserModel user;
	
	public CreateUserModel getUser() {
		return user;
	}

	public void setUser(CreateUserModel user) {
		this.user = user;
	}

	@Override
	public String getNativeTemplateName() {
		return "newuserregistered.html";
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getTimeCreated() {
		return timeCreated;
	}

	public void setTimeCreated(String timeCreated) {
		this.timeCreated = timeCreated;
	}
}
