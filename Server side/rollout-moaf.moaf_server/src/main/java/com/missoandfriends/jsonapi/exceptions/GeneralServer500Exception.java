package com.missoandfriends.jsonapi.exceptions;

public class GeneralServer500Exception extends Exception {

	private static final long serialVersionUID = -8615015040288644232L;
	
	public GeneralServer500Exception(final String message) {
		super(message);
	}
	
	public GeneralServer500Exception(final String message, Throwable t) {
		super(message, t);
	}
	
	public GeneralServer500Exception() {
		super("Internal server error. Please, contact the administrator.");
	}
	
}
