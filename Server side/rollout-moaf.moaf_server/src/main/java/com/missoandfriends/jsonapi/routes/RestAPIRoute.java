package com.missoandfriends.jsonapi.routes;

import java.io.InputStream;
import java.util.Date;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.DefaultValue;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import org.apache.commons.lang3.StringUtils;
import org.glassfish.jersey.media.multipart.FormDataBodyPart;
import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import com.missoandfriends.jsonapi.controllers.RestAPIController;
import com.missoandfriends.jsonapi.controllers.filters.EntryFilter;
import com.missoandfriends.jsonapi.controllers.filters.SecureOAuth;
import com.missoandfriends.jsonapi.controllers.filters.SecureOAuthFilter;
import com.missoandfriends.jsonapi.exceptions.Forbidden403Exception;
import com.missoandfriends.jsonapi.exceptions.ValidationException;
import com.missoandfriends.jsonapi.models.CountryModel;
import com.missoandfriends.jsonapi.models.CreateUserModel;
import com.missoandfriends.jsonapi.models.LoggedInUserModel;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.StateModel;
import com.missoandfriends.jsonapi.services.GsonFactory;
import com.missoandfriends.jsonapi.services.NotificationService;
import com.missoandfriends.jsonapi.services.UserService;

@Path("/api/v1/")
public class RestAPIRoute {
	
	@Context
	private ContainerRequestContext configuration;
	
	@GET
	@Path("phpass")
	public Response phpass() throws Exception {
		System.out.println(new UserService().checkPassTemp("MTtHHz/TQPKYy5WkyJk3mM9an/Uz88xSAljJWT+buyT0ZOVWYLieG+lCYijXxjB+QPtGJLV3k1yRG4zi3LM5alCzLAecXQRPDtWw1+S/tQw9e6jGzrY=", "VBe8cx9/h0A71k6RIKsBNva9L5KvW7tKtPhAYTaJR9oDR1UANxA30M1jRq7t+zc4p4pg0WIjNdWcC+oGY8UAHFswYIeNRB+W4iuW+2HAoPPTBRO79xk="));
		return Response.ok().build();
	}
	
	@GET
	@Path("testtest")
	public Response models() throws Exception {
		final UserService s = new UserService();
		CreateUserModel model = new CreateUserModel();
		model.setBirthDate(new Date());
		model.setCountry(new CountryModel("USA", "United States"));
		model.setEmail("sypachev_s_s+1024@mail.ru");
		model.setFirstName("test+1024");		
		model.setPassword("qwerty");
		model.setUsername("SomeUsername+1024");
		final StateModel sm = new StateModel();
		sm.setAbbreviation("IN");
		sm.setName("Indiana");
		model.setState(sm);
		final String x = s.submitForm(model);
		return Response.ok(x).build();
	}
	
	@GET
	@Path("/time")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response testTime() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.time();
	}
	
	@POST
	@Path("login")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response login(@DefaultValue("") final String login) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.login(login);
	}
	
	@Path("logout")
	@POST
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response logout() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel model = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.logout(model);
	}
	
	@POST
	@Path("password/forgot")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response passwordForgot(@DefaultValue("") final String email) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.forgotPassword(email);
	}
	
	@POST
	@Path("password/reset")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response passwordReset(@DefaultValue("") final String reset) throws Exception {
		final RestAPIController ctrl = new RestAPIController();
		return ctrl.resetPassword(reset);
	}
	
	@GET
	@Path("nop")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response nop() {
		OAuthModel model = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return Response.ok(GsonFactory.getGson().toJson(model)).build();
	}
	
	@GET
	@Path("semi")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response semi() {
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		if (wasAuthorized) {
			return Response.ok("{\"result\":\"private\"}").build();
		} else {
			return Response.ok("{\"result\":\"public\"}").build();
		}
	}
	
// CONVOS ===================================================================== 
	@POST
	@Path("convos")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response convosConvos(final String json) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		final String ipAddress = (String) configuration.getProperty(EntryFilter.REMOTE_IP_ADDRESS);
		return ctrl.postConvo(oauth, json, ipAddress);
	}
	
	@GET
	@Path("convos/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response convosConvosId(@PathParam("id") String id) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		if (wasAuthorized) {
			OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
			return ctrl.getConvosById(id, oauth);
		} else {
			return ctrl.getConvosById(id);
		}
	}
	
	@GET
	@Path("convos/{id}/url")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getConvoUrl(@PathParam("id") String id) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.getConvoUrl(id);
	}
	
	/***
	 * 
	 * @param id - in response to
	 * @param json {convo_id - topic id}
	 * @return
	 * @throws Exception
	 */
	@POST
	@Path("convos/{id}/responses")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response convosConvosIdResponse(@PathParam("id") String id, final String json) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		final String ipAddress = (String) configuration.getProperty(EntryFilter.REMOTE_IP_ADDRESS);
		return ctrl.postConvoReply(oauth, id, json, ipAddress);
	}
	
	@GET
	@Path("convos/groups/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response convosConvosGroupsId(@PathParam("id") String id, @DefaultValue("0") @QueryParam("offset") final int offset) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		if (wasAuthorized) {
			OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
			return ctrl.getGroupsConvosById(id, offset, oauth);
		} else {
			return ctrl.getGroupsConvosById(id, offset);
		}
	}
	
	@GET
	@Path("convos/users/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response convosConvosUsersId(@PathParam("id") String id, @DefaultValue("0") @QueryParam("offset") final int offset) throws Exception {		
		RestAPIController ctrl = new RestAPIController();
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		if (wasAuthorized) {
			OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
			return ctrl.getUsersConvos(id, offset, oauth);
		} else {
			return ctrl.getUsersConvos(id, offset);
		}		
	}
	
	/* SAME as feed
	@GET
	@Path("feed")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response convosFeed() throws Exception {
		throw new NotImplementedException();
	}
	*/
// CONVOS END =================================================================
// GROUPS =====================================================================
	
	@GET
	@Path("groups")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response getAllGroups() throws Exception {
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		if (wasAuthorized) {
			OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
			return new RestAPIController().getGroups(oauth);
		} else {
			return new RestAPIController().getGroups();
		}
	}
	
	@GET
	@Path("groups/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getGroupById(@PathParam("id") final String id) throws Exception {
		return new RestAPIController().getGroupById(id);
	}
// GROUP END ==================================================================
// FOLLOWINGS =================================================================
	
	@GET
	@Path("followings")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getFollowings(@QueryParam("follower_id") final String followerId, 
								  @QueryParam("following_type") @DefaultValue("") final String followingType) 
		throws Exception {
		if (StringUtils.isBlank(followerId)) {
			throw new ValidationException("follower_id query parameter required");
		}
		return new RestAPIController().getFollowers(followerId, followingType);
	}
	
	@POST
	@Path("followings")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response createFollowings(final String json) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.createFollowing(oauth, json);
	}
	
	@DELETE
	@Path("followings")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response deleteFollowings(@QueryParam("follower_id") final String followerId,
									 @QueryParam("following_id") final String followingId,
									 @QueryParam("following_type") final String followingType) throws Exception {
		final StringBuilder sb = new StringBuilder();
		boolean errorFound = false;
		if (StringUtils.isBlank(followerId)) {
			sb.append("follower_id query parameter required. ");
			errorFound = true;
		}
		if (StringUtils.isBlank(followingId)) {
			sb.append("following_id query parameter required. ");
			errorFound = true;
		}
		if (StringUtils.isBlank(followingType)) {
			sb.append("following_type query parameter required");
			errorFound = true;
		}
		if (errorFound) {
			throw new ValidationException(sb.toString());
		}
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.deleteFollowing(oauth, followerId, followingId, followingType);
	}
	
// NOTIFICATIONS ==============================================================
	
	@GET
	@Path("notifications")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response getUserNotifications() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.getUserNotifications(oauth);
	}
	
	@DELETE
	@Path("notifications/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response deleteUserNotifications(@PathParam("id") final String id) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.deleteUserNotification(oauth, id);
	}
	
	@PUT
	@Path("notifications/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response readUserNotifications(@PathParam("id") final String id) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.readUserNotification(oauth, id);
	}
	
	@PUT
	@Path("notifications")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response readManyUserNotifications(final String json) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.readManyUserNotifications(oauth, json);
	}
	
// USERS ======================================================================
	
	@PUT
	@Path("users/{id}")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response modifyUser(@FormDataParam("photo") final InputStream fileInputStream,
							   @FormDataParam("photo") final FormDataContentDisposition header,
							   @FormDataParam("photo") final FormDataBodyPart bodypart,
							   @DefaultValue("") @FormDataParam("birth_date") 	final FormDataBodyPart birthDate,
							   @DefaultValue("") @FormDataParam("_id") 			final FormDataBodyPart idUnd,
							   @DefaultValue("") @FormDataParam("country") 		final FormDataBodyPart country,
							   @DefaultValue("") @FormDataParam("email") 		final FormDataBodyPart email,
							   @DefaultValue("") @FormDataParam("name_first") 	final FormDataBodyPart nameFirst,
							   @DefaultValue("") @FormDataParam("name_last") 	final FormDataBodyPart nameLast,
							   @DefaultValue("") @FormDataParam("state") 		final FormDataBodyPart state,
							   @DefaultValue("") @FormDataParam("username") 	final FormDataBodyPart username,
							   @DefaultValue("") @FormDataParam("photo_url") 	final FormDataBodyPart photoUrl,
							   @PathParam("id") final String id, final String json) throws Exception {
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		if (!id.equals(oauth.getUserId())) {
			throw new Forbidden403Exception();
		}
		final LoggedInUserModel user = new LoggedInUserModel.LoggedInUserModelBuilder()
				.withId(oauth.getUserId())
				.withBirthDate(birthDate)
				.withCountry(country)
				.withEmail(email)
				.withFirstName(nameFirst)
				.withLastName(nameLast)	
				.withState(state)
				.withUsername(username)
				.build();
		
		RestAPIController ctrl = new RestAPIController();
		return ctrl.modifyUser(oauth, user, fileInputStream);
	}
	
	@POST
	@Path("users")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createUser(@DefaultValue("") @FormDataParam("birth_date") 	final FormDataBodyPart birthDate,
							   @DefaultValue("") @FormDataParam("country") 		final FormDataBodyPart country,
							   @DefaultValue("") @FormDataParam("email") 		final FormDataBodyPart email,
							   @DefaultValue("") @FormDataParam("parentEmail") 	final FormDataBodyPart parentEmail,
							   @DefaultValue("") @FormDataParam("name_first") 	final FormDataBodyPart nameFirst,
							   @DefaultValue("") @FormDataParam("name_last") 	final FormDataBodyPart nameLast,
							   @DefaultValue("") @FormDataParam("state") 		final FormDataBodyPart state,
							   @DefaultValue("") @FormDataParam("password") 	final FormDataBodyPart password,
							   @DefaultValue("") @FormDataParam("username") 	final FormDataBodyPart username,
							   @DefaultValue("") @FormDataParam("photo_url") 	final FormDataBodyPart photoUrl
			) throws Exception {		
		RestAPIController ctrl = new RestAPIController();
		
		final CreateUserModel user = new CreateUserModel.CreateUserModelBuilder()
				.withBirthDate(birthDate)
				.withCountry(country)
				.withParentEmail(parentEmail)
				.withEmail(email)
				.withFirstName(nameFirst)
				.withLastName(nameLast)
				.withPassword(password)
				.withPhotoUrl(photoUrl)
				.withState(state)
				.withUsername(username)
				.build();
		
		return ctrl.createUser(user);
	}
	
	@PUT
	@Path("users/{id}/password")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response changePassword(@PathParam("id") final String userId, final String json) throws Exception {
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		RestAPIController ctrl = new RestAPIController();
		return ctrl.changePassword(oauth, json, userId);
	}
	
	@GET
	@Path("notitifications")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response getUsersNotifications() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.getUserNotifications(oauth);
	}
	
	@GET
	@Path("notitifications/friendship")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response getUserFriendshipRequestNotifications() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.getUserFriendshipNotifications(oauth);
	}
	
	/**
	 * @param id of notification!
	 * @return
	 * @throws Exception
	 */
	@PUT
	@Path("notitifications/friendship/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response acceptFriendshipRequest(@PathParam("id") final String id) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.processFriendship(id, oauth, NotificationService.FriendshipAction.ACCEPT);
	}
	
	@DELETE
	@Path("notitifications/friendship/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response declineFriendshipRequest(@PathParam("id") final String id) throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.processFriendship(id, oauth, NotificationService.FriendshipAction.DECLINE);
	}
	
	@GET
	@Path("self")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response getUserSelf() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return ctrl.getUser(oauth.getUserId());
	}
	
	@GET
	@Path("users/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response getUser(@PathParam("id") final String id) throws Exception {
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		RestAPIController ctrl = new RestAPIController();
		if (wasAuthorized) {
			final OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
			return ctrl.getUser(id, oauth);
		} else {
			return ctrl.getUser(id);
		}
	}
	
	/**
	 * 
	 * @param offset is a page offset, for example, offset 3 is 3*ConvosService.CONVOS_FEED_LIMIT
	 * @return
	 * @throws Exception
	 */
	@GET
	@Path("feed")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response feed(@DefaultValue("0") @QueryParam("offset") final int offset) throws Exception {		
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		RestAPIController ctrl = new RestAPIController();
		if (wasAuthorized) {
			final OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
			return ctrl.getAuthorizedFeed(oauth, offset);
		} else {
			return ctrl.getUnauthorizedFeed(offset);
		}
	}
	
// END USERS ==================================================================
// FRIENDS
	@Path("friends")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response getFriends(@DefaultValue("0") @QueryParam("convo") final String convoId) throws Exception {
		final OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		RestAPIController ctrl = new RestAPIController();
		return ctrl.getFriends(oauth, convoId);
	}
	
	@Path("email")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response emailExists(@DefaultValue("") @QueryParam("email") final String email)throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.emailExists(email);
	}
	
	@Path("username")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response usernameExists(@DefaultValue("") @QueryParam("username") final String username)throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.usernameExists(username);
	}

// TEXT	
	@Path("texts")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTexts() throws Exception {
		RestAPIController ctrl = new RestAPIController();
		return ctrl.getTextBlocks();
	}
	
	@Path("check")
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth(strict=false)
	public Response check() throws Exception {
		final boolean wasAuthorized = (boolean) configuration.getProperty(SecureOAuthFilter.WAS_AUTHORIZED);
		if (wasAuthorized) {
			return Response.ok("{\"status\":true}").build();
		} else {
			return Response.ok("{\"status\":false}").build();
		}
	}
	
	@GET
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getConstant() {
		return Response.ok("{\"ok\":\"true\"}").build();
	}
	
}





















