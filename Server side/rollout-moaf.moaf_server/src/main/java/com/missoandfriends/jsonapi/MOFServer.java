package com.missoandfriends.jsonapi;

import java.io.IOException;
import java.util.Properties;

import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.missoandfriends.jsonapi.exceptions.ServerSetupException;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.DBManagerService;
import com.missoandfriends.jsonapi.services.FileUploadService;
import com.missoandfriends.jsonapi.services.OAuthService;
import com.missoandfriends.jsonapi.services.PropertiesLoadingService;
import com.missoandfriends.jsonapi.services.SchedulerService;
import com.missoandfriends.jsonapi.services.TemplaterService;
import com.missoandfriends.jsonapi.services.TimeService;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

public final class MOFServer implements ServletContextListener {
	
	private static final Logger LOG = LogManager.getLogger(MOFServer.class);
	private static Properties properties;
	private static SchedulerService scheduler = new SchedulerService();
	
	public static Properties getApplicationProperties() {
		return (Properties) properties.clone();
	}
	
	public static String getInterval() {
		final String interval = properties.getProperty("interval");
		return interval;
	}
	
	public static int getPostTimeLimit() {
		final String postlimit = properties.getProperty("postlimit");
		try {
			return Integer.parseInt(postlimit);
		} catch (final NumberFormatException e) {
			return 5;
		}
	}
	
	public static String getTimeShift() {
		final String shift = properties.getProperty("timeshift", "-11");
		return shift;
	}
	
	private void loadProperties() {
		try {
			properties = PropertiesLoadingService.loadProperties();
		} catch (IOException ex) {
			LOG.error(ex);
		}
	}
	
	@Override
	public void contextDestroyed(final ServletContextEvent sce) {
		DBManagerService.shutdown();
		LOG.info("Hikari shutdown");
		OAuthService.shutdown();
		LOG.info("OAuth shutdown");
		LOG.info("Context Destroyed");
		scheduler.shutdown();
	}
	
	@Override
	public void contextInitialized(ServletContextEvent sce) {
		LOG.info("Start Context Initialization");
		loadProperties();
		LOG.info("Properties loaded");
		TimeService.init();
		LOG.info("Time Service Inited");
		DBManagerService.init(properties);
		LOG.info("Hikari Pool Initialized");
		Wordpress.init(properties);
		LOG.info("Wordpress inited");
		OAuthService.init(properties.getProperty("mapdb.location"));
		LOG.info("OAuth service inited");
		try {
			MailProxyService.init(properties);
		} catch (final ServerSetupException e) {
			throw new RuntimeException(e.getMessage(), e);
		}
		LOG.info("Mail Proxy inited");
		scheduler.start();
		TemplaterService.init(properties);
		LOG.info("Templater init");
		FileUploadService.init(properties);
		LOG.info("File server inited");		
	}
	
}
