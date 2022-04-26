package com.missoandfriends.jsonapi.exceptions;

public class MOFSQL500Exception extends Exception {
	
	private static final long serialVersionUID = -7803096949471025921L;

	public MOFSQL500Exception(String message) {
		super(message);
	}
	
	public MOFSQL500Exception(String message, Throwable t) {
		super(message, t);
	}
	
}
