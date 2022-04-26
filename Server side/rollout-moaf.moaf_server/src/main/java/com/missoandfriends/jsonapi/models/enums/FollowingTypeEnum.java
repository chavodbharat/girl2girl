package com.missoandfriends.jsonapi.models.enums;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.exceptions.ValidationException;

public enum FollowingTypeEnum {
	@SerializedName("0")
	GROUP(0),
	@SerializedName("1")
	USER(1),
	@SerializedName("2")
	CONVO(2),
	ANY(-1);
	
	private int intValue;
	
	private FollowingTypeEnum(int value) {
		intValue = value;
	}
	
	public static int getIntValue(FollowingTypeEnum o) {
		return o.intValue;
	}
	
	@Override
	public String toString() {
		return String.valueOf(intValue);
	}
	
	public static FollowingTypeEnum fromString (final String id) throws ValidationException {
		switch (id) {
		case "0":
			return GROUP;
		case "1":
			return USER;
		case "2":
			return CONVO;
		case "":
			return ANY;
		default:
			throw new ValidationException("bad following_type. Possible values are 0, 1, 2");
		}
	}
}
