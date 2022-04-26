package com.missoandfriends.jsonapi.models;

import java.util.ArrayList;
import java.util.List;

public class GroupConvosModel {
	private List<ConvoWithoutResponsesModel> convos = new ArrayList<>();

	public List<ConvoWithoutResponsesModel> getConvos() {
		return convos;
	}

	public void setConvos(List<ConvoWithoutResponsesModel> convos) {
		this.convos = convos;
	}
}
