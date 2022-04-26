package com.missoandfriends.jsonapi.models.payloads;

import org.apache.commons.lang3.builder.ToStringBuilder;

import com.google.gson.annotations.SerializedName;

import net.sf.oval.constraint.Assert;
import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class ChangePasswordPayloadModel {
	
	@NotNull(message="field _id is missing")
	@NotEmpty(message="field _id is empty")
	@SerializedName("_id")
	private String id;
	
	@NotNull(message="field old_password is missing")
	@NotEmpty(message="field old_password is empty")
	@SerializedName("old_password")
	private String oldPassword;
	
	@NotNull(message="field new_password is missing")
	@NotEmpty(message="field new_password is empty")
	@SerializedName("new_password")
	@Assert(expr="_value != _this.oldPassword", message="old_password matches new_password", lang="js")
	private String newPassword;
	
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getOldPassword() {
		return oldPassword;
	}
	public void setOldPassword(String oldPassword) {
		this.oldPassword = oldPassword;
	}
	public String getNewPassword() {
		return newPassword;
	}
	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}
	
	@Override
	public String toString() {
		return ToStringBuilder.reflectionToString(this);
	}
	
	@Override
	public boolean equals(final Object other) {
		if (other instanceof ChangePasswordPayloadModel) {
			final ChangePasswordPayloadModel model = (ChangePasswordPayloadModel) other;
			return model.id.equals(this.id) &&
				   model.newPassword.equals(this.newPassword) &&
				   model.oldPassword.equals(this.oldPassword);
		}
		return false;
	}
	
	@Override
	public int hashCode() {
		return (this.oldPassword + ":" + this.newPassword).hashCode();
	}
	
}
