package com.missoandfriends.jsonapi.controllers.filters;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.ext.Provider;

@Provider
public class EntryFilter implements ContainerRequestFilter {
	
	public static final String USER_IP_ADDRESS   = "forwarded-ip-address";
	public static final String REMOTE_IP_ADDRESS = "remote-ip-address";
	
	final static List<String> DEFAULT_IP_ADDRESS = Arrays.asList("0.0.0.0");
	
	@Context
    private transient ResourceInfo resourceInfo;
	
	@Context 
	private transient HttpServletRequest request;  
	
	@Override
	public void filter(ContainerRequestContext context) throws IOException {
		MultivaluedMap<String, String>map = context.getHeaders();
		context.setProperty(REMOTE_IP_ADDRESS, request.getRemoteAddr());
		context.setProperty(USER_IP_ADDRESS, map.getOrDefault("X-Forwarded-For", DEFAULT_IP_ADDRESS).get(0));
	}
	
}
