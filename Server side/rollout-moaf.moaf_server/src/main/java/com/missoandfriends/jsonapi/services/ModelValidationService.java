package com.missoandfriends.jsonapi.services;

import java.util.List;

import com.missoandfriends.jsonapi.exceptions.ValidationException;

import net.sf.oval.ConstraintViolation;
import net.sf.oval.Validator;

public class ModelValidationService {
	
	private static Validator validator = new Validator();
	
	public static void validate (final Object o) throws ValidationException {
		if (o == null) {
			throw new ValidationException("Json data expected but nothing received");
		}
		List<ConstraintViolation> cv = validator.validate(o);
		if (cv.isEmpty()) {
			return;
		}
		throw new ValidationException(cv);
	}
	
}
