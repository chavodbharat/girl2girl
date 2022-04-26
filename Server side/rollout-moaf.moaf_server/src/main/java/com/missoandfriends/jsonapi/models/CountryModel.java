package com.missoandfriends.jsonapi.models;

import org.apache.commons.lang3.builder.ToStringBuilder;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.services.CountryStateAbbrService;

import net.sf.oval.constraint.Length;

public class CountryModel {
	
	//@NotNull(message="field alpha_3 is missing")
	@Length(max=3, min=3, message="field alpha_3 must be 3 letters long")
	@SerializedName("alpha_3")
	private String alpha3;
	
	//@NotNull(message="field name is missing")
	//@NotEmpty(message="field name is empty")
	@SerializedName("name")
	//@ValidateWithMethod(methodName="checkCountry", parameterType=String.class, message="no such alpha3 or country full name found")
	private String name;
	
	public CountryModel() {}
	
	public CountryModel(final String alpha3, final String name) {
		this.alpha3 = alpha3;
		this.name   = name;
	}
	
	public boolean checkCountry(final String tmp) {
		return CountryStateAbbrService.countryToAlpha3.containsKey(this.name) && CountryStateAbbrService.countryToAlpha3.get(this.name).equals(this.alpha3);
	}

	public String getAlpha3() {
		return alpha3;
	}

	public void setAlpha3(String alpha3) {
		this.alpha3 = alpha3;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
	
}
