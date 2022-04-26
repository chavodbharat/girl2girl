package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.Gone410Exception;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class GoneExceptionHandler implements ExceptionMapper<Gone410Exception> {

	private static final Logger LOG = LogManager.getLogger(GoneExceptionHandler.class);
	
	@Override
	public Response toResponse(Gone410Exception ex) {
		LOG.error("410 GONE", ex);
		return Response.ok(new Gson().toJson(
				new GenericResponseModel(HttpStatus.GONE_410, ex.getMessage()), GenericResponseModel.class))
				.status(HttpStatus.GONE_410).build();
	}

}
