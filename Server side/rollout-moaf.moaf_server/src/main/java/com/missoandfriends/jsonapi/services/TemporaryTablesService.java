package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class TemporaryTablesService {
	
	public static final String MOAF_GROUP_TO_FORUM_TABLE_NAME = "moaf_group_to_forum";
	
	private boolean createGroupToForumTable() {
		try (final Connection con = DBManagerService.getConnection();) {
			try (final PreparedStatement pstm = con.prepareStatement("drop table if exists " + MOAF_GROUP_TO_FORUM_TABLE_NAME);) {
				pstm.executeUpdate();
			}
			try (final PreparedStatement pstm = con.prepareStatement(
					"create table " + MOAF_GROUP_TO_FORUM_TABLE_NAME + " ( " +
					"group_id integer, " +
					"forum_id integer, " +
					"primary key (group_id, forum_id))");) {
				pstm.executeUpdate();
			}
			try (final PreparedStatement pstm = con.prepareStatement(
					"insert into " + MOAF_GROUP_TO_FORUM_TABLE_NAME + " (select g.id as group_id, convert(substring(gm.meta_value, 12, length(meta_value) - 13), UNSIGNED INTEGER) as forum_id " +
					"from wp_bp_groups g left join wp_bp_groups_groupmeta gm on gm.group_id = g.id " +
					"where gm.meta_key = 'forum_id' order by g.id)");) {
				pstm.executeUpdate();
			}
			return true;
		} catch (Exception e) {
			return false;
		}
	}
	
	public boolean init() {
		return createGroupToForumTable();
	}
	
	public boolean flush() {
		return createGroupToForumTable();
	}
	
}
