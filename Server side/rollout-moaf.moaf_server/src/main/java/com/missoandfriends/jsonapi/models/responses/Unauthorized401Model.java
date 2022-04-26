package com.missoandfriends.jsonapi.models.responses;

import org.eclipse.jetty.http.HttpStatus;

public class Unauthorized401Model extends GenericResponseModel {
	
	public Unauthorized401Model(final int code, final String message) {
		super(code, message);
	}
	
	public Unauthorized401Model(final String message) {
		this(HttpStatus.UNAUTHORIZED_401, message);
	}
	
	public Unauthorized401Model() {
		this(HttpStatus.UNAUTHORIZED_401, "Unauthorized");
	}
	
}
