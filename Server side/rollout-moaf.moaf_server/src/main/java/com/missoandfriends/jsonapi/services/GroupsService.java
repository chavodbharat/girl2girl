package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.models.GroupArrayModel;
import com.missoandfriends.jsonapi.models.GroupModel;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.enums.GroupMembershipEnum;

import de.ailis.pherialize.MixedArray;
import de.ailis.pherialize.Pherialize;

public class GroupsService {
	
	private static final Logger LOG = LogManager.getLogger(GroupsService.class);
	
	public static final String GROUP_BANNER_METAKEY = "cgb-banner";
	public static final String UNDEFINED_BANNER 	= "undefined";
	
	public static String getImageFromMetadata(final String data) {
		if (StringUtils.isBlank(data)) {
			return UNDEFINED_BANNER;
		}
		try {
			MixedArray list = Pherialize.unserialize( data ).toArray();
			return list.getString("url");
		} catch (final de.ailis.pherialize.exceptions.UnserializeException e) {
			LOG.error("PHP Array unserialization exception", e);
			return UNDEFINED_BANNER;
		} catch (final Exception others) {
			return UNDEFINED_BANNER;
		}
	}
	
	public GroupArrayModel getAllGroups(final OAuthModel oauth) throws MOFSQL500Exception, GeneralServer500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "SELECT g.id as id, g.name as name, m.meta_key as meta_key, m.meta_value as meta_value, g.pid as pid " +
					 "FROM (select g.id, g.name, n.pid from wp_bp_groups g left join " +
					 "(select group_id, group_id as pid from wp_bp_groups_members where user_id = ?  and is_confirmed = 1) n on n.group_id = g.id) g JOIN wp_bp_groups_groupmeta m ON m.group_id = g.id " +
					 "ORDER BY g.id");) {
			pstm.setString(1, oauth.getUserId());
			try (final ResultSet rs = pstm.executeQuery();) {
				String currentGroupId;
				final Map<String, GroupModel> tmp = new HashMap<>();
				while (rs.next()) {
					currentGroupId = rs.getString("id");
					if (!tmp.containsKey(currentGroupId)) {
						tmp.put(currentGroupId, new GroupModel());
						tmp.get(currentGroupId).setId(currentGroupId);
						tmp.get(currentGroupId).setName(rs.getString("name"));						
						tmp.get(currentGroupId).setFollowing(rs.getString("pid") != null);
					}
					tmp.get(currentGroupId).getMetadata().put(rs.getString("meta_key"), rs.getString("meta_value"));
				}
				List<GroupModel> out = new ArrayList<>();
				double avgMembers = 0.0;
				for (String id: tmp.keySet()) {
					GroupModel gm = tmp.get(id);				
					gm.setImageClass(getImageFromMetadata(gm.getMetadata().get(GROUP_BANNER_METAKEY)));
					try {
						avgMembers += Integer.parseInt( gm.getMetadata().get("total_member_count") );
					} catch (final NumberFormatException e) {
						LOG.error("GroupsService@getAllGroups: number format exeption while parsing total_member_count", e);
					}
					out.add(gm);
				}
				avgMembers /= out.size();
				for (GroupModel gm: out) {
					int number;
					try {
						number = Integer.parseInt(Optional.of(gm.getMetadata().get("total_member_count")).orElse("0"));
					} catch (final NullPointerException | NumberFormatException e) {
						number = 0;
					}
					if (number > avgMembers) {
						gm.setPopular(true);
					}
				}
				out.sort(new Comparator<GroupModel>() {				
					@Override
					public int compare(GroupModel o1, GroupModel o2) {				
						return o1.getName().compareTo(o2.getName());
					}
				});				
				return new GroupArrayModel(out);
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at GroupsService@getAllGroups: " + e.getMessage(), e);
		} catch (final Exception e) {
			throw new GeneralServer500Exception("Server Error. Please, contact the administrator", e);
		}
	}	
	public GroupArrayModel getAllGroups() throws MOFSQL500Exception, GeneralServer500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "SELECT g.id as id, g.name as name, m.meta_key as meta_key, m.meta_value as meta_value " +
					 "FROM wp_bp_groups g JOIN wp_bp_groups_groupmeta m ON m.group_id = g.id " + 
					 "ORDER BY g.id");
			 final ResultSet rs = pstm.executeQuery();) {
			String currentGroupId;
			final Map<String, GroupModel> tmp = new HashMap<>();
			while (rs.next()) {
				currentGroupId = rs.getString("id");
				if (!tmp.containsKey(currentGroupId)) {
					tmp.put(currentGroupId, new GroupModel());
					tmp.get(currentGroupId).setId(currentGroupId);
					tmp.get(currentGroupId).setName(rs.getString("name"));
				}
				tmp.get(currentGroupId).getMetadata().put(rs.getString("meta_key"), rs.getString("meta_value"));
			}
			List<GroupModel> out = new ArrayList<>();
			double avgMembers = 0.0;
			for (String id: tmp.keySet()) {
				GroupModel gm = tmp.get(id);
				gm.setImageClass(getImageFromMetadata(gm.getMetadata().get(GROUP_BANNER_METAKEY)));
				try {
					avgMembers += Integer.parseInt( gm.getMetadata().get("total_member_count") );
				} catch (final NumberFormatException e) {
					LOG.error("GroupsService@getAllGroups: number format exeption while parsing total_member_count", e);
				}
				out.add(gm);
			}
			avgMembers /= out.size();
			for (GroupModel gm: out) {
				int number;
				try {
					number = Integer.parseInt(Optional.of(gm.getMetadata().get("total_member_count")).orElse("0"));
				} catch (final NullPointerException | NumberFormatException e) {
					number = 0;
				}
				if (number > avgMembers) {
					gm.setPopular(true);
				}
			}
			out.sort(new Comparator<GroupModel>() {				
				@Override
				public int compare(GroupModel o1, GroupModel o2) {				
					return o1.getName().compareTo(o2.getName());
				}
			});
			/*
			out.get(0).setNewest(true);
			*/
			return new GroupArrayModel(out);
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at GroupsService@getAllGroups: " + e.getMessage(), e);
		} catch (final Exception e) {
			throw new GeneralServer500Exception("Server Error. Please, contact the administrator", e);
		}
	}
	
	public GroupModel getGroupById(final String id) throws MOFSQL500Exception, GeneralServer500Exception, NotFound404Exception {
		final FileUploadService upload = new FileUploadService();
		try (final Connection con = DBManagerService.getConnection();
				 final PreparedStatement pstm = con.prepareStatement(
						 "SELECT g.id as id, g.name as name, m.meta_key as meta_key, m.meta_value as meta_value " +
						 "FROM wp_bp_groups g JOIN wp_bp_groups_groupmeta m ON m.group_id = g.id " + 
						 "WHERE g.id = ?");) {			
				 pstm.setString(1, id);
				 try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {						
						GroupModel group = new GroupModel();
						group.setId(id);
						group.setName(rs.getString("name"));						
						group.getMetadata().put(rs.getString("meta_key"), rs.getString("meta_value"));
						while (rs.next()) {
							group.getMetadata().put(rs.getString("meta_key"), rs.getString("meta_value"));
						}
						final String groupImage = upload.getCoverImageFromDirectory(id);
						if (groupImage == null) {
							group.setImageClass(getImageFromMetadata(group.getMetadata().get(GROUP_BANNER_METAKEY)));
						} else {
							group.setImageClass(groupImage);
						}
						return group;
					}
					throw new NotFound404Exception("group with specified id was not found");
				 }
			} catch (final SQLException e) {
				throw new MOFSQL500Exception("at GroupsService@getGroupById: " + e.getMessage(), e);
			} catch (final NotFound404Exception e) {
				throw e;
			} catch (final Exception e) {
				throw new GeneralServer500Exception("Server Error. Please, contact the administrator");
			}
	}
	
	public GroupMembershipEnum isMember(final String groupId, final String userId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "SELECT * FROM wp_bp_groups_members WHERE group_id = ? AND user_id = ?");) {
			pstm.setString(1, groupId);
			pstm.setString(2, userId);
			try (final ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {					
					if (rs.getInt("is_admin") == 1) {
						return GroupMembershipEnum.ADMIN;
					}
					if (rs.getInt("is_banned") == 1) {
						return GroupMembershipEnum.BANNED;
					}
					if (rs.getInt("is_confirmed") == 1) {
						return GroupMembershipEnum.MEMBER;
					}
					return GroupMembershipEnum.UNCONFIRMED_MEMBER;
				}
				return GroupMembershipEnum.NOT_MEMBER;
			}
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at GroupsService@isMember: " + e.getMessage(), e);
		}
	}
	
	public Set<Integer> findAllUserGroups(final String userId) throws MOFSQL500Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select group_id " +
					 "from wp_bp_groups_members " +
					 "where user_id = ? and is_confirmed = 1 and is_banned = 0 order by 1")) {
			pstm.setString(1, userId);
			final Set<Integer> out = new HashSet<>();
			try (final ResultSet rs = pstm.executeQuery();) {
				while (rs.next()) {
					out.add(rs.getInt("group_id"));
				}
			}
			return out;
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at GroupsService@isMember: " + e.getMessage(), e);
		}
	}
	
}
















