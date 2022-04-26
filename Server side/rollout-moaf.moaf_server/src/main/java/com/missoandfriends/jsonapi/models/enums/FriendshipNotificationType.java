package com.missoandfriends.jsonapi.models.enums;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.exceptions.ValidationException;

public enum FriendshipNotificationType {
	
	@SerializedName("0")
	REQUEST(0),
	@SerializedName("1")
	ACCEPTED(1);
	
	private int intValue;
	
	private FriendshipNotificationType(int value) {
		intValue = value;
	}
	
	public static int getIntValue(FriendshipNotificationType o) {
		return o.intValue;
	}
	
	@Override
	public String toString() {
		return String.valueOf(intValue);
	}
	
	public static FriendshipNotificationType fromString (final String id) throws ValidationException {
		switch (id) {
		case "0":
			return REQUEST;
		case "1":
			return ACCEPTED;
		default:
			throw new ValidationException("bad notification_type. Possible values are 0, 1");
		}
	}
	
}
