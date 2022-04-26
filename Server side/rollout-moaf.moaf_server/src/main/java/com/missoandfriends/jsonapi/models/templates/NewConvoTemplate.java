package com.missoandfriends.jsonapi.models.templates;

public class NewConvoTemplate implements HtmlTemplate {
	private String text;
	private String username;
	
	@Override
	public String getNativeTemplateName() {
		return "newconvo.html";
	}

	public String getText() {
		return text;
	}

	public void setText(String body) {
		this.text = body;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
}
