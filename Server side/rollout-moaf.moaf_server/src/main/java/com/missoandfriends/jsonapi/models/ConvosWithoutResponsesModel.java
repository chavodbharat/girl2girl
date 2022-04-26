package com.missoandfriends.jsonapi.models;

import java.util.ArrayList;
import java.util.List;

import com.google.gson.annotations.SerializedName;

public class ConvosWithoutResponsesModel {
	
	@SerializedName("has_next")
	private boolean hasNext;

	private List<ConvoWithoutResponsesModel> convos = new ArrayList<>();

	public List<ConvoWithoutResponsesModel> getConvos() {
		return convos;
	}

	public void setConvos(List<ConvoWithoutResponsesModel> convos) {
		this.convos = convos;
	}

	public boolean isHasNext() {
		return hasNext;
	}

	public void setHasNext(boolean hasNext) {
		this.hasNext = hasNext;
	}
	
}
