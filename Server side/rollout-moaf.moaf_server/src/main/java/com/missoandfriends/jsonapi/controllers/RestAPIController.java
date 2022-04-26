package com.missoandfriends.jsonapi.controllers;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.ws.rs.core.Response;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.eclipse.jetty.http.HttpStatus;

import com.google.gson.Gson;
import com.google.gson.stream.MalformedJsonException;
import com.missoandfriends.jsonapi.exceptions.Conflict409Exception;
import com.missoandfriends.jsonapi.exceptions.Forbidden403Exception;
import com.missoandfriends.jsonapi.exceptions.GeneralServer500Exception;
import com.missoandfriends.jsonapi.exceptions.Gone410Exception;
import com.missoandfriends.jsonapi.exceptions.MOFSQL500Exception;
import com.missoandfriends.jsonapi.exceptions.NotFound404Exception;
import com.missoandfriends.jsonapi.exceptions.PayloadTooLarge413Exception;
import com.missoandfriends.jsonapi.exceptions.UnauthorizedException;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.ConvoUrlModel;
import com.missoandfriends.jsonapi.models.ConvoWithResponsesModel;
import com.missoandfriends.jsonapi.models.ConvosWithoutResponsesModel;
import com.missoandfriends.jsonapi.models.CreateUserModel;
import com.missoandfriends.jsonapi.models.EmailModel;
import com.missoandfriends.jsonapi.models.FollowingsModel;
import com.missoandfriends.jsonapi.models.FriendsModel;
import com.missoandfriends.jsonapi.models.FriendshipRequestNotificationsModel;
import com.missoandfriends.jsonapi.models.GroupArrayModel;
import com.missoandfriends.jsonapi.models.GroupModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModel;
import com.missoandfriends.jsonapi.models.LoginModel;
import com.missoandfriends.jsonapi.models.NotificationsModel;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.ResetPasswordModel;
import com.missoandfriends.jsonapi.models.enums.FollowingTypeEnum;
import com.missoandfriends.jsonapi.models.payloads.ChangePasswordPayloadModel;
import com.missoandfriends.jsonapi.models.payloads.ConvoPayloadModel;
import com.missoandfriends.jsonapi.models.payloads.ConvoReplyPayloadModel;
import com.missoandfriends.jsonapi.models.payloads.FollowingsPayloadModel;
import com.missoandfriends.jsonapi.models.payloads.NotificationIdsModel;
import com.missoandfriends.jsonapi.models.responses.GenericResponseModel;
import com.missoandfriends.jsonapi.services.AuthenticationService;
import com.missoandfriends.jsonapi.services.ConvosService;
import com.missoandfriends.jsonapi.services.DBManagerService;
import com.missoandfriends.jsonapi.services.FileUploadService;
import com.missoandfriends.jsonapi.services.FollowersService;
import com.missoandfriends.jsonapi.services.FriendsService;
import com.missoandfriends.jsonapi.services.GroupsService;
import com.missoandfriends.jsonapi.services.GsonFactory;
import com.missoandfriends.jsonapi.services.ModelValidationService;
import com.missoandfriends.jsonapi.services.NotificationService;
import com.missoandfriends.jsonapi.services.OAuthService;
import com.missoandfriends.jsonapi.services.TextBlocksService;
import com.missoandfriends.jsonapi.services.TimeService;
import com.missoandfriends.jsonapi.services.UserService;

public class RestAPIController {
	
	public static final String OK_MESSAGE = "OK";
	public static final String OK_RESULT = GsonFactory.getGson().toJson(new GenericResponseModel(HttpStatus.OK_200, OK_MESSAGE)); 
	
	public Response time() throws Exception {
		try (final Connection con = DBManagerService.getConnection();
			 final PreparedStatement pstm = con.prepareStatement("select utc_timestamp()");
			 final ResultSet rs = pstm.executeQuery();) {
			rs.next();
			final String time = rs.getString(1);
			final Date date = TimeService.getMysqlTimestampFormat().parse(time);
			final Date local = new Date();
			final Map<String, String> map = new HashMap<>();
			map.put("utc_string", time);
			map.put("utc_parsed", date.toGMTString());
			map.put("local", local.toGMTString());
			return Response.ok(GsonFactory.getGson().toJson(map)).build();
		}
	}
	
	public Response login(final String login) throws MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException {		
		final Gson gson = GsonFactory.getGson();
		LoginModel lmod = gson.fromJson(login, LoginModel.class);
		
		ModelValidationService.validate(lmod);
		
		final LoggedInUserModel out = new AuthenticationService().getLoggedInUser(lmod.getUsername(), lmod.getPassword());
		final String token = out.getOauth().getToken();
		return Response.ok(gson.toJson(out)).header("authorization", token).build();
	}
	
	public Response logout(final OAuthModel oauth) throws Forbidden403Exception {
		final boolean logout = new OAuthService().logout(oauth);
		if (!logout) {
			throw new Forbidden403Exception();
		}
		return Response.ok(OK_RESULT).build();
	}
	
	/**
	 * 1. Create temp key
	 * 2. Send email with notification
	 * @param changePassword
	 * @return
	 */
	public Response forgotPassword(final String email) throws MalformedJsonException, ValidationException, MOFSQL500Exception, NotFound404Exception {	
		final Gson gson = GsonFactory.getGson();
		EmailModel model = gson.fromJson(email, EmailModel.class);
		
		ModelValidationService.validate(model);
		
		final GenericResponseModel resp = new AuthenticationService().forgotPassword(model);
		return Response.ok(gson.toJson(resp)).build();
	}
	
	public Response resetPassword(final String reset) throws Gone410Exception, MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException {	
		final Gson gson = GsonFactory.getGson();
		ResetPasswordModel model = gson.fromJson(reset, ResetPasswordModel.class);
		
		ModelValidationService.validate(model);
		if (model.resetKeyExpired()) {
			throw new Gone410Exception("reset_link has expired");
		}
		
		final GenericResponseModel resp = new AuthenticationService().resetPassword(model);
		return Response.ok(gson.toJson(resp)).build();
	}
	
	public Response postConvo(OAuthModel oauth, final String json, final String ipAddress) throws Forbidden403Exception, MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException {
		final Gson gson = GsonFactory.getGson();
		
		ConvoPayloadModel model = gson.fromJson(json, ConvoPayloadModel.class);
		ModelValidationService.validate(model);
		
		/*
		if (!(oauth.isAdmin() || model.getUserId().equals(oauth.getUserId()))) {
			throw new Forbidden403Exception();
		}
		*/
		
		String id = new ConvosService().createConvo(oauth, model, ipAddress);
		
		return Response.ok(gson.toJson(new GenericResponseModel(HttpStatus.OK_200, id))).build();
	}
	
	public Response postConvoReply(OAuthModel oauth, final String inResponseToPostId, final String json, final String ipAddress) throws Forbidden403Exception, MalformedJsonException, NotFound404Exception, ValidationException, MOFSQL500Exception, UnauthorizedException {
		final Gson gson = GsonFactory.getGson();
		
		ConvoReplyPayloadModel model = gson.fromJson(json, ConvoReplyPayloadModel.class);
		ModelValidationService.validate(model);
		
		/*
		if (!(oauth.isAdmin() || model.getUserId().equals(oauth.getUserId()))) {
			throw new Forbidden403Exception();
		}
		*/
		
		String id = new ConvosService().createConvoReply(oauth, inResponseToPostId,  model, ipAddress);
		
		return Response.ok(gson.toJson(new GenericResponseModel(HttpStatus.OK_200, id))).build();
	}
	
	public Response getConvosById(final String id) throws NotFound404Exception, MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException {
		return getConvosById(id, null);
	}
	
	public Response getConvosById(final String id, final OAuthModel oauth) throws NotFound404Exception, MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException {
		final Gson gson = GsonFactory.getGson();
		final ConvoWithResponsesModel convo = new ConvosService().getConvoById(id, oauth);
		return Response.ok(gson.toJson(convo)).build();
	}
	
	public Response getConvoUrl(final String id) throws NotFound404Exception, MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException  {
		final ConvoUrlModel model = new ConvosService().getConvoUrl(id);
		return Response.ok(GsonFactory.getGson().toJson(model, ConvoUrlModel.class)).build();
	}
	
	public Response getGroups() throws MOFSQL500Exception, GeneralServer500Exception {
		final GroupArrayModel groups = new GroupsService().getAllGroups();
		return Response.ok(GsonFactory.getGson().toJson(groups)).build();
	}
	
	public Response getGroups(final OAuthModel oauth) throws MOFSQL500Exception, GeneralServer500Exception {
		final GroupArrayModel groups = new GroupsService().getAllGroups(oauth);
		return Response.ok(GsonFactory.getGson().toJson(groups)).build();
	}
	
	public Response getGroupById(final String id) throws MOFSQL500Exception, GeneralServer500Exception, NotFound404Exception {
		final GroupModel group = new GroupsService().getGroupById(id);
		return Response.ok(GsonFactory.getGson().toJson(group)).build();
	}
	
	public Response getFollowers(final String followerId, final String followingType) throws MOFSQL500Exception, ValidationException {
		FollowersService fs = new FollowersService();
		final FollowingsModel fm = fs.getFollowers(followingType, followerId);
		return Response.ok(GsonFactory.getGson().toJson(fm)).build();
	}
	
	public Response createFollowing(final OAuthModel oauth, final String json) throws Forbidden403Exception, GeneralServer500Exception, NotFound404Exception, MalformedJsonException, ValidationException, MOFSQL500Exception, UnauthorizedException {
		final FollowingsPayloadModel model = GsonFactory.getGson().fromJson(json, FollowingsPayloadModel.class);
		ModelValidationService.validate(model);
		if (!model.getFollowerId().equals(oauth.getUserId())) {
			throw new Forbidden403Exception();
		}
		new FollowersService().createFollowing(model);
		
		return Response.ok(OK_RESULT).build();
	}
	
	public Response deleteFollowing(final OAuthModel oauth, final String followerId, final String followingId, final String followingType) 
			throws Forbidden403Exception, ValidationException, NotFound404Exception, MOFSQL500Exception {
		if (!followerId.equals(oauth.getUserId())) {
			throw new Forbidden403Exception();
		}
		final FollowingTypeEnum type = FollowingTypeEnum.fromString(followingType);
		new FollowersService().deleteFollowing(followerId, followingId, type);
		return Response.ok(OK_RESULT).build();
	}
	
	public Response getUserNotifications(final OAuthModel oauth) throws MOFSQL500Exception {
		final NotificationService ns = new NotificationService();
		final NotificationsModel out = ns.getUserNotification(oauth);
		return Response.ok(GsonFactory.getGson().toJson(out)).build();
	}
	
	public Response deleteUserNotification(final OAuthModel oauth, final String notificationId) throws MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		final NotificationService ns = new NotificationService();
		ns.deleteNotification(oauth, notificationId);
		return Response.ok(OK_RESULT).build();
	}
	
	public Response readManyUserNotifications(final OAuthModel oauth, final String json) throws ValidationException, MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		final NotificationIdsModel ids = GsonFactory.getGson().fromJson(json, NotificationIdsModel.class);
		ModelValidationService.validate(ids);
		final NotificationService ns = new NotificationService();
		ns.setAsReadNotifications(oauth, ids.getNotificationIds());
		return Response.ok(OK_RESULT).build();
	}
	
	public Response readUserNotification(final OAuthModel oauth, final String notificationId) throws MOFSQL500Exception, Gone410Exception, Forbidden403Exception {
		final NotificationService ns = new NotificationService();
		ns.setAsReadNotification(oauth, notificationId);
		return Response.ok(OK_RESULT).build();
	}
	
	public Response getUser(final String id, OAuthModel oauth) throws Forbidden403Exception, NotFound404Exception, MOFSQL500Exception {
		final UserService us = new UserService();
		final LoggedInUserModel model = us.getUser(id, oauth);
		return Response.ok(GsonFactory.getGson().toJson(model)).build();
	}
	
	public Response getUser(final String id) throws Forbidden403Exception, NotFound404Exception, MOFSQL500Exception {
		return getUser(id, null);
	}
	
	public Response createUser(final CreateUserModel model) throws ValidationException, MOFSQL500Exception, Forbidden403Exception, Conflict409Exception, GeneralServer500Exception {
		final UserService us = new UserService();
		ModelValidationService.validate(model);
		//Because there is no distinction on wordpress website between parent email and
		//user email, user email should be set to parent email
		if (!StringUtils.isBlank(model.getParentEmail())) {
			model.setEmail(model.getParentEmail());
		}
		us.createUser(model);
		return Response.ok(OK_RESULT).build();
	}
	
	public Response modifyUser(final OAuthModel oauth, LoggedInUserModel model, final InputStream fis)
			throws ValidationException, MOFSQL500Exception, Forbidden403Exception, NotFound404Exception, GeneralServer500Exception, PayloadTooLarge413Exception {
		ModelValidationService.validate(model);
		final UserService us = new UserService();

		if (fis != null) {
			final String filename = new FileUploadService().uploadImage(oauth.getUserId(), fis);			
			model.setPhotoUrl(filename);
			us.deleteUserAvatarChoice(oauth.getUserId());
		}
		
		us.changeUser(model);
		final LoggedInUserModel user = us.getUser(oauth.getUserId(), oauth);
		return Response.ok(GsonFactory.getGson().toJson(user)).build();
	}
	
	public Response changePassword(final OAuthModel oauth, final String json, final String userId) throws MOFSQL500Exception, ValidationException, NotFound404Exception, Forbidden403Exception {
		if (!oauth.getUserId().equals(userId)) {
			throw new Forbidden403Exception();
		}
		final Gson gson = GsonFactory.getGson();		
		ChangePasswordPayloadModel model = gson.fromJson(json, ChangePasswordPayloadModel.class);
		
		System.out.println(ToStringBuilder.reflectionToString(model));
		
		new UserService().changeUserPassword(model, userId);
		return Response.ok(OK_RESULT).build();
	}
	
	public Response getUsersConvos(final String userId, final int offset) throws MOFSQL500Exception, NotFound404Exception {
		return getUsersConvos(userId, offset, null);
	}
	
	public Response getUsersConvos(final String userId, final int offset, OAuthModel oauth) throws MOFSQL500Exception, NotFound404Exception {
		final Gson gson = GsonFactory.getGson();
		final ConvosWithoutResponsesModel model = new ConvosService().getUsersConvos(userId, offset, oauth);
		return Response.ok(gson.toJson(model)).build();
	}
	
	public Response getUnauthorizedFeed(final int offset) throws MOFSQL500Exception {
		final Gson gson = GsonFactory.getGson();
		final ConvosWithoutResponsesModel model = new ConvosService().getLatestFeed(offset);
		return Response.ok(gson.toJson(model)).build();
	}
	
	public Response getAuthorizedFeed(final OAuthModel oauth, final int offset) throws MOFSQL500Exception {
		final Gson gson = GsonFactory.getGson();
		final ConvosWithoutResponsesModel model = new ConvosService().feedFollowedAuthorized(oauth, offset);
		return Response.ok(gson.toJson(model)).build();
	}
	
	public Response getGroupsConvosById(final String groupId, final int offset) throws MOFSQL500Exception {
		final Gson gson = GsonFactory.getGson();
		final ConvosWithoutResponsesModel model = new ConvosService().getGroupsConvosByGroupId(groupId, offset);
		return Response.ok(gson.toJson(model)).build();
	}
	
	public Response getGroupsConvosById(final String groupId, final int offset, OAuthModel oauth) throws MOFSQL500Exception {
		final Gson gson = GsonFactory.getGson();
		final ConvosWithoutResponsesModel model = new ConvosService().getGroupsConvosByGroupId(groupId, offset, oauth);
		return Response.ok(gson.toJson(model)).build();
	}
	
	public Response getUsersConvosById(final String userId) throws MOFSQL500Exception {
		final Gson gson = GsonFactory.getGson();
		final ConvosWithoutResponsesModel model = new ConvosService().getUsersConvosByUserId(userId);
		return Response.ok(gson.toJson(model)).build();
	}
	
	public Response getTextBlocks () throws MOFSQL500Exception {
		final Gson gson = GsonFactory.getGson();
		final Map<String, String> texts = new TextBlocksService().getTextBlocks();
		return Response.ok(gson.toJson(texts)).build();
	}
	
	public Response getUserFriendshipNotifications(final OAuthModel oauth) throws MOFSQL500Exception {
		final String userId = oauth.getUserId();
		final FriendshipRequestNotificationsModel model = new NotificationService().getFriendshipRequests(userId);
		return Response.ok(GsonFactory.getGson().toJson(model)).build();
	}
	
	public Response processFriendship(final String notificationId, final OAuthModel oauth, NotificationService.FriendshipAction action) throws MOFSQL500Exception, NotFound404Exception, Forbidden403Exception, GeneralServer500Exception {
		final String userId = oauth.getUserId();
		new NotificationService().processFriendship(notificationId, userId, action == NotificationService.FriendshipAction.ACCEPT);
		return Response.ok(OK_RESULT).build();
	}
	
	public Response getFriends(final OAuthModel oauth, final String convoId) throws MOFSQL500Exception {
		FriendsModel out;
		final FriendsService service = new FriendsService();
		if ("0".equals(convoId)) {
			out = service.getListOfAssociatedUsers(oauth.getUserId());
		} else {
			out = service.getListOfAssociatedUsers(oauth.getUserId(), convoId);
		}
		return Response.ok(GsonFactory.getGson().toJson(out)).build();
	}
	
	public Response emailExists(final String email) throws MOFSQL500Exception {
		final boolean exists = new UserService().emailExists(email);
		return Response.ok("{ \"exists\": " + exists + " }").build();
	}
	
	public Response usernameExists(final String username) throws MOFSQL500Exception {
		final boolean exists = new UserService().usernameExists(username);
		return Response.ok("{ \"exists\": " + exists + " }").build();
	}
}


























