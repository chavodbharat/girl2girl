package com.missoandfriends.jsonapi.exceptions;

public class Forbidden403Exception extends Exception {
	
	private static final long serialVersionUID = -1184052844367469346L;

	public Forbidden403Exception() {
		super("Access Forbidden");
	}
	
}
