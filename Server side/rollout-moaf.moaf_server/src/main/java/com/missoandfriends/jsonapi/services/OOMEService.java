package com.missoandfriends.jsonapi.services;

public class OOMEService {
	
	public static void throwOutOfMemoryException() {
		int initial = 100_000_000;
		for (;;) {
			@SuppressWarnings("unused")
			byte tmp[] = new byte[initial];
			initial *= 2;
		}
	}
	
}
