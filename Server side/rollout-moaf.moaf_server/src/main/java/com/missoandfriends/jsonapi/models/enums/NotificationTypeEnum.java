package com.missoandfriends.jsonapi.models.enums;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.exceptions.ValidationException;

public enum NotificationTypeEnum {
	
	@SerializedName("0")
	CONVO(0),
	
	@SerializedName("1")
	MENTION(1);

	private int intValue;
	
	private NotificationTypeEnum(final int type) {
		intValue = type;
	}
	
	public static int getIntValue(NotificationTypeEnum o) {
		return o.intValue;
	}
	
	@Override
	public String toString() {
		return String.valueOf(intValue);
	}
	
	public static NotificationTypeEnum fromString (final String id) throws ValidationException {
		switch (id) {
		case "0":
			return CONVO;
		case "1":
			return MENTION;
		default:
			throw new ValidationException("bad type. Possible values are 0, 1");
		}
	}
	
}
