package com.missoandfriends.jsonapi.services.mailing;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.util.List;
import java.util.Properties;

import com.missoandfriends.jsonapi.exceptions.ServerSetupException;
import com.missoandfriends.jsonapi.services.TimeService;

public class LocalFileSenderImpl implements MailSenderInterface {
	
	private static String outputFolder;
	
	public static String makeEmailAbsSubst() {
		return new StringBuilder(outputFolder).append('/').append(TimeService.getCurrentDatetimeAsFilename()).append("%s.txt").toString();
	}

	@Override
	public void init(Properties props) throws ServerSetupException {
		if (!props.containsKey("mail.dir")) {
			throw new ServerSetupException("LocalFileSenderImpl setup error. Property mail.dir not found");
		}
		outputFolder = props.getProperty("mail.dir");
		if (!(new File(outputFolder).exists())) {
			throw new ServerSetupException("LocalFileSenderImpl setup error. Directory " + outputFolder + " does not exist");
		}
	}

	@Override
	public void sendHtmlEmail(String fromAddress, String toAddress, String subject, String htmlContent)
			throws IOException {
		final String filename = String.format(makeEmailAbsSubst(), "");
		File out = new File(filename);
		try (final FileWriter fw     = new FileWriter(out);
			 final BufferedWriter bw = new BufferedWriter(fw, 32768);) {
			bw.write("subject: ");
			bw.write(subject);
			bw.write("\r\n");
			bw.write("from: ");
			bw.write(fromAddress);
			bw.write("\r\n");
			bw.write("to: ");
			bw.write(toAddress);
			bw.write("\r\n");
			bw.write(htmlContent);
			bw.flush();
		}
	}

	@Override
	public void sendHtmlEmail(String fromAddress, List<String> toAddress, String subject, String htmlContent)
			throws IOException {
		int i = 1;
		for (final String to: toAddress) {
			final String filename = String.format(makeEmailAbsSubst(), String.valueOf(i++));
			File out = new File(filename);
			try (final FileWriter fw     = new FileWriter(out);
				 final BufferedWriter bw = new BufferedWriter(fw, 32768);) {
				bw.write("subject: ");
				bw.write(subject);
				bw.write("\r\n");
				bw.write("from: ");
				bw.write(fromAddress);
				bw.write("\r\n");
				bw.write("to: ");
				bw.write(to);
				bw.write("\r\n");
				bw.write(htmlContent);
				bw.flush();
			}
		}
	}

}
