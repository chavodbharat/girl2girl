package com.missoandfriends.jsonapi.services;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.mapdb.DB;
import org.mapdb.DBMaker;
import org.mapdb.DataInput2;
import org.mapdb.DataOutput2;
import org.mapdb.HTreeMap;
import org.mapdb.Serializer;
import org.mapdb.serializer.GroupSerializer;

import com.missoandfriends.jsonapi.models.OAuthModel;

public class OAuthService {
	
	private static HTreeMap<String, OAuthModel> map;
	private static DB db;
	
	private static String setToString(Set<Integer> set) {
		if (set.isEmpty()) {
			return "";
		}
		try {
			return set.stream().map(a -> String.valueOf(a)).collect(Collectors.joining(","));
		} catch (final Exception e) {
			return "";
		}
	}
	private static Set<Integer> stringToSet(final String str) {
		if (StringUtils.isBlank(str)) {
			return new HashSet<Integer>();
		}
		try {
			return Arrays.asList(str.split(",")).stream().map(a -> Integer.parseInt(a)).collect(Collectors.toSet());
		} catch (final Exception e) {
			return new HashSet<Integer>();
		}
	}
	
	public static void showAll() {
		map.forEachValue((val) -> {
			if (val != null) {
				System.out.println(((OAuthModel) val).getExpires() + " >> " + ((OAuthModel) val).getToken());
			}
			return null;
		});
	}
	
	public static void init(String filename) {		
		db = DBMaker.fileDB(filename).fileLockDisable().checksumHeaderBypass().closeOnJvmShutdown().make();
		map = db.hashMap("oauth")
				//.expireAfterGet(OAuthModel.EXPIRES_SECONDS * 1000)
				.expireStoreSize(100 * 1024*1024) //100 mb
				.expireExecutor(Executors.newScheduledThreadPool(2))		
				.keySerializer(GroupSerializer.STRING)
				/*
				.modificationListener((s, arg1, arg2, bl) -> {
					System.out.println("key access: " + s);
					if (arg1 != null) {
						System.out.println("old: " + ((OAuthModel) arg1).getToken());
					}
					if (arg2 != null) {
						System.out.println("new: " + ((OAuthModel) arg2).getToken());
					}
				})
				*/
				.valueSerializer(new Serializer<OAuthModel>() {
					@Override
					public OAuthModel deserialize(DataInput2 in, int available) throws IOException {
						OAuthModel out = new OAuthModel();
						out.setToken(in.readUTF());
						out.setUserId(in.readUTF());
						out.setUsername(in.readUTF());
						out.setExpires(Long.parseLong(in.readUTF()));
						out.setDisplayName(in.readUTF());
						out.setGroupsMembership(stringToSet(in.readUTF()));
						out.setAdmin(Boolean.valueOf(in.readUTF()));
						out.setModerator(Boolean.valueOf(in.readUTF()));
						return out;
					}

					@Override
					public void serialize(DataOutput2 out, OAuthModel oauth) throws IOException {
						out.writeUTF(oauth.getToken());
						out.writeUTF(oauth.getUserId());
						out.writeUTF(oauth.getUsername());
						out.writeUTF(String.valueOf(oauth.getExpires()));
						out.writeUTF(oauth.getDisplayName());
						out.writeUTF(setToString(oauth.getGroupsMembership()));
						out.writeUTF(String.valueOf(oauth.isAdmin()));
						out.writeUTF(String.valueOf(oauth.isModerator()));
					}
				})
				.createOrOpen();
	}
	
	public static void shutdown() {
		if (!db.isClosed()) {
			db.close();
		}
	}
	
	public OAuthModel save(final OAuthModel obj) {
		map.put(obj.getToken(), obj);
		return obj;
	}
	
	public boolean logout(final OAuthModel oauth) {
		if (map.containsKey(oauth.getToken())) {
			map.remove(oauth.getToken());
			return true;
		}
		return false;
	}
	
	public OAuthModel getAndUpdate(final String token) {
		if (map.containsKey(token)) {
			OAuthModel tmp = map.get(token);
			tmp.setExpires();
			tmp.setToken(token);
			map.put(token, tmp);
			return tmp;
		}
		return null;
	}
	
}
