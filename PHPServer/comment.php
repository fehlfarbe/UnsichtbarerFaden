<?php
session_start();
include_once 'sql.inc';


// test Captcha
if( !isset($_SESSION['captcha_spam']) OR $_POST['captcha'] != $_SESSION['captcha_spam']){
	echo "Falscher Captcha!";
	exit();
}
unset($_SESSION['captcha_spam']); 

$articleID = intval($_POST['articleid']);
$name = htmlentities( mysql_real_escape_string( $_POST['name']) );
$email = htmlentities( mysql_real_escape_string($_POST['email']) );
$text = htmlentities( mysql_real_escape_string($_POST['text']) );


$query = "INSERT INTO comments(articleid, name, email, text, date, new) 
			VALUES ( $articleID, '$name', '$email', '$text', NOW(), 1 )";

if( $result = $con->query($query) ){
	error_log($result);
	echo "Kommentar gespeichert!";
} else {
	error_log( $con->error );
	header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
	echo "Fehler bei Verarbeitung!";
	return;
}


?>