package com.missoandfriends.jsonapi.models;

public class ConvoUrlModel {
	private String url;

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}
	
	public ConvoUrlModel(final String link) {
		this.url = link;
	}
	
	public ConvoUrlModel() {}
}
