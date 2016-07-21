<?php

include_once 'auth.php';
include_once 'sql.php';
include_once 'backend_functions.php';

/// Set header to JSON for return type
header('Content-Type: application/json');
$action = $_GET['action'];
$data = json_decode(file_get_contents("php://input"), true);
//error_log("DATA: " . json_encode($data));

// do action
switch ($action) {
	case 'articles':
		echo json_encode(getArticles($con, $data['id']));
		return;
	case 'nodessymbols':
		$nodesSymbols = getNodesSymbols($con);
		echo json_encode($nodesSymbols);
		return;		
	case 'save_article':
		$article = saveArticle($con,
					$data['id'],
					$data['headline'],
					$data['content'],
					$data['symbol'],
					$data['book'],
					$data['active'],
					$data['categories']
		);
		echo json_encode($article);
		return;
	case 'delete_article':
		if( !deleteArticle( $con, intval($data['id'])) )
			header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		return;
	case 'save_nodes':
		if( !saveNodes($con, 
				$data['nodes'], 
				$data['deletedNodes'], 
				$data['links'], 
				$data['deletedLinks']) )
		{
			header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		}
		return;
	case 'upload':
		echo uploadFile();		
		return;
	case 'get_symlinks':
		echo json_encode(getSymbolsLinks($con));
		return;
	case 'newcat' :
		$ret = addNode($con, $data['name']);
		if( is_object($ret) ){
			echo json_encode($ret);
		}elseif( $ret == false ){
			echo "null";
			header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		}else{
			echo "null";
		}		
		return;
	case 'nodes':
		echo json_encode(getNodes($con));		
		return;
	case 'linkstrength':
		echo json_encode(getNodeLinkStrength($con, $data['nodeid']));
		error_log(json_encode(getNodeLinkStrength($con, $data['nodeid'])));
		return;
	case 'nodearticles':
		echo json_encode(getNodeArticles($con, $data['nodeid']));
		return;
	case 'comments':		
		echo json_encode(getComments($con));		
		return;
	case 'sqldump':
		getSQLDump($db_user, $db_password, $db_database);
		exit(0);
	case 'mediabackup':
		$filename = backupDirectory("./upload");
		header('Content-type: application/zip');
		header('Content-Disposition: attachment; filename=' .urlencode($filename));
		readfile($filename);
		return;
}


?>