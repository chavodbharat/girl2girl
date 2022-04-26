package com.missoandfriends.jsonapi.services;

import static java.util.concurrent.TimeUnit.MINUTES;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;

import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;

public class SchedulerService {
	
	private static final Logger LOG = LogManager.getLogger(SchedulerService.class);
	
	private static final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
	
	public void start() {
		final Runnable beeper = new Runnable() {
			@Override
		    public void run() {
				final boolean res = new TemporaryTablesService().init();
				LOG.info("TMP Tables created with status " + (res ? "OK" : "FAIL"));
			}
	    };	    
	    scheduler.scheduleAtFixedRate(beeper, 0, 10, MINUTES);	   
	}
	
	public void shutdown() {
		if (!scheduler.isShutdown()) {
			scheduler.shutdown();
		}		
	}
	
}
