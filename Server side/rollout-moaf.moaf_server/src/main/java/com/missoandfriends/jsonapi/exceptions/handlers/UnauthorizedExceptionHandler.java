package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.UnauthorizedException;
import com.missoandfriends.jsonapi.models.responses.Unauthorized401Model;

@Provider
public class UnauthorizedExceptionHandler implements ExceptionMapper<UnauthorizedException> {

	private static final Logger LOG = LogManager.getLogger(UnauthorizedExceptionHandler.class);
	
	@Override
	public Response toResponse(UnauthorizedException ex) {
		LOG.error("401 UNAUTHORIZED", ex);
		Unauthorized401Model um = new Unauthorized401Model();
		return Response.ok(new Gson().toJson(um, Unauthorized401Model.class)).status(HttpStatus.UNAUTHORIZED_401).build();
	}
	
}
