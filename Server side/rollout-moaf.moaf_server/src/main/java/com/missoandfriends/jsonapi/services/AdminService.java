package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;

public class AdminService {

	public List<String> getAdminEmails() throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select distinct user_email " +
					 "from wp_users u, " +
					 "wp_usermeta m where m.meta_key = 'wp_capabilities' and m.meta_value = 'a:2:{s:13:\"administrator\";b:1;s:13:\"bbp_keymaster\";b:1;}' and u.id = m.user_id");
			 final ResultSet rs = pstm.executeQuery();) {
			final List<String> out = new ArrayList<>();
			while (rs.next()) {
				out.add(rs.getString("user_email"));
			}
			return out;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception(" at AdminService@getAdminEmails", e);
		}
	}
	
}
