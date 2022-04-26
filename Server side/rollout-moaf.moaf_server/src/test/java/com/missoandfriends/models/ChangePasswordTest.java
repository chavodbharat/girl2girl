package com.missoandfriends.models;

import org.junit.Test;

import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.payloads.ChangePasswordPayloadModel;
import com.missoandfriends.jsonapi.services.ModelValidationService;

public class ChangePasswordTest {
	
	@Test(expected=ValidationException.class)
	public void failOnMatch() throws ValidationException {
		final ChangePasswordPayloadModel cpm = new ChangePasswordPayloadModel();
		cpm.setNewPassword("sometext");
		cpm.setOldPassword("sometext");
		ModelValidationService.validate(cpm);
	}
	
}
