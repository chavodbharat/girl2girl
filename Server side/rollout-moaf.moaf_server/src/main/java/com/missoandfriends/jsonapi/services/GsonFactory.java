package com.missoandfriends.jsonapi.services;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

public class GsonFactory {
/*	
	final static GsonBuilder standard = new GsonBuilder()
			.registerTypeHierarchyAdapter(Date.class, new ISO8601ZTDateAdapter());
			*/
	final static GsonBuilder standard = new GsonBuilder().setDateFormat(TimeService.ISO8601Z);
	
	public static Gson getGson() {
		return standard.create();
	}
	
}
