package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.Forbidden403Exception;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class Forbidden403ExceptionHandler implements ExceptionMapper<Forbidden403Exception> {
	
	private static final Logger LOG = LogManager.getLogger(Forbidden403ExceptionHandler.class);

	@Override
	public Response toResponse(Forbidden403Exception ex) {
		LOG.error("403 FORBIDDEN", ex);
		return Response.ok(new Gson().toJson(
				new GenericResponseModel(HttpStatus.FORBIDDEN_403, ex.getMessage()), GenericResponseModel.class))
				.status(HttpStatus.FORBIDDEN_403).build();
	}

}
