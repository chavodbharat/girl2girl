package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class NotFound404ExceptionHandler implements ExceptionMapper<NotFound404Exception> {

	private static final Logger LOG = LogManager.getLogger(NotFound404ExceptionHandler.class);
	
	@Override
	public Response toResponse(NotFound404Exception ex) {
		LOG.error("404 NOT FOUND", ex);
		return Response.ok(new Gson().toJson(
				new GenericResponseModel(HttpStatus.NOT_FOUND_404, ex.getMessage()), GenericResponseModel.class))
				.status(HttpStatus.NOT_FOUND_404).build();
	}

}
