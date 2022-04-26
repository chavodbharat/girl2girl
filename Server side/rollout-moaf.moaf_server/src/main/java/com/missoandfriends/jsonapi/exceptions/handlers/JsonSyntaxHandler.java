package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.missoandfriends.jsonapi.models.responses.BadRequest400Model;

@Provider
public class JsonSyntaxHandler implements ExceptionMapper<JsonSyntaxException> {
	
	private static final Logger LOG = LogManager.getLogger(JsonSyntaxHandler.class);

	@Override
	public Response toResponse(JsonSyntaxException ex) {
		LOG.error("400 JSON SYNTAX", ex);
		BadRequest400Model brm = new BadRequest400Model("Bad Request: Malformed JSON. " + ex.getMessage());
		return Response.ok(new Gson().toJson(brm, BadRequest400Model.class)).status(400).build();
	}
	
}	
