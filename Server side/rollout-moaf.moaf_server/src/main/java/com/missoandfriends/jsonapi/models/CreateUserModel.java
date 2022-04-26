package com.missoandfriends.jsonapi.models;

import java.util.Date;

import org.glassfish.jersey.media.multipart.FormDataBodyPart;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;
import com.google.gson.stream.MalformedJsonException;
import com.missoandfriends.jsonapi.misc.EmailHelper;
import com.missoandfriends.jsonapi.services.GsonFactory;
import com.missoandfriends.jsonapi.services.TimeService;

import net.sf.oval.constraint.AssertValid;
import net.sf.oval.constraint.MatchPattern;
import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class CreateUserModel implements InputValuesInterface {
	
	public static final int THIRTEEN = 13;
	
	@SerializedName("birth_date")
	@NotNull(message="field birth_date is null")
	@NotEmpty(message="field birth_date is empty")
	private Date birthDate;
	
	@SerializedName("name_first")
	@NotNull(message="field name_first is null")
	@NotEmpty(message="field name_first is empty")
	private String firstName;
	
	@SerializedName("name_last")
	@NotNull(message="field name_last is null")
	private String lastName = "";
	
	@SerializedName("photo_url")
	@NotNull(message="field photo_url is null")
	@NotEmpty(message="field photo_url is empty")
	private String photoUrl;
	
	@AssertValid
	@NotNull(message="field country is null")
	private CountryModel country;
	
	private StateModel state;
	
	@NotNull(message="field username is null")
	@NotEmpty(message="field username is empty")
	private String username;
	
	@NotNull(message="field email is missing")
	@NotEmpty(message="field email is empty")
	@MatchPattern(pattern=EmailHelper.BASIC_EMAIL_TEMPLATE, message="bad email format")
	private String email;
	
	private String parentEmail;
	
	@NotNull(message="field password is missing")
	@NotEmpty(message="field password is empty")
	private String password;
	
	public String getParentEmail() {
		return parentEmail;
	}

	public void setParentEmail(String parentEmail) {
		this.parentEmail = parentEmail;
	}

	public boolean isUnder13() {
		if (this.birthDate != null) {
			return TimeService.yearsBetween(this.birthDate) < THIRTEEN;
		}
		return false;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public Date getBirthDate() {
		return birthDate;
	}

	public void setBirthDate(Date birthDate) {
		this.birthDate = birthDate;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getPhotoUrl() {
		return photoUrl;
	}

	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = photoUrl;
	}

	public CountryModel getCountry() {
		return country;
	}

	public void setCountry(CountryModel country) {
		this.country = country;
	}

	public StateModel getState() {
		return state;
	}

	public void setState(StateModel state) {
		this.state = state;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
	public static class CreateUserModelBuilder {
		private String birthDateString;
		private String countryJsonString;
		private String emailString;
		private String parentEmailString;
		private String nameFirstString;  
		private String nameLastString;
		private String stateJsonString;	
		private String passwordString;
		private String usernameString;	
		private String photoUrlString;
		
		public CreateUserModelBuilder withBirthDate (final FormDataBodyPart bp) {
			this.birthDateString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withCountry (final FormDataBodyPart bp) {
			this.countryJsonString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withEmail (final FormDataBodyPart bp) {
			this.emailString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withParentEmail (final FormDataBodyPart bp) {
			this.parentEmailString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withFirstName (final FormDataBodyPart bp) {
			this.nameFirstString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withLastName (final FormDataBodyPart bp) {
			this.nameLastString = (bp != null) ? bp.getValue() : "";
			return this;
		}
		public CreateUserModelBuilder withState (final FormDataBodyPart bp) {
			this.stateJsonString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withPassword (final FormDataBodyPart bp) {
			this.passwordString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withUsername (final FormDataBodyPart bp) {
			this.usernameString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModelBuilder withPhotoUrl (final FormDataBodyPart bp) {
			this.photoUrlString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public CreateUserModel build () throws MalformedJsonException {
			final CreateUserModel user = new CreateUserModel();
			final Gson gson = GsonFactory.getGson();
			final CountryModel country = gson.fromJson(this.countryJsonString, CountryModel.class);
			final StateModel state = gson.fromJson(this.stateJsonString, StateModel.class);
			
			user.setBirthDate(TimeService.isoStringToDate(this.birthDateString));
			user.setCountry(country);
			user.setState(state);
			user.parentEmail = this.parentEmailString;
			user.setEmail(this.emailString);
			user.firstName = this.nameFirstString;
			user.lastName  = this.nameLastString;
			user.setPassword(this.passwordString);
			user.photoUrl  = this.photoUrlString;
			user.setUsername(this.usernameString);
			
			return user;
		}
	}
	
}
