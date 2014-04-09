<?php

// prepare destination data
$dstPath = "./";
$dstCSS = $dstPath."fonts.css";
$dstJS = $dstPath."fonts.js";

$CSSData = "";
$JSCSSData = "var globalCSSFonts = '";
$JSFontFormatData = "var globalFonts = '";


// prepare source data
$srcFile = "./fonts.txt";
$srcArray = Array();
$handle = fopen($srcFile, "r");
if ($handle) {
    while (($line = fgets($handle)) !== false) {
        $srcArray[] = str_replace("\n", "", $line);
    }
  fclose($handle);
} else {
    exit();
}

// generate fonts
echo "generate fonts...<br>";

print_r($srcArray);

for($i=0; $i < count($srcArray); $i++){
	echo "generate font ".$srcArray[$i]." (".($i+1)."/".count($srcArray).")<br>";
	
	$font = str_replace(' ', '+', $srcArray[$i]);
	$googleLink = "http://fonts.googleapis.com/css?family=".$font;
	echo $googleLink."<br>";
	if( $str = file_get_contents($googleLink) ){
		$CSSData .= $str;
		
		if( $i != 0){
			$JSFontFormatData .= ";";
			$JSCSSData .= ",";
		}
		
		$JSFontFormatData .= $srcArray[$i]."=".$srcArray[$i];
		$JSCSSData .= "http://fonts.googleapis.com/css?family=".$font;
	}
}

$JSCSSData .= "';";
$JSFontFormatData .= "';";


if( file_put_contents($dstCSS, $CSSData) != false){
	echo "CSS file written... <br>";
}
if( file_put_contents($dstJS, $JSCSSData.$JSFontFormatData) != false ){
	echo "JS file written... <br>";
}


echo "done";

?>