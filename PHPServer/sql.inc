<?php

//error_log(json_encode($_SERVER['USER']));

if( isset($_SERVER['USER']))
	$con = new mysqli("localhost","db12039510-faden","PASSWORT","db12039510-faden");
else
	//$con = new mysqli("localhost","faden","unsichtbar","derunsichtbarefaden");
	$con = new mysqli("kolbe.no-ip.org","faden","unsichtbar","derunsichtbarefaden");

/* check connection */
if ($con->connect_errno) {
	error_log("Connect failed: " . $con->connect_error);
	exit();
} else {
	error_log("mySQL successfully connected!");
}

?>