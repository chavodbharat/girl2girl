package com.missoandfriends.jsonapi.models;

import java.util.Optional;

import com.google.gson.annotations.SerializedName;

public class ShortUserModel {
	
	@SerializedName("_id")
	private String id;
	
	@SerializedName("is_sponsor")
	private Boolean isSponsor = false;
	
	@SerializedName("name_first")
	private String firstName;
	
	@SerializedName("name_last")
	private String lastName;
	
	private String username;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Boolean getIsSponsor() {
		return isSponsor;
	}

	public void setIsSponsor(Boolean isSponsor) {
		this.isSponsor = isSponsor;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = Optional.ofNullable(firstName).orElse("");
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = Optional.ofNullable(lastName).orElse("");
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}
	
}
