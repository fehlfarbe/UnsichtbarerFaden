<?php
header('Content-Type: application/json');

include_once 'sql.inc';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
      session_start();

      $data = json_decode(file_get_contents("php://input"), true);
      //error_log("DATA: " . json_encode($data));
      
      $username = mysql_real_escape_string($data['username']);
      $password = mysql_real_escape_string($data['password']);

      $hostname = $_SERVER['HTTP_HOST'];
      $path = dirname($_SERVER['PHP_SELF']);

      // Benutzername und Passwort werden überprüft
      $query = "SELECT count(*) as count FROM user WHERE username = '$username' AND password = PASSWORD('$password')";
      $result = $con->query($query);
      $count = $result->fetch_object();

      if ($result && $count->count > 0) {
		$_SESSION['isLogged'] = true;
      } else {
      	error_log($con->error);
      	error_log($result);
      	error_log($con->insert_id);
      	header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
      	exit;
      }
      
      $ret = new stdClass();
      $ret->username = $username;
      
      echo json_encode($ret);
      return;
}
?>