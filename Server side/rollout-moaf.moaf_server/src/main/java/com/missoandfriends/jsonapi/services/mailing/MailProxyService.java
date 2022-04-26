package com.missoandfriends.jsonapi.services.mailing;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.missoandfriends.jsonapi.exceptions.ServerSetupException;
import com.missoandfriends.jsonapi.models.CreateUserModel;
import com.missoandfriends.jsonapi.models.templates.ActivateTemplate;
import com.missoandfriends.jsonapi.models.templates.ForgotPasswordTemplate;
import com.missoandfriends.jsonapi.models.templates.FriendRequestTemplate;
import com.missoandfriends.jsonapi.models.templates.NewConvoReplyTemplate;
import com.missoandfriends.jsonapi.models.templates.NewConvoTemplate;
import com.missoandfriends.jsonapi.models.templates.NewUserRegistrationTemplate;
import com.missoandfriends.jsonapi.models.templates.ParentRegistrationTemplate;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.AdminService;
import com.missoandfriends.jsonapi.services.TemplaterService;
import com.missoandfriends.jsonapi.services.TimeService;

public class MailProxyService {
	
	private static final Logger LOG = LogManager.getLogger(MailProxyService.class);
	
	private static String mailEngine;
	private static MailSenderInterface sender;
	private static String senderName; 
	private static String recipientName;
	
	public static void init(final Properties props) throws ServerSetupException {
		if (!props.containsKey("mail.engine")) {
			throw new ServerSetupException("MailPropxyServre error. Property mail.engine not found");
		}
		MailProxyService.mailEngine = props.getProperty("mail.engine");
		MailProxyService.senderName = props.getProperty("main.sender", "missonotifications@gmail.com");
		MailProxyService.recipientName = props.getProperty("main.recipient", "missonotifications@gmail.com");
		
		switch (mailEngine) {
		case "local":
			sender = new LocalFileSenderImpl();
			break;
		case "sendgrid":
			sender = new SendgridMailImpl();
			break;
		default: 
			throw new ServerSetupException("MailPropxyService error. mail.engine property must be local or sendgrid, but " + mailEngine + " found");
		}
		sender.init(props);
	}
	
	public void sendHtmlEmailWithSendgrid(final String fromAddress, final String toAddress, final String subject, final String htmlContent) throws IOException {	    
	    sender.sendHtmlEmail(fromAddress, toAddress, subject, htmlContent);
	}
	
	public void sendHtmlEmailWithSendgrid(final String fromAddress, final List<String> toAddress, final String subject, final String htmlContent) throws IOException {	    		
	    sender.sendHtmlEmail(fromAddress, toAddress, subject, htmlContent);
	}
	
	public void newUserRegistrationActivation(String activationKey, String email, String parentEmail) {
		try {
			String body;
			if (StringUtils.isEmpty( parentEmail )) {
				body = TemplaterService.build(new ActivateTemplate(Wordpress.getWebsiteUrl(), activationKey));
			} else {
				body = TemplaterService.build(new ParentRegistrationTemplate(Wordpress.getWebsiteUrl(), activationKey));
			}
			sendHtmlEmailWithSendgrid(senderName, email, "[MissOAndFriends] Activate your account", body);
		} catch (final Exception e) {
			LOG.error(" as MailProxyService@newUserRegistrationActivation", e);
		}
	}
	
	public void friendRequestNotification(final String email, final String following, final String follower) {
		try {
			final FriendRequestTemplate t = new FriendRequestTemplate();
			t.setFollower(follower);
			t.setFollowing(following);
			t.setHost(Wordpress.getWebsiteUrl());
			final String body = TemplaterService.build(t);
			sendHtmlEmailWithSendgrid(senderName, email, "[MissOAndFriends] New friendship request from " + follower, body);
		} catch (final Exception e) {
			LOG.error(" as MailProxyService@friendRequestNotification", e);
		}
	}
	
	public void newUserRegistration(final String username, final CreateUserModel user) {
		try {
			final List<String> emails = new AdminService().getAdminEmails();
			final NewUserRegistrationTemplate html = new NewUserRegistrationTemplate();
			html.setUsername(username);
			html.setTimeCreated(TimeService.getCurrentDatetimeUSString());
			html.setUser(user);
			final String body = TemplaterService.build(html);
			sendHtmlEmailWithSendgrid(senderName, emails, "New User Registration", body);
		} catch (final Exception e) {
			LOG.error(" as MailProxyService@newUserRegistration", e);
		}
	}
	
	/**
	 * 
	 * @param username
	 * @param text
	 * @param isNewConvo - if true, then is convo, if false, then is reply
	 */
	public void newConvo(final String username, final String text) {
		try {
			//final List<String> emails = new AdminService().getAdminEmails();
			final List<String> emails = Arrays.stream(MailProxyService.recipientName.split(","))
					.map(String::trim)
					.collect(Collectors.toList());
			
			final NewConvoTemplate html = new NewConvoTemplate();
			html.setUsername(username);
			html.setText(text);			
			final String body = TemplaterService.build(html);
			
			final String subject = "Please approve new convo";
			
			sendHtmlEmailWithSendgrid(senderName, emails, subject, body);
		} catch (final Exception e) {
			LOG.error(" as MailProxyService@newConvo", e);
		}
	}
	
	public void newConvoReply(final String username, final String text) {
		try {
			//final List<String> emails = new AdminService().getAdminEmails();
			final List<String> emails = Arrays.stream(MailProxyService.recipientName.split(","))
					.map(String::trim)
					.collect(Collectors.toList());
			
			final NewConvoReplyTemplate html = new NewConvoReplyTemplate();
			html.setUsername(username);
			html.setText(text);			
			final String body = TemplaterService.build(html);
			
			final String subject = "Please approve new convo reply";
			
			sendHtmlEmailWithSendgrid(senderName, emails, subject, body);
		} catch (final Exception e) {
			LOG.error(" as MailProxyService@newConvo", e);
		}
	}
	
	public void sendForgotPasswordEmail(final String email, final String host, final String login, final String resetKey) {
		try {
			final String body = TemplaterService.build(new ForgotPasswordTemplate(host, login, resetKey));
			sendHtmlEmailWithSendgrid(senderName, email, "Reset Missoandfriends Password", body);
		} catch (final Exception e) {
			LOG.error(" as MailProxyService@sendForgotPasswordEmail", e);
		}
	}
	
}
