<?php

$reqUri = $_SERVER['REQUEST_URI'];
error_log("$reqUri");

$JSON_API = Array( 'agent', 'backend', 'login', 'get');

if( $reqUri == "/" ){
	header("Location: /frontend/index.html");
	die();
}

if (preg_match('/\.(?:png|jpg|jpeg|gif)$/', $_SERVER["REQUEST_URI"]))
	return false;


if(preg_match('/agent.*$/', $reqUri)){
	include_once 'agent.php';
	return true;
}
if(preg_match('/backend/.*$/', $reqUri)){
	include_once 'backend.php';
	return true;
}
if(preg_match('/get.*$/', $reqUri)){
	include_once 'backend.php';
	return true;
}
if(preg_match('/login.*$/', $reqUri)){
	include_once 'login.php';
	return false;
}

return false;


?>