package com.missoandfriends.jsonapi.models.enums;

import com.google.gson.annotations.SerializedName;

public enum PostStatusEnum {
	
	@SerializedName("publish")
	PUBLISHED("published"),
	@SerializedName("pending")
	PENDING("pending"),
	@SerializedName("other")
	OTHER("other");
	
	private String text;
	
	private PostStatusEnum(final String text) {
		this.text = text;
	}
	
	@Override
	public String toString() {
		return this.text;
	}
	
	public static PostStatusEnum fromString(final String value) {
		switch (value) {
		case "published":
			return PUBLISHED;
		case "pending":
			return PENDING;
		default:
			return OTHER;
		}
	}
	
}
