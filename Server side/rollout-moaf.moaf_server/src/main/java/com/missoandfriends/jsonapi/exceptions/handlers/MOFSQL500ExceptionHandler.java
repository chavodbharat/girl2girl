package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.models.responses.Server500Model;

@Provider
public class MOFSQL500ExceptionHandler implements ExceptionMapper<MOFSQL500Exception> {

	private static final Logger LOG = LogManager.getLogger(MOFSQL500ExceptionHandler.class);
	
	public Response toResponse(MOFSQL500Exception ex) {
		LOG.error("500 SQL EXCEPTION", ex);
		Server500Model brm = new Server500Model("Internal Server Error: " + ex.getMessage());
		return Response.ok(new Gson().toJson(brm, Server500Model.class)).status(HttpStatus.INTERNAL_SERVER_ERROR_500).build();
	}

}
