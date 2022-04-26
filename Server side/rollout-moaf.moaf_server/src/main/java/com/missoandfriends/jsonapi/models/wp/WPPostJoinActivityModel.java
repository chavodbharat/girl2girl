package com.missoandfriends.jsonapi.models.wp;

/**
 * Does not implement all fields, only necessary for work!
 * @author stepan
 *
 */
public class WPPostJoinActivityModel {
	
	private String primaryLink;
	private String itemId;
	private String secondaryItemId;
	private String postTitle;
	
	public String getPrimaryLink() {
		return primaryLink;
	}
	public void setPrimaryLink(String primaryLink) {
		this.primaryLink = primaryLink;
	}
	public String getItemId() {
		return itemId;
	}
	public void setItemId(String itemId) {
		this.itemId = itemId;
	}
	public String getSecondaryItemId() {
		return secondaryItemId;
	}
	public void setSecondaryItemId(String secondaryItemId) {
		this.secondaryItemId = secondaryItemId;
	}
	public String getPostTitle() {
		return postTitle;
	}
	public void setPostTitle(String postTitle) {
		this.postTitle = postTitle;
	}
	
}
