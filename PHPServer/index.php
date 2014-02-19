<?php
	header ( 'HTTP/1.1 301 Moved Permanently' );
	header ( "Location: /frontend/" );
	header ( "Connection: close" );
?>