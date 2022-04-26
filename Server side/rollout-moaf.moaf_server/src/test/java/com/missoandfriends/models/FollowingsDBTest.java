package com.missoandfriends.models;

import java.sql.Connection;
import java.util.Properties;

import org.junit.After;
import org.junit.Before;
import org.junit.Ignore;
import org.junit.Test;

import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.DBManagerService;
import com.missoandfriends.jsonapi.services.FollowersService;
import com.missoandfriends.jsonapi.services.PropertiesLoadingService;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

public class FollowingsDBTest {
	
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
	@Ignore
	public void testCreateKey() {
		FollowersService fs = new FollowersService();
		try (final Connection con = DBManagerService.getConnection();) {
			fs.addConvoFollowingMetadataIfNotExists(con, "111111", "37093");
			fs.delConvoFollowingMetadata("111111");
		} catch (final Exception e) {}
	}
	
}











