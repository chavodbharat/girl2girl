package com.missoandfriends.jsonapi.models.templates;

public class NewConvoReplyTemplate implements HtmlTemplate {
	private String text;
	private String username;
	
	@Override
	public String getNativeTemplateName() {
		return "newconvoreply.html";
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
