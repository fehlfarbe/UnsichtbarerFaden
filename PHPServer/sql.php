<?php

//error_log(json_encode($_SERVER['USER']));
include_once 'sqldata.php';

$con = new mysqli($db_server, $db_user, $db_password, $db_database);

/* check connection */
if ($con->connect_errno) {
	error_log("Connect failed: " . $con->connect_error);
	exit();
} else {
	error_log("mySQL successfully connected!");
}

/* change character set to utf8 */
if (!$con->set_charset("utf8")) {
	error_log("Error loading character set utf8: $con->error");
}

?>
