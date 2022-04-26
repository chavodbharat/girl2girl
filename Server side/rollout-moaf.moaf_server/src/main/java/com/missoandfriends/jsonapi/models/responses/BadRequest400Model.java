package com.missoandfriends.jsonapi.models.responses;

import org.eclipse.jetty.http.HttpStatus;

public class BadRequest400Model extends GenericResponseModel {
	
	public BadRequest400Model(final int code, final String message) {
		super(code, message);
	}
	
	public BadRequest400Model(final String message) {
		this(HttpStatus.BAD_REQUEST_400, message);
	}
	
	public BadRequest400Model() {
		this(HttpStatus.BAD_REQUEST_400, "Bad Request");
	}
	
}
