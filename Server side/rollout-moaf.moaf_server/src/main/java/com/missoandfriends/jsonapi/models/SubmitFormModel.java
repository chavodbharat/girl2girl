package com.missoandfriends.jsonapi.models;

import com.google.gson.annotations.SerializedName;

public class SubmitFormModel {
	
	@SerializedName("input_values")
	protected SubmissionPayloadModel inputValues;

	public SubmissionPayloadModel getInputValues() {
		return inputValues;
	}

	public void setInputValues(SubmissionPayloadModel inputValues) {
		this.inputValues = inputValues;
	}
	
}
