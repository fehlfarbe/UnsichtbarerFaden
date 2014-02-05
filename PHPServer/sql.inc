<?php

$con = new mysqli("localhost","faden","unsichtbar","derunsichtbarefaden");

/* check connection */
if ($con->connect_errno) {
	printf("Connect failed: %s\n", $con->connect_error);
	exit();
}

?>