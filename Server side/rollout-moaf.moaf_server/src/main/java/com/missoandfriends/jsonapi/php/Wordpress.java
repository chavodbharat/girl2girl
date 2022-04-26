package com.missoandfriends.jsonapi.php;

import java.util.Properties;
import java.util.Random;

import org.apache.commons.lang3.StringUtils;

import com.missoandfriends.jsonapi.MOFServer;

public final class Wordpress {
	
	public static final int PHPASS_LENGTH = 12;
	
	private Wordpress () {}
	
	private static String websiteHostname;
	private static String websiteSchema;
	private static String websiteAddress;
	
	public static final String CONVO_PARENT_POST_TYPE 		= "topic";
	public static final String CONVO_PARENT_MENU_ORDER 		= "0";
	public static final String CONVO_REPLY_POST_TYPE  		= "reply";
	public static final String CONVO_REPLY_MENU_ORDER  		= "3";
	public static final String CONVO_MIME_TYPE  			= "";
	public static final String CONVO_POST_STATUS_PUBLISH	= "publish";
	public static final String CONVO_POST_STATUS_PENDING 	= "pending";
	public static final String CONVO_COMMENT_STATUS  		= "closed";
	public static final String CONVO_PING_STATUS_OPEN  		= "open";
	public static final String CONVO_PING_STATUS_CLOSED  	= "open";
	public static final String CONVO_BP_CREATE_TOPIC_ACTIVITY_TYPE  = "bbp_topic_create";
	public static final String CONVO_BP_REPLY_TOPIC_ACTIVITY_TYPE  	= "bbp_reply_create";
	public static final String CONVO_BP_COMPONENT_TYPE  = "bbpress";
	
	public static PHPass getPHPass () {
		return new PHPass(Wordpress.PHPASS_LENGTH);
	}
	
	public static String getWebsiteUrl() {
		return websiteAddress;
	}
	
	public static void init (final Properties props) {
		Wordpress.websiteSchema   = (String) props.getProperty("wp.schema", "https");
		Wordpress.websiteHostname = (String) props.getProperty("wp.host", "gcloud.missoandfriends.com");
		websiteAddress = Wordpress.websiteSchema + "://" + Wordpress.websiteHostname;
	}
	
	public static String getWpBpActivityPostActionByAdmin(final String postId, final String title) {
		return String
			.format("<a href=\"%s\" title=\"admin\">admin</a> wrote a new post, <a href=\"%s\">%s</a>", getAdminProfile(), getCommonPostUrlById(postId), title);
	}
	
	public static String getWpBpActivityPostActionByMember(final String username, final String postId, final String niceName, final String title) {
		return String.format("<a href=\"%s\" title=\"%s\">%s</a> wrote a new post, <a href=\"%s\">%s</a>", 
				getUserProfileAddressByUsername(username), niceName, niceName, getCommonPostUrlById(postId), title);	
	}
	
	public static String getWpBpActivityReplyActionByMember(
			final String username, final String displayName, final String primaryLink, final String title, final String forumAddress, final String forumName) {
		return String.format(
			"<a href=\"%s/members/%s/\" rel=\"nofollow\">%s</a> replied to the topic <a href=\"%s\">%s</a> in the forum <a href=\"%s\">%s</a>", 
			websiteAddress, username, displayName, primaryLink, title, forumAddress, forumName);
	}
	
	public static String getForumNameBySlug(final String slug) {
		return new StringBuilder(websiteAddress).append("/girl2girl-groups/").append(slug).append("/forum/").toString();
	}
	
	public static String getUserProfileAddressByUsername (final String username) {
		return new StringBuilder(websiteAddress).append("/members/").append(username).append('/').toString();
	}
	
	public static String getAdminProfile () {
		return new StringBuilder(websiteAddress).append("/members/admin/").toString();
	}
	
	/**
	 * same as getCommonPostUrlByIdm but with parameter post_type=topic
	 * @param id
	 * @return
	 */
	public static String getTopicPostGuid(final String id) {
		return new StringBuilder(websiteAddress).append("/?post_type=topic&#038;p=").append(id).toString();		
	}
	
	
	/**
	 * url of topic post
	 * @param parentSlug
	 * @param postSlug
	 * @return
	 */
	public static String getTopicGirls2GirlsPrimaryLink(final String parentSlug, final String postSlug) {
		return new StringBuilder(websiteAddress).append("/girl2girl-groups/").append(parentSlug).append("/forum/topic/").append(postSlug).append('/').toString();
	}
	
	/**
	 * url of post by id, without slug, as is 
	 * @param postId
	 * @return
	 */
	public static String getCommonPostUrlById (final String postId) {
		return new StringBuilder(websiteAddress).append("/?p=").append(postId).toString();
	}
	
	public static String wpGeneratePassword(final int length, boolean useSpecialChars, boolean useExtraSpecialChars) {
		final StringBuilder charsBuilder = new StringBuilder("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
		if (useSpecialChars) {
			charsBuilder.append("!@#$%^&*()");
		}
		if (useExtraSpecialChars) {
			charsBuilder.append("-_ []{}<>~`+=,.;:/?|");
		}
		final String[] chars = charsBuilder.toString().split("(?!^)");
		final int cLen = chars.length;
		final StringBuilder out = new StringBuilder();
		final Random rand = new Random();
		for (int i = 0; i < length; i++) {
			out.append(chars[rand.nextInt(cLen)]);
		}
		return out.toString();
	}
	
	public static String wpGeneratePassword(final int length, boolean useSpecialChars) {
		return wpGeneratePassword(length, useSpecialChars, false);
	}
	
	public static String wpGeneratePassword(final int length) {
		return wpGeneratePassword(length, true, false);
	}
	
	public static boolean resetLinkExpired(final String resetKey) {
		assert !StringUtils.isBlank(resetKey);
		final String [] pair = resetKey.split(":");
		if (pair.length != 2) {
			return true;
		}
		final long unixTimestamp = Long.parseLong(pair[0]);
		final long diff = System.currentTimeMillis() - unixTimestamp * 1000L;
		return (double) diff / 1000.0 / 60.0 / 60.0 / 24.0 > 1.0;
	}
	
	public static boolean isValidResetLink(final String resetKey) {
		if (StringUtils.isBlank(resetKey)) {
			return false;
		}
		return resetKey.contains(":");
	}
	
}















