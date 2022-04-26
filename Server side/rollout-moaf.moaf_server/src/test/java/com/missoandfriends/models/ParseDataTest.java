package com.missoandfriends.models;

import java.text.DateFormat;
import java.text.SimpleDateFormat;

import org.junit.Assert;
import org.junit.Test;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.missoandfriends.jsonapi.models.payloads.ConvoReplyPayloadModel;

public class ParseDataTest {
	
	@Test
	public void parseData() {
		try {
			final String ISO8601Z = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
			DateFormat dateFormat = new SimpleDateFormat(ISO8601Z);
			dateFormat.parse("2017-07-31T12:08:34.941Z");	
		} catch (final Exception e) {
			Assert.assertNull(e);
		}
		Gson gson = new GsonBuilder().setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").create();
		gson.fromJson("{\"date\": \"2017-07-31T12:15:30.094Z\",\"group_id\": \"60\",\"text\": \"Lol, this is an answer\",\"user_id\": \"646373\"}", ConvoReplyPayloadModel.class);
	}
	
}
