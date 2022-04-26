package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.PayloadTooLarge413Exception;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class PayloadTooLarge413ExceptionHandler implements ExceptionMapper<PayloadTooLarge413Exception> {
	
	private static final Logger LOG = LogManager.getLogger(PayloadTooLarge413ExceptionHandler.class);
	
	@Override
	public Response toResponse(PayloadTooLarge413Exception ex) {
		LOG.error("413 PAYLOAD TOO LARGE", ex);
		return Response.ok(new Gson().toJson(
				new GenericResponseModel(HttpStatus.PAYLOAD_TOO_LARGE_413, ex.getMessage()), GenericResponseModel.class))
				.status(HttpStatus.PAYLOAD_TOO_LARGE_413).build();
	}
	
}
