package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import com.missoandfriends.jsonapi.MOFServer;
import com.missoandfriends.jsonapi.exceptions.Forbidden403Exception;
import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.exceptions.Gone410Exception;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.FriendshipRequestNotificationModel;
import com.missoandfriends.jsonapi.models.FriendshipRequestNotificationsModel;
import com.missoandfriends.jsonapi.models.NotificationModel;
import com.missoandfriends.jsonapi.models.NotificationsModel;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.ShortUserModel;
import com.missoandfriends.jsonapi.models.enums.FriendshipNotificationType;
import com.missoandfriends.jsonapi.models.enums.NotificationTypeEnum;
import com.missoandfriends.jsonapi.models.wp.WPNotificationModel;

public class NotificationService {
	
	private String intervalSQLPartial = "interval 1 hour";
	
	public NotificationService() {
		intervalSQLPartial = MOFServer.getInterval();
	}
	
	public static enum FriendshipAction {
		ACCEPT,
		DECLINE
	}
	
	public static final String NOTIFICATION_COMPONENT_FORUM    	   = "forums";
	public static final String NOTIFICATION_COMPONENT_ACTIVITY     = "activity";
	public static final String NOTIFICATION_COMPONENT_ACTION       = "bbp_new_reply";
	public static final String NOTIFICATION_COMPONENT_NEWATMENTION = "new_at_mention";
	
	/**
	 * @param notificationId
	 * @param userId - user who receives notification about request 
	 * @param accept - if true, then accept, if false then decline
	 * @throws NotFound404Exception
	 * @throws Forbidden403Exception
	 * @throws MOFSQL500Exception
	 * @throws GeneralServer500Exception
	 */
	public void processFriendship(final String notificationId, final String userId, final boolean accept) throws NotFound404Exception, Forbidden403Exception, MOFSQL500Exception, GeneralServer500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			String secondaryItemId = "";
			String followerId = "";
			try (final PreparedStatement pstm = con.prepareStatement("select user_id, secondary_item_id, item_id from wp_bp_notifications where id = ?");) {
				pstm.setString(1, notificationId);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String toUserId = rs.getString("user_id");
						if (!userId.equals(toUserId)) {
							throw new Forbidden403Exception();
						}
						secondaryItemId = rs.getString("secondary_item_id");
						followerId      = rs.getString("item_id");
					} else {
						throw new NotFound404Exception("Notification with specified id was not found");
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement("DELETE from wp_bp_notifications WHERE id = ?");) {
				pstm.setString(1, notificationId);
				pstm.executeUpdate();
			}
			if (accept) {
				new FollowersService().acceptFriendship(secondaryItemId, userId);
				try (final PreparedStatement pstm = con.prepareStatement(
						"insert into wp_bp_notifications (user_id, item_id, secondary_item_id, component_name, component_action, date_notified, is_new) " +
						"values (?, ?, ?, 'friends', 'friendship_accepted', utc_timestamp(), 1)");) {
					pstm.setString(1, followerId);
					pstm.setString(2, userId);
					pstm.setString(3, secondaryItemId);
					pstm.executeUpdate();
				}
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at NotificationService@processFriendship error ", e);
		} catch (final Forbidden403Exception | NotFound404Exception | MOFSQL500Exception e) {
			throw e;
		} catch (final Exception e) {
			throw new GeneralServer500Exception(e.getMessage(), e);
		}
	}
	
	public void notifyAboutFollowFriendRequest(final String followerId, final String followingId, final String friendshipId) 
			throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "INSERT INTO `wp_bp_notifications` (`user_id`, `item_id`, `secondary_item_id`, `component_name`, `component_action`, `date_notified`, `is_new`) " +
					 "VALUES (?, ?, ?, 'friends', 'friendship_request', ?, 1)");) {
			pstm.setString(1, followingId);
			pstm.setString(2, followerId);
			pstm.setString(3, friendshipId);
			pstm.setString(4, TimeService.getMysqlTimestampFormat().format(new Date()));
			pstm.executeUpdate();
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@notifyAboutFollowFriendRequest ", e);
		}
	}
	
	public void notifyAboutConvoReply(final String receiverId, final String senderId, final String convoId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
				 final PreparedStatement pstm = con.prepareStatement(
						 "INSERT INTO `wp_bp_notifications` (`user_id`, `item_id`, `secondary_item_id`, `component_name`, `component_action`, `date_notified`, `is_new`) " +
						 "VALUES (?, ?, ?, 'forums', 'bbp_new_reply', current_timestamp() + " + intervalSQLPartial + ", 1)");) {
				pstm.setString(1, receiverId);
				pstm.setString(2, convoId);
				pstm.setString(3, senderId);
				pstm.executeUpdate();
			} catch (final SQLException e) {
				throw new MOFSQL500Exception("at NotificationService@notifyAboutConvoReply ", e);
			}
	}
	
	public FriendshipRequestNotificationsModel getFriendshipRequests(final String userId) throws MOFSQL500Exception  {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select * from " +
					 "(select n.component_action, n.secondary_item_id as request_id, u1.id as user_id, u1.user_login as username, u1.first_name as first_name, u1.last_name as last_name, " + 
					 "n.date_notified as date_notified, n.id as id, n.is_new as is_new " + 
					 "from wp_bp_notifications n " + 
					 "left join wp_users u1 on u1.id = n.item_id " +
					 "left join wp_users u2 on u2.id = n.user_id " +
					 "where user_id = ? and " +
					 "n.component_name = 'friends' and " +
					 "(n.component_action = 'friendship_request' or n.component_action = 'friendship_accepted')) tmp " +
					 "left join " +
					 "( " +
					 "select f.initiator_user_id as is_friend " +
					 "from wp_bp_friends f " +
					 "where f.friend_user_id = ? and f.is_confirmed = 1 " +
					 "union " +
					 "select f.friend_user_id as is_friend " +
					 "from wp_bp_friends f " +
					 "where f.initiator_user_id = ? and f.is_confirmed = 1 " +
					 ") x on x.is_friend = tmp.user_id");) {
			pstm.setString(1, userId);
			pstm.setString(2, userId);
			pstm.setString(3, userId);
			try (final ResultSet rs = pstm.executeQuery();) {
				final List<FriendshipRequestNotificationModel> list = new ArrayList<>();
				while (rs.next()) {
					final FriendshipRequestNotificationModel req = new FriendshipRequestNotificationModel();
					switch (rs.getString("component_action")) {
					case "friendship_request":
						req.setNotificationType(FriendshipNotificationType.REQUEST);
						break;
					case "friendship_accepted":
						req.setNotificationType(FriendshipNotificationType.ACCEPTED);
						break;
					}
					boolean isFriend = rs.getString("is_friend") == null ? false: true;
					req.setFriend(isFriend);
					try {
						final String date = rs.getString("date_notified");
						req.setDate(TimeService.getMysqlTimestampFormat().parse(date));
					} catch (final ParseException e) {
						req.setDate(null);
					}
					req.setRequestId(rs.getString("request_id"));
					req.setId(rs.getString("id"));
					req.setWasRead(rs.getInt("is_new") != 1);
					final ShortUserModel user = new ShortUserModel();
					user.setFirstName(rs.getString("first_name"));
					user.setLastName(rs.getString("last_name"));
					user.setId(rs.getString("user_id"));
					user.setUsername(rs.getString("username"));
					req.setUser(user);
					list.add(req);
				}
				return new FriendshipRequestNotificationsModel(list);
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at NotificationService@getFriendshipRequests error " + e.getMessage(), e);
		}
	}
	
	public String[] getConvoIdAndConvoTitle(final String convoReplyId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select p.post_title, p.id from " +  
					 "wp_posts p left join wp_postmeta m on (m.meta_value = p.id and m.meta_key = '_bbp_topic_id') " +
					 "where m.post_id = ? "
			 );) {
			 pstm.setString(1, convoReplyId);			 
			 try (final ResultSet rs = pstm.executeQuery();) {
			 	if (rs.next()) {
			 		final String[] out = new String[2];
			 		out[0] = rs.getString("id");
			 		out[1] = rs.getString("post_title");
			 		return out;
			 	}
			 	return null;
			 }
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at NotificationService@getConvoIdAndConvoTitle error " + e.getMessage(), e);
		}
	}
	
	public NotificationsModel getUserNotification(final OAuthModel oauth) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select * from (" +
					 "select distinct n.id as note_id, n.is_new as is_new, n.date_notified as `date`, n.user_id as receiver_id, u1.user_login as receiver_username, n.item_id as convo_id, px.post_title as convo_text, " +
					 "u3.id as convo_author_id, u3.user_login as convo_author_username, u2.id as sender_id, u2.user_login as sender_username, p.post_parent as in_response_to_id, 0 as type, p.post_type as post_type " + 
					 "from wp_bp_notifications n " +
					 "left join wp_users u1 on u1.id = n.user_id " +
					 "left join wp_users u2 on u2.id = n.secondary_item_id " +
					 "left join wp_posts p on p.post_parent = n.item_id " +
					 "left join wp_users u3 on p.post_author = u3.id " +
					 "left join wp_posts px on px.id = n.item_id " + 
					 "where component_name = ? and n.component_action = ? and p.post_status = 'publish' and px.post_status = 'publish' and p.post_type = 'reply' " +
					 "and n.user_id = ? " +
					 "order by n.date_notified desc) a group by a.note_id " + 
					 "union " + 
					 "select * from " +
					 "(select distinct n.id as note_id, n.is_new as is_new, n.date_notified as `date`, n.user_id as receiver_id, u1.user_login as receiver_username, p.id as convo_id, p.post_title as convo_text, " +
					 "u3.id as convo_author_id, u3.user_login as convo_author_username, u2.id as sender_id, u2.user_login as sender_username, p.post_parent as in_response_to_id, " +
					 "1 as type, p.post_type as post_type " +
					 "from wp_bp_notifications n " +
					 "left join wp_users u1 on u1.id = n.user_id " +
					 "left join wp_users u2 on u2.id = n.secondary_item_id " +
					 "left join wp_bp_activity a on a.id = n.item_id " +
					 "left join wp_posts p on p.id = a.item_id " +
					 "left join wp_users u3 on p.post_author = u3.id " +
					 "where component_name = ? and n.component_action = ? and p.post_status = 'publish' " +
					 "and n.user_id = ? " +
					 "order by n.date_notified desc) b");) {
			pstm.setString(1, NOTIFICATION_COMPONENT_FORUM);
			pstm.setString(2, NOTIFICATION_COMPONENT_ACTION);
			pstm.setString(3, oauth.getUserId());
			pstm.setString(4, NOTIFICATION_COMPONENT_ACTIVITY);
			pstm.setString(5, NOTIFICATION_COMPONENT_NEWATMENTION);
			pstm.setString(6, oauth.getUserId());
			final NotificationsModel out = new NotificationsModel();
			try (final ResultSet rs = pstm.executeQuery();) {
				while (rs.next()) {
					final NotificationModel note = new NotificationModel();
					note.setId(rs.getString("note_id"));
					try {
						note.setType(rs.getString("type"));
					} catch (ValidationException e) {;}
					try {
						final String date = rs.getString("date");
						if (note.getType() == NotificationTypeEnum.MENTION) {
							note.setDate(TimeService.getMysqlTimestampFormatNoShift().parse(date));
						} else {
							note.setDate(TimeService.getMysqlTimestampFormat().parse(date));
						}
					} catch (final ParseException | SQLException e) {
						note.setDate(null);
					}
					
					//in response to user of response
					note.getResponse().getInRepsonseTo().getUser().setId(rs.getString("receiver_id"));
					note.getResponse().getInRepsonseTo().getUser().setUsername(rs.getString("receiver_username"));
					
					//notification user - you, oauth
					note.getUser().setId(oauth.getUserId());
					note.getUser().setUsername(oauth.getUsername()); 
					
					note.getConvo().setId(rs.getString("convo_id"));
					note.getConvo().setText(rs.getString("convo_text"));
					
					//convo user - the one who created convo topic
					note.getConvo().getUser().setId(rs.getString("convo_author_id"));
					note.getConvo().getUser().setUsername(rs.getString("convo_author_username"));
					
					//response user - the one who created response
					note.getResponse().getUser().setId(rs.getString("sender_id"));
					note.getResponse().getUser().setUsername(rs.getString("sender_username"));		
					
					note.getResponse().getInRepsonseTo().setId(rs.getString("in_response_to_id"));
					
					note.setWasRead(rs.getInt("is_new") != 1);
					
					if (note.getType() == NotificationTypeEnum.MENTION) {
						final String postType = rs.getString("post_type");
						if ("reply".equals(postType)) {
							final String[] newres = this.getConvoIdAndConvoTitle(note.getResponse().getInRepsonseTo().getId());
							if (newres != null) {
								note.getConvo().setId(newres[0]);
								note.getConvo().setText(newres[1]);
							}
						}
					}
					
					out.getNotifications().add(note);					
				}
			}
			return out;
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@getUserNotification: " + e.getMessage(), e);
		}
	}
	
	public void deleteNotification(final OAuthModel oauth, final String notificationId) throws MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("select user_id from wp_bp_notifications where id = ?");) {
				pstm.setString(1, notificationId);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String userId = rs.getString("user_id");
						if (!userId.equals(oauth.getUserId())) {
							throw new Forbidden403Exception();
						}
					} else {
						throw new Gone410Exception("notification with specified id was not found");
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement("delete from wp_bp_notifications where id = ?");) {
				pstm.setString(1,  notificationId);
				pstm.executeUpdate();
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@deleteNotification: " + e.getMessage(), e);
		}
	}
	
	public void setAsReadNotification (final OAuthModel oauth, final String notificationId) throws MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("select user_id from wp_bp_notifications where id = ?");) {
				pstm.setString(1, notificationId);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String userId = rs.getString("user_id");
						if (!userId.equals(oauth.getUserId())) {
							throw new Forbidden403Exception();
						}
					} else {
						throw new Gone410Exception("notification with specified id was not found");
					}
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement("update wp_bp_notifications set is_new = 0 where id = ?");) {
				pstm.setString(1,  notificationId);
				pstm.executeUpdate();
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@setAsReadNotification: " + e.getMessage(), e);
		}
	}
	
	public void setAsReadNotifications(final OAuthModel oauth, final List<String> notificationIds) throws MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		if (notificationIds.isEmpty()) {
			return;
		}
		final String ids = notificationIds.stream().collect(Collectors.joining(","));
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("update wp_bp_notifications set is_new = 0 where user_id = ? and id in (" + ids + ")");) {
				pstm.setString(1, oauth.getUserId());				
				pstm.executeUpdate();
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@setAsReadNotification: " + e.getMessage(), e);
		}
	}
	
	//for testing issues only!
	public void setAsUnreadNotification (final String notificationId) throws MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("update wp_bp_notifications set is_new = 1 where id = ?");) {
				pstm.setString(1,  notificationId);
				pstm.executeUpdate();
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@setAsUnreadNotification: " + e.getMessage(), e);
		}
	}
	
	public String createNewNotification (final WPNotificationModel notification) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "insert into wp_bp_notifications " +
					 "(user_id, item_id, secondary_item_id, component_name, component_action, " +
					  "date_notified, is_new) values (?,?,?,?,?,?,?)", Statement.RETURN_GENERATED_KEYS);) {
			int i = 1;
			pstm.setString(i++, notification.getUserId());
			pstm.setString(i++, notification.getItemId());
			pstm.setString(i++, notification.getSecondaryItemId());
			pstm.setString(i++, notification.getComponentName());
			pstm.setString(i++, notification.getComponentAction());
			
			pstm.setDate(i++, notification.getDateNotified());
			pstm.setInt(i++, notification.getNewSQL());
			
			pstm.executeUpdate();
			String newInsertedId;
			try (ResultSet generatedKeys = pstm.getGeneratedKeys();) {
				if (generatedKeys.next()) {
	                newInsertedId = String.valueOf(generatedKeys.getLong(1));
	                return newInsertedId;
	            }
			}
			throw new MOFSQL500Exception("at NotificationService@createNewNotification: unable to insert new notification to db");
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@createNewNotification: " + e.getMessage(), e);
		}
	}
	
	/**
	 * Not used in API, used in testing
	 * @param notificationId
	 * @return
	 * @throws MOFSQL500Exception
	 */
	public void deleteNotification (final String notificationId) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					"DELETE FROM wp_bp_notifications WHERE id = ?");) {
			pstm.setString(1, notificationId);
			if (pstm.executeUpdate() == 0) {
				throw new NotFound404Exception("notification with specified id was not found");
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@createNewNotification: " + e.getMessage(), e);
		}
	}
	
	public void setAsRead(final String notificationId) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
						"UPDATE wp_bp_notifications SET is_new = 0 WHERE id = ?");) {
			pstm.setString(1, notificationId);
			if (pstm.executeUpdate() == 0) {
				throw new NotFound404Exception("notification with specified id was not found");
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at NotificationService@setAsRead(String): " + e.getMessage(), e);
		}
	}
	
}









