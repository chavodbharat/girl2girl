package com.missoandfriends.jsonapi.routes;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.util.ArrayList;
import java.util.List;

import javax.ws.rs.Consumes;
import javax.ws.rs.DELETE;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.PUT;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.container.ContainerRequestContext;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

import com.missoandfriends.jsonapi.controllers.TestController;
import com.missoandfriends.jsonapi.controllers.filters.SecureOAuth;
import com.missoandfriends.jsonapi.controllers.filters.SecureOAuthFilter;
import com.missoandfriends.jsonapi.models.OAuthModel;
import com.missoandfriends.jsonapi.models.templates.ForgotPasswordTemplate;
import com.missoandfriends.jsonapi.models.templates.NewUserRegistrationTemplate;
import com.missoandfriends.jsonapi.php.PHPass;
import com.missoandfriends.jsonapi.php.Wordpress;
import com.missoandfriends.jsonapi.services.DBManagerService;
import com.missoandfriends.jsonapi.services.TemplaterService;
import com.missoandfriends.jsonapi.services.TimeService;
import com.missoandfriends.jsonapi.services.mailing.MailProxyService;

@Path("/api/vx/")
public class TestRoutes {
	
	@Context
	private ContainerRequestContext configuration;
	
	
	@GET
	@Path("convos/wpgroup/{forumId}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getWPGroup(@PathParam("forumId") final String forumId) throws Exception {
		return new TestController().getWPGroup(forumId);
	}
	
	@GET
	@Path("convos/actionpost/{convoId}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getWPActionPost(@PathParam("convoId") final String convoId) throws Exception {
		return new TestController().getWPActionPost(convoId);
	}
	
	@GET
	@Path("groups/member/{userId}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getUserGroupIdsList(@PathParam("userId") final String userId) throws Exception {
		return new TestController().getGroupMembership(userId);
	}
	
	@POST
	@Path("notifications")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response createDummyNotification() throws Exception {
		return new TestController().createDummyConvoReplyNotification();
	}
	
	@POST
	@Path("notification/notifications")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	@SecureOAuth
	public Response createXDummyNotification() throws Exception {
		OAuthModel oauth = (OAuthModel) configuration.getProperty(SecureOAuthFilter.USER_KEY);
		return new TestController().createDummyConvoReplyNotification(oauth);
	}
	
	@DELETE
	@Path("notifications/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteDummyNotification(@PathParam("id") final String id) throws Exception {
		return new TestController().deleteNotification(id);
	}
	
	@PUT
	@Path("notifications/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response unsetDummyNotification(@PathParam("id") final String id) throws Exception {
		return new TestController().setUnreadNotification(id);
	}
	
	@DELETE
	@Path("convos/starter/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteTopicstarter(@PathParam("id") final String postId) throws Exception {
		return new TestController().deleteTopicstarter(postId);
	}

	@GET
	@Path("templater")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getTemplate() throws Exception {
		final ForgotPasswordTemplate tmp = new ForgotPasswordTemplate();
		tmp.setHost("hostname");
		tmp.setKey("reset_key");
		tmp.setLogin("ann");
		try (final Writer w = new OutputStreamWriter(System.out)) {
			TemplaterService.build(tmp, w);
		}
		return Response.ok().build();
	}
	
	@POST
	@Path("emails")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response sendEmail() throws Exception {
		MailProxyService s = new MailProxyService();
		final List<String> toAddress = new ArrayList<>();
		toAddress.add("sypachev_s_s@mail.ru");
		toAddress.add("ssypachev@dynamixsoftware.com");
		toAddress.add("zooeydog@icloud.com");
		final NewUserRegistrationTemplate html = new NewUserRegistrationTemplate();
		html.setUsername("wabalabadubdub");
		html.setTimeCreated(TimeService.getCurrentDatetimeUSString());
		s.sendHtmlEmailWithSendgrid("integrationtesting@missoandfriends.com", toAddress, "new user registration", TemplaterService.build(html));
		//s.newUserRegistration("wadlabadubdub");
		//s.sendForgotPasswordEmail("sypachev_s_s@mail.ru", Wordpress.getWebsiteUrl(), "", "123:somekey");
		return Response.ok().build();
	}
	
	@DELETE
	@Path("users/{id}")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response deleteUserAndAllData(@PathParam("id") final String id) throws Exception {
		return new TestController().deleteUser(id);
	}
	
	@GET
	@Path("/adminemails")
	@Consumes(MediaType.APPLICATION_JSON)
	@Produces(MediaType.APPLICATION_JSON)
	public Response getAdminEmails() throws Exception {
		return new TestController().getAdminEmail();
	}
	
	@GET
	@Path("padding")
	@Produces(MediaType.TEXT_PLAIN)
	public Response padding() throws Exception {
		String source = "test300";
		Process p = Runtime.getRuntime().exec("php translator.php " + source);
		BufferedReader stdInput = new BufferedReader(new 
                InputStreamReader(p.getInputStream()));
		String s, a = "";
		while ((s = stdInput.readLine()) != null) {
			a = s;
        }
		return Response.ok(a).build();
	}
	
	@GET
	@Path("nowtime")
	@Produces(MediaType.TEXT_PLAIN)
	public Response nowtime() throws Exception {
		return Response.ok(TimeService.getMysqlTimestampFormat().format( new java.util.Date() )).build();
	}
	
	@GET
	@Path("resetall")
	public Response resetall() throws Exception {
		try (final Connection con = DBManagerService.getConnection();) {
			final PHPass phpass = Wordpress.getPHPass();
			try (final PreparedStatement pstm = con.prepareStatement("update wp_users set user_pass = ? where id = ?");) {
				pstm.setString(1, phpass.HashPassword("Misso2010$%"));
				pstm.setString(2, "646373");
				System.out.println(pstm);
				pstm.executeUpdate();
			}
		}
		return Response.ok().build();
	}
	
	@POST
	@Path("emoji")
	public Response emoji(final String somedata) throws Exception {
		try (final Connection con = DBManagerService.getConnection();) {			
			try (final PreparedStatement pstm = con.prepareStatement("update wp_posts set post_content = concat(?, post_content) where id = 57378");) {
				pstm.setString(1, somedata);
				pstm.executeUpdate();
			}
		}
		return null;
	}
	
}


















