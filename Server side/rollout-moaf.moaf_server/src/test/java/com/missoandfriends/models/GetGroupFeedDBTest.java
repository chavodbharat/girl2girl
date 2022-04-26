package com.missoandfriends.models;

import java.util.List;
import java.util.Properties;

import org.junit.After;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import com.missoandfriends.jsonapi.models.wp.WPGroupModel;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.ConvosService;
import com.missoandfriends.jsonapi.services.DBManagerService;
import com.missoandfriends.jsonapi.services.PropertiesLoadingService;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;


public class GetGroupFeedDBTest {
static Properties properties;
	
	@Before
	@Ignore
	public void before() throws Exception {
		
		properties = PropertiesLoadingService.loadProperties();
		DBManagerService.init(properties);
		Wordpress.init(properties);
		//OAuthService.init(properties.getProperty("mapdb.location"));
		MailProxyService.init(properties);
		
	}
	
	@After
	@Ignore
	public void after() {
		//OAuthService.shutdown();
		DBManagerService.shutdown();
	}
	
	@Test
	public void doTest() {
		try {
			final ConvosService s = new ConvosService();
			final List<WPGroupModel> groups = s.getWPGroups(); 
			s.getGroupsFeed(groups, 5);
		} catch (final Exception e) {
			System.out.println(e);
			Assert.assertNull(e);
		}
	}
}
