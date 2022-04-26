package com.missoandfriends.models;

import org.junit.Assert;
import org.junit.Test;

import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.CountryModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModel;
import com.missoandfriends.jsonapi.models.StateModel;
import com.missoandfriends.jsonapi.services.ModelValidationService;

public class UnprovidedFieldsTest {
	
	@Test
	public void testUnprovidedFields() {
		LoggedInUserModel model = new LoggedInUserModel();
		model.setId("120");
		try {
			ModelValidationService.validate(model);
		} catch (ValidationException e) {
			Assert.assertNull(e);
		}
		model.setEmail("");
		try {
			ModelValidationService.validate(model);
		} catch (ValidationException e) {
			Assert.assertNotNull(e);
		}
		model.setEmail(null);
		try {
			ModelValidationService.validate(model);
		} catch (ValidationException e) {
			Assert.assertNull(e);
		}
		model.setUsername("tratata");
		try {
			ModelValidationService.validate(model);
		} catch (ValidationException e) {
			System.out.println(e.getMessage());
			Assert.assertNotNull(e);
		}
	}
	
	@Test
	public void recurciveNullFieldsTest() {
		LoggedInUserModel model = new LoggedInUserModel();
		model.setId("646373");
		model.setCountry(new CountryModel("USA", "United States of America"));
		model.setState(new StateModel("AK", "Alaska"));
		try {
			ModelValidationService.validate(model);
		} catch (ValidationException e) {
			Assert.assertNull(e);
		}	
		model.getState().setName("WPSUCKS");
		try {
			ModelValidationService.validate(model);
		} catch (ValidationException e) {
			Assert.assertNotNull(e);
		}	
	}
	
}













