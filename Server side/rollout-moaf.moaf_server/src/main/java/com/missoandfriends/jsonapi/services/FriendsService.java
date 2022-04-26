package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.models.FriendModel;
import com.missoandfriends.jsonapi.models.FriendsModel;

public class FriendsService {
	
	public FriendsModel getListOfAssociatedUsers(final String userId, final String convoId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement(
					"select distinct id, user_login from ( " +
					  "select u.id, u.user_login " + 
					  "from wp_posts p join wp_users u on u.id = p.post_author " + 
					  "where p.id = ? and p.post_status = 'publish' " + 
		              "union " +
					  "select u.id, u.user_login " +
					  "from wp_posts p join wp_users u on u.id = p.post_author " +
					  "where p.post_parent = ? and p.post_status = 'publish' " +
					  "union " + 
					  "select u.id, u.user_login " +
					  "from wp_posts p join wp_users u on u.id = p.post_author " + 
					  "where p.id in (select post_id from wp_postmeta where meta_key = '_bbp_reply_to' and meta_value = ?) and p.post_status = 'publish' " +
					  "union " +
					  "select u.id, u.user_login " +
					  "from wp_users u join " +
					    "(select friend_user_id as id " +
				 	     "from wp_bp_friends f " +
					     "where f.initiator_user_id = ? and f.is_confirmed = 1 " +
					     "union " +
					     "select initiator_user_id as id " +
					     "from wp_bp_friends f " +
					     "where f.friend_user_id = ? and f.is_confirmed = 1) x on x.id = u.id ) x " +
					"order by lower(user_login) asc");) {
				pstm.setString(1, convoId);
				pstm.setString(2, convoId);
				pstm.setString(3, convoId);
				pstm.setString(4, userId);
				pstm.setString(5, userId);
				try (final ResultSet rs = pstm.executeQuery();) {
					final List<FriendModel> out = new ArrayList<>();
					while (rs.next()) {
						final FriendModel friend = new FriendModel();
						friend.setId(rs.getString("id"));
						friend.setUsername(rs.getString("user_login"));
						out.add(friend);
					}
					final FriendsModel friends = new FriendsModel();
					friends.setFriends(out);
					return friends;
				}
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at FriendService@getListOfAssociatedUsers error " + e.getMessage(), e);
		}
	}
	
	public FriendsModel getListOfAssociatedUsers(final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement(
					"select u.id, u.user_login " +
					"from wp_users u join " +
					"(select friend_user_id as id " +
					"from wp_bp_friends f " +
					"where f.initiator_user_id = ? and f.is_confirmed = 1 " +
					"union " +
					"select initiator_user_id as id " +
					"from wp_bp_friends f " +
					"where f.friend_user_id = ? and f.is_confirmed = 1) x on x.id = u.id " +
					"order by lower(user_login) asc");) {
				pstm.setString(1, userId);
				pstm.setString(2, userId);
				try (final ResultSet rs = pstm.executeQuery();) {
					final List<FriendModel> out = new ArrayList<>();
					while (rs.next()) {
						final FriendModel friend = new FriendModel();
						friend.setId(rs.getString("id"));
						friend.setUsername(rs.getString("user_login"));
						out.add(friend);
					}
					final FriendsModel friends = new FriendsModel();
					friends.setFriends(out);
					return friends;
				}
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at FriendService@getListOfAssociatedUsers error " + e.getMessage(), e);
		}
	}
	
}
