package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.missoandfriends.jsonapi.exceptions.Forbidden403Exception;
import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.FollowingModel;
import com.missoandfriends.jsonapi.models.FollowingsModel;
import com.missoandfriends.jsonapi.models.enums.FollowingTypeEnum;
import com.missoandfriends.jsonapi.models.payloads.FollowingsPayloadModel;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

public class FollowersService {
	
	private static final Logger LOG = LogManager.getLogger(FollowersService.class);
	
	public static final String META_KEY_CONVO_FOLLOWER      = "wp__bbp_subscriptions"; 	//it is array for user: 111, 222, 333...
	public static final String META_KEY_POST_VOICES_COUNTER = "_bbp_voice_count"; 		//it is number of followers for post, 101 for example
	public static final String META_KEY_GROUP_MEMBERS 		= "total_member_count";
	
	/**
	 * accept friendship and set notification as read
	 * @param friendshipId
	 * @param userId (from oauth)
	 * @throws MOFSQL500Exception
	 * @throws NotFound404Exception no such friendship link
	 * @throws Forbidden403Exception if wants to accept request that does not belong to him/her
	 */
	public void acceptFriendship(final String friendshipId, final String userId) throws MOFSQL500Exception, NotFound404Exception, Forbidden403Exception {
		String other;
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("select friend_user_id, initiator_user_id from wp_bp_friends where id = ?");) {
				pstm.setString(1, friendshipId);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String friendUserId = rs.getString("friend_user_id");
						if (!friendUserId.equals(userId)) {
							throw new Forbidden403Exception();
						}
						other = rs.getString("initiator_user_id");
					} else {
						throw new NotFound404Exception("Friendship link with specified id was not found");
					}
				}
			}
			int res;
			try (final PreparedStatement pstm = con.prepareStatement("update wp_bp_friends set is_confirmed = 1 where id = ?");) {
				pstm.setString(1, friendshipId);
				res = pstm.executeUpdate();
			}
			if (res == 1) {
				new ActivityService().friendshipAcceptedActivity(userId, other, friendshipId);
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at FollowersService@acceptFriendship error " + e.getMessage(), e);
		} catch (final NotFound404Exception | Forbidden403Exception e) {
			throw e;
		}
	}
	
	public List<FollowingModel> getFriendsFollowers (final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
				 final PreparedStatement pstm = con.prepareStatement(
						 "select id, friend_user_id as following " +
						 "from wp_bp_friends f " +
						 "where f.initiator_user_id = ? " +
						 "and is_confirmed = 1 " +
						 "union " +
						 "select id, initiator_user_id as following " +
						 "from wp_bp_friends f " +
						 "where friend_user_id = ? " +
						 "and is_confirmed = 1");) {
				pstm.setString(1, userId);				
				pstm.setString(2, userId);								
				try (final ResultSet rs = pstm.executeQuery();) {
					final List<FollowingModel> followersList = new ArrayList<>();
					while (rs.next()) {						
						final String friend    = rs.getString("following"); 
						final String id	       = rs.getString("id"); 
						
						FollowingModel followerModel = new FollowingModel();
						followerModel.setFollowingId(friend);
						followerModel.setFollowerId(userId);
						followerModel.setFollowingType(FollowingTypeEnum.USER);
						followerModel.setId(id);
						followersList.add(followerModel);						
					}
					return followersList;
				}
			} catch (Exception e) {
				throw new MOFSQL500Exception("at FollowersService@getFriendsFollowers: " + e.getMessage(), e);
			}
	}
	
	public String[] getFollowedConvosArray(final Connection con, final String id) throws SQLException {
		try (final PreparedStatement pstm = con.prepareStatement(
						 "select meta_value " + 
						 "from wp_usermeta " +
						 "where user_id = ? "+
						 "and meta_key = ?");) {
			pstm.setString(1, id);				
			pstm.setString(2, META_KEY_CONVO_FOLLOWER);				
			try (final ResultSet rs = pstm.executeQuery();) {
				String[] ids;
				if (rs.next()) {						
					final String convos = rs.getString("meta_value");
					ids = convos.split(",");
				} else {
					ids = new String[]{};
				}
				return ids;
			}
		}
	}
	
	public String getFollowedConvosUnserialized(final Connection con, final String id) throws SQLException {
		try (final PreparedStatement pstm = con.prepareStatement(
				"select meta_value " + 
				"from wp_usermeta " +
				"where user_id = ? "+
				"and meta_key = ?");) {
			pstm.setString(1, id);				
			pstm.setString(2, META_KEY_CONVO_FOLLOWER);				
			try (final ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {						
					return rs.getString("meta_value");					
				} else {
					return "";
				}
			}
		}
	}
	
	public List<FollowingModel> getConvosFollowers (final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {			
			final List<FollowingModel> followersList = new ArrayList<>();
			final String[] ids = getFollowedConvosArray(con, userId);
			int i = 0;			
			for (String id: ids) {
				FollowingModel followerModel = new FollowingModel();
				followerModel.setFollowerId(userId);
				followerModel.setFollowingId(id);
				followerModel.setFollowingType(FollowingTypeEnum.CONVO);
				followerModel.setId(String.valueOf(i++));
				followersList.add(followerModel);
			}
			return followersList;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at FollowersService@getConvosFollowers: " + e.getMessage(), e);
		}
	}
	
	public List<FollowingModel> getGroupFollowers (final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select id, group_id " +
					 "from wp_bp_groups_members gm " +
					 "where gm.user_id = ? " +
					 "and is_confirmed = 1");) {
			pstm.setString(1, userId);
			final List<FollowingModel> followersList = new ArrayList<>();
			try (final ResultSet rs = pstm.executeQuery();) {
				while (rs.next()) {
					FollowingModel followerModel = new FollowingModel();
					followerModel.setFollowerId(userId);
					followerModel.setFollowingId(rs.getString("group_id"));
					followerModel.setFollowingType(FollowingTypeEnum.GROUP);
					followerModel.setId(rs.getString("id"));
					followersList.add(followerModel);
				}
				return followersList;
			}			
		} catch (Exception e) {
			throw new MOFSQL500Exception("at FollowersService@getGroupFollowers: " + e.getMessage(), e);
		}
	}
	
	public FollowingsModel getFollowers (final String type, final String followerId) throws MOFSQL500Exception, ValidationException {
		final FollowingTypeEnum ftype = FollowingTypeEnum.fromString(type);
		return getFollowers(ftype, followerId);
	}
	
	//TODO separate method to speed up ANY: combine three requests to one
	public FollowingsModel getFollowers (final FollowingTypeEnum type, final String followerId) throws MOFSQL500Exception {
		List<FollowingModel> out = new ArrayList<>();
		switch (type) {
		case GROUP:
			out = getGroupFollowers(followerId);
			break;
		case CONVO:
			out = getConvosFollowers(followerId);
			break;
		case USER:
			out = getFriendsFollowers(followerId);
			break;
		case ANY:
			out.addAll(getGroupFollowers(followerId));
			out.addAll(getConvosFollowers(followerId));
			out.addAll(getFriendsFollowers(followerId));
			break;
		}
		FollowingsModel fs = new FollowingsModel();
		fs.setFollowings(out);
		return fs;
	}
	
	public void followConvo(final FollowingsPayloadModel payload) throws MOFSQL500Exception, ValidationException, NotFound404Exception, GeneralServer500Exception {
		followConvo(payload, true);
	}
	/**
	 * 1. Check if convo exists
	 * 2. Get array of ids
	 * 3. Add new and persist
	 * @param payload
	 * @param warnOnValidation if true, then throw ValidationException when user already follow the convo
	 * @throws MOFSQL500Exception
	 * @throws ValidationException
	 * @throws NotFound404Exception
	 * @throws GeneralServer500Exception
	 */
	public void followConvo(final FollowingsPayloadModel payload, final boolean warnOnValidation) throws MOFSQL500Exception, ValidationException, NotFound404Exception, GeneralServer500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("select id, post_author from wp_posts where id = ?");) {
				pstm.setString(1, payload.getFollowingId());
				try (final ResultSet rs = pstm.executeQuery();) {
					if (!rs.next()) {
						throw new NotFound404Exception("convo with specified id was not found");
					}
					final String postAuthor = rs.getString("post_author");
					if (postAuthor.equals(payload.getFollowerId())) {
						if (warnOnValidation) {
							throw new ValidationException("you can not follow your own convo");
						} else {
							return;
						}
					}
				}
			}
			final String[] rawIds = getFollowedConvosArray(con, payload.getFollowerId());
			final List<String> ids = new ArrayList<>(Arrays.asList(rawIds));
			for (final String id: ids) {
				if (id.equals(payload.getFollowingId())) {
					if (warnOnValidation) {
						throw new ValidationException("the user had been followed the convo already");
					} else {
						return;
					}
				}
			}
			ids.add(payload.getFollowingId());
			int res;
			try (final PreparedStatement pstm = con.prepareStatement(
					"UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? and meta_key = ?"); ) {
				int i = 1;
				final String values = ids.stream().collect(Collectors.joining(","));
				
				pstm.setString(i++, values);
				pstm.setString(i++, payload.getFollowerId());
				pstm.setString(i++, META_KEY_CONVO_FOLLOWER);				
				res = pstm.executeUpdate();				
				changeConvoFollowersMetadata(payload.getFollowingId(), true);
			}
			//If such key does not exist
			if (res == 0) {
				addConvoFollowingMetadataIfNotExists(con, payload.getFollowerId(), payload.getFollowingId());
			}
		} catch (final ValidationException | NotFound404Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at FollowersService@followConvo: " + e.getMessage(), e);
		}
	}
	
	public void addConvoFollowingMetadataIfNotExists(final Connection con, final String followerId, final String followingId) throws SQLException {
		try (final PreparedStatement pstm = con.prepareStatement("INSERT INTO wp_usermeta (user_id, meta_key, meta_value, misso_age) values (?,?,?,0)"); ) {
			pstm.setString(1, followerId);
			pstm.setString(2, META_KEY_CONVO_FOLLOWER);
			pstm.setString(3, followingId);
			pstm.executeUpdate();
		}
	}
	
	//For testing issues! complement for addConvoFollowingMetadataIfNotExists
	public void delConvoFollowingMetadata(final String userId) {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("DELETE FROM wp_usermeta where user_id = ? and meta_key = ?");) {
			pstm.setString(1, userId);
			pstm.setString(2, META_KEY_CONVO_FOLLOWER);
			pstm.executeUpdate();
		} catch (Exception e) {
			
		}
	}
	
	public void changeConvoFollowersMetadata (final String convoId, final boolean toIncrease) {
		final String op = toIncrease ? "+" : "-";
		try (final Connection con = DBManagerService.getConnection(); ) {
			int processed;
			try (final PreparedStatement pstm = con.prepareStatement("UPDATE wp_postmeta SET meta_value = meta_value " + op + " 1 where post_id = ? and meta_key = ?");) {
				pstm.setString(1, convoId);
				pstm.setString(2, META_KEY_POST_VOICES_COUNTER);
				processed = pstm.executeUpdate();				
			}
			//If zero followers and want to follow, then create new counter
			if (0 == processed && toIncrease) {
				try (final PreparedStatement pstm = con.prepareStatement("INSERT into wp_postmeta (post_id, meta_key, meta_value) values (?,?,?)");) {
					pstm.setString(1, convoId);
					pstm.setString(2, META_KEY_POST_VOICES_COUNTER);
					pstm.setInt(3, 1);
					pstm.executeUpdate();
				}
			}
		} catch (final SQLException e) {
			LOG.error("at FollowersService@changeConvoFollowersMetadata: can not increase or decrease voice counter ", e);
		}
	}
	
	public void changeGroupFollowersMetadata (final String groupId, final boolean toIncrease) {
		final String op = toIncrease ? "+" : "-";
		try (final Connection con = DBManagerService.getConnection();) {
			int processed;
			try (final PreparedStatement pstm = con.prepareStatement("UPDATE wp_bp_groups_groupmeta SET meta_value = meta_value " + op + " 1 where group_id = ? and meta_key = ?");) {
				pstm.setString(1, groupId);
				pstm.setString(2, META_KEY_GROUP_MEMBERS);
				processed = pstm.executeUpdate();
			}
			if (0 == processed && toIncrease) {
				try (final PreparedStatement pstm = con.prepareStatement("INSERT into wp_bp_groups_groupmeta (group_id, meta_key, meta_value) values (?,?,?)");) {
					pstm.setString(1, groupId);
					pstm.setString(2, META_KEY_POST_VOICES_COUNTER);
					pstm.setInt(3, 1);
					pstm.executeUpdate();
				}
			}
		} catch (final SQLException e) {
			LOG.error("at FollowersService@changeConvoFollowersMetadata: can not increase or decrease voice counter ");
		}
	}
	
	/**
	 * 1. Check if group membership exists
	 * 2. Check that group exists
	 * 3. Create membership
	 * @param payload
	 * @throws MOFSQL500Exception if unpredicted SQL error occurred
	 * @throws ValidationException if request had been sent
	 * @throws NotFound404Exception if group does not exist (user existence checked in controller with oauth)
	 * @throws GeneralServer500Exception who knows?
	 */
	public void followGroup(final FollowingsPayloadModel payload) throws MOFSQL500Exception, ValidationException, NotFound404Exception, GeneralServer500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement(
						 "select id, group_id, is_confirmed, is_banned " +
						 "from wp_bp_groups_members gm " +
						 "where gm.user_id = ? and group_id = ?");) {
				pstm.setString(1, payload.getFollowerId());
				pstm.setString(2, payload.getFollowingId());					
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final boolean isBanned    = rs.getInt("is_banned") == 1;
						final boolean isConfirmed = rs.getInt("is_confirmed") == 1;
						final StringBuilder status = new StringBuilder("user is already a follower of specified group.");
						if (isBanned) {
							status.append(" The user was banned.");
						}
						if (isConfirmed) {
							status.append(" The user was confirmed.");
						} else {
							status.append(" The user is not confirmed yet.");
						}
						throw new ValidationException(status.toString());
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement("select count(*) as cnt from wp_bp_groups where id = ?")) {
				pstm.setString(1, payload.getFollowingId());
				try (final ResultSet rs = pstm.executeQuery();) {
					rs.next();
					final int count = rs.getInt("cnt");
					if (count == 0) {
						throw new NotFound404Exception("group with specified id was not found");
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement(
					 "insert into wp_bp_groups_members " + 
					 "(group_id, user_id, inviter_id, is_admin, is_mod, " + 
					 "user_title, date_modified, comments, is_confirmed, is_banned, " + 
					 "invite_sent) values (?,?,?,?,?,?,?,?,?,?,?)");) {
				int i = 1;
				pstm.setString(i++, payload.getFollowingId());
				pstm.setString(i++, payload.getFollowerId());
				pstm.setString(i++, "0");
				pstm.setString(i++, "0");
				pstm.setString(i++, "0");
				
				pstm.setString(i++, "");
				pstm.setDate(i++, new java.sql.Date(0L));
				pstm.setString(i++, "");
				pstm.setString(i++, "1"); //is confirmed true
				pstm.setString(i++, "0");
				
				pstm.setString(i++, "0");
				
				pstm.executeUpdate();
			}
			changeGroupFollowersMetadata(payload.getFollowingId(), true);
			new ActivityService().joinGroupActivity(payload.getFollowerId(), payload.getFollowingId());
		} catch (final ValidationException | NotFound404Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at FollowersService@followGroup: " + e.getMessage(), e);
		}
	}
	
	/**
	 * 1. Check if user exists (the one whom to follow)
	 * 2. Check if request was sent
	 * 3. Create unconfirmed friendship
	 * @param payload
	 * @throws MOFSQL500Exception
	 * @throws ValidationException
	 * @throws NotFound404Exception
	 * @throws GeneralServer500Exception
	 */
	public void followFriend(final FollowingsPayloadModel payload) throws MOFSQL500Exception, ValidationException, NotFound404Exception, GeneralServer500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement(
					 "select count(*) as cnt from wp_users where id = ?");) {
				pstm.setString(1, payload.getFollowingId());
				try (final ResultSet rs = pstm.executeQuery();) {
					if (!rs.next()) {
						throw new NotFound404Exception("user with specified id was not found");
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement(
					"select initiator_user_id, is_confirmed " + 
					"from wp_bp_friends f " +
					"where (f.initiator_user_id = ? and friend_user_id = ?) or (f.initiator_user_id = ? and friend_user_id = ?)")) {
				pstm.setString(1, payload.getFollowingId());
				pstm.setString(2, payload.getFollowerId());
				pstm.setString(3, payload.getFollowerId());
				pstm.setString(4, payload.getFollowingId());
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final boolean isConfirmed = rs.getInt("is_confirmed") == 1;
						final StringBuilder sb = new StringBuilder("the user has is already a follower of specified user.");
						final String initiator = rs.getString("initiator_user_id");						
						if (initiator.equals(payload.getFollowerId())) {
							sb.append(" Request was initiated by the user.");
						} else {
							sb.append(" Request was initiated by counter-party.");
						}
						if (isConfirmed) {
							sb.append(" Request was confirmed.");
						} else {
							sb.append(" Request is pending.");
						}
						throw new ValidationException(sb.toString());
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement(
					"insert into wp_bp_friends " + 
					"(initiator_user_id, friend_user_id, is_confirmed, is_limited, date_created) values" + 
					"(?,?,?,?, UTC_TIMESTAMP())", Statement.RETURN_GENERATED_KEYS);) {
				pstm.setString(1, payload.getFollowerId());
				pstm.setString(2, payload.getFollowingId());
				pstm.setString(3, "0");
				pstm.setString(4, "0");
				pstm.executeUpdate();
				
				try (final ResultSet generatedKeys = pstm.getGeneratedKeys();) {
					if (generatedKeys.next()) {
						final String friendshipId = String.valueOf(generatedKeys.getLong(1));
						new NotificationService().notifyAboutFollowFriendRequest(payload.getFollowerId(), payload.getFollowingId(), friendshipId);
					}
				}
				
				final String[] emailLoginLogin = new UserService().getPairUsername(payload.getFollowingId(), payload.getFollowerId());
				new MailProxyService().friendRequestNotification(emailLoginLogin[0], emailLoginLogin[1], emailLoginLogin[2]);
			}
		} catch (final ValidationException | NotFound404Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at FollowersService@followFriend: " + e.getMessage(), e);
		}
	}
	
	public void createFollowing(final FollowingsPayloadModel payload) throws MOFSQL500Exception, ValidationException, NotFound404Exception, GeneralServer500Exception {
		final FollowingTypeEnum type = payload.getFollowingTypeEnum();
		switch (type) {
		case GROUP:
			followGroup(payload);
			break;
		case USER:
			followFriend(payload);
			break;
		case CONVO:
			followConvo(payload);
			break;
		default: //IMPOSSIBURU if called from controller!
			throw new ValidationException("unspecified following_type");
		}
	}
	
	public void deleteFollowingConvo (final String userId, final String followingId) throws NotFound404Exception, MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {			
			final String[] rawIds = getFollowedConvosArray(con, userId);
			final List<String> ids = new ArrayList<>(Arrays.asList(rawIds));
			
			try (final PreparedStatement pstm = con.prepareStatement(
					"UPDATE wp_usermeta SET meta_value = ? WHERE user_id = ? and meta_key = ?"); ) {
				int i = 1;
				final String values = ids.stream().filter(x -> !x.equals(followingId)).collect(Collectors.joining(","));
				
				pstm.setString(i++, values);
				pstm.setString(i++, userId);
				pstm.setString(i++, META_KEY_CONVO_FOLLOWER);
				//TODO check result and insert if nothing updated! Severity HIGH
				int res = pstm.executeUpdate();
				if (res == 0) {
					throw new NotFound404Exception("conversation following was not found");
				}
				changeConvoFollowersMetadata(followingId, false);
			}
		} catch (final NotFound404Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at FollowersService@followConvo: " + e.getMessage(), e);
		}
	}
	
	public void deleteFollowingGroup (final String userId, final String followingId) throws NotFound404Exception, MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "delete from wp_bp_groups_members where user_id = ? and group_id = ?");) {
			pstm.setString(1, userId);
			pstm.setString(2, followingId);
			final int res = pstm.executeUpdate();
			if (res == 0) {
				throw new NotFound404Exception("");
			}
			changeGroupFollowersMetadata(followingId, false);
		} catch (NotFound404Exception e) {
			throw e;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at FollowersService@followFriend: " + e.getMessage(), e);
		}
	}
	
	public void deleteFollowingFriend(final String userId, final String followingId) throws NotFound404Exception, MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
						 "delete from wp_bp_friends where (initiator_user_id = ? and friend_user_id = ?) or (initiator_user_id = ? and friend_user_id = ?)");) {
				pstm.setString(1, userId);
				pstm.setString(2, followingId);
				pstm.setString(3, followingId);
				pstm.setString(4, userId);
				final int res = pstm.executeUpdate();
				if (res == 0) {
					throw new NotFound404Exception("");
				}
			} catch (NotFound404Exception e) {
				throw e;
			} catch (final SQLException e) {
				throw new MOFSQL500Exception("at FollowersService@followFriend: " + e.getMessage(), e);
			}
	}
	
	public void deleteFollowing(final String userId, final String followingId, final FollowingTypeEnum type) throws NotFound404Exception, MOFSQL500Exception {
		switch (type) {
		case GROUP:
			deleteFollowingGroup(userId, followingId);
			break;
		case USER:
			deleteFollowingFriend(userId, followingId);
			break;
		case CONVO:
			deleteFollowingConvo(userId, followingId);
			break;
		default:
			break;
		}
	}
	
}
















