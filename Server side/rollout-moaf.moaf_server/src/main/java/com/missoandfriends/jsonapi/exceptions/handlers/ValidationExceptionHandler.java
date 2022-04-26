package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.responses.BadRequest400Model;

@Provider
public class ValidationExceptionHandler implements ExceptionMapper<ValidationException> {

	private static final Logger LOG = LogManager.getLogger(ValidationExceptionHandler.class);
	
	@Override
	public Response toResponse(ValidationException ex) {
		LOG.error("400 VALIDATION EXCEPTION", ex);
		BadRequest400Model brm = new BadRequest400Model("Bad Request: " + ex.getMessage());
		return Response.ok(new Gson().toJson(brm, BadRequest400Model.class)).status(HttpStatus.BAD_REQUEST_400).build();
	}
	
}
