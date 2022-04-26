package com.missoandfriends.jsonapi.models;

import java.util.List;

public class ConvoWithResponsesModel extends ConvoWithoutResponsesModel {
	
	private List<ResponseModel> responses;
	
	public List<ResponseModel> getResponses() {
		return responses;
	}
	public void setResponses(List<ResponseModel> responses) {
		this.responses = responses;
	}
	
}
