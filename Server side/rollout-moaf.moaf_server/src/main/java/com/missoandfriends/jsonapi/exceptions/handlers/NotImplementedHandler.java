package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.NotImplementedException;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class NotImplementedHandler implements ExceptionMapper<NotImplementedException> {

	@Override
	public Response toResponse(NotImplementedException ex) {
		return Response.ok(new Gson().toJson(
				new GenericResponseModel(HttpStatus.NOT_IMPLEMENTED_501, ex.getMessage()), GenericResponseModel.class))
				.status(HttpStatus.NOT_IMPLEMENTED_501).build();
	}
	
}
