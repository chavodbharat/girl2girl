package com.missoandfriends.jsonapi.services;

import java.lang.reflect.Type;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

import com.google.gson.JsonDeserializationContext;
import com.google.gson.JsonDeserializer;
import com.google.gson.JsonElement;
import com.google.gson.JsonPrimitive;
import com.google.gson.JsonSerializationContext;
import com.google.gson.JsonSerializer;
import com.google.gson.JsonSyntaxException;

public class ISO8601ZTDateAdapter implements JsonSerializer<java.util.Date>, JsonDeserializer<java.util.Date> {
	
	private final DateFormat dateFormat;

	public ISO8601ZTDateAdapter() {		
		this.dateFormat = new SimpleDateFormat(TimeService.ISO8601Z);
	}

	@Override
	public synchronized JsonElement serialize(Date date, Type type,
			JsonSerializationContext jsonSerializationContext) {
		final String dateFormatAsString = this.dateFormat.format(date);		
		return new JsonPrimitive(dateFormatAsString);
	}

	@Override
	public synchronized Date deserialize(JsonElement jsonElement, Type type,
		JsonDeserializationContext jsonDeserializationContext) {
		try {
			return this.dateFormat.parse(jsonElement.getAsString());
		} catch (final ParseException e) {
			throw new JsonSyntaxException(jsonElement.getAsString(), e);
		}
	}
	
}
