package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class ShortGroupModel {
	
	@SerializedName("_id")
	private String id;
	private String name;
	@SerializedName("total_members")
	private Integer totalMembers;
	
	public static ShortGroupModel getRemovedGroup() {
		final ShortGroupModel out = new ShortGroupModel();
		out.setId("-1");
		out.setName("This group was removed");
		out.setTotalMembers(0);
		return out;
	}
	
	public ShortGroupModel() {}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Integer getTotalMembers() {
		return totalMembers;
	}

	public void setTotalMembers(Integer totalMembers) {
		this.totalMembers = totalMembers;
	}
	
}
