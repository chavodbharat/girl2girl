<?php
require_once (__DIR__ . '/../../../send_notification.php');
/*
function newReply( $reply_id = 0, $topic_id = 0, $forum_id = 0, $anonymous_data = false, $author_id = 0, $is_edit = false, $reply_to = 0 ) {
    global $wpdb;

    $reply_to_post = get_post($reply_to);
    $parent_post   = get_post($topic_id);

    $a = $reply_to_post->post_author ?: -1;
    $b = $parent_post->post_author ?: -1;
    $c = $author_id ?: -1;

    $myrows = $wpdb->get_results( "SELECT push_token from wp_dyn_push_tokens where id in (646373, $a, $b, $c)" );
    $tokens = array();
    foreach ($myrows as $row) {
        array_push($tokens, $row->push_token);
    }

    $reply_author_name = get_author_name($author_id);

    sendToken('new_reply', $tokens, [
        'event'        => 'new_reply',
        'reply_to'     => strval($reply_to_post->post_author),
        'author'       => strval($author_id),
        'topicstarter' => strval($parent_post->post_author),
        'topic_id'     => strval($topic_id),
    ], 'New Reply', "New reply from $reply_author_name in convo $reply_to_post->post_title");
}

add_action( 'bbp_new_reply', 'newReply', 10, 7 );
*/

function get_all_mentioned ($content) {
	global $wpdb;
	preg_match_all('/@[a-zA-Z0-9\-_]+/', $content, $out);
	$values = array_map(function ($item) {
		return '"' . mb_substr($item, 1) . '"';
	}, $out[0]);
	$sql = 'select id from wp_users where user_login in ' . '(' . implode($values, ',') . ')';
	$myrows = $wpdb->get_results($sql);
	$ids = array();
    foreach ($myrows as $row) {
        array_push($ids, $row->id);
    }
	if (count($ids) === 0) {
		return '(-1)';
	}
	return '(' . implode($ids, ',') . ')';
}

add_action( 'transition_post_status', 'wpse120996_generic_post_status_transition', 10, 3 );
function wpse120996_generic_post_status_transition( $new_status, $old_status, $post ) {
    global $wpdb;

    if ( ($old_status === 'pending') && ($new_status === 'publish') && ($post->post_type === 'topic') ) {

        $meta = get_post_meta($post->ID);
        $forum_id = $meta['_bbp_forum_id'][0];

        $sql = "select push_token from wp_dyn_push_tokens where id in (
 select distinct user_id as id from wp_bp_groups_members
 where group_id = (select group_id
 from wp_bp_groups_groupmeta
 where meta_key = 'forum_id' and meta_value = concat('a:1:{i:0;i:', " . strval($forum_id) . ", ';}'))) or id in " . get_all_mentioned($post->post_content);

        $myrows = $wpdb->get_results($sql);
        $tokens = array();
        foreach ($myrows as $row) {
            array_push($tokens, $row->push_token);
        }

        $reply_author_name = get_author_name($author_id);

        $sql = "select * from wp_bp_groups
 where id = (select group_id
 from wp_bp_groups_groupmeta
 where meta_key = 'forum_id' and meta_value = concat('a:1:{i:0;i:', " . strval($forum_id) . ", ';}'))";

        $myrows = $wpdb->get_results($sql);

        $groupName = $myrows[0]->name;
        $groupId   = $myrows[0]->id;

        sendToken('new_post', $tokens, [
            'event'        => 'new_post',
            'group'        => $groupName,
            'group_id'     => $groupId,
            'author'       => strval($post->post_author),
            'topic_id'     => strval($post->ID),
        ], 'New Post', "New convo in $groupName has been posted");
		
    }
	if ( ($old_status === 'pending') && ($new_status === 'publish') && ($post->post_type === 'reply') ) {
		$meta = get_post_meta($post->ID);
		
		$topic_id = $meta['_bbp_topic_id'][0];
		$reply_to = $meta['_bbp_reply_to'][0];
		
		$reply_to_post = get_post($reply_to);
		$post_author   = $post->post_author;
		$parent_post   = get_post($topic_id);
		
		$a = $reply_to_post->post_author ?: -1;
		$b = $parent_post->post_author ?: -1;
		$c = $post->post_author;
		
		$author_id = $post->post_author;
		
		$sql = "SELECT push_token from wp_dyn_push_tokens where id in (646373, $a, $b, $c)";

		$myrows = $wpdb->get_results( $sql );
		
		$tokens = array();
		foreach ($myrows as $row) {
			array_push($tokens, $row->push_token);
		}	
		
		$reply_author_name = get_author_name($author_id);

		sendToken('new_reply', $tokens, [
			'event'        => 'new_reply',
			'reply_to'     => strval($reply_to_post->post_author),
			'author'       => strval($author_id),
			'topicstarter' => strval($parent_post->post_author),
			'topic_id'     => strval($topic_id),
		], 'New Chat!', "From $reply_author_name in convo $parent_post->post_title was just posted!");
		
		//now all mentiones
		$sql = "SELECT push_token from wp_dyn_push_tokens where id in " . get_all_mentioned($post->post_content);

		$myrows = $wpdb->get_results( $sql );
		
		$tokens = array();
		foreach ($myrows as $row) {
			array_push($tokens, $row->push_token);
		}	

		sendToken('new_reply', $tokens, [
			'event'        => 'new_reply',
			'reply_to'     => strval($reply_to_post->post_author),
			'author'       => strval($author_id),
			'topicstarter' => strval($parent_post->post_author),
			'topic_id'     => strval($topic_id),
		], 'Mentioned!', "You’ve been mentioned in the convo $reply_to_post->post_title. Check it out!");
	}	
}

function my_accepted_function( $id, $user_id, $friend_id, $friendship  ) {
	global $wpdb;

	$myrows = $wpdb->get_results( "SELECT push_token from wp_dyn_push_tokens where id in (646373, $user_id)" );
	$username = get_author_name($friend_id);
	$tokens = array();
	foreach ($myrows as $row) {
		array_push($tokens, $row->push_token);
	}	
	sendToken('new_friend', $tokens, [
		'event'        => 'new_friend',
		'user_id'      => strval($friend_id)
	], 'You got a new friend!', "User $username just accepted your friendship!!");
}

function my_requested_function( $friendship_id, $friendship_initiator_id, $friendship_friend_id  ) {
	global $wpdb;

	$myrows = $wpdb->get_results( "SELECT push_token from wp_dyn_push_tokens where id in (646373, $friendship_friend_id)" );
	$username = get_author_name($friendship_initiator_id);
	$tokens = array();
	foreach ($myrows as $row) {
		array_push($tokens, $row->push_token);
	}	
	sendToken('new_friendship_request', $tokens, [
		'event'        => 'new_friendship_request',
		'user_id'      => strval($friendship_initiator_id)
	], 'New Friendship Request', "$username requested friendship");
}

add_action( 'friends_friendship_accepted',  'my_accepted_function',  1, 4 );
add_action( 'friends_friendship_requested', 'my_requested_function', 1, 3 );



































