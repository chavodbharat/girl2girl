package com.missoandfriends.jsonapi.services;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.Properties;

import org.apache.commons.lang3.StringUtils;

public class PropertiesLoadingService {
	
	private PropertiesLoadingService() {};
	
	public static Properties loadProperties() throws FileNotFoundException, IOException {
		final Properties properties = new Properties();
		String appPropertiesPath = System.getProperty("app.properties");
		if (StringUtils.isBlank(appPropertiesPath)) {
			appPropertiesPath = System.getenv("MISSO_APP");
		}
		if (StringUtils.isBlank(appPropertiesPath)) {			
			throw new RuntimeException("at PropertiesLoadingService@loadProperies error: app.properties argument not found. Can not load application properties.");
		}
	    properties.load(new FileInputStream(appPropertiesPath));
	    return properties;
	}
	
}
