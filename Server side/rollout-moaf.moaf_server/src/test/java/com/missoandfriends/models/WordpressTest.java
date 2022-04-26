package com.missoandfriends.models;

import org.junit.Assert;
import org.junit.Test;

import com.missoandfriends.jsonapi.php.Wordpress;

public class WordpressTest {
	
	@Test
	public void wpGeneratePasswordTest() {
		Assert.assertEquals(Wordpress.wpGeneratePassword(10).length(), 10);
		Assert.assertEquals(Wordpress.wpGeneratePassword(100).length(), 100);
		Assert.assertEquals(Wordpress.wpGeneratePassword(1000).length(), 1000);
	}
	
}
