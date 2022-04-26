package com.missoandfriends.jsonapi.services;

import java.io.File;
import java.io.IOException;
import java.io.StringWriter;
import java.io.Writer;
import java.util.Properties;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.missoandfriends.jsonapi.models.templates.HtmlTemplate;

import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import freemarker.template.TemplateExceptionHandler;

public class TemplaterService {
	
	private static final Logger LOG = LogManager.getLogger(TemplaterService.class);
	
	private TemplaterService() {}

	private static Configuration cfg;
	
	public static Configuration getCfg() {
		return cfg;
	}

	public static void setCfg(Configuration cfg) {
		TemplaterService.cfg = cfg;
	}

	public static void init(Properties props) {
		try {
			cfg = new Configuration();
			final File file = new File(props.getProperty("templater.dir"));
			cfg.setDirectoryForTemplateLoading(file);
			cfg.setDefaultEncoding("UTF-8");
			cfg.setTemplateExceptionHandler(TemplateExceptionHandler.RETHROW_HANDLER);
		} catch (final IOException e) {
			LOG.error("Unable to initialize templater", e);
		}
	}
	
	public static String build(final HtmlTemplate data, final String name) throws IOException, TemplateException {
		Template temp = cfg.getTemplate(name);
		try (Writer out = new StringWriter();) {
			temp.process(data, out);
			return out.toString();
		}
	}
	
	public static String build(final HtmlTemplate data) throws IOException, TemplateException {
		return build(data, data.getNativeTemplateName());
	}
	
	public static void build(final HtmlTemplate data, Writer out, final String name) throws IOException, TemplateException {
		Template temp = cfg.getTemplate(name);
		temp.process(data, out);
	}
	
	public static void build(final HtmlTemplate data, Writer out) throws IOException, TemplateException {
		build(data, out,data.getNativeTemplateName());
	}
	
}
