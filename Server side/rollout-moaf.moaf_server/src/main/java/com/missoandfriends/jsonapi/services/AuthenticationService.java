package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.ParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import org.eclipse.jetty.http.HttpStatus;

import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.exceptions.UnauthorizedException;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.CountryModel;
import com.missoandfriends.jsonapi.models.EmailModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModelFollowings;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.ResetPasswordModel;
import com.missoandfriends.jsonapi.models.StateModel;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;
import com.missoandfriends.jsonapi.php.PHPass;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

import de.ailis.pherialize.MixedArray;
import de.ailis.pherialize.Pherialize;

public class AuthenticationService {
	
	public static final String META_KEY_CAPABILITIES 	= "wp_capabilities";
	public static final String META_KEY_USERLEVEL 		= "wp_user_level";
	
	public static boolean isAdmin(final String userLevel, final String userCaps) {
		try {
			MixedArray list = Pherialize.unserialize(userCaps).toArray();
			return list.contains("administrator") && list.getInt("administrator") == 1 && "10".equals(userLevel);
		} catch (final Exception e) {
			return false;
		}
	}
	
	public static boolean isModerator(final String userLevel, final String userCaps) {
		try {
			MixedArray list = Pherialize.unserialize(userCaps).toArray();
			return list.contains("bbp_moderator") && list.getInt("bbp_moderator") == 1 && "10".equals(userLevel);
		} catch (final Exception e) {
			return false;
		}
	}
	
	public static Date dateOfBirthFromXprofile (final String userId) throws SQLException {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select d.value as value from wp_bp_xprofile_data d, " +
					 "wp_bp_xprofile_fields f " +
					 "where user_id = ? and f.type = 'birthdate' and f.id = d.field_id");) {
			pstm.setString(1, userId);
			try (final ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {
					final String date = rs.getString("value");
					final Date out = TimeService.getMysqlTimestampFormat().parse(date);
					return out;
				}
				return null;
			} catch (final ParseException e) {
				return null;
			}
		}
	}
	
	public static LoggedInUserModelFollowings buildUser(final ResultSet rs, final Map<String, String> metadata) throws SQLException, MOFSQL500Exception {
		LoggedInUserModelFollowings out = new LoggedInUserModelFollowings();
		out.setEmail(rs.getString("user_email"));
		
		out.setId(rs.getString("ID"));
		
		final Date xdateBirthdate = dateOfBirthFromXprofile(out.getId());
		if (xdateBirthdate != null) {
			out.setBirthday(xdateBirthdate);
		}
		
		if (out.getBirthday() == null) {
			try {
				out.setBirthday(rs.getDate("birth_date"));
			} catch (final SQLException e) {
				out.setBirthday(null);
			}
		}
		
		final String firstNameRaw = rs.getString("first_name");
		final String lastNameRaw  = rs.getString("last_name");
		
		out.setDisplayName(rs.getString("display_name"));
		
		out.setPhotoUrl("");
		
		out.setUsername(rs.getString("user_login"));
		
		final String stateAbbr   = rs.getString("state");
		final String countryName = rs.getString("country");
		
		metadata.put(rs.getString("meta_key"), rs.getString("meta_value"));
		while (rs.next()) {							
			metadata.put(rs.getString("meta_key"), rs.getString("meta_value"));
		}
		
		if (out.getBirthday() == null) {			
			if (metadata.containsKey("birthday")) {				
				try {
					final Date date = TimeService.getMysqlDateFormat().parse(metadata.get("birthday"));
					out.setBirthday(date);
				} catch (final ParseException e) {}
			}
		}
		
		final CountryModel cm = new CountryModel();
		if (countryName == null) {
			cm.setName(metadata.get("country"));
			cm.setAlpha3(CountryStateAbbrService.countryToAlpha3.get(cm.getName()));
		} else {							
			cm.setName(countryName);
			cm.setAlpha3(CountryStateAbbrService.countryToAlpha3.get(cm.getName()));
		}						
		out.setCountry(cm);
		
		//meta first
		final String photo = metadata.getOrDefault("user_avatar_choice", "");
		if ("".equals(photo)) {
			final String filePhoto = new FileUploadService().getFullAbsBPImageFromDirectory(out.getId());
			out.setPhotoUrl(filePhoto);
		} else {
			out.setPhotoUrl(photo);
		}

		/*
		//file first
		final String photo = new FileUploadService().getFullAbsBPImageFromDirectory(out.getId());
		if (photo == null) {
			out.setPhotoUrl(metadata.getOrDefault("user_avatar_choice", ""));
		} else {
			out.setPhotoUrl(photo);
		}
		*/
		
		final StateModel sm = new StateModel();
		
		if (stateAbbr == null) {
			sm.setName(metadata.get("state"));
			sm.setAbbreviation(CountryStateAbbrService.stateNameToAbbr.get(sm.getName()));
		} else {
			sm.setAbbreviation(stateAbbr);
			sm.setName(CountryStateAbbrService.stateAbbToName.get(sm.getAbbreviation()));
		}
		out.setState(sm);
		
		if (firstNameRaw == null) {
			out.setFirstName(metadata.get("first_name"));
		} else {
			out.setFirstName(firstNameRaw);
		}
		if (lastNameRaw == null) {
			out.setLastName(metadata.get("last_name"));
		} else {
			out.setLastName(lastNameRaw);
		}
		
		return out;
	}
	
	public LoggedInUserModel getLoggedInUser(final String username, final String password) throws MOFSQL500Exception, UnauthorizedException {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select * from wp_users wu, " + 
					 											 "wp_usermeta wm " +
					 											 "where " + 
					 											 "wm.user_id = wu.id " +
					 											 "and wu.user_login = ?");) {
			pstm.setString(1, username);
			try (ResultSet rs = pstm.executeQuery();) {				
				if (rs.next()) {
					final String realPass = rs.getString("user_pass");	
					final PHPass phpass = Wordpress.getPHPass();
					if (phpass.CheckPassword(password, realPass)) {
						Map<String, String> metadata = new HashMap<>();
						
						LoggedInUserModel out = buildUser(rs, metadata);
						
						final String userLevel    = metadata.get(META_KEY_USERLEVEL);						
						final String userCaps     = metadata.get(META_KEY_CAPABILITIES);						
						final boolean isAdmin     = isAdmin(userLevel, userCaps);
						final boolean isModerator = isModerator(userLevel, userCaps);
						
						OAuthService os = new OAuthService();
						final  Set<Integer> member = new GroupsService().findAllUserGroups(out.getId());
										
						OAuthModel oauth = new OAuthModel.OAuthModelBuilder()
								.withAdmin(isAdmin)
								.withModerator(isModerator)
								.withDisplayName(out.getDisplayName())
								.withGroupsMembership(member)
								.withUserId(out.getId())
								.withUsername(out.getUsername())
								.build();
						os.save(oauth);
						out.setOauth(oauth);
						
						return out;
					}
				}
				throw new UnauthorizedException();
			}
		} catch (UnauthorizedException e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at AuthenticationService@getLoggedInUser: " + e.getMessage(), e);
		}
	}
	
	public GenericResponseModel forgotPassword(final EmailModel email) throws MOFSQL500Exception, NotFound404Exception {		
		try (final Connection con = DBManagerService.getConnection();) {
			final String username;
			try (final PreparedStatement pstm = con.prepareStatement("SELECT user_login FROM wp_users WHERE user_email = ?");) {
				pstm.setString(1, email.getEmail());				
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						username = rs.getString("user_login");
					} else {
						throw new NotFound404Exception("User with specified email was not found");
					}
				}
			}			
			final String key = Wordpress.wpGeneratePassword(20, false);
			final PHPass phpass = Wordpress.getPHPass();
			final String activationKey = System.currentTimeMillis() / 1000L + ":" + phpass.HashPassword(key);
			try (final PreparedStatement pstm = con.prepareStatement("UPDATE wp_users set user_activation_key = ? where user_email = ?");) {
				pstm.setString(1, activationKey);
				pstm.setString(2, email.getEmail());
				pstm.executeUpdate();
				new MailProxyService().sendForgotPasswordEmail(email.getEmail(), Wordpress.getWebsiteUrl(), username, key);
				return new GenericResponseModel(HttpStatus.OK_200, key);
			}
		} catch (final NotFound404Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at AuthenticationService@forgotPassword: " + e.getMessage(), e);
		}
	}
	
	public GenericResponseModel resetPassword(ResetPasswordModel reset) throws MOFSQL500Exception, ValidationException, UnauthorizedException {		
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("UPDATE wp_users set user_pass = ?, user_activation_key = '' WHERE user_activation_key = ?");) {
			final PHPass phpass = Wordpress.getPHPass();
			pstm.setString(1, phpass.HashPassword(reset.getPassword()));
			pstm.setString(2, reset.getResetKey());
			final int res = pstm.executeUpdate();
			if (res == 0) {
				throw new UnauthorizedException();
			}
			return new GenericResponseModel(HttpStatus.OK_200, reset.getResetKey());
		} catch (UnauthorizedException e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at AuthenticationService@resetPassword: " + e.getMessage(), e);
		}
	}
	
}













