package com.missoandfriends.jsonapi.models.responses;

import org.eclipse.jetty.http.HttpStatus;

public class Server500Model extends GenericResponseModel {
	
	public Server500Model(final int code, final String message) {
		super(code, message);
	}
	
	public Server500Model(final String message) {
		this(HttpStatus.INTERNAL_SERVER_ERROR_500, message);
	}
	
}
