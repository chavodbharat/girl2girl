package com.missoandfriends.jsonapi.services;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

import com.missoandfriends.jsonapi.MOFServer;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

public class DBManagerService {

	private static final int TIMES_TRY = 1;
	
	private static HikariDataSource ds;
	private volatile static Object lock;
	private volatile static boolean isInited = false;
	
	public static void init (final Properties pro) {
		try {
			Object local = lock;
			if (local == null) {
				synchronized (DBManagerService.class) {
					local = lock;
					if (local == null) {
						HikariConfig config = new HikariConfig();
						
						config.setJdbcUrl(
								String.format(
										"jdbc:%s://%s:%s/%s?%s", 
										pro.getProperty("db.driver"),
										pro.getProperty("db.host"),
										pro.getProperty("db.port"),	
										pro.getProperty("db.schema"),
										pro.getProperty("db.options")));
						
						config.setUsername(pro.getProperty("db.username"));
						config.setPassword(pro.getProperty("db.password"));
						config.addDataSourceProperty("cachePrepStmts", 			pro.getProperty("hikari.cachePrepStmts"));
						config.addDataSourceProperty("prepStmtCacheSize", 		pro.getProperty("hikari.prepStmtCacheSize"));
						config.addDataSourceProperty("prepStmtCacheSqlLimit", 	pro.getProperty("hikari.prepStmtCacheSqlLimit"));
						
						ds = new HikariDataSource(config);
	
						local = lock = new Object();
						isInited = true;
					}
				}
			}
		} catch (final Throwable e) {
			
		}
	}
	
	public static HikariDataSource getDataSource() {
		return ds;
	}
	
	public static synchronized void shutdown () {
		if (ds != null && !ds.isClosed()) {
			ds.close();
			lock = null;
		}
	}
	
	public static void reload() {
		shutdown();
		init(MOFServer.getApplicationProperties());
	}
	
	public static Connection getConnection () throws SQLException {
		return getConnection(0);
	}
	
	public static Connection getConnection (final int depth) throws SQLException {
		if (isInited) {
			return ds.getConnection();
		} else {
			reload();
			if (depth > TIMES_TRY) {
				throw new SQLException("Connection unreachable. Database is down. " + depth + "-times request failed.");
			} else {
				return getConnection(depth + 1);
			}
		}
	}
	
}
