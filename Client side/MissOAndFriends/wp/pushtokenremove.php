<?php
require_once(__DIR__ . '/wp-config-x.php');

$data = json_decode(file_get_contents('php://input'), true);

header('Content-type: application/json');

$hasErr = false;
$err = "";
foreach(["os", "push_token"] as $requiredParam) {
	if (!array_key_exists($requiredParam, $data)) {
		$hasErr = true;
		$err .= "$requiredParam is required parameter. ";
	}
}

if ($hasError) {
	http_response_code(400);
	echo json_encode(array('status' => 400, 'message' => $err));
	return;
}

$os = $data['os'];

if ($os !== 'Android' && $os !== 'iOS') {	
	http_response_code(400);
	echo json_encode(array('status' => 400, 'message' => 'Bad os type. Must be either iOS or Android, but found' . $os));
	return;
}

$push_token = $data['push_token'];

$dbh = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASSWORD);
$sth = $dbh->prepare(
"DELETE from wp_dyn_push_tokens where os = :os and push_token = :push_token");
$sth->bindParam('os',         $os,         PDO::PARAM_STR);
$sth->bindParam('push_token', $push_token, PDO::PARAM_STR);
$sth->execute();

echo json_encode(array('status' => 200));