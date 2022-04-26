<?php
require __DIR__ . '/vendor/autoload.php';
require_once(__DIR__ . '/wp-config-x.php');

use Morrislaptop\Firestore\Factory;
use Kreait\Firebase\ServiceAccount;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;

function removeToken($token) {
	$dbh = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
	$sth = $dbh->prepare(
	"DELETE from wp_dyn_push_tokens where push_token = :push_token");
	$sth->bindParam('push_token', $token, PDO::PARAM_STR);
	$sth->execute();
}

function sendToken ($event, $deviceTokens, $data, $title = null, $body = null) {
	$serviceAccount = ServiceAccount::fromJsonFile(__DIR__ . '/Auth-9f6fe2647b6b.json');

	$firebase = (new Factory)
		->withServiceAccount($serviceAccount)
		->withDatabaseUri('https://auth-213e2.firebaseio.com/')
		->create();
	
	foreach($deviceTokens as $token) {
		$messaging = $firebase->getMessaging();
		
		if ($title && $body) {
			$notification = array( 'title' => $title, 'body' => $body );

			$message = CloudMessage::fromArray([
				'token'        => $token,
				'notification' => $notification,
				'data'         => $data
			]);
		} else {
			$message = CloudMessage::fromArray([
				'token' => $token,
				'data'  => $data
			]);
		}
		try {
			$resp = $messaging->send($message);
			var_dump($resp);
		} catch (Exception $e) {
			var_dump($e);
			removeToken($token);
		}
	}
}

function send_new_friend ($argv) {
	$friendship_initiator_id = $argv[2];
	$friendship_friend_id = $argv[3];
	$username = $argv[4];
	var_dump($friendship_initiator_id);
	var_dump($friendship_friend_id);
	var_dump($username);
	$dbh = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
	$sth = $dbh->prepare(
	"SELECT push_token from wp_dyn_push_tokens where id in (646373, :friend_id)");
	$sth->bindParam('friend_id', $friendship_initiator_id, PDO::PARAM_STR);
	$sth->execute();
	$myrows = $sth->fetchAll();
	$tokens = array();
	foreach ($myrows as $row) {
		array_push($tokens, $row['push_token']);
	}	
	var_dump($tokens);
	sendToken('new_friend', $tokens, [
		'event'        => 'new_friend',
		'user_id'      => strval($friendship_friend_id)
	], 'You got a new friend!', "User $username just accepted your friendship!!");
}

function send_new_friendship_request ($argv) {
	$friendship_initiator_id = $argv[2];
	$friendship_friend_id = $argv[3];
	$username = $argv[4];
	var_dump($friendship_initiator_id);
	var_dump($friendship_friend_id);
	var_dump($username);
	$dbh = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
	$sth = $dbh->prepare(
	"SELECT push_token from wp_dyn_push_tokens where id in (646373, :friend_id)");
	$sth->bindParam('friend_id', $friendship_friend_id, PDO::PARAM_STR);
	$sth->execute();
	$myrows = $sth->fetchAll();
	$tokens = array();
	foreach ($myrows as $row) {
		array_push($tokens, $row['push_token']);
	}	
	var_dump($tokens);
	sendToken('new_friendship_request', $tokens, [
		'event'        => 'new_friendship_request',
		'user_id'      => strval($friendship_initiator_id)
	], 'New Friendship Request', "$username requested friendship");
}

if ($argc && $argc > 1) {
	var_dump($argv);
	$name = $argv[1];
	switch ($name) {
	case "new_friend":
		send_new_friend($argv);
		return;
	case "new_friendship_request":
		send_new_friendship_request($argv);
		return;
	default:
		break;
	}
}















	
