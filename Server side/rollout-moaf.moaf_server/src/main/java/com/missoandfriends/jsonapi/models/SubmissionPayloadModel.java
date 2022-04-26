package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class SubmissionPayloadModel {
	
	@SerializedName("input_1")
	private String name;
	
	@SerializedName("input_2")
	private String date;
	
	@SerializedName("input_3")
	private String gender = "Female";
	
	@SerializedName("input_4")
	private String country = "United States";
	
	@SerializedName("input_5")
	private String state;
	
	@SerializedName("input_6")
	private String whereFrom = "Teacher / Teacher's Website";
	
	@SerializedName("input_7")
	private String username;
	
	@SerializedName("input_13")
	private String password;
	
	@SerializedName("input_13_2")
	private String rePassword;
	
	@SerializedName("input_12")
	private String email;
	
	@SerializedName("input_12_2")
	private String reEmail;
	
	@SerializedName("input_14")
	private String parentEmail;
	
	@SerializedName("input_14_2")
	private String reParentEmail;

	public String getReParentEmail() {
		return reParentEmail;
	}

	public void setReParentEmail(String reParentEmail) {
		this.reParentEmail = reParentEmail;
	}

	public String getParentEmail() {
		return parentEmail;
	}

	public void setParentEmail(String parentEmail) {
		this.parentEmail = parentEmail;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDate() {
		return date;
	}

	public void setDate(String date) {
		this.date = date;
	}

	public String getGender() {
		return gender;
	}

	public void setGender(String gender) {
		this.gender = gender;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public String getState() {
		return state;
	}

	public void setState(String state) {
		this.state = state;
	}

	public String getWhereFrom() {
		return whereFrom;
	}

	public void setWhereFrom(String whereFrom) {
		this.whereFrom = whereFrom;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getRePassword() {
		return rePassword;
	}

	public void setRePassword(String rePassword) {
		this.rePassword = rePassword;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getReEmail() {
		return reEmail;
	}

	public void setReEmail(String reEmail) {
		this.reEmail = reEmail;
	}
	
}
