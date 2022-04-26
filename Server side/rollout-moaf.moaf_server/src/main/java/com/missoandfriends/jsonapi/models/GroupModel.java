package com.missoandfriends.jsonapi.models;

import java.util.HashMap;
import java.util.Map;

import com.google.gson.annotations.SerializedName;

public class GroupModel {
	
	@SerializedName("_id")
	private String id;
	
	@SerializedName("img_class")
	private String imageClass;
	
	@SerializedName("img_url")
	private String imageUrl;
	
	@SerializedName("is_active")
	private boolean isActive;
	
	@SerializedName("is_following")
	private boolean isFollowing;
	
	@SerializedName("is_newest")
	private boolean isNewest;
	
	@SerializedName("is_popular")
	private boolean isPopular;
	
	private String name;
	
	private transient Map<String, String> metadata = new HashMap<>();

	public Map<String, String> getMetadata() {
		return metadata;
	}

	public void setMetadata(Map<String, String> metadata) {
		this.metadata = metadata;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getImageClass() {
		return imageClass;
	}

	public void setImageClass(String imageClass) {
		this.imageClass = imageClass;
		this.imageUrl   = imageClass;
	}
	
	public String getImageUrl() {
		return this.imageUrl;
	}

	public boolean isActive() {
		return isActive;
	}

	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}

	public boolean isFollowing() {
		return isFollowing;
	}

	public void setFollowing(boolean isFollowing) {
		this.isFollowing = isFollowing;
	}

	public boolean isNewest() {
		return isNewest;
	}

	public void setNewest(boolean isNewest) {
		this.isNewest = isNewest;
	}

	public boolean isPopular() {
		return isPopular;
	}

	public void setPopular(boolean isPopular) {
		this.isPopular = isPopular;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}
	
	@Override
	public GroupModel clone() {
		final GroupModel out = new GroupModel();
		out.id 			= this.id;
		out.imageClass 	= this.imageClass;
		out.isActive 	= this.isActive;
		out.isFollowing = this.isFollowing;
		out.isNewest 	= this.isNewest;
		out.isPopular 	= this.isPopular;
		return out;
	}
	
}
