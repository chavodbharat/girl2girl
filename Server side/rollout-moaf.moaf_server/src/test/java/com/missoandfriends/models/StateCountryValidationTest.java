package com.missoandfriends.models;

import org.junit.Assert;
import org.junit.Test;

import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.CountryModel;
import com.missoandfriends.jsonapi.models.StateModel;
import com.missoandfriends.jsonapi.services.ModelValidationService;

public class StateCountryValidationTest {
	
	@Test(expected=ValidationException.class)
	public void validateStateWithBadAbbr() throws ValidationException {
		StateModel st = new StateModel();
		st.setAbbreviation("ZZ");
		st.setName("Zumumbu");
		ModelValidationService.validate(st);
	}
	
	@Test
	public void validateStateWithGoodAbbr() throws ValidationException {
		StateModel st = new StateModel();
		st.setAbbreviation("AL");
		st.setName("Alabama");
		try {
			ModelValidationService.validate(st);
		} catch (ValidationException e) {
			Assert.assertNull(e);
		}
	}
	
	@Test(expected=ValidationException.class)
	public void validatecountryWithBadAlpha3() throws ValidationException {
		CountryModel st = new CountryModel();
		st.setAlpha3("XXX");
		st.setName("Rokamakafoo");
		ModelValidationService.validate(st);
	}
	
	@Test
	public void validatecountryWithGoodData() throws ValidationException {
		CountryModel st = new CountryModel();
		st.setAlpha3("UMI");
		st.setName("US Minor Outlying Islands");
		try {
			ModelValidationService.validate(st);
		} catch (ValidationException e) {
			Assert.assertNull(e);
		}
	}
}
