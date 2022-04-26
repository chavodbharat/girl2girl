package com.missoandfriends.models;

import java.util.ArrayList;
import java.util.GregorianCalendar;
import java.util.List;

import org.junit.Assert;
import org.junit.Test;

import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.CountryModel;
import com.missoandfriends.jsonapi.models.CreateUserModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModel;
import com.missoandfriends.jsonapi.models.StateModel;
import com.missoandfriends.jsonapi.services.ModelValidationService;
import com.missoandfriends.jsonapi.services.UserService;

public class UserUpdateBuilderTest {
	
	@Test
	public void buildUpdateWithNoProblema() {
		
		final UserService us = new UserService();
		final LoggedInUserModel user = new LoggedInUserModel();
		
		user.setId("646373");
		user.setBirthday(new GregorianCalendar(1993, 9, 10).getTime());
		user.setCountry(new CountryModel("USA", "United States of America"));
		user.setEmail("somemail@mail.com");
		
		try {
			ModelValidationService.validate(user);
		} catch (final ValidationException e) {
			Assert.assertNull(e);
		}
		
		final StringBuilder sb = new StringBuilder();
		final List<String> list = new ArrayList<>();
		
		us.buildUserUpdate(user, sb, list);
	
		Assert.assertEquals(sb.toString(), "UPDATE wp_users SET birth_date=?,country=?,user_email=? WHERE id = ?");
		Assert.assertEquals(list.get(0), "1993-10-10");
		Assert.assertEquals(list.get(1), "United States of America");
		Assert.assertEquals(list.get(2), "somemail@mail.com");
		
	}
	
	@Test
	public void buildInsertWithNoProblema() {
		
		final UserService us = new UserService();
		final CreateUserModel user = new CreateUserModel();
				
		user.setBirthDate(new GregorianCalendar(1993, 9, 10).getTime());
		user.setCountry(new CountryModel("USA", "United States of America"));
		user.setState(new StateModel("AK", "Alaska"));
		user.setEmail("somemail@mail.com");
		
		final StringBuilder sb = new StringBuilder();
		final List<String> list = new ArrayList<>();
		
		us.buildUserMetaInsert(user, "646373", sb, list);

		System.out.println(sb.toString());
		for (final String s: list) {
			System.out.println(s);
		}
	}
	
}
