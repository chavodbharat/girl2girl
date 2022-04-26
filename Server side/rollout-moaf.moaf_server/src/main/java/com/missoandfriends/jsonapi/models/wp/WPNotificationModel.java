package com.missoandfriends.jsonapi.models.wp;

import java.sql.Date;

public class WPNotificationModel {
	
	public static final String COMPONENT_NAME_CONVO = "forums";
	public static final String COMPONENT_ACTION_REPLY = "bbp_new_reply"; 
	
	private String id;
	private String userId;
	private String itemId;
	private String secondaryItemId;
	private String componentName;
	private String componentAction;
	private Date dateNotified;
	private boolean isNew;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
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
	public String getComponentName() {
		return componentName;
	}
	public void setComponentName(String componentName) {
		this.componentName = componentName;
	}
	public String getComponentAction() {
		return componentAction;
	}
	public void setComponentAction(String componentAction) {
		this.componentAction = componentAction;
	}
	public Date getDateNotified() {
		return dateNotified;
	}
	public void setDateNotified(Date dateNotified) {
		this.dateNotified = dateNotified;
	}
	public boolean isNew() {
		return isNew;
	}
	public void setNew(boolean isNew) {
		this.isNew = isNew;
	}
	public int getNewSQL() {
		return this.isNew ? 1 : 0;
	}
	
	public static class WPNotificationBuilder {
		private String userId;
		private String itemId;
		private String secondaryItemId;
		private String componentName;
		private String componentAction;
		private Date dateNotified;
		
		public WPNotificationBuilder withUserId(final String userId) {
			this.userId = userId;
			return this;
		}
		public WPNotificationBuilder withItemId(final String itemId) {
			this.itemId = itemId;
			return this;
		}
		public WPNotificationBuilder withSecondayItemId(final String secondaryItemId) {
			this.secondaryItemId = secondaryItemId;
			return this;
		}
		public WPNotificationBuilder withDateNotified(final Date dateNotified) {
			this.dateNotified = dateNotified;
			return this;
		}
		public WPNotificationBuilder withDateNotified(final java.util.Date dateNotified) {
			this.dateNotified = new java.sql.Date( dateNotified.getTime() );
			return this;
		}
		public WPNotificationBuilder asConvoReply () {
			this.componentAction 	= COMPONENT_ACTION_REPLY;
			this.componentName 		= COMPONENT_NAME_CONVO;
			return this;
		}
		public WPNotificationModel build() {
			WPNotificationModel out = new WPNotificationModel();
			out.setComponentAction(this.componentAction);
			out.setComponentName(this.componentName);
			out.setDateNotified(this.dateNotified);
			out.setItemId(this.itemId);
			out.setNew(true);
			out.setSecondaryItemId(this.secondaryItemId);
			out.setUserId(this.userId);
			return out;
		}
	}
	
}
