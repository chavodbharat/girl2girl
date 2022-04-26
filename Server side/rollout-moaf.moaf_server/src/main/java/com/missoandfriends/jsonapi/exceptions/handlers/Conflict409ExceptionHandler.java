package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.Conflict409Exception;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class Conflict409ExceptionHandler implements ExceptionMapper<Conflict409Exception> {
	
	private static final Logger LOG = LogManager.getLogger(NotFound404ExceptionHandler.class);
	
	@Override
	public Response toResponse(Conflict409Exception ex) {
		LOG.error("409 CONFLICT", ex);
		return Response.ok(new Gson().toJson(
				new GenericResponseModel(HttpStatus.CONFLICT_409, ex.getMessage()), GenericResponseModel.class))
				.status(HttpStatus.CONFLICT_409).build();
	}
	
}
