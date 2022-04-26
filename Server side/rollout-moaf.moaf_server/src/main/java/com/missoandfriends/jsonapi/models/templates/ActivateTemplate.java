package com.missoandfriends.jsonapi.models.templates;

public class ActivateTemplate implements HtmlTemplate {
	
	@Override
	public String getNativeTemplateName() {
		return "activation.html";
	}
	
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
	
	public ActivateTemplate(final String host, final String key) {
		this.key = key;
		this.host = host;
	}
	
}
