package com.missoandfriends.jsonapi.exceptions;

public class NotFound404Exception extends Exception {

	private static final long serialVersionUID = 4699548366579969250L;
	
	public NotFound404Exception (final String message) {
		super(message);
	}
	
}
