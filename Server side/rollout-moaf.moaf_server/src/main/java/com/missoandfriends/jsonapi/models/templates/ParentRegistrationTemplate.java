package com.missoandfriends.jsonapi.models.templates;

public class ParentRegistrationTemplate implements HtmlTemplate {
	
	private String host;
	private String key;
	
	public String getHost() {
		return host;
	}
	public void setHost(String host) {
		this.host = host;
	}
	public String getKey() {
		return key;
	}
	public void setKey(String key) {
		this.key = key;
	}
	
	public ParentRegistrationTemplate (final String host, final String key) {
		this.key = key;
		this.host = host;
	}
	
	@Override
	public String getNativeTemplateName() {
		return "parentregistration.html";
	}

}
