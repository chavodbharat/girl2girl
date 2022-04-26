package com.missoandfriends.jsonapi.models;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Optional;

import org.glassfish.jersey.media.multipart.FormDataBodyPart;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;
import com.google.gson.stream.MalformedJsonException;
import com.missoandfriends.jsonapi.services.GsonFactory;
import com.missoandfriends.jsonapi.services.TimeService;

import net.sf.oval.constraint.Assert;
import net.sf.oval.constraint.AssertValid;
import net.sf.oval.constraint.NotEmpty;
import net.sf.oval.constraint.NotNull;

public class LoggedInUserModel extends SerializableModel {
	
	@SerializedName("_id")
	@NotNull(message="field _id is null")
	@NotEmpty(message="field _id is empty")
	private String id;
	
	@SerializedName("birth_date")
	private Date birthday;
	
	@AssertValid
	private CountryModel country;
	
	@AssertValid
	private StateModel state;
	
	@NotEmpty(message="if provided, email field must not be empty")
	private String email;
	
	@SerializedName("name_first")
	@NotEmpty(message="if provided, name_first field must not be empty")
	private String firstName;
	
	@SerializedName("name_last")
	@NotEmpty(message="if provided, name_last field must not be empty")
	private String lastName;
	
	@SerializedName("user_nicename")
	@NotEmpty(message="if provided, user_nicename field must not be empty")
	private String displayName;
	
	@SerializedName("photo_url")
	@NotEmpty(message="if provided, photoUrl field must not be empty")
	private String photoUrl;
	
	private OAuthModel oauth;
	
	//@Assert(expr="_value == null", message="You can not change username. Provide user_nicename, or contact the administrator", lang="js")
	private String username;

	public String getDisplayName() {
		return displayName;
	}

	public void setDisplayName(String displayName) {
		this.displayName = displayName;
	}

	public OAuthModel getOauth() {
		return oauth;
	}

	public void setOauth(OAuthModel oauth) {
		this.oauth = oauth;
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public Date getBirthday() {
		return birthday;
	}

	public void setBirthday(Date birthday) {
		this.birthday = birthday;
	}
	
	public String getBirthdayStringCompact() {
		final SimpleDateFormat sdf = TimeService.getMysqlDateFormat();
		return sdf.format(this.birthday);
	}

	public CountryModel getCountry() {
		return country;
	}

	public void setCountry(CountryModel country) {
		this.country = country;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = Optional.ofNullable(firstName).orElse("");
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = Optional.ofNullable(lastName).orElse("");
	}

	public String getPhotoUrl() {
		return photoUrl;
	}

	public void setPhotoUrl(String photoUrl) {
		this.photoUrl = Optional.ofNullable(photoUrl).orElse("");
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
	
	public LoggedInUserModel() {};
	
	public static class LoggedInUserModelBuilder {
		private String id;
		private String birthDateString;
		private String countryJsonString;
		private String emailString;
		private String nameFirstString;  
		private String nameLastString;
		private String stateJsonString;
		private String usernameString;	
		private String photoUrlString;
		
		public LoggedInUserModelBuilder withId (final FormDataBodyPart bp) {
			this.id = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withId (final String id) {
			this.id = id;
			return this;
		}
		public LoggedInUserModelBuilder withBirthDate (final FormDataBodyPart bp) {
			this.birthDateString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withCountry (final FormDataBodyPart bp) {
			this.countryJsonString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withEmail (final FormDataBodyPart bp) {
			this.emailString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withFirstName (final FormDataBodyPart bp) {
			this.nameFirstString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withLastName (final FormDataBodyPart bp) {
			this.nameLastString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withState (final FormDataBodyPart bp) {
			this.stateJsonString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withUsername (final FormDataBodyPart bp) {
			this.usernameString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModelBuilder withPhotoUrl (final FormDataBodyPart bp) {
			this.photoUrlString = (bp != null) ? bp.getValue() : null;
			return this;
		}
		public LoggedInUserModel build () throws MalformedJsonException {
			final LoggedInUserModel user = new LoggedInUserModel();
			final Gson gson = GsonFactory.getGson();
			final CountryModel country = gson.fromJson(this.countryJsonString, CountryModel.class);
			final StateModel state = gson.fromJson(this.stateJsonString, StateModel.class);
			
			user.setId(this.id);
			user.setBirthday(TimeService.isoStringToDate(this.birthDateString));
			user.setCountry(country);
			user.setState(state);
			user.setEmail(this.emailString);
			user.firstName = this.nameFirstString;
			user.lastName  = this.nameLastString;
			user.photoUrl  = this.photoUrlString;
			user.setUsername(this.usernameString);
			
			return user;
		}
	}
}
