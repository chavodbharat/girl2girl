package com.missoandfriends.jsonapi.exceptions;

public class UnauthorizedException extends Exception {

	private static final long serialVersionUID = 2829048175450327070L;

	public UnauthorizedException (final String message) {
		super(message);
	}
	
	public UnauthorizedException () {
		super("Unauthorized");
	}
	
}
