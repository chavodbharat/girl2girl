package com.missoandfriends.jsonapi.models;

import org.apache.commons.lang3.builder.ToStringBuilder;

import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class LoginModel {
	
	@NotNull(message="field password is missing")
	@NotEmpty(message="field password is empty")
	private String password;
	
	@NotNull(message="field username is missing")
	@NotEmpty(message="field username is empty")
	private String username;
	
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
	
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	
}
