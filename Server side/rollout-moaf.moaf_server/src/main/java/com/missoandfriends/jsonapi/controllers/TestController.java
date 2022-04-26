package com.missoandfriends.jsonapi.controllers;

import java.util.Date;
import java.util.Set;

import javax.ws.rs.core.Response;

import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;
import com.missoandfriends.jsonapi.models.wp.WPGroupModel;
import com.missoandfriends.jsonapi.models.wp.WPNotificationModel;
import com.missoandfriends.jsonapi.models.wp.WPPostJoinActivityModel;
import com.missoandfriends.jsonapi.services.AdminService;
import com.missoandfriends.jsonapi.services.ConvosService;
import com.missoandfriends.jsonapi.services.GroupsService;
import com.missoandfriends.jsonapi.services.GsonFactory;
import com.missoandfriends.jsonapi.services.NotificationService;
import com.missoandfriends.jsonapi.services.UserService;

public class TestController {
	
	public Response getWPGroup(final String forumId) throws MOFSQL500Exception, NotFound404Exception {
		ConvosService c = new ConvosService();
		final WPGroupModel wg = c.getWPGroupByForumId(forumId);
		return Response.ok(GsonFactory.getGson().toJson(wg)).build();
	}
	
	public Response getWPActionPost(final String convoId) throws MOFSQL500Exception, NotFound404Exception {
		ConvosService c = new ConvosService();
		final WPPostJoinActivityModel pja = c.getWPPostJoinActivityByPostId(convoId);
		return Response.ok(GsonFactory.getGson().toJson(pja)).build();
	}
	
	public Response getGroupMembership(final String userId) throws MOFSQL500Exception {
		GroupsService gs = new GroupsService();
		final Set<Integer> gids = gs.findAllUserGroups(userId);
		return Response.ok(GsonFactory.getGson().toJson(gids)).build();
	}
	
	public Response createDummyConvoReplyNotification() throws MOFSQL500Exception {
		WPNotificationModel model = new WPNotificationModel.WPNotificationBuilder()
				.asConvoReply()
				.withDateNotified(new Date())
				.withItemId("1000000")
				.withSecondayItemId("2000000")
				.withUserId("646373")
				.build();
		NotificationService ns = new NotificationService();
		final String newId = ns.createNewNotification(model);
		return Response.ok(GsonFactory.getGson().toJson(new GenericResponseModel(200, newId))).build();
	}
	
	public Response createDummyConvoReplyNotification(final OAuthModel oauth) throws MOFSQL500Exception {
		WPNotificationModel model = new WPNotificationModel.WPNotificationBuilder()
				.asConvoReply()
				.withDateNotified(new Date())
				.withItemId("1000000")
				.withSecondayItemId("2000000")
				.withUserId(oauth.getUserId())
				.build();
		NotificationService ns = new NotificationService();
		final String newId = ns.createNewNotification(model);
		return Response.ok(GsonFactory.getGson().toJson(new GenericResponseModel(200, newId))).build();
	}
	
	public Response deleteNotification(final String id) throws MOFSQL500Exception, NotFound404Exception {
		NotificationService ns = new NotificationService();
		ns.deleteNotification(id);
		return Response.ok(GsonFactory.getGson().toJson(new GenericResponseModel(200, "true"))).build();
	}
	
	public Response setUnreadNotification(final String id) throws Exception {
		NotificationService ns = new NotificationService();
		ns.setAsUnreadNotification(id);
		return Response.ok(GsonFactory.getGson().toJson(new GenericResponseModel(200, "true"))).build();
	}
	
	public Response deleteTopicstarter(final String postId) throws MOFSQL500Exception {
		ConvosService cs = new ConvosService();
		cs.deleteTopicstarter(postId);
		return Response.ok(RestAPIController.OK_RESULT).build();
	}
	
	public Response deleteUser(final String userId) throws MOFSQL500Exception {
		UserService us = new UserService();
		us.deleteUser(userId);
		return Response.ok(RestAPIController.OK_RESULT).build();
	}
	
	public Response getAdminEmail() throws MOFSQL500Exception {
		return Response.ok(GsonFactory.getGson().toJson(new AdminService().getAdminEmails())).build();
	}
}
