package com.missoandfriends.jsonapi.controllers.filters;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

import javax.ws.rs.NameBinding;

/**
 * This parameter needed to implement semi-secure methods.
 * In this strange API some methods provides authorization header, or not. According
 * to this me should return different feedback
 * If true (default) then throw 410, if not then provide data
 * @return
 */

@NameBinding
@Retention(RetentionPolicy.RUNTIME)
public @interface SecureOAuth {
	boolean strict() default(true);
}

