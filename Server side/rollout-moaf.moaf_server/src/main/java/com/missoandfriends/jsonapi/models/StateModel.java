package com.missoandfriends.jsonapi.models;

import com.missoandfriends.jsonapi.services.CountryStateAbbrService;

import net.sf.oval.constraint.Length;

public class StateModel {
	
	//@NotNull(message="field abbreviation is null")
	//@NotEmpty(message="field abbreviation is empty")
	@Length(max=2, min=2, message="field abbreviation must be 2 letters long")
	private String abbreviation;
	
	//@NotNull(message="field name is null")
	//@NotEmpty(message="field name is empty")
	//@ValidateWithMethod(methodName="checkState", parameterType=String.class, message="no such abbreviation or state full name found")
	private String name;
	
	public boolean checkState(final String tmp) {
		return CountryStateAbbrService.stateAbbToName.containsKey(this.abbreviation) && CountryStateAbbrService.stateAbbToName.get(this.abbreviation).equals(this.name);
	}
	
	public StateModel(final String abbreviation, final String name) {
		this.abbreviation = abbreviation;
		this.name = name;
	}
	
	public StateModel() {}

	public String getAbbreviation() {
		return abbreviation;
	}

	public void setAbbreviation(String abbreviation) {
		this.abbreviation = abbreviation;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
}
