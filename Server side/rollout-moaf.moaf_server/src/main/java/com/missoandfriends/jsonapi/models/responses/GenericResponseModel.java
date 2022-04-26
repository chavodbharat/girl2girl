package com.missoandfriends.jsonapi.models.responses;

public class GenericResponseModel {
	
	private int code;
	private String message;
	
	public int getCode() {
		return code;
	}
	public void setCode(int code) {
		this.code = code;
	}
	public String getMessage() {
		return message;
	}
	public void setMessage(String message) {
		this.message = message;
	}
	
	public GenericResponseModel(final int code, final String message) {
		this.code = code;
		this.message = message;
	}
}
