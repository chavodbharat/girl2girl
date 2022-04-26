package com.missoandfriends.jsonapi.controllers.filters;

import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.container.ContainerResponseContext;
import javax.ws.rs.container.ContainerResponseFilter;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.ext.Provider;

@Provider
public class CharsetUTF8Filter implements ContainerResponseFilter {
	@Override
    public void filter(ContainerRequestContext request, ContainerResponseContext response) {
		final MediaType type = response.getMediaType();
        if (type != null) {
            if (!type.getParameters().containsKey(MediaType.CHARSET_PARAMETER)) {
                final MediaType typeWithCharset = type.withCharset("utf-8");
                response.getHeaders().putSingle(HttpHeaders.CONTENT_TYPE, typeWithCharset);
            }
        }
    }
}
