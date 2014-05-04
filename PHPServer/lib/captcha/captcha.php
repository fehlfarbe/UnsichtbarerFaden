<?php
	header('Content-type: image/png');
	session_start ();
	unset ( $_SESSION ['captcha_spam'] );
	function randomString($len) {
		function make_seed() {
			list ( $usec, $sec ) = explode ( ' ', microtime () );
			return ( float ) $sec + (( float ) $usec * 100000);
		}
		srand ( make_seed () );
		
		// Der String $possible enthält alle Zeichen, die verwendet werden sollen
		$possible = "@ABCDEFGHJKLMNPRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
		$str = "";
		while ( strlen ( $str ) < $len ) {
			$str .= substr ( $possible, (rand () % (strlen ( $possible ))), 1 );
		}
		return ($str);
	}
	
	$text = randomString ( 5 ); // Die Zahl bestimmt die Anzahl stellen
	$_SESSION ['captcha_spam'] = $text;
	
	$img = ImageCreateFromPNG( "captcha.png" ); // Backgroundimage
	$color = ImageColorAllocate ( $img, 0, 0, 0 ); // Farbe
	$ttf = $_SERVER ['DOCUMENT_ROOT'] . "/lib/captcha/XFILES.TTF"; // Schriftart
	$ttfsize = 15; // Schriftgrösse
	$angle = rand ( 0, 5 );
	$t_x = rand ( 5, 30 );
	$t_y = 35;
	imagettftext ( $img, $ttfsize, $angle, $t_x, $t_y, $color, $ttf, $text );
	if(imagepng($img, NULL)){
		error_log("Captcha created!");
		imagedestroy ( $img );
	}
	?> 