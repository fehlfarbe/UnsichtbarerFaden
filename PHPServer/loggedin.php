<?php

include_once 'auth.inc';

header('Content-Type: application/json');

return $_SESSION['username'];

?>