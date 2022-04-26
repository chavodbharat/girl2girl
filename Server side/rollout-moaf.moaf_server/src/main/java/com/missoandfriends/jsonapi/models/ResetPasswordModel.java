package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;
import com.missoandfriends.jsonapi.php.Wordpress;

import net.sf.oval.constraint.MatchPattern;
import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class ResetPasswordModel {
	
	@NotNull(message="field password is empty")
	@NotEmpty(message="field password is empty")
	private String password;
	
	@NotNull(message="field reset_key is empty")
	@NotEmpty(message="field reset_key is empty")
	@MatchPattern(pattern="[0-9]+\\:.*", message="bad reset_key format")
	@SerializedName("reset_key")
	private String resetKey;

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getResetKey() {
		return resetKey;
	}

	public void setResetKey(String resetKey) {
		this.resetKey = resetKey;
	}
	
	public boolean resetKeyExpired() {
		return Wordpress.resetLinkExpired(this.resetKey);
	}
	
}
