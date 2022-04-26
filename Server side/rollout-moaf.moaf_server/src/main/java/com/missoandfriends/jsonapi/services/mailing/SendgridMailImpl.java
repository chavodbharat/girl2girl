package com.missoandfriends.jsonapi.services.mailing;

import java.io.IOException;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.missoandfriends.jsonapi.exceptions.ServerSetupException;
import com.sendgrid.Content;
import com.sendgrid.Email;
import com.sendgrid.Mail;
import com.sendgrid.Method;
import com.sendgrid.Personalization;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;

public class SendgridMailImpl implements MailSenderInterface {
	
	private static final Logger LOG = LogManager.getLogger(SendgridMailImpl.class);
	
	private static SendGrid sendgrid;
	
	@Override
	public void init(final Properties props) throws ServerSetupException {
		if (!props.containsKey("mail.sendgrid.apikey")) {
			throw new ServerSetupException("SendgridMailImpl error. Property mail.sendgrid.apikey not found");
		}
		sendgrid = new SendGrid(props.getProperty("mail.sendgrid.apikey"));
	}

	@Override
	public void sendHtmlEmail(String fromAddress, String toAddress, String subject, String htmlContent)
			throws IOException {
		Email from = new Email(fromAddress);
	    Email to   = new Email(toAddress);
	    Content content = new Content("text/html", htmlContent);
	    Mail mail = new Mail(from, subject, to, content);
	    Request request = new Request();
	    try {
	    	request.setMethod(Method.POST);
	    	request.setEndpoint("mail/send");
	    	request.setBody(mail.build());
	    	Response response = sendgrid.api(request);
	    	LOG.info(response.getStatusCode());
	    	LOG.info(response.getBody());
	    	LOG.info(response.getHeaders());
	    } catch (IOException ex) {
	        throw ex;
	    }
	}

	@Override
	public void sendHtmlEmail(String fromAddress, List<String> toAddress, String subject, String htmlContent)
			throws IOException {
		if (toAddress.isEmpty()) {
			return;
		}
		Email from = new Email(fromAddress);
	    Personalization personalization = new Personalization();
	    boolean first = true;
	    for (final String email: toAddress) {
	    	Email to   = new Email(email);
	    	if (first) {
	    		first = false;
	    		personalization.addTo(to);
	    	} else {	    	
	    		personalization.addBcc(to);
	    	}
	    }
	    Content content = new Content("text/html", htmlContent);
	    Mail mail = new Mail();
	    mail.setFrom(from);
	    mail.addPersonalization(personalization);
	    mail.setSubject(subject);
	    mail.addContent(content);
	    Request request = new Request();
	    try {
	    	request.setMethod(Method.POST);
	    	request.setEndpoint("mail/send");
	    	request.setBody(mail.build());
	    	Response response = sendgrid.api(request);
	    	LOG.info(response.getStatusCode());
	    	LOG.info(response.getBody());
	    	LOG.info(response.getHeaders());
	    } catch (IOException ex) {
	        throw ex;
	    }
	}
	
	
	
}
