package com.missoandfriends.jsonapi.controllers.filters;

import java.io.IOException;
import java.lang.reflect.Method;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerRequestFilter;
import javax.ws.rs.container.ResourceInfo;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MultivaluedMap;
import javax.ws.rs.core.Response;
import javax.ws.rs.ext.Provider;

import org.eclipse.jetty.http.HttpStatus;

import com.google.common.net.HttpHeaders;
import com.google.gson.Gson;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.responses.Unauthorized401Model;
import com.missoandfriends.jsonapi.services.OAuthService;

/**
 * Here we go. As mentioned in {@link #com.missoandfriends.jsonapi.controllers.filters.SecureOAuth.java retention policy},
 * if strict security was used, then abort on unauthorized, or set user and rise wasAuthorized flag, otherwise
 * fall through and set wasAuthorized to false.
 * @author stepan
 *
 */
@Provider
public class SecureOAuthFilter implements ContainerRequestFilter {

	public static final String USER_KEY       = "user";
	public static final String WAS_AUTHORIZED = "wasAuthorized";
	
	private final static String UnauthorizedResponse = 
			new Gson().toJson(new Unauthorized401Model(), Unauthorized401Model.class);
	
	@Context
    private transient ResourceInfo resourceInfo;
	
	public static String getToken(final String header) {
		if (header.startsWith("Bearer: ")) {
			return header.substring(8);
		}
		return header;
	}
	
	@Override
	public void filter(ContainerRequestContext context) throws IOException {
		final Method method = this.resourceInfo.getResourceMethod();
		if (method.isAnnotationPresent(SecureOAuth.class)) {
			MultivaluedMap<String, String>	map = context.getHeaders();
			if (!map.containsKey(HttpHeaders.AUTHORIZATION) && !map.containsKey("authorization")) {
				if (method.getAnnotation(SecureOAuth.class).strict()) {
					context.abortWith(
							Response.ok(UnauthorizedResponse).status(HttpStatus.UNAUTHORIZED_401).build());
				} else {
					context.setProperty(WAS_AUTHORIZED, false);
				}
			} else {
				OAuthService os = new OAuthService();
				final String token = getToken(map.getFirst(HttpHeaders.AUTHORIZATION));		
				OAuthModel oauth = os.getAndUpdate(token);				
				if (oauth == null) {					
					context.abortWith(
							Response.ok(UnauthorizedResponse).status(HttpStatus.UNAUTHORIZED_401).build());
				}				
				context.setProperty(WAS_AUTHORIZED, true);
				context.setProperty(USER_KEY, oauth);
			}
		}
	}

}
