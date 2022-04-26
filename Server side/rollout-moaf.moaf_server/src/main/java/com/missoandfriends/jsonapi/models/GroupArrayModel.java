package com.missoandfriends.jsonapi.models;

import java.util.ArrayList;
import java.util.List;

public class GroupArrayModel {
	private List<GroupModel> groups;

	public List<GroupModel> getGroups() {
		return groups;
	}

	public void setGroups(List<GroupModel> groups) {
		this.groups = groups;
	}
	
	public GroupArrayModel(List<GroupModel> groups) {
		this.groups = groups;
	}
	
	public GroupArrayModel() {
		this.groups = new ArrayList<>();
	}
}
