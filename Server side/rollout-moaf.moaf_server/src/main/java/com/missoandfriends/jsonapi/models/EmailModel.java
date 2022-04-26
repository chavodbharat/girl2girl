package com.missoandfriends.jsonapi.models;

import com.missoandfriends.jsonapi.misc.EmailHelper;

import net.sf.oval.constraint.MatchPattern;
import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class EmailModel {
	
	@NotNull(message="field email is missing")
	@NotEmpty(message="field email is empty")
	@MatchPattern(pattern=EmailHelper.BASIC_EMAIL_TEMPLATE, message="bad email format")
	private String email;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
}
