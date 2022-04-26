package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import com.missoandfriends.jsonapi.MOFServer;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;

public class PostMetaService {
	
	private String intervalSQLPartial;
	
	public PostMetaService() {
		intervalSQLPartial = MOFServer.getInterval();
	}
	
	public void addPostmetaOnReply (final String postId, final String authorIp, final String convoIdTo, final String convoIdMain, final String forumId, final String convoId) 
	throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement(
				"INSERT INTO wp_postmeta (post_id, meta_key, meta_value) values " + 
			    "(?, ?, ?),(?, ?, ?),(?, ?, ?),(?, ?, ?)");) {
				int i = 1;
	
				pstm.setString(i++, postId);
				pstm.setString(i++, "_bbp_author_ip");
				pstm.setString(i++, authorIp);
				
				pstm.setString(i++, postId);
				pstm.setString(i++, "_bbp_reply_to");
				pstm.setString(i++, convoIdTo);
				
				pstm.setString(i++, postId);
				pstm.setString(i++, "_bbp_topic_id");
				pstm.setString(i++, convoIdMain);
				
				pstm.setString(i++, postId);
				pstm.setString(i++, "_bbp_forum_id");
				pstm.setString(i++, forumId);
				
				pstm.executeUpdate();
			}
			int res;
			try (final PreparedStatement pstm = con.prepareStatement("update wp_postmeta set meta_value = current_timestamp() + " + intervalSQLPartial + " where meta_key = '_bbp_last_active_time' and post_id = ?");) {
				pstm.setString(1, convoId);
				res = pstm.executeUpdate();				
			}
			if (res == 0) {
				try (final PreparedStatement pstm = con.prepareStatement("insert into wp_postmeta (post_id, meta_key, meta_value) values (?, '_bbp_last_active_time', current_timestamp() + " + intervalSQLPartial + ")");) {					
					pstm.setString(1, convoId);
					pstm.executeUpdate();				
				}
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at PostMetaService@addPostmetaOnReply: " + e.getMessage(), e);
		}
	}
	
	public void changeReplyCounter (final String postId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			int res;
			try (final PreparedStatement pstm = con.prepareStatement("update wp_postmeta set meta_value = meta_value + 1 where meta_key = '_bbp_reply_count' and post_id = ?");) {
				pstm.setString(1, postId);
				res = pstm.executeUpdate();
			}
			if (res == 0) {
				try (final PreparedStatement pstm = con.prepareStatement("INSERT into wp_postmeta (post_id, meta_key, meta_value) values (?, '_bbp_reply_count', 1)");) {
					pstm.setString(1, postId);
					pstm.executeUpdate();
				}
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at PostMetaService@changeReplyCounter: " + e.getMessage(), e);
		}
	}
	
	
	public void addPostmetaOnTopicstarter (final String postId, final String authorIp, final String forumId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
				final PreparedStatement pstm = con.prepareStatement(
						"INSERT INTO wp_postmeta (post_id, meta_key, meta_value) values " + 
						"(?, ?, ?), (?,?,?), (?,?,?), (?,?, current_timestamp() + interval 1 hour), (?,?,?), (?,?,?), (?,?,?)");) {
			int i = 1;
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_voice_count");
			pstm.setString(i++, "1");
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_reply_count_hidden");
			pstm.setString(i++, "0");
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_reply_count");
			pstm.setString(i++, "0");
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_last_active_time");
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_author_ip");
			pstm.setString(i++, authorIp);
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_topic_id");
			pstm.setString(i++, postId);
			
			pstm.setString(i++, postId);
			pstm.setString(i++, "_bbp_forum_id");
			pstm.setString(i++, forumId);
			
			pstm.executeUpdate();
			
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at PostMetaService@addPostmetaOnTopicstarter: " + e.getMessage(), e);
		}
	}
	
	//for testing issues
	public void deletePostmeta(final String postId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("delete from wp_postmeta where post_id = ?");) {
			pstm.setString(1, postId);
			pstm.executeUpdate();
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at PostMetaService@deletePostmeta: " + e.getMessage(), e);
		}
	}
	
	public void creatFreeConvoCounter(final String postId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("insert into wp_postmeta (post_id, meta_key, meta_value) values (?,?,0)");) {
			pstm.setString(1, postId);
			pstm.setString(2, FollowersService.META_KEY_POST_VOICES_COUNTER);
			pstm.executeUpdate();
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at PostMetaService@creatFreeConvoCounter " + e.getMessage(), e);
		}
	}
	
}
