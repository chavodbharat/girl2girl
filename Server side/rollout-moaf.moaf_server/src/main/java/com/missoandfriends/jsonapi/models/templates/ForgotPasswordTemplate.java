package com.missoandfriends.jsonapi.models.templates;

import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class ForgotPasswordTemplate implements HtmlTemplate {
	@NotNull(message="field key is null")
	@NotEmpty(message="field key is empty")
	private String key;
	@NotNull(message="field host is null")
	@NotEmpty(message="field host is empty")
	private String host;
	@NotNull(message="field login is null")
	@NotEmpty(message="field login is empty")
	private String login;
	
	public ForgotPasswordTemplate() {}
	
	public ForgotPasswordTemplate(final String host, final String login, final String key) {
		this.key   = key;
		this.login = login;
		this.host  = host;
	}
	
	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public String getLogin() {
		return login;
	}

	public void setLogin(String login) {
		this.login = login;
	}

	@Override
	public String getNativeTemplateName() {
		return "forgotpassword.html";
	}
}
