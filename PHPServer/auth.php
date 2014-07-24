<?php

session_start();

$hostname = $_SERVER['HTTP_HOST'];
$path = dirname($_SERVER['PHP_SELF']);

if (!isset($_SESSION['isLogged']) || !$_SESSION['isLogged']) {
	header("HTTP/1.1 401 Unauthorized");
	exit;
}


?>