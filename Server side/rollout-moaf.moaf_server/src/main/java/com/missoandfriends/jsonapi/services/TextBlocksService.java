package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;


public class TextBlocksService {
	
	public static final String POST_TYPE = "text-blocks";
	public static final String BLOCK_NO_GROUPS_SELECTED = "noGroupsSelectedText";  
	
	public Map<String, String> getTextBlocks() throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select post_title, post_content from wp_posts where post_title in (?) and post_type = ? and post_status = 'publish'")) {
			pstm.setString(1, BLOCK_NO_GROUPS_SELECTED);
			pstm.setString(2, POST_TYPE);
			final Map<String, String> texts = new HashMap<>();
			try (final ResultSet rs = pstm.executeQuery();) {
				while (rs.next()) {
					texts.put(rs.getString("post_title"), rs.getString("post_content"));
				}
			}
			return texts;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at TextBlocksService@getTextBlocks error " + e.getMessage(), e);
		}
	}
	
}
