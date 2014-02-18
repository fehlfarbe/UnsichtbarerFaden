<?php
header('Content-Type: application/json');

include_once 'sql.inc';
// Melde alle PHP Fehler (siehe Changelog)
error_reporting(E_ALL);
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
      session_start();

      $data = json_decode(file_get_contents("php://input"), true);
      error_log(json_encode($_POST) . "\n\n".json_encode($data));
      //error_log("DATA: " . json_encode($data));
      
      $username = $con->real_escape_string($data['username']); //escape strings!!!!!!!!!!!!!!!!!!!
      $password = $con->real_escape_string($data['password']);

      $hostname = $_SERVER['HTTP_HOST'];
      $path = dirname($_SERVER['PHP_SELF']);

      // Benutzername und Passwort werden überprüft
      $query = "SELECT count(*) as count FROM user WHERE username = '$username' AND password = PASSWORD('$password')";
      //error_log("Q: $query");
      $result = $con->query($query);
      $count = $result->fetch_object();
      
      //error_log("\nResult: " . json_encode($result) . ", count: $count->count");

      if ($result && $count->count > 0) {
		$_SESSION['isLogged'] = true;
		$_SESSION['username'] = $username;
		error_log("Loggedin :)");
      } else {
      	error_log("\n\nLogin Error: ".  $con->error);
      	//error_log($con->insert_id);
      	//header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
      	exit;
      }
      
      $ret = new stdClass();
      $ret->username = $username;
      
      echo json_encode($ret);
      return;
}
?>