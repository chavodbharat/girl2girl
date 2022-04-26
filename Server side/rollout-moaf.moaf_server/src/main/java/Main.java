import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.webapp.WebAppContext;

public class Main {
	public static void main(String [] args) throws Exception {		        
		Server server = new Server(8080);
	    WebAppContext webAppContext = new WebAppContext();
	    webAppContext.setContextPath("/");

	    /* Important: Use getResource */
	    String webxmlLocation = "/src/main/webapp/WEB-INF/web.xml";
	    webAppContext.setDescriptor(webxmlLocation);

	    /* Important: Use getResource */
	    String resLocation = "/src/main/webapp";
	    webAppContext.setResourceBase(resLocation);

	    webAppContext.setParentLoaderPriority(true);

	    server.setHandler(webAppContext);

	    server.start();
	    server.join();
	}
}
