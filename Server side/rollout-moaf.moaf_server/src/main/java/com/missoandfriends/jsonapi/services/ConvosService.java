package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.ParseException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import com.missoandfriends.jsonapi.MOFServer;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.models.ConvoUrlModel;
import com.missoandfriends.jsonapi.models.ConvoWithResponsesModel;
import com.missoandfriends.jsonapi.models.ConvoWithoutResponsesModel;
import com.missoandfriends.jsonapi.models.ConvosWithoutResponsesModel;
import com.missoandfriends.jsonapi.models.GroupConvosModel;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.ResponseModel;
import com.missoandfriends.jsonapi.models.ShortGroupModel;
import com.missoandfriends.jsonapi.models.ShortUserModel;
import com.missoandfriends.jsonapi.models.enums.FollowingTypeEnum;
import com.missoandfriends.jsonapi.models.payloads.ConvoPayloadModel;
import com.missoandfriends.jsonapi.models.payloads.ConvoReplyPayloadModel;
import com.missoandfriends.jsonapi.models.payloads.FollowingsPayloadModel;
import com.missoandfriends.jsonapi.models.wp.WPGroupModel;
import com.missoandfriends.jsonapi.models.wp.WPPostJoinActivityModel;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

import de.ailis.pherialize.MixedArray;
import de.ailis.pherialize.Pherialize;

public class ConvosService {
	
	public static final int CONVOS_FEED_LIMIT = 20;
	public static final boolean ALLOW_NOTIFICATIONS_BEFORE_APPROVE = true;
	private int postTimeLimit = 3; //5 seconds between posts
	private String intervalSQLPartial = "interval 1 hour";
	
	public ConvosService() {
		intervalSQLPartial = MOFServer.getInterval();
		postTimeLimit      = MOFServer.getPostTimeLimit();
	}
	
	public ConvoUrlModel getConvoUrl(final String id) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			try(final PreparedStatement pstm = con.prepareStatement(
					 "select primary_link from " +
					 "(select primary_link from wp_bp_activity  where item_id = ? and component = 'bbpress' limit 1) x " +
					 "union " +
					 "select primary_link from wp_bp_activity where secondary_item_id = ? and user_id = (select post_author from wp_posts where id = ?) " + 
					 "union " +
					 "select primary_link from wp_bp_activity where secondary_item_id = ?");) {
				pstm.setString(1, id);
				pstm.setString(2, id);
				pstm.setString(3, id);
				pstm.setString(4, id);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String link = rs.getString("primary_link");
						return new ConvoUrlModel(link);
					}								
				}
			}
			try (final PreparedStatement pstm = con.prepareStatement("select guid from wp_posts where id = ?");) {
				pstm.setString(1, id);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final String link = rs.getString("guid");
						return new ConvoUrlModel(link);
					}								
				}
			}
			throw new NotFound404Exception("convo with specified id not found or not submited");
		} catch (final SQLException e) {
			throw new MOFSQL500Exception("at ConvosService@getConvoUrl", e);
		}
	}
	
	public static String getForumArray(final String sid) {
		Integer id;
		try {
			id = Integer.parseInt(sid);
		} catch (final NumberFormatException e) {
			id = 0;
		}
		final List<Integer> ids = new ArrayList<>();
		ids.add(id);
		return Pherialize.serialize(ids);
	}
	
	public static Integer getForumFromArray(final String phpArray) {
		try {
			final MixedArray list = Pherialize.unserialize(phpArray).toArray();
			return list.getInt(0);
		} catch (final Exception e) {
			return null;
		}
	}
	
	public ShortGroupModel findGroupByParentIdAndType(final String forumId, final String type) throws MOFSQL500Exception, NotFound404Exception {		
		return findGroupByParentIdAndType(forumId, type, 0);
	}
	
	public ShortGroupModel findGroupByParentIdAndType(final String forumId, final String type, int depth) throws MOFSQL500Exception, NotFound404Exception {
		if (depth == 5) {
			return null;
		}
		if ("topic".equals(type)) {
			return findGroupByParentId(forumId);
		}
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select post_parent, post_type from wp_posts where id = ?");) {			
			pstm.setString(1, forumId);
			try (ResultSet rs = pstm.executeQuery();) {
				rs.next();
				final String newForumId = rs.getString("post_parent");
				final String newType = rs.getString("post_type");
				return findGroupByParentIdAndType(newForumId, newType, depth + 1);
			}			
		} catch (NotFound404Exception e) {
			throw e;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosService@findGroupByParentId: " + e.getMessage(), e);
		}
	}
	
	public ShortGroupModel findGroupByParentId(final String forumId) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select * " +
			 	"from wp_bp_groups where id = (select group_id from wp_bp_groups_groupmeta g where meta_key = 'forum_id' and meta_value = ? limit 1)");) {			
			pstm.setString(1, getForumArray(forumId));
			try (ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {
					final ShortGroupModel out = new ShortGroupModel();
					out.setId(rs.getString("id"));
					out.setName(rs.getString("name"));
					return out;
				}
				throw new NotFound404Exception("group with specified id was not found");
			}			
		} catch (NotFound404Exception e) {
			throw e;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosService@findGroupByParentId: " + e.getMessage(), e);
		}
	}
	
	public String[] findParentByGroupId(final String groupId) throws MOFSQL500Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
				final PreparedStatement pstm = con.prepareStatement("select meta_value, slug " +
																	"from wp_bp_groups_groupmeta m join wp_bp_groups g on g.id = m.group_id " +
																	"where m.meta_key = 'forum_id' and m.group_id = ?");) {
			pstm.setString(1, groupId);
			try (ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {
					String parent = rs.getString("meta_value");
					String slug   = rs.getString("slug");
					//a:1:{i:0;i:19627;}
					parent = parent.substring(11);
					parent = parent.substring(0, parent.indexOf(";"));
					return new String[] {parent, slug};
				} 
				return null;
			}			
		} catch (Exception e) {			
			throw new MOFSQL500Exception("at ConvosService@findParentByGroupId: " + e.getMessage(), e);
		}
	}
	
	public List<WPGroupModel> getWPGroups () throws MOFSQL500Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
						 "select * " + 
						 "from wp_bp_groups g left join wp_bp_groups_groupmeta m on g.id = m.group_id " +
						 "where m.meta_key = 'forum_id'");
			 final ResultSet rs = pstm.executeQuery();) {
			final List<WPGroupModel> groups = new ArrayList<>();
			while (rs.next()) {
				final WPGroupModel out = new WPGroupModel();
				out.setId(rs.getString("id"));
				out.setName(rs.getString("name"));
				out.setCreatorId(rs.getString("creator_id"));
				final String array = rs.getString("meta_value");
				out.setParentId(getForumFromArray(array).toString());
				out.setSlug(rs.getString("slug"));
				groups.add(out);
			}
			return groups;
		} catch (Exception e) {			
			throw new MOFSQL500Exception("at ConvosService@getWPGroups: " + e.getMessage(), e);
		}
	}
	
	public WPGroupModel getWPGroupByForumId (final String forumId) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
				 final PreparedStatement pstm = con.prepareStatement("select * " +
				 	"from wp_bp_groups where id = (select group_id from wp_bp_groups_groupmeta g where meta_key = 'forum_id' and meta_value like ? limit 1)");) {
				pstm.setString(1, "%:" + forumId + ";}");				
				try (ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final WPGroupModel out = new WPGroupModel();
						out.setId(rs.getString("id"));
						out.setName(rs.getString("name"));
						out.setCreatorId(rs.getString("creator_id"));
						out.setParentId(rs.getString("parent_id"));
						out.setSlug(rs.getString("slug"));
						return out;
					}
					throw new NotFound404Exception("no forum found for specified forum_id");
				}			
			} catch (NotFound404Exception e) {
				throw e;
			} catch (Exception e) {			
				throw new MOFSQL500Exception("at ConvosService@getWPGroupByForumId: " + e.getMessage(), e);
			}
	}
	
	public WPGroupModel getWPGroupByGroupId (final String groupId) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select * " +
				     "from wp_bp_groups g left join wp_bp_groups_groupmeta m on m.group_id = g.id " +
				     "where g.id = ? and m.meta_key = 'forum_id'");) {
			pstm.setString(1, groupId);				
			try (ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {
					final WPGroupModel out = new WPGroupModel();
					out.setId(rs.getString("id"));
					out.setName(rs.getString("name"));
					out.setCreatorId(rs.getString("creator_id"));
					final String array = rs.getString("meta_value");
					out.setParentId(getForumFromArray(array).toString());
					out.setSlug(rs.getString("slug"));
					return out;
				}
				throw new NotFound404Exception("no forum found for specified forum_id");
			}			
		} catch (NotFound404Exception e) {
			throw e;
		} catch (Exception e) {			
			throw new MOFSQL500Exception("at ConvosService@getWPGroupByForumId: " + e.getMessage(), e);
		}
	}
	
	@Deprecated
	public GroupConvosModel getGroupConvos(final String groupId) throws MOFSQL500Exception, NotFound404Exception {
		final WPGroupModel group = this.getWPGroupByGroupId(groupId);
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select * " +
					 "from wp_posts p left join wp_users u on u.id = p.post_author  left join " +
					 "(select ifnull(meta_value, 0) as cnt, post_id from wp_postmeta where meta_key = ? ) x on x.post_id = p.id " +
					 "where p.post_parent = ?");) {
			pstm.setString(1, FollowersService.META_KEY_POST_VOICES_COUNTER);
			pstm.setString(2, group.getParentId());
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosService@getGroupConvos: " + e.getMessage(), e);
		}
		return null;
	}
	
	public ConvoWithResponsesModel getConvoById(final String id) throws NotFound404Exception, MOFSQL500Exception {
		return getConvoById(id, null);
	}
	/**
	 * This could be quite sophisticated. If this convo is a topicstarter, then return all posts under this post.
	 * If this is a reply, then return all replies of that convo.
	 * So, first select is a concrete post.
	 * Second union gives all posts of this convo, but returns empty set if this.
	 * Third gives replies, if exist.
	 * @param id
	 * @return
	 * @throws NotFound404Exception
	 * @throws MOFSQL500Exception
	 */
	public ConvoWithResponsesModel getConvoById(final String id, final OAuthModel oauth) throws NotFound404Exception, MOFSQL500Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
						 "select u.first_name as first_name, u.last_name as last_name, u.id as user_id, u.user_login as username, post_content, post_date, " +
					 	 "p.id as post_id, p.post_status as status, p.post_parent, x.cnt as cnt, p.post_type, ifnull(y.meta_value, 0) as reply_counter " +
						 "from wp_posts p join wp_users u on u.id = p.post_author " +
					 	 "left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') y on y.post_id = p.id," +
					 	 "(" +
					 	 " select y.cnt as cnt " +
					 	 " from ( " +
					 	 " select ifnull(meta_value, 0) as cnt from wp_postmeta where post_id = ? and meta_key = '_bbp_voice_count' " + //1
					 	 " union " +
					 	 " select 0 as cnt) y limit 1 " +
					 	 ") x " +
						 "where p.id = ? and p.post_status = 'publish' " + //2
						 "union " + 
						 "select u.first_name as first_name, u.last_name as last_name, u.id as user_id, u.user_login as username, post_content, post_date, " +
					 	 "p.id as post_id, p.post_status as status, p.post_parent, null, p.post_type, 0 as reply_counter " + 
						 "from wp_posts p join wp_users u on u.id = p.post_author " +
						 "where p.post_parent = ? and p.post_status = 'publish' " + //3
						 "union " + 
						 "select u.first_name as first_name, u.last_name as last_name, u.id as user_id, u.user_login as username, post_content, post_date, " +
					 	 "p.id as post_id, p.post_status as status, p.post_parent, null, p.post_type,  0 as reply_counter " + 
						 "from wp_posts p join wp_users u on u.id = p.post_author " +
						 "where p.id in (select post_id from wp_postmeta where meta_key = '_bbp_reply_to' and meta_value = ?) and (p.post_status = 'publish' or p.post_status = 'pending')");) { //4
				pstm.setString(1, id);
				pstm.setString(2, id);
				pstm.setString(3, id);
				pstm.setString(4, id);
				try (final ResultSet rs = pstm.executeQuery();) {
					if (rs.next()) {
						final ConvoWithResponsesModel out = new ConvoWithResponsesModel();
						out.setId(id);
						//First retrieve author's information
						final ShortUserModel author = new ShortUserModel();
						author.setId(rs.getString("user_id"));
						author.setFirstName(rs.getString("first_name"));
						author.setLastName(rs.getString("last_name"));
						author.setUsername(rs.getString("username"));
						final String parentPostId = rs.getString("post_parent");
						final String post_type = rs.getString("post_type");						
						out.setUser(author);
						out.setNumResponses(rs.getInt("reply_counter"));
						try {
							ShortGroupModel g = findGroupByParentIdAndType(parentPostId, post_type);
							out.setGroup(g);
						} catch (final NotFound404Exception e) {
							out.setGroup(ShortGroupModel.getRemovedGroup());
						}
						out.setText(rs.getString("post_content"));
						try {
							final String date = rs.getString("post_date");
							out.setDate(TimeService.getMysqlTimestampFormat().parse(date));
						} catch (final ParseException | SQLException e) {
							out.setDate(null);
						}
						out.setNumFollowers(Optional.ofNullable(rs.getInt("cnt")).orElse(0));				
						final List<ResponseModel> responses = new ArrayList<>();
						final Set<String> distinctFollowers = new HashSet<>();
						while (rs.next()) {
							final ResponseModel res = new ResponseModel();
							res.setConvoId(id);
							try {
								final String date = rs.getString("post_date");
								res.setDate(TimeService.getMysqlTimestampFormat().parse(date));
							} catch (final SQLException e) {
								res.setDate(null);
							}
							res.setId(rs.getString("post_id"));
							res.setText(rs.getString("post_content"));
							res.setStatus(rs.getString("status"));							
							
							final ShortUserModel shortUser = new ShortUserModel();
							shortUser.setFirstName(rs.getString("first_name"));
							shortUser.setLastName(rs.getString("last_name"));
							shortUser.setId(rs.getString("user_id"));
							shortUser.setUsername(rs.getString("username"));
							distinctFollowers.add(shortUser.getUsername());
							res.setUser(shortUser);
							
							responses.add(res);
						}
						Collections.sort(responses, new Comparator<ResponseModel>() {
							@Override
							public int compare(ResponseModel arg0, ResponseModel arg1) {
								return arg1.getDate().compareTo(arg0.getDate());
							}
						});
						out.setResponses(responses);
						out.setHasResponded(!responses.isEmpty());						
						out.setHasFollowers(!distinctFollowers.isEmpty());
						
						if (oauth != null) {
							final String[] cids = new FollowersService().getFollowedConvosArray(con, oauth.getUserId());			
							final Set<String> cidset = new HashSet<>(Arrays.asList(cids));
							out.setFollowing(cidset.contains(out.getId()));
						}
						
						return out;
					}
					throw new NotFound404Exception("Convo with specified id was not found");
				}
		} catch (NotFound404Exception e) {
			throw e;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosService@getConvosById: " + e.getMessage(), e);
		}
	}
	
	/*
	public ConvoWithResponsesModel getConvoById(final String id) throws NotFound404Exception, MOFSQL500Exception {
		try (final Connection con 		  = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select * " +
					 "from wp_posts p left join wp_bp_activity a on p.id = a.item_id " +
					 "join wp_users u on u.id = p.post_author " +
					 "where p.id = ? " +
					 "group by u.id " +
					 "union " +
					 "select * " +
					 "from wp_posts p left join wp_bp_activity a on p.id = a.secondary_item_id " +
					 "join wp_users u on u.id = a.user_id " +
					 "where p.id = ?");) {
			pstm.setString(1, id);
			pstm.setString(2, id);
			try (final ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {
					final ConvoWithResponsesModel out = new ConvoWithResponsesModel();
					final ShortUserModel author = new ShortUserModel();
					author.setFirstName(rs.getString("first_name"));
					author.setLastName(rs.getString("last_name"));
					author.setId(rs.getString("user_id"));
					author.setUsername(rs.getString("user_login"));
					final String parentPostId = rs.getString("post_parent");
					out.setUser(author);
					out.setGroup(findGroupByParentId(parentPostId));
					out.setText(rs.getString("post_content"));
					final List<ResponseModel> responses = new ArrayList<>();
					final Set<String> distinctFollowers = new HashSet<>();
					while (rs.next()) {
						final ResponseModel res = new ResponseModel();
						res.setConvoId(id);
						res.setDate(rs.getDate("post_date_gmt"));
						res.setId(rs.getString("item_id"));
						res.setText(rs.getString("post_content"));
						
						final ShortUserModel shortUser = new ShortUserModel();
						shortUser.setFirstName(rs.getString("first_name"));
						shortUser.setLastName(rs.getString("last_name"));
						shortUser.setId(rs.getString("user_id"));
						shortUser.setUsername(rs.getString("user_login"));
						distinctFollowers.add(shortUser.getUsername());
						res.setShortUser(shortUser);
						
						responses.add(res);
					}
					out.setResponses(responses);
					out.setHasResponded(!responses.isEmpty());
					out.setNumFollowers(distinctFollowers.size());
					out.setHasFollowers(!distinctFollowers.isEmpty());
					return out;
				}
				throw new NotFound404Exception("Convo with specified id was not found");
			}
		} catch (NotFound404Exception e) {
			throw e;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosServicee@getConvosById: " + e.getMessage());
		}
	}
	*/
	
	public WPPostJoinActivityModel getWPPostJoinActivityByPostId (final String convoId) throws NotFound404Exception, MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("SELECT * FROM wp_bp_activity b join wp_posts p on p.id = b.item_id WHERE b.item_id = ? and b.type = ?");) {
			pstm.setString(1, convoId);
			pstm.setString(2, Wordpress.CONVO_BP_CREATE_TOPIC_ACTIVITY_TYPE);
			try (final ResultSet rs = pstm.executeQuery();) {
				if (rs.next()) {
					WPPostJoinActivityModel out = new WPPostJoinActivityModel();
					out.setItemId(rs.getString("item_id"));
					out.setPostTitle(rs.getString("post_title"));
					out.setPrimaryLink(rs.getString("primary_link"));
					out.setSecondaryItemId(rs.getString("secondary_item_id"));
					return out;
				}
				throw new NotFound404Exception("Convo with specified id was not found");
			}
		} catch (NotFound404Exception e) {
			throw e;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosServicee@getConvosById: " + e.getMessage(), e);
		}
	}
	
	public String createConvo(final OAuthModel oauth, final ConvoPayloadModel payload, final String ipAddress) throws MOFSQL500Exception {
		
		final String postStatus = oauth.canPostWithoutPremoderation() ? Wordpress.CONVO_POST_STATUS_PUBLISH : Wordpress.CONVO_POST_STATUS_PENDING;
		
		try (final Connection con = DBManagerService.getConnection();) {
			con.setAutoCommit(false);
			String newInsertedId = "";			
			final String[] parentSlug = findParentByGroupId(payload.getGroupId());			
			final String nowString = TimeService.getMysqlTimestampFormat().format( new java.util.Date() );
			try (final PreparedStatement pstm = con.prepareStatement("INSERT into wp_posts " + 
					  "(`post_author`, `post_date`, `post_date_gmt`, `post_content`, `post_title`, " + 
					   "`post_excerpt`, `post_status`, `comment_status`, `ping_status`, `post_password`, " + 
					   "`post_name`, `to_ping`, `pinged`, `post_modified`, `post_modified_gmt`, " + 
					   "`post_content_filtered`, `post_parent`, `guid`, `menu_order`, `post_type`, " + 
					   "`post_mime_type`, `comment_count`) values (" +
					   "?,current_timestamp() + " + intervalSQLPartial + ",?,?,?," +
					   "?,?,?,?,?," +
					   "?,?,?,current_timestamp() + " + intervalSQLPartial + ",?," +
					   "?,?,?,?,?," +
					   "?,?)",
					  Statement.RETURN_GENERATED_KEYS);) {
				int i = 1;
				
				pstm.setString(i++, payload.getUserId());
				//pstm.setString(i++, nowString);
				pstm.setString(i++, oauth.canPostWithoutPremoderation() ? nowString: "0000-00-00 00:00:00");
				pstm.setString(i++, payload.getText());
				pstm.setString(i++, payload.getTitle());
				
				pstm.setString(i++, "");
				pstm.setString(i++, postStatus);
				pstm.setString(i++, Wordpress.CONVO_COMMENT_STATUS);
				pstm.setString(i++, Wordpress.CONVO_PING_STATUS_CLOSED);
				pstm.setString(i++, "");
				
				pstm.setString(i++, payload.getSlugTitle());
				pstm.setString(i++, "");
				pstm.setString(i++, "");
				//pstm.setString(i++, nowString);
				pstm.setString(i++, oauth.canPostWithoutPremoderation() ? nowString: "0000-00-00 00:00:00");
				
				pstm.setString(i++, "");
				pstm.setString(i++, parentSlug[0]);
				pstm.setString(i++, "");
				pstm.setString(i++, Wordpress.CONVO_PARENT_MENU_ORDER);
				pstm.setString(i++, Wordpress.CONVO_PARENT_POST_TYPE);
				
				pstm.setString(i++, Wordpress.CONVO_MIME_TYPE);
				pstm.setString(i++, "0");
				
				pstm.executeUpdate();
				
				try (ResultSet generatedKeys = pstm.getGeneratedKeys();) {
					if (generatedKeys.next()) {
		                newInsertedId = String.valueOf(generatedKeys.getLong(1));
		            }
				}
			} catch (SQLException e) {				
				con.rollback();
				throw new MOFSQL500Exception("at ConvosServicee@createConvo/1: " + e.getMessage(), e);
			}
			try (final PreparedStatement pstm = con.prepareStatement("UPDATE wp_posts set guid = ? WHERE id = ?")) {
				pstm.setString(1, Wordpress.getTopicPostGuid(newInsertedId));
				pstm.setString(2, newInsertedId);				
			} catch (SQLException e) {
				con.rollback();
				throw new MOFSQL500Exception("at ConvosServicee@createConvo: " + e.getMessage(), e);
			}
			if (oauth.canPostWithoutPremoderation()) {
				try (final PreparedStatement pstm = con.prepareStatement("INSERT INTO wp_bp_activity (`user_id`, `component`, `type`, `action`, `content`, " + 
																									 "`primary_link`, `item_id`, `secondary_item_id`, `date_recorded`, `hide_sitewide`," +
																								 	 "`mptt_left`, `mptt_right`, `is_spam`) " + 
																								 	 "values (?, ?, ?, ?, ?," +
																								 	         "?, ?, ?, ?, 0," + 
																								 	         "0, 0, 0)")) {
					int i = 1;
					pstm.setString(i++, payload.getUserId());
					pstm.setString(i++, Wordpress.CONVO_BP_COMPONENT_TYPE);				
					pstm.setString(i++, Wordpress.CONVO_BP_CREATE_TOPIC_ACTIVITY_TYPE);		
					pstm.setString(i++, Wordpress.getWpBpActivityPostActionByMember(oauth.getUsername(), newInsertedId, oauth.getDisplayName(), payload.getTitle()));
					pstm.setString(i++, payload.getText());				
					pstm.setString(i++, Wordpress.getTopicGirls2GirlsPrimaryLink(parentSlug[1], payload.getSlugTitle()));
					pstm.setString(i++, newInsertedId);
					pstm.setString(i++, parentSlug[0]);
					pstm.setString(i++, nowString);
					
					pstm.executeUpdate();
					
				} catch (SQLException e) {
					e.printStackTrace(System.err);
					con.rollback();
					throw new MOFSQL500Exception("at ConvosServicee@createConvo/2: " + e.getMessage());
				}
			}
			con.commit();
			new PostMetaService().addPostmetaOnTopicstarter(newInsertedId, ipAddress, parentSlug[0]);
			//do not create empty counter
			new UserService().updateLatesActivityMetadata(payload.getUserId());
			new MailProxyService().newConvo(oauth.getUsername(), payload.getText());
			return newInsertedId;
		} catch (Exception e) {
			e.printStackTrace(System.err);
			throw new MOFSQL500Exception("at ConvosServicee@createConvo/3: " + e.getMessage(), e);
		}
		
	}
	
	public String createConvoReply(final OAuthModel oauth, final String inResponseToPostId, final ConvoReplyPayloadModel payload, final String ipAddress) throws MOFSQL500Exception, NotFound404Exception {
		final String groupId = findGroupByParentIdAndType(inResponseToPostId, null).getId();
		final String forumId = getWPGroupByGroupId(groupId).getParentId();
		
		final String postStatus = oauth.canPostWithoutPremoderation() ? Wordpress.CONVO_POST_STATUS_PUBLISH : Wordpress.CONVO_POST_STATUS_PENDING;
		
		//final WPGroupModel group = this.getWPGroupByForumId(forumId);
		try (final Connection con = DBManagerService.getConnection();) {
			con.setAutoCommit(false);
			
			String newInsertedId = "";						
			final String nowString = TimeService.getMysqlTimestampFormat().format( new java.util.Date() );
			
			int menuOrder = 0;
			try (final PreparedStatement pstm = con.prepareStatement("select ifnull(max(menu_order), 0) + 1 from wp_posts where post_parent = ? and post_type = 'reply'");) {
				pstm.setString(1, payload.getConvoId());
				try (final ResultSet rs = pstm.executeQuery();) {
					rs.next();
					menuOrder = rs.getInt(1);
				}
			}
			
			String receiverId = payload.getUserId();
			try (final PreparedStatement pstm = con.prepareStatement("select post_author from wp_posts where id = ?");) {
				pstm.setString(1, payload.getConvoId());
				try (final ResultSet rs = pstm.executeQuery();) {
					rs.next();
					receiverId = rs.getString(1);
				}
			}
		
			try (final PreparedStatement pstm = con.prepareStatement("INSERT into wp_posts " + 
					  "(`post_author`, `post_date`, `post_date_gmt`, `post_content`, `post_title`, " + 
					   "`post_excerpt`, `post_status`, `comment_status`, `ping_status`, `post_password`, " + 
					   "`post_name`, `to_ping`, `pinged`, `post_modified`, `post_modified_gmt`, `post_content_filtered`, " + 
					   "`post_parent`, `guid`, `menu_order`, `post_type`, `post_mime_type`, " + 
					   "`comment_count`) values (?,current_timestamp() + " + intervalSQLPartial + ",?,?,?,"
					   + "?,?,?,?,?,"
					   + "?,?,?,current_timestamp() + " + intervalSQLPartial + ",?,?,"
					   + "?,?,?,?,?,?)",
					  Statement.RETURN_GENERATED_KEYS);) {
				int i = 1;
				
				pstm.setString(i++, payload.getUserId());
				//pstm.setString(i++, nowString);
				pstm.setString(i++, oauth.canPostWithoutPremoderation() ? nowString: "0000-00-00 00:00:00");
				pstm.setString(i++, payload.getText());
				pstm.setString(i++, "");
				
				pstm.setString(i++, "");
				pstm.setString(i++, postStatus);
				pstm.setString(i++, Wordpress.CONVO_COMMENT_STATUS);
				pstm.setString(i++, Wordpress.CONVO_PING_STATUS_CLOSED);
				pstm.setString(i++, "");
				
				pstm.setString(i++, "");
				pstm.setString(i++, "");
				pstm.setString(i++, "");
				//pstm.setString(i++, nowString);
				pstm.setString(i++, oauth.canPostWithoutPremoderation() ? nowString: "0000-00-00 00:00:00");
				pstm.setString(i++, "");
				
				pstm.setString(i++, payload.getConvoId());
				pstm.setString(i++, "");				
				//pstm.setString(i++, Wordpress.CONVO_REPLY_MENU_ORDER);
				pstm.setInt(i++, menuOrder);
				pstm.setString(i++, Wordpress.CONVO_REPLY_POST_TYPE);
				pstm.setString(i++, Wordpress.CONVO_MIME_TYPE);
				pstm.setString(i++, "0");
				
				pstm.executeUpdate();
				
				try (ResultSet generatedKeys = pstm.getGeneratedKeys();) {
					if (generatedKeys.next()) {
						newInsertedId = String.valueOf(generatedKeys.getLong(1));
					}
				}
			} catch (SQLException e) {
				con.rollback();
				throw new MOFSQL500Exception("at ConvosServicee@createConvoReply/1: " + e.getMessage(), e);
			}
			
			
			try (final PreparedStatement pstm = con.prepareStatement("UPDATE wp_posts set guid = ?, post_name = ? WHERE id = ?")) {
				pstm.setString(1, Wordpress.getTopicPostGuid(newInsertedId));
				pstm.setString(2, newInsertedId);
				pstm.setString(3, newInsertedId);
				pstm.executeUpdate();
			} catch (SQLException e) {				
				con.rollback();
				throw new MOFSQL500Exception("at ConvosServicee@createConvoReply/(update guid): " + e.getMessage(), e);
			}

			if (ALLOW_NOTIFICATIONS_BEFORE_APPROVE) {
				new NotificationService().notifyAboutConvoReply(receiverId, oauth.getUserId(), payload.getConvoId());
			}
			
			if (oauth.canPostWithoutPremoderation()) {
				try {
					WPPostJoinActivityModel wpPost = this.getWPPostJoinActivityByPostId(payload.getConvoId());
					final WPGroupModel group = this.getWPGroupByForumId(wpPost.getSecondaryItemId());
					try (final PreparedStatement pstm = con.prepareStatement("INSERT INTO wp_bp_activity (`user_id`, `component`, `type`, `action`, `content`, " + 
																										 "`primary_link`, `item_id`, `secondary_item_id`, `date_recorded`, `hide_sitewide`," +
																									 	 "`mptt_left`, `mptt_right`, `is_spam`) " + 
																									 	 "values (?, ?, ?, ?, ?," +
																									 	         "?, ?, ?, ?, 0," + 
																									 	         "0, 0, 0)")) {
						int i = 1;
						pstm.setString(i++, payload.getUserId());
						pstm.setString(i++, Wordpress.CONVO_BP_COMPONENT_TYPE);				
						pstm.setString(i++, Wordpress.CONVO_BP_REPLY_TOPIC_ACTIVITY_TYPE);				
						pstm.setString(i++, Wordpress.getWpBpActivityReplyActionByMember(oauth.getUsername(), oauth.getDisplayName(), wpPost.getPrimaryLink(), wpPost.getPostTitle(), Wordpress.getForumNameBySlug(group.getSlug()), group.getName()));
						pstm.setString(i++, payload.getText());
						
						pstm.setString(i++, wpPost.getPrimaryLink() + "#post-" + newInsertedId);
						pstm.setString(i++, newInsertedId);
						pstm.setString(i++, payload.getConvoId());
						pstm.setString(i++, nowString);
						
						pstm.executeUpdate();
						
					} catch (SQLException e) {
						con.rollback();
						throw new MOFSQL500Exception("at ConvosServicee@createConvoReply/2: " + e.getMessage());
					}
				} catch (NotFound404Exception e) {;}
			}
			
			con.commit();
			PostMetaService pms = new PostMetaService();
			pms.addPostmetaOnReply(newInsertedId, ipAddress, inResponseToPostId, payload.getConvoId(), forumId, payload.getConvoId());
			
			pms.changeReplyCounter(inResponseToPostId);
			
			new UserService().updateLatesActivityMetadata(payload.getUserId());
			//do not create empty counter
			new MailProxyService().newConvoReply(oauth.getUsername(), payload.getText());
			
			final FollowingsPayloadModel follow = new FollowingsPayloadModel();
			follow.setFollowerId(oauth.getUserId());
			follow.setFollowingId(payload.getConvoId());
			follow.setFollowingType(FollowingTypeEnum.CONVO.name());
			
			new FollowersService().followConvo(follow, false);
			
			return newInsertedId;
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosServicee@createConvoReply/3: " + e.getMessage(), e);
		}
	}
	
	//For testing issues
	public void deleteTopicstarter(final String postId) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();
			 PreparedStatement pstm = con.prepareStatement("delete from wp_posts where id = ?");) {
			pstm.setString(1, postId);
			pstm.executeUpdate();
			new PostMetaService().deletePostmeta(postId);
		} catch (Exception e) {
			throw new MOFSQL500Exception("at ConvosServicee@deleteTopicstarter/3: " + e.getMessage(), e);
		}
	}
	
	public ConvosWithoutResponsesModel getGroupsFeed(final int limit) throws MOFSQL500Exception {
		List<WPGroupModel> wpGroups = getWPGroups();
		return getGroupsFeed(wpGroups, limit);
	}
	
	public ConvosWithoutResponsesModel getGroupsFeed(final List<WPGroupModel> groups, final int limit) throws MOFSQL500Exception {		
		final String block = "select * from (select distinct u.user_login as username, u.id as user_id, u.last_name as last_name, u.first_name as first_name, ifnull(z.meta_value, 0) as total_members, g.name as group_name, g.id as group_id, " +
				"p.id, p.post_date_gmt as post_date, p.post_content as text, ifnull(x.meta_value, 0) as reply_counter, ifnull(y.meta_value, 0) as followers_count, srt.meta_value as srt_date " +
				"from wp_bp_groups g, wp_posts p left join wp_postmeta m on m.post_id = p.id " +
				"left join wp_users u on u.id = p.post_author " + 
				"left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_voice_count') y on y.post_id = p.id " + 
				"left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') x on x.post_id = p.id " +
				"left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_last_active_time') srt on srt.post_id = p.id," +
				"(select group_id, meta_value from wp_bp_groups_groupmeta where meta_key = 'total_member_count') z " +
				"where m.meta_key = '_bbp_forum_id' and p.post_status = 'publish' " + 
				"and g.id = ? and p.post_parent = ? and z.group_id = g.id order by srt_date limit ?) ";
		final StringBuilder sb = new StringBuilder();
		int i;
		for (i = 0; i < groups.size() - 1; i++) {
			sb.append(block).append("a" + String.valueOf(i)).append("\nunion \n");
		}
		sb.append(block).append("a" + String.valueOf(i));
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(sb.toString());) {
			i = 1;
			for (final WPGroupModel group: groups) {
				pstm.setString(i++, group.getId());
				pstm.setString(i++, group.getParentId());
				pstm.setInt(i++, limit);
			}
			
			try (final ResultSet rs = pstm.executeQuery();) {
				final ConvosWithoutResponsesModel out = new ConvosWithoutResponsesModel();
				buildFromResultSet(out, rs);
				return out;
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at ConvosServicee@getGroupsFeed: " + e.getMessage(), e);
		}
	}
	
	public void buildFromResultSet(final ConvosWithoutResponsesModel out, final ResultSet rs) throws SQLException {
		while (rs.next()) {
			final ConvoWithoutResponsesModel convo = new ConvoWithoutResponsesModel();
			convo.setId(rs.getString("id"));
			try {
				final String strdate = rs.getString("post_date");
				convo.setDate(TimeService.getMysqlTimestampFormat().parse(strdate));
			} catch (final SQLException | ParseException e) {
				convo.setDate(null);
			}
			try {
				final String strdate = rs.getString("srt_date");
				convo.setLastUpdate(TimeService.getMysqlTimestampFormat().parse(strdate));
			} catch (final SQLException | ParseException e) {				
				convo.setLastUpdate(convo.getDate());
			}
			final int followers = rs.getInt("followers_count");
			convo.setHasFollowers(followers > 0);
			convo.setHasResponded(rs.getInt("reply_counter") > 0);
			convo.setNumResponses(rs.getInt("reply_counter"));
			convo.setNumFollowers(followers);
			convo.setText(rs.getString("text"));
			
			final ShortGroupModel group = new ShortGroupModel();
			group.setId(rs.getString("group_id"));
			group.setName(rs.getString("group_name"));
			group.setTotalMembers(rs.getInt("total_members"));
			convo.setGroup(group);
			
			final ShortUserModel user = new ShortUserModel();
			user.setFirstName(rs.getString("first_name"));
			user.setLastName(rs.getString("last_name"));
			user.setId(rs.getString("user_id"));
			user.setUsername(rs.getString("username"));
			convo.setUser(user);
			out.getConvos().add(convo);
		}
	}
	
	public ConvosWithoutResponsesModel getLatestFeed() throws MOFSQL500Exception {
		return getLatestFeed(0);
	}
	
	public ConvosWithoutResponsesModel getLatestFeed(final int offset) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			final ConvosWithoutResponsesModel out = new ConvosWithoutResponsesModel();
			try (final PreparedStatement pstm = con.prepareStatement(
						 "select distinct u.user_login as username, u.id as user_id, u.last_name as last_name, u.first_name as first_name, ifnull(z.meta_value, 0) as total_members, g.name as group_name, g.id as group_id, " + 
						 "p.id, p.post_date_gmt as post_date, p.post_content as text, ifnull(x.meta_value, 0) as reply_counter, ifnull(y.meta_value, 0) as followers_count, srt.meta_value as srt_date " + 
						 "from wp_posts p, wp_postmeta m, wp_bp_groups_groupmeta gm, wp_bp_groups g, wp_users u, " + 
						 "(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_voice_count') y, " +
						 "(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') x, " +
						 "(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_last_active_time') srt, " +
						 "(select group_id, meta_value from wp_bp_groups_groupmeta where meta_key = 'total_member_count') z, " +
						 "moaf_group_to_forum mf " +
						 "where m.meta_key = '_bbp_forum_id' and p.post_status = 'publish' and srt.post_id = p.id " + 
						 "and m.post_id = p.id and mf.forum_id = m.meta_value and mf.group_id = g.id and g.id = gm.group_id and u.id = p.post_author and y.post_id = p.id and x.post_id = p.id and z.group_id = g.id " + 
						 "order by srt.meta_value desc limit ? offset ?");) {
				pstm.setInt(1, CONVOS_FEED_LIMIT + 1);
				pstm.setInt(2, CONVOS_FEED_LIMIT * offset);
				try (final ResultSet rs = pstm.executeQuery();) {										
					buildFromResultSet(out, rs);					
				}
				if (out.getConvos().size() > CONVOS_FEED_LIMIT) {
					out.setHasNext(true);
					out.getConvos().remove(CONVOS_FEED_LIMIT);
				} else {
					out.setHasNext(false);
				}
				return out;
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at ConvosServicee@deleteTopicstarter/3: " + e.getMessage(), e);
		}
	}
	
	public ConvosWithoutResponsesModel getGroupsConvosByGroupId(final String groupId, final int offset) throws MOFSQL500Exception {
		return getGroupsConvosByGroupId(groupId, offset, null);
	}
	
	public ConvosWithoutResponsesModel getGroupsConvosByGroupId(final String groupId, final int offset, final OAuthModel oauth) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			final ConvosWithoutResponsesModel out = new ConvosWithoutResponsesModel();
			try (final PreparedStatement pstm = con.prepareStatement(
					"select distinct u.user_login as username, u.id as user_id, u.last_name as last_name, u.first_name as first_name, ifnull(z.meta_value, 0) as total_members, g.name as group_name, g.id as group_id, " + 
					"p.id, p.post_date_gmt as post_date, p.post_content as text, ifnull(x.meta_value, 0) as reply_counter, ifnull(y.meta_value, 0) as followers_count, ifnull(srt.meta_value, '0000-00-00 00:00:00') as srt_date " + 
					"from wp_posts p, wp_postmeta m, wp_bp_groups_groupmeta gm, wp_bp_groups g, wp_users u, " + 
					"(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_voice_count') y, " +
					"(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') x, " +
					"(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_last_active_time') srt, " + 
					"(select group_id, meta_value from wp_bp_groups_groupmeta where meta_key = 'total_member_count') z, " +
					"moaf_group_to_forum mf " +
					"where g.id = ? and m.meta_key = '_bbp_forum_id' and p.post_type = 'topic' and p.post_status = 'publish' and srt.post_id = p.id " + 
					"and m.post_id = p.id and mf.forum_id = m.meta_value and mf.group_id = g.id and g.id = gm.group_id and u.id = p.post_author and y.post_id = p.id and x.post_id = p.id and z.group_id = g.id " + 
					"order by srt_date desc limit ? offset ?");) {
				pstm.setString(1, groupId);
				pstm.setInt(2, CONVOS_FEED_LIMIT + 1);
				pstm.setInt(3, CONVOS_FEED_LIMIT * offset);
				try (final ResultSet rs = pstm.executeQuery();) {										
					buildFromResultSet(out, rs);					
				}
				if (oauth != null) {
					final String[] cids = new FollowersService().getFollowedConvosArray(con, oauth.getUserId());			
					final Set<String> cidset = new HashSet<>(Arrays.asList(cids));
					if (!cidset.isEmpty()) {					
						for (final ConvoWithoutResponsesModel cnv: out.getConvos()) {
							cnv.setFollowing(cidset.contains(cnv.getId()));				
						}
					}
				}
				if (out.getConvos().size() > CONVOS_FEED_LIMIT) {
					out.setHasNext(true);
					out.getConvos().remove(CONVOS_FEED_LIMIT);
				} else {
					out.setHasNext(false);
				}
				return out;
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at ConvosServicee@getGroupsConvosByGroupId: " + e.getMessage(), e);
		}
	}
	
	public ConvosWithoutResponsesModel getUsersConvosByUserId(final String userId) throws MOFSQL500Exception {		
		try (final Connection con = DBManagerService.getConnection();) {
			final ConvosWithoutResponsesModel out = new ConvosWithoutResponsesModel();
			try (final PreparedStatement pstm = con.prepareStatement(
					"select distinct u.user_login as username, u.id as user_id, u.last_name as last_name, u.first_name as first_name, ifnull(z.meta_value, 0) as total_members, g.name as group_name, g.id as group_id, " + 
							"p.id, p.post_date_gmt as post_date, p.post_content as text, ifnull(x.meta_value, 0) as reply_counter, ifnull(y.meta_value, 0) as followers_count " + 
							"from wp_posts p, wp_postmeta m, wp_bp_groups_groupmeta gm, wp_bp_groups g, wp_users u, " + 
							"(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_voice_count') y, " +
							"(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') x, " +
							"(select group_id, meta_value from wp_bp_groups_groupmeta where meta_key = 'total_member_count') z, " +
							"(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_last_active_time') srt, " +							
							"moaf_group_to_forum mf " +
							"where p.post_author = ? and m.meta_key = '_bbp_forum_id' and p.post_status = 'publish' and srt.post_id = p.id " + 
							"and m.post_id = p.id and mf.forum_id = m.meta_value and mf.group_id = g.id and g.id = gm.group_id and u.id = p.post_author and y.post_id = p.id and x.post_id = p.id and z.group_id = g.id " + 
					"order by srt.meta_value desc limit ?");) {
				pstm.setString(1, userId);
				pstm.setInt(2, CONVOS_FEED_LIMIT);
				try (final ResultSet rs = pstm.executeQuery();) {										
					buildFromResultSet(out, rs);					
				}
			}
			final String[] cids = new FollowersService().getFollowedConvosArray(con, userId);	
			final Set<String> cidset = new HashSet<>(Arrays.asList(cids));
			if (!cidset.isEmpty()) {
				for (final ConvoWithoutResponsesModel cnv: out.getConvos()) {
					cnv.setFollowing(cidset.contains(cnv.getId()));				
				}
			}
			return out;
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at ConvosServicee@getUsersConvosByUserId: " + e.getMessage(), e);
		}
	}
	
	public ConvosWithoutResponsesModel feedFollowedAuthorized(final OAuthModel oauth) throws MOFSQL500Exception {
		return feedFollowedAuthorized(oauth, 0);
	}
	
	public ConvosWithoutResponsesModel feedFollowedAuthorized(final OAuthModel oauth, final int offset) throws MOFSQL500Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			String followedConvos = new FollowersService().getFollowedConvosUnserialized(con, oauth.getUserId());
			final ConvosWithoutResponsesModel out = new ConvosWithoutResponsesModel();
			//If nothing followed then return empty convo array
			if ("".equals(followedConvos)) {
				followedConvos = "-1";
			}
			//it is possible to use find_in_set, but still slower than two requests
			try (final PreparedStatement pstm = con.prepareStatement(
					"select sql_no_cache distinct u.user_login as username, u.id as user_id, u.last_name as last_name, u.first_name as first_name, ifnull(z.meta_value, 0) as total_members, g.name as group_name, g.id as group_id, " + 
							 "p.id, p.post_date_gmt as post_date, p.post_content as text, ifnull(x.meta_value, 0) as reply_counter, ifnull(y.meta_value, 0) as followers_count, ifnull(srt.meta_value, p.post_date_gmt + interval 6 hour) as srt_date " + 
							 "from wp_posts p left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_last_active_time') srt on srt.post_id = p.id," + 
							 "wp_postmeta m, wp_bp_groups_groupmeta gm, wp_bp_groups g, wp_users u, " + 
							 "(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_voice_count') y, " +
							 "(select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') x, " +
							 "(select group_id, meta_value from wp_bp_groups_groupmeta where meta_key = 'total_member_count') z, " +
							 "moaf_group_to_forum mf " +
							 "where m.meta_key = '_bbp_forum_id' and p.post_status = 'publish' and p.post_type = 'topic' " + 
							 "and m.post_id = p.id and mf.forum_id = m.meta_value and mf.group_id = g.id and g.id = gm.group_id and u.id = p.post_author and y.post_id = p.id and x.post_id = p.id and z.group_id = g.id " + 
						     " and (p.id in (?) or " + //1
						     	   "g.id in (select group_id from wp_bp_groups_members tmp1 where tmp1.user_id = ? and tmp1.is_confirmed = 1) or " + //2
						     	   "p.post_author in (select friend_user_id from wp_bp_friends f where f.initiator_user_id = ? and is_confirmed = 1 " + //3 
						 				   			 "union " + 
						 				   			 "select initiator_user_id from wp_bp_friends f where friend_user_id = ? and is_confirmed = 1)) " + //4
					"order by srt_date desc limit ? offset ?");) { //5,6
				pstm.setString(1, followedConvos);
				pstm.setString(2, oauth.getUserId());
				pstm.setString(3, oauth.getUserId());
				pstm.setString(4, oauth.getUserId());
				pstm.setInt(5, CONVOS_FEED_LIMIT + 1);
				pstm.setInt(6, CONVOS_FEED_LIMIT * offset);
				try (final ResultSet rs = pstm.executeQuery();) {										
					buildFromResultSet(out, rs);
				}
				final String[] cids = new FollowersService().getFollowedConvosArray(con, oauth.getUserId());			
				final Set<String> cidset = new HashSet<>(Arrays.asList(cids));
				if (!cidset.isEmpty()) {					
					for (final ConvoWithoutResponsesModel cnv: out.getConvos()) {
						cnv.setFollowing(cidset.contains(cnv.getId()));				
					}
				}
				if (out.getConvos().size() > CONVOS_FEED_LIMIT) {
					out.setHasNext(true);
					out.getConvos().remove(CONVOS_FEED_LIMIT);
				} else {
					out.setHasNext(false);
				}
				return out;
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at ConvosServicee@deleteTopicstarter/3: " + e.getMessage(), e);
		}
	}
	
	/**
	 * Union user counter to make one request
	 * @param userId
	 * @return
	 * @throws MOFSQL500Exception
	 * @throws NotFound404Exception
	 */
	public ConvosWithoutResponsesModel getUsersConvos(final String userId, final int offset, final OAuthModel oauth) throws MOFSQL500Exception, NotFound404Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement(
					 "select count(*) as counter, null as username, null as user_id, null as last_name, null as first_name, null as total_members, null as group_name, null as group_id, " + 
					 "null as id, null as post_date, null as text, null as reply_counter, null as followers_count, null as srt_date " +
					 "from wp_users where id = ? " +
					 "union " + 
					 "select * from ("+
					 "select null, u.user_login as username, u.id as user_id, u.last_name as last_name, u.first_name as first_name, ifnull(z.meta_value, 0) as total_members, g.name as group_name, g.id as group_id, " + 
					 "p.id, p.post_date_gmt as post_date, p.post_content as text, ifnull(x.meta_value, 0) as reply_counter, ifnull(y.meta_value, 0) as followers_count, ifnull(srt.meta_value, p.post_date) as srt_date " +
					 "from wp_posts p left join wp_postmeta m on m.post_id = p.id " +
					 "left join wp_bp_groups_groupmeta gm on gm.meta_value = concat('a:1:{i:0;i:',m.meta_value,';}') " +
					 "left join wp_bp_groups g on g.id = gm.group_id " +
					 "left join wp_users u on u.id = p.post_author " +
					 "left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_voice_count') y on y.post_id = p.id " +
					 "left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_reply_count') x on x.post_id = p.id " +
					 "left join (select group_id, meta_value from wp_bp_groups_groupmeta where meta_key = 'total_member_count') z on z.group_id = g.id " +
					 "left join (select post_id, meta_value from wp_postmeta where meta_key = '_bbp_last_active_time') srt on srt.post_id = p.id " + 
					 "where p.post_author = ? and m.meta_key = '_bbp_forum_id' " + 
					 "and p.post_status = 'publish' " +
					 "order by srt_date desc limit ? offset ?) tmp where tmp.group_id is not null");) {
			pstm.setString(1, userId);
			pstm.setString(2, userId);
			pstm.setInt(3, CONVOS_FEED_LIMIT + 1);
			pstm.setInt(4, CONVOS_FEED_LIMIT * offset);
			
			try (final ResultSet rs = pstm.executeQuery();) {
				rs.next();
				final int userExists = rs.getInt("counter");
				if (userExists == 0) {
					throw new NotFound404Exception("user with specified id was not found");
				}
				final ConvosWithoutResponsesModel out = new ConvosWithoutResponsesModel();
				buildFromResultSet(out, rs);
				if (oauth != null) {
					final String[] cids = new FollowersService().getFollowedConvosArray(con, oauth.getUserId());			
					final Set<String> cidset = new HashSet<>(Arrays.asList(cids));
					if (!cidset.isEmpty()) {					
						for (final ConvoWithoutResponsesModel cnv: out.getConvos()) {
							cnv.setFollowing(cidset.contains(cnv.getId()));				
						}
					}
				}
				if (out.getConvos().size() > CONVOS_FEED_LIMIT) {
					out.setHasNext(true);
					out.getConvos().remove(CONVOS_FEED_LIMIT);
				} else {
					out.setHasNext(false);
				}
				return out;
			}
		} catch (SQLException e) {
			throw new MOFSQL500Exception("at ConvosServicee@deleteTopicstarter/3: " + e.getMessage(), e);
		}
	}
	
}































