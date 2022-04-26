package com.missoandfriends.models;

import org.junit.Assert;
import org.junit.Test;

import com.missoandfriends.jsonapi.services.ConvosService;


public class PherializedTest {

	@Test
	public void forumSerialization() {
		final String phpArr = ConvosService.getForumArray("19627");
		Assert.assertEquals(phpArr, "a:1:{i:0;i:19627;}");
	}
	
	@Test
	public void forumUnserialization() {
		Integer id = ConvosService.getForumFromArray("a:1:{i:0;i:19627;}");
		Assert.assertEquals(id, new Integer(19627));
	}
	
	@Test
	public void forumUnserializationError() {
		Integer id = ConvosService.getForumFromArray("a:1{i:0;i:19627;}");
		Assert.assertNull(id);
	}
	
}
