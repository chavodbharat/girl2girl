package com.missoandfriends.jsonapi.services;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;

import com.missoandfriends.jsonapi.exceptions.Conflict409Exception;
import com.missoandfriends.jsonapi.exceptions.Forbidden403Exception;
import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.models.CreateUserModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModelFollowings;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.SubmissionPayloadModel;
import com.missoandfriends.jsonapi.models.SubmitFormModel;
import com.missoandfriends.jsonapi.models.payloads.ChangePasswordPayloadModel;
import com.missoandfriends.jsonapi.php.PHPass;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

import de.ailis.pherialize.MixedArray;
import de.ailis.pherialize.Pherialize;

public class UserService {
	
	public void deleteUserAvatarChoice(final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("delete FROM wp_usermeta WHERE meta_key = 'user_avatar_choice' and user_id = ?");) {
			pstm.setString(1, userId);
			pstm.executeUpdate();
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" as UserService@emailExists error " + e.getMessage(), e);
		}
	}
	
	public boolean emailExists(final String email) throws MOFSQL500Exception {
		if (StringUtils.isBlank(email)) {
			return false;
		}
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select * from wp_users where user_email = ?");) {
			pstm.setString(1, email);
			try (final ResultSet rs = pstm.executeQuery();) {
				return rs.next();
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" as UserService@emailExists error " + e.getMessage(), e);
		}
	}
	
	public boolean usernameExists(final String username) throws MOFSQL500Exception {
		if (StringUtils.isBlank(username)) {
			return false;
		}
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select * from wp_users where user_login = ?");) {
			pstm.setString(1, username);			
			try (final ResultSet rs = pstm.executeQuery();) {
				return rs.next();
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" as UserService@usernameExists error " + e.getMessage(), e);
		}
	}

	public boolean updateLatesActivityMetadata(final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("update wp_usermeta set meta_value = utc_timestamp() where meta_key = 'last_activity' and user_id = ?");) {
			pstm.setString(1, userId);			
			return pstm.executeUpdate() > 0;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@updateLatesActivityMetadata: " + e.getMessage(), e);
		}
	}
	
	public boolean updateLatesUpdateMetadata(final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("update wp_usermeta set meta_value = unix_timestamp() where meta_key = 'last_update' and user_id = ?");) {
			pstm.setString(1, userId);			
			return pstm.executeUpdate() > 0;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@updateLatesActivityMetadata: " + e.getMessage(), e);
		}
	}
	
	public boolean updateFirstNameMetadata(final String userId, final String firstName) throws MOFSQL500Exception {
		return updateMetadata(userId, "first_name", firstName);
	}
	
	public boolean updateLastNameMetadata(final String userId, final String lastName) throws MOFSQL500Exception {
		return updateMetadata(userId, "last_name", lastName);
	}
	
	/**
	 * 
	 * @param userId
	 * @param country Full country name
	 * @return
	 * @throws MOFSQL500Exception
	 */
	public boolean updateCountryMetadata(final String userId, final String country) throws MOFSQL500Exception {
		return updateMetadata(userId, "country", country);
	}
	
	/**
	 * 
	 * @param userId
	 * @param state 2 letter state abbreviation uppercase
	 * @return
	 * @throws MOFSQL500Exception
	 */
	public boolean updateStateMetadata(final String userId, final String state) throws MOFSQL500Exception {
		return updateMetadata(userId, "state", state.toUpperCase());
	}
	
	public boolean updateMetadata(final String userId, final String key, String value) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
				final PreparedStatement pstm = con.prepareStatement("update wp_usermeta set meta_value = ? where meta_key = ? and user_id = ?");) {
			pstm.setString(1, value);
			pstm.setString(2, key);
			pstm.setString(3, userId);			
			return pstm.executeUpdate() > 0;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@updateMetadata: " + e.getMessage(), e);
		}
	}
	
	public void updateUserMetadata(final LoggedInUserModel data) throws MOFSQL500Exception  {
		if (data.getCountry() != null) {
			updateCountryMetadata(data.getId(), data.getCountry().getName());
		}
		if (data.getState() != null) {
			updateStateMetadata(data.getId(), data.getState().getAbbreviation());
		}
		if (data.getFirstName() != null) {
			updateFirstNameMetadata(data.getId(), data.getFirstName());
		}
		if (data.getLastName() != null) {
			updateLastNameMetadata(data.getId(), data.getLastName());
		}
	}
	/**
	 * Build update wp_user table statement
	 * @param data Object to map
	 * @param sb In this buffer the update string would be stored
	 * @param params This list will contain all parameters to be set
	 * @return true if something changed.
	 */
	public boolean buildUserUpdate (final LoggedInUserModel data, final StringBuilder sb, final List<String> params) {
		sb.append("UPDATE wp_users SET ");
		if (data.getBirthday() != null) {
			sb.append("birth_date=?,");
			params.add(data.getBirthdayStringCompact());
		}
		if (data.getCountry() != null) {
			final String name = data.getCountry().getName();
			sb.append("country=?,");
			params.add(name);
		}
		if (data.getState() != null) {
			final String abbr = data.getState().getAbbreviation();
			sb.append("state=?,");
			params.add(abbr);
		}
		if (data.getFirstName() != null) {
			sb.append("first_name=?,");
			params.add(data.getFirstName());
		}
		if (data.getLastName() != null) {
			sb.append("last_name=?,");
			params.add(data.getLastName());
		}
		if (data.getEmail() != null) {
			sb.append("user_email=?,");
			params.add(data.getEmail());
		}
		sb.deleteCharAt(sb.length() - 1);
		
		if (params.isEmpty()) {
			return false;
		}
		
		sb.append(" WHERE id = ?");
		params.add(data.getId());
		return true;
	}
	
	public boolean buildUserMetaInsert (final CreateUserModel data, final String userId, final StringBuilder sb, final List<String> params) {
		sb.append("insert into wp_usermeta (user_id, meta_key, meta_value, misso_age) values ");		
		if (data.getCountry() != null) {
			sb.append("(?,?,?,0),");
			params.add(userId);
			params.add("country");
			params.add(data.getCountry().getName());
		}
		if (data.getState() != null) {
			sb.append("(?,?,?,0),");
			params.add(userId);
			params.add("state");
			params.add(data.getState().getAbbreviation());
		}
		if (data.getFirstName() != null) {			
			sb.append("(?,?,?,0),");
			params.add(userId);
			params.add("first_name");
			params.add(data.getFirstName());
		}
		if (data.getLastName() != null) {
			sb.append("(?,?,?,0),");
			params.add(userId);
			params.add("last_name");
			params.add(data.getLastName());
		}
		
		sb.append("(?,?,unix_timestamp(),0),");
		params.add(userId);
		params.add("last_update");
		
		sb.append("(?,?,utc_timestamp(),0)");
		params.add(userId);
		params.add("last_activity");
		
		if (params.isEmpty()) {
			return false;
		}
		return true;
	}
	
	public void changeUser(final LoggedInUserModel data) throws MOFSQL500Exception {
		final StringBuilder sb = new StringBuilder();
		final List<String> params = new ArrayList<>();
		
		if (!buildUserUpdate(data, sb, params)) {
			return;
		}
	
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement(sb.toString());) {
				int i = 1;				
				for (final String param: params) {
					pstm.setString(i++, param);
				}
				pstm.executeUpdate();
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@changeUser: " + e.getMessage(), e);
		}
		updateUserMetadata(data);
		updateLatesUpdateMetadata(data.getId());
	}
	
	public String hashPass(final String source) throws IOException {		
		Process p = Runtime.getRuntime().exec("/usr/local/bin/php translator.php " + source);
		try (BufferedReader stdInput = new BufferedReader(new 
                InputStreamReader(p.getInputStream()));) {
			return stdInput.readLine();
		}
	}
	
	public String hashPass2(final String source) throws IOException {		
		Process p = Runtime.getRuntime().exec("/usr/local/bin/php translator2.php " + source);
		try (BufferedReader stdInput = new BufferedReader(new 
				InputStreamReader(p.getInputStream()));) {
			return stdInput.readLine();
		}
	}
	
	public void createUser(final CreateUserModel data) throws MOFSQL500Exception, Conflict409Exception, GeneralServer500Exception {
	
		try {
			final String out = submitForm(data);
			System.out.println(out);
		} catch (Exception e) {
			System.out.println(e.getMessage());
			throw new MOFSQL500Exception("at UserService@changeUser: " + e.getMessage(), e);
		}
		
		if (1 == 1) {
			return;
		}
	
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("select count(*) as cnt from wp_users where user_login = ?");) {
				pstm.setString(1, data.getUsername());				
				try (final ResultSet rs = pstm.executeQuery();) {
					rs.next();
					if (rs.getInt("cnt") > 0) {
						throw new Conflict409Exception("user with specified username already exists");
					}
				}
			}
			//String insertedId = "";
			final String activationKey = Wordpress.wpGeneratePassword(16, false);
			/*
			try (final PreparedStatement pstm = con.prepareStatement(
					"insert into wp_users " + 
					"(birth_date, country, user_email, first_name, last_name, " +
					 "user_pass, state, user_login, create_date, passwordhint, above_13_user, misso_user_points, misso_user_tokens, accept_friends, inactive, password, user_status) values (?,?,?,?,?,?,?,?, utc_timestamp(), '', ?, 0, '', 1, 0, '', ?)", Statement.RETURN_GENERATED_KEYS);) {
				int i = 1;
				pstm.setDate(i++, TimeService.toSQLDate(data.getBirthDate()));
				pstm.setString(i++, data.getCountry().getName());
				
				pstm.setString(i++, data.getEmail());
				pstm.setString(i++, data.getFirstName());
				pstm.setString(i++, data.getLastName());
				
				final PHPass phpass = Wordpress.getPHPass();
				pstm.setString(i++, phpass.HashPassword(data.getPassword()));				
				pstm.setString(i++, data.getState().getAbbreviation());
				pstm.setString(i++, data.getUsername());
				
		        pstm.setInt(i++, data.isUnder13() ? 1 : 0);
		        pstm.setInt(i++, 2);
				pstm.executeUpdate();
				
				try (ResultSet generatedKeys = pstm.getGeneratedKeys();) {
					if (generatedKeys.next()) {
						insertedId = String.valueOf(generatedKeys.getLong(1));
					}
				}
			} catch (final SQLException e) {				
				throw new MOFSQL500Exception("at UserService@createUser: " + e.getMessage(), e);
			}
			try (final PreparedStatement pstm = con.prepareStatement("insert into wp_usermeta (user_id, meta_key, meta_value, misso_age) values (?, 'user_avatar_choice', ?, 0)");) {
				pstm.setString(1, insertedId);
				pstm.setString(2, data.getPhotoUrl());
				pstm.executeUpdate();
			}
			*/
			
			/*
			final StringBuilder sb = new StringBuilder();
			final List<String> params = new ArrayList<>();
			
			buildUserMetaInsert(data, insertedId, sb, params);
			try (final PreparedStatement pstm = con.prepareStatement(sb.toString());) {
				int i = 1;				
				for (final String param: params) {
					pstm.setString(i++, param);
				}
				pstm.executeUpdate();
			}
			*/			
			
			String leadId = "";
			try (final PreparedStatement pstm = con.prepareStatement(
					"INSERT INTO wp_rg_lead(form_id, ip, source_url, date_created, user_agent, currency, created_by) " + 
					"VALUES(3, ?, 'https://gcloud.missoandfriends.com/join-now/', utc_timestamp(), ?, 'USD', NULL)", Statement.RETURN_GENERATED_KEYS);) {
				//1 ip
				//2 client
				pstm.setString(1, "127.0.0.1");
				pstm.setString(2, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:54.0) Gecko/20100101 Firefox/54.0");
				pstm.executeUpdate();
				try (ResultSet generatedKeys = pstm.getGeneratedKeys();) {
					if (generatedKeys.next()) {
						leadId = String.valueOf(generatedKeys.getLong(1));
					}
				}
			}
			
			
			/*
			MixedArray list = new MixedArray();
			list.put("lead_id", leadId);
			list.put("entry_id", leadId);
			list.put("user_login", data.getUsername());
			list.put("email", data.getEmail());			
			list.put("password", this.hashPass(data.getPassword()));
			*/
			
			long entryId = 0;
			try (final PreparedStatement pstm = con.prepareStatement(
					"INSERT INTO wp_gf_entry(form_id, ip, source_url, date_created, user_agent, currency, created_by) VALUES (3, ?, ?, ?, ?, ?, NULL)",
					Statement.RETURN_GENERATED_KEYS);) {
				pstm.setString(1, "127.0.0.1");
				pstm.setString(2, "https://missoandfriends.com/join-now/");
				pstm.setString(3, TimeService.getMysqlTimestampFormat().format(new Date()));
				pstm.setString(4, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:60.0) Gecko/20100101 Firefox/60.0");
				pstm.setString(5, "USD");
				pstm.executeUpdate();
				try (ResultSet generatedKeys = pstm.getGeneratedKeys();) {
					if (generatedKeys.next()) {
						entryId = generatedKeys.getLong(1);
					}
				}
			}
			if (entryId != 0) {
				try (final PreparedStatement pstm = con.prepareStatement(
						"INSERT INTO `wp_signups` (`domain`, `path`, `title`, `user_login`, `user_email`, `registered`, `activation_key`, `meta`) VALUES " + 
						"('', '', '', ?, ?, ?, ?, ?)");) {
					pstm.setString(1, data.getUsername());
					pstm.setString(2, data.getEmail());
					pstm.setString(3, TimeService.getMysqlTimestampFormat().format(new Date()));
					pstm.setString(4, activationKey);
					final Map<Object, Object> mar = new HashMap<Object, Object>();
					mar.put("lead_id",    String.valueOf(entryId));
					mar.put("entry_id",   String.valueOf(entryId));
					mar.put("user_login", data.getUsername());
					mar.put("email",      data.getEmail());
					mar.put("password",   this.hashPass(data.getPassword()));
					final String arr = Pherialize.serialize(mar);
					pstm.setString(5, arr);
					pstm.executeUpdate();
				} catch (final SQLException e) {
					throw new MOFSQL500Exception("at UserService@createUser.wp_signups: " + e.getMessage(), e);
				}
				
				try (final PreparedStatement pstm = con.prepareStatement("INSERT INTO `wp_gf_entry_meta` (`form_id`, `entry_id`, `meta_key`, `meta_value`) VALUES (3, ?, 'activation_key', ?)");) {
					pstm.setLong(1, entryId);
					pstm.setString(2, activationKey);
					pstm.executeUpdate();
				} catch (final SQLException e) {
					throw new MOFSQL500Exception("at UserService@createUser.wp_gf_entry_meta: " + e.getMessage(), e);
				}
			}
			
			try (final PreparedStatement pstm = con.prepareStatement(
					"INSERT INTO wp_gf_entry_meta (form_id, entry_id, meta_key, meta_value) " + 
					"values (3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?)");) {
				int i = 1;
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "1");
				pstm.setString(i++, data.getFirstName());
				
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "2");
				pstm.setString(i++, TimeService.getMysqlDateFormat().format(data.getBirthDate()));
				
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "3");
				pstm.setString(i++, "Female");
				
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "4");
				pstm.setString(i++, data.getCountry().getName());
				
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "5");
				//This is apple hack - you can not enter state
				if (data.getState() != null) {
					pstm.setString(i++, data.getState().getName());
				} else {
					pstm.setString(i++, "");
				}
				
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "6");
				pstm.setString(i++, "Teacher / Teacher's Website");
				
				pstm.setLong(i++, entryId);
				pstm.setString(i++, "7");
				pstm.setString(i++, data.getUsername());
				
				/*
				pstm.setString(i++, leadId);
				pstm.setString(i++, "13.000000");
				pstm.setString(i++, data.getPassword());
				*/
				
				pstm.setString(i++, leadId);
				pstm.setString(i++, "12.000000");
				pstm.setString(i++, data.getEmail());
				
				pstm.executeUpdate();
			}
			
			/*
			try (final PreparedStatement pstm = con.prepareStatement("insert into wp_signups (domain, path, title, user_login, user_email, registered, activated, active, activation_key, meta) " + 
					 "values ('', '', '', ?, ?, utc_timestamp(), '0000-00-00 00:00:00', 0, ?, ?)");) {
				pstm.setString(1, data.getUsername());
				pstm.setString(2, data.getEmail());
				pstm.setString(3, activationKey);
				pstm.setString(4, Pherialize.serialize(list));
				pstm.executeUpdate();
			}
			*/
			
			try (final PreparedStatement pstm = con.prepareStatement(
					"INSERT INTO `wp_rg_lead_meta` (`form_id`, `lead_id`, `meta_key`, `meta_value`) VALUES " + 
					"(3, ?, ?, ?),(3, ?, ?, ?),(3, ?, ?, ?)");) {
				int i = 1;
				pstm.setString(i++, leadId);
				pstm.setString(i++, "activation_key");
				pstm.setString(i++, activationKey);
				
				pstm.setString(i++, leadId);
				pstm.setString(i++, "gravityformsuserregistration_is_fulfilled");
				pstm.setString(i++, "1");
				
				MixedArray grv = new MixedArray();
				MixedArray grvo = new MixedArray();
				grvo.put(0, "1");
				grv.put("gravityformsuserregistration", grvo);
				
				pstm.setString(i++, leadId);
				pstm.setString(i++, "processed_feeds");
				pstm.setString(i++, Pherialize.serialize(grv));
				
				pstm.executeUpdate();
			}
			
			final MailProxyService mps = new MailProxyService();
			mps.newUserRegistration(data.getUsername(), data);
			mps.newUserRegistrationActivation(activationKey, data.getEmail(), data.getParentEmail());
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@createUser: " + e.getMessage(), e);
		} catch (final IOException e) {
			throw new GeneralServer500Exception("can not create password", e);
		}
	}
	
	public LoggedInUserModelFollowings getUser(final String id, final OAuthModel oauth) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			LoggedInUserModelFollowings out;
			try (final PreparedStatement pstm = con.prepareStatement(
					 "select * from wp_users wu, wp_usermeta wm " +
					 "where wm.user_id = wu.id and wu.id = ?");) {
				pstm.setString(1, id);
				try (ResultSet rs = pstm.executeQuery();) {				
					if (!rs.next()) {
						throw new NotFound404Exception("user with specified id was not found");
					}
					Map<String, String> metadata = new HashMap<>();
					out = AuthenticationService.buildUser(rs, metadata);			
				}
			}
			if (oauth != null) {
				final String selfId = oauth.getUserId();
				out.setFollowing(this.isFriendFriend(con, selfId, id));
			}
			return out;
		} catch (NotFound404Exception e) {
			throw e;
		} catch (MOFSQL500Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@getUser: " + e.getMessage(), e);
		}
	}
	
	public boolean checkPassTemp (final String a, final String b) {
		final PHPass phpass = Wordpress.getPHPass();
		return phpass.CheckPassword(a, b);
	}
	
	public void changeUserPassword(final ChangePasswordPayloadModel payload, final String userId) throws MOFSQL500Exception, NotFound404Exception, Forbidden403Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			final PHPass phpass = Wordpress.getPHPass();
			try (final PreparedStatement pstm = con.prepareStatement("select * from wp_users where id = ?");) {				
				pstm.setString(1, userId);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String realPass = rs.getString("user_pass");
						if (!phpass.CheckPassword(payload.getOldPassword(), realPass)) {
							throw new Forbidden403Exception();
						}
					} else {
						throw new NotFound404Exception("User with specified id not found");
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement("update wp_users set user_pass = ? where id = ?");) {
				pstm.setString(1, phpass.HashPassword(payload.getNewPassword()));
				pstm.setString(2, userId);
				pstm.executeUpdate();
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@changeUserPassword: " + e.getMessage(), e);
		}
	}
	
	public String getUrl() throws IOException {
		Process p = Runtime.getRuntime().exec("/usr/local/bin/php encode.php");
		try (BufferedReader stdInput = new BufferedReader(
				new InputStreamReader(p.getInputStream()));) {
			return stdInput.readLine();
		}
	}

	public String submitForm (final CreateUserModel data) throws IOException {
		final SubmissionPayloadModel model = new SubmissionPayloadModel();

		model.setCountry(data.getCountry().getName());
		model.setDate(TimeService.getBBPBirthdayFormat().format(data.getBirthDate()));
		model.setEmail(data.getEmail());
		model.setReEmail(data.getEmail());
		model.setName(data.getFirstName());
		model.setPassword(data.getPassword());
		model.setRePassword(data.getPassword());
		model.setState(data.getState().getName());
		model.setUsername(data.getUsername());
		
		if (!StringUtils.isBlank(data.getParentEmail())) {
			model.setParentEmail(data.getParentEmail());
			model.setReParentEmail(data.getParentEmail());
		}
		
		SubmitFormModel out = new SubmitFormModel();
		out.setInputValues(model);

		final String json = GsonFactory.getGson().toJson(out);
		
		CloseableHttpClient client = HttpClients.createDefault();
		final String url = getUrl();		
	    HttpPost httpPost = new HttpPost(url);
	    StringEntity entity = new StringEntity(json, "UTF-8");
	    httpPost.setEntity(entity);
	    System.out.println(json);
	    System.out.println(url);
	    httpPost.setHeader("Accept", "application/json");
	    httpPost.setHeader("Content-Type", "application/json");
	    httpPost.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36");
	    //httpPost.setHeader("Host", "missoandfriends.com");
	    //httpPost.setHeader("Referer", "46.146.206.116");
	    HttpResponse response = client.execute(httpPost);
	    return EntityUtils.toString(response.getEntity(), "UTF-8");
	}

	/**
	 * For testing only!!!
	 */
	public void deleteUser(final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("delete from wp_users where id = ?")) {
				pstm.setString(1, userId);
				System.out.println(pstm);
				pstm.executeUpdate();
			}
			try (final PreparedStatement pstm = con.prepareStatement("delete from wp_usermeta where user_id = ?")) {
				pstm.setString(1, userId);
				System.out.println(pstm);
				pstm.executeUpdate();
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at UserService@deleteUser: " + e.getMessage(), e);
		}
	}
	
	/*
	 * String[3] - user one mail, user one username, user two username
	 */
	public String[] getPairUsername(String one, String two) throws SQLException {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select user_login, user_email from wp_users where id = ? union select user_login, user_email from wp_users where id = ?");) {			
			pstm.setString(1, one);
			pstm.setString(2, two);
			try (final ResultSet rs = pstm.executeQuery();) {
				final String out[] = new String[3];
				rs.next();
				out[0] = rs.getString("user_email");
				out[1] = rs.getString("user_login");
				rs.next();
				out[2] = rs.getString("user_login");
				return out;
			}
		}
	};
	
	public Boolean isFriendFriend(final Connection con, final String one, final String another) throws SQLException {
		if (one.equals(another)) {
			return null;
		}
		try (final PreparedStatement pstm = con.prepareStatement(
					 "select * from wp_bp_friends where " + 
					 "((initiator_user_id = ? and friend_user_id = ?) or (initiator_user_id = ? and friend_user_id = ?)) " +
					 "and is_confirmed = 1")) {
			pstm.setString(1, one);
			pstm.setString(2, another);
			pstm.setString(3, another);
			pstm.setString(4, one);
			try (final ResultSet rs = pstm.executeQuery();) {
				return rs.next();
			}
		}
	}
	
}




















