package com.missoandfriends.jsonapi.exceptions;

public class PayloadTooLarge413Exception extends Exception {

	private static final long serialVersionUID = -8424680588879337105L;

	public PayloadTooLarge413Exception(final String message) {
		super(message);
	}
	
}
