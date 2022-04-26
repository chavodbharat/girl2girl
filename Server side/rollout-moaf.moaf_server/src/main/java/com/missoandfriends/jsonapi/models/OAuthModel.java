package com.missoandfriends.jsonapi.models;

import java.util.HashSet;
import java.util.Set;

import org.apache.commons.lang3.RandomStringUtils;

import com.google.gson.annotations.SerializedName;

public class OAuthModel {
	
	public static final long EXPIRES_SECONDS = 60 * 60 * 24 * 30;
	
	private String token;
	private String username;
	@SerializedName("user_id")
	private String userId;
	private long expires;
	private boolean isAdmin     = false;
	private boolean isModerator = false;
	
	private Set<Integer> groupsMembership = new HashSet<>();
	
	@SerializedName("display_name")
	private String displayName;
	
	public OAuthModel(final String username, final String userId, boolean isAdmin, boolean isModerator, final String userNiceName, final Set<Integer> groupsMembership) {
		this.setToken();
		this.username = username;
		this.userId   = userId;
		this.expires  = System.currentTimeMillis() / 1000L + EXPIRES_SECONDS;
		this.isAdmin  = isAdmin;
		this.isModerator = isModerator;
		this.displayName = userNiceName;
		this.groupsMembership = groupsMembership;
	}
	
	public boolean canPostWithoutPremoderation () {
		return this.isAdmin || this.isModerator;
	}
	
	public Set<Integer> getGroupsMembership() {
		return groupsMembership;
	}

	public void setGroupsMembership(Set<Integer> groupsMembership) {
		this.groupsMembership = groupsMembership;
	}

	public String getDisplayName() {
		return displayName;
	}
	
	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public boolean isModerator() {
		return isModerator;
	}

	public void setModerator(boolean isModerator) {
		this.isModerator = isModerator;
	}

	public boolean isAdmin() {
		return isAdmin;
	}

	public void setAdmin(boolean isAdmin) {
		this.isAdmin = isAdmin;
	}

	public boolean expired() {
		System.out.println("expired? " + ((System.currentTimeMillis() / 1000L) > this.expires) + " current " + System.currentTimeMillis() / 1000L + " vs expire " + this.expires);
		return (System.currentTimeMillis() / 1000L) > this.expires;
	}
	
	public OAuthModel() {}
	
	public void setToken() {
		this.token = RandomStringUtils.randomAlphanumeric(50);
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public long getExpires() {
		return expires;
	}

	public void setExpires(long expires) {
		this.expires = expires;
	}
	
	public void setExpires () {
		System.out.println("setExpires " + ((System.currentTimeMillis() / 1000L) > this.expires) + " current " + System.currentTimeMillis() / 1000L + " vs expire " + this.expires);
		this.expires = System.currentTimeMillis() / 1000L + EXPIRES_SECONDS;
	}
	
	public static class OAuthModelBuilder {
		private String username;
		private String userId;
		private boolean isAdmin = false;
		private boolean isModerator = false;
		private Set<Integer> groupsMembership = new HashSet<>();
		private String displayName;

		public OAuthModelBuilder withUsername(final String username) {
			this.username = username;
			return this;
		}
		
		public OAuthModelBuilder withUserId(final String userId) {
			this.userId = userId;
			return this;
		}
		
		public OAuthModelBuilder withAdmin(final boolean isAdmin) {
			this.isAdmin = isAdmin;
			return this;
		}
		
		public OAuthModelBuilder withModerator(final boolean isModerator) {
			this.isModerator = isModerator;
			return this;
		}
		
		public OAuthModelBuilder withGroupsMembership(final Set<Integer> groupsMembership) {
			this.groupsMembership = groupsMembership;
			return this;
		}
		
		public OAuthModelBuilder withDisplayName(final String displayName) {
			this.displayName = displayName;
			return this;
		}
		
		public OAuthModel build() {
			return new OAuthModel(username, userId, isAdmin, isModerator, displayName, groupsMembership);
		}
		
	}
	
}

















