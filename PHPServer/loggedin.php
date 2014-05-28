<?php

include_once 'auth.php';

header('Content-Type: application/json');

return $_SESSION['username'];

?>