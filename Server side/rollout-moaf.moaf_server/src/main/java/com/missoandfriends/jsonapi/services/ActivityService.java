package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.php.Wordpress;

public class ActivityService {

	
	public void addActivity (final String userId, final String component, final String type, final String action, final String content, final String primaryLink,
			final String itemId, final String secondaryItemId) throws SQLException {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "insert into wp_bp_activity (user_id, component, type, action, content, primary_link, item_id, secondary_item_id, date_recorded, hide_sitewide, mptt_left, mptt_right, is_spam) " +
					 "values (?,?,?,?,?,?,?,?, utc_time(), 0,0,0,0)");) {
			int i = 1;
			pstm.setString(i++, userId);
			pstm.setString(i++, component);
			pstm.setString(i++, type);
			pstm.setString(i++, action);
			pstm.setString(i++, content);
			pstm.setString(i++, primaryLink);
			pstm.setString(i++, itemId);
			pstm.setString(i++, secondaryItemId);
			pstm.executeUpdate();
		}
	}
	
	public void joinGroupActivity(final String userId, final String groupId) throws MOFSQL500Exception {
		final String wsu = Wordpress.getWebsiteUrl();
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
			"insert into wp_bp_activity " +
			"(user_id, component, type, action, content, primary_link, item_id, secondary_item_id, date_recorded, hide_sitewide, mptt_left, mptt_right, is_spam) " + 
			"select " + 
			"?, 'groups', 'joined_group', concat('<a href=\"" + wsu + "/members/', u.user_login ,'/\">', u.user_login ,'</a> joined the group <a href=\"" + wsu + "/girl2girl-groups/', g.slug, '/\">', g.name, '</a>'), " +
			"'', concat('" + wsu + "/members/', u.user_login ,'/'), g.id, 0, utc_time(), 0,0,0,0 " +
			"from wp_bp_groups g, wp_users u where g.id = ? and u.id = ?");) {
			int i = 1;
			pstm.setString(i++, userId);			
			pstm.setString(i++, groupId);
			pstm.setString(i++, userId);
			pstm.executeUpdate();
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" as ActivityService@joinGroupActivity error " + e.getMessage(), e);
		}
	}
	
	public void friendshipAcceptedActivity(final String user1, final String user2, final String friendshipId) throws MOFSQL500Exception {
		final String wsu = Wordpress.getWebsiteUrl();
		try (final Connection con = DBManagerService.getConnection();
				final PreparedStatement pstm = con.prepareStatement(
						"insert into wp_bp_activity " + 
						"(user_id, component, type, action, content, primary_link, item_id, secondary_item_id, date_recorded, hide_sitewide, mptt_left, mptt_right, is_spam) " + 
						"select " + 
						"u1.id, 'friends', 'friendship_created', concat('<a href=\"" + wsu + "/members/', u1.id,'/\">', u1.user_login, '</a> and <a href=\"" + wsu + "/members/', u2.id, '/\">', u2.user_login, '</a> are now friends'), " +
						"'', concat('" + wsu + "/members/', u2.user_login ,'/'), u2.id, ?, utc_time(), 0,0,0,0 " +
						"from wp_users u1, wp_users u2 " +
						"where u1.id = ? and u2.id = ?");) {
			int i = 1;
			pstm.setString(i++, friendshipId);			
			pstm.setString(i++, user1);
			pstm.setString(i++, user2);
			pstm.executeUpdate();
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" as ActivityService@friendshipAcceptedActivit error " + e.getMessage(), e);
		}
	}
		
}
