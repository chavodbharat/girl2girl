package com.missoandfriends.jsonapi.services.mailing;

import java.io.IOException;
import java.util.List;
import java.util.Properties;

import com.missoandfriends.jsonapi.exceptions.ServerSetupException;

public interface MailSenderInterface {
		
	void init(final Properties props) throws ServerSetupException;
	void sendHtmlEmail(final String fromAddress, final String toAddress, final String subject, final String htmlContent) throws IOException;
	void sendHtmlEmail(final String fromAddress, final List<String> toAddress, final String subject, final String htmlContent) throws IOException;
	
}
