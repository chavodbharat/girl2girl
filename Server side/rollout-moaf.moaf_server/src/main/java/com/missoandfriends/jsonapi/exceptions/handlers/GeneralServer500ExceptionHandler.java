package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;
import com.missoandfriends.jsonapi.services.GsonFactory;

@Provider
public class GeneralServer500ExceptionHandler implements ExceptionMapper<GeneralServer500Exception> {
	
	private static final Logger LOG = LogManager.getLogger(GeneralServer500ExceptionHandler.class);

	@Override
	public Response toResponse(GeneralServer500Exception ex) {
		LOG.error("500 General Server Error", ex);
		return Response.ok(GsonFactory.getGson().toJson(
			new GenericResponseModel(HttpStatus.INTERNAL_SERVER_ERROR_500, ex.getMessage())
		)).status(HttpStatus.INTERNAL_SERVER_ERROR_500).build();
	}

}
