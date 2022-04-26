package com.missoandfriends.models;

import org.junit.Assert;
import org.junit.Test;

import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.EmailModel;
import com.missoandfriends.jsonapi.services.ModelValidationService;

public class EmailModelTest {
	
	@Test(expected=ValidationException.class)
	public void testValidation1() throws ValidationException {
		
		final EmailModel m = new EmailModel();	
		m.setEmail(null);
		
		ModelValidationService.validate(m);
	}
	
	@Test(expected=ValidationException.class)
	public void testValidation2() throws ValidationException {
		
		final EmailModel m = new EmailModel();	
		m.setEmail("");
		
		ModelValidationService.validate(m);
	}
	
	@Test(expected=ValidationException.class)
	public void testValidation3() throws ValidationException {
		
		final EmailModel m = new EmailModel();	
		m.setEmail("sometextthatisnotvalidemail");
		
		ModelValidationService.validate(m);
	}
	
	@Test
	public void testValidEmail4() throws ValidationException {
		final EmailModel m = new EmailModel();	
		m.setEmail("test@mail.ru");
		ModelValidationService.validate(m);
		Assert.assertTrue(true);
	}
}





























