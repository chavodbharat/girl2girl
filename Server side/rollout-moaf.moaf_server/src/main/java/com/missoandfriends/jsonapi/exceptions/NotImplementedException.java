package com.missoandfriends.jsonapi.exceptions;

public class NotImplementedException extends Exception {

	private static final long serialVersionUID = -1555705524907711196L;
	
	public NotImplementedException() {
		super("Server is under construction. This method is not implemented yet.");
	}

}
