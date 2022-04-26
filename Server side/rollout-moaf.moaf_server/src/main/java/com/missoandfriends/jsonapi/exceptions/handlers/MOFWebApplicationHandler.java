package com.missoandfriends.jsonapi.exceptions.handlers;

import javax.ws.rs.WebApplicationException;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.ExceptionMapper;
import javax.ws.rs.ext.Provider;

import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;

@Provider
public class MOFWebApplicationHandler implements ExceptionMapper<WebApplicationException>{
	
	public Response toResponse(WebApplicationException e) {
	     Response r = e.getResponse();
	     int status = r.getStatus();
	     switch (status) {
	     case HttpStatus.METHOD_NOT_ALLOWED_405:
	    	 return Response.fromResponse(r)
	    			 .entity(new Gson().toJson(new GenericResponseModel(HttpStatus.METHOD_NOT_ALLOWED_405, e.getMessage())))
	    			 .status(HttpStatus.METHOD_NOT_ALLOWED_405).build();
	     case HttpStatus.NOT_FOUND_404:
	    	 return Response.fromResponse(r)
	    			 .entity(new Gson().toJson(new GenericResponseModel(HttpStatus.NOT_FOUND_404, "Not Found")))
	    			 .status(HttpStatus.NOT_FOUND_404).build();
	     case HttpStatus.UNSUPPORTED_MEDIA_TYPE_415:
	    	 return Response.fromResponse(r)
	    			 .entity(new Gson().toJson(new GenericResponseModel(HttpStatus.UNSUPPORTED_MEDIA_TYPE_415, "Unsupported Media Type. Use application/json")))
	    			 .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE_415).build();
	     default:
	    	 return r;
	     }
	}
	
}
