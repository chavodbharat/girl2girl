package com.missoandfriends.jsonapi.exceptions;

public class Conflict409Exception extends Exception {

	private static final long serialVersionUID = 293226448298469737L;
	
	public Conflict409Exception(final String message) {
		super(message);
	}
	
}
