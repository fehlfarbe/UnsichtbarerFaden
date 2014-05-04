<?php

include_once 'auth.inc';
include_once 'sql.inc';

/// Set header to JSON for return type
header('Content-Type: application/json');

$action = $_GET['action'];

$data = json_decode(file_get_contents("php://input"), true);
error_log("DATA: " . json_encode($data));

switch ($action) {
	
	case 'articles':
		error_log("Get articles");
		$query = 'SELECT articles.articleid AS id, articles.name AS name, text,  book, active, ' .
				'symbols.id AS symID, symbols.name AS symName, symbols.icon AS symIcon, ' .
				'nodes.nodeid AS nodeid, nodes.name AS category ' .
				'FROM articles ' .
				'LEFT JOIN 	articlenodes 	ON articles.articleid = articlenodes.articleid ' .
				'LEFT JOIN  nodes 			ON articlenodes.nodeid = nodes.nodeid ' .
				'JOIN symbols ON articles.symbol = symbols.id';
		
		if( isset($data['id']) ){
			error_log("Data ID: ". $data['id']);
			$query .= " WHERE articles.articleid = " . intval($data['id']);
		}
		
		$articles = Array();
		if ($result = $con->query($query)) {
			while ($article =  $result->fetch_object()){
				$article->id = intval($article->id);
				$article->book = intval($article->book);
				$article->symID = intval($article->symID);
				$articles[] = $article;
			}
		}
		
		
		$filteredArticles = Array();
		$lastId = -1;
		$article = null;
		for($i=0; $i<count($articles); $i++){
			if( $articles[$i]->id == $lastId ){
				$c = new stdClass();
				$c->id = intval($articles[$i]->nodeid);
				$c->name = $articles[$i]->category;
// 				error_log("CAT".json_encode($filteredArticles[count($filteredArticles)-1]->category));
				$filteredArticles[count($filteredArticles)-1]->category[] = $c;
			} else {
				$lastId = $articles[$i]->id;
				$article = $articles[$i];
		
 				if( !is_array($article->category) ) {
					if( $article->category != null){
						$c = new stdClass();
						$c->id = intval($article->nodeid);
						$c->name = $article->category;
						$article->category = Array();
						$article->category[] = $c;
					}
						
				}
				
				error_log("Article: " . json_encode($article));
				$filteredArticles[] = $article;
			}
		}
		
		for($i=0; $i<count($filteredArticles); $i++){
			unset( $filteredArticles[$i]->nodeid );
			unset( $filteredArticles[$i]->screen );
			//if( $filteredArticles[$i]->screen == "" )
			//	$filteredArticles[$i]->screen = null;
				
			error_log($filteredArticles[$i]->id . " " . $filteredArticles[$i]->name);
			if( $filteredArticles[$i]->category != null)
			for($j=0; $j<count($filteredArticles[$i]->category); $j++)
				error_log("\t" . $filteredArticles[$i]->category[$j]->id . ":" . $filteredArticles[$i]->category[$j]->name);
		}
		
		echo json_encode($filteredArticles);
		return;
		
		
	case 'nodessymbols':
		error_log("Get nodes/symbols");
		
		$query = 'SELECT nodeid AS id, nodes.name AS name, x, y FROM nodes';
		$nodes = Array();
		if( $result = $con->query($query) )
			while($node = $result->fetch_object()){
				$node->id = intval($node->id);
				$node->x = intval($node->x);
				$node->y = intval($node->y);
				$nodes[] = $node;
				//erro_log(json_encode($node->name));
			}
		
		$query = 'SELECT * FROM links';
		$links = Array();
		if( $result = $con->query($query) )
			while($link = $result->fetch_object()){
				$link->source = intval($link->source);
				$link->target = intval($link->target);
				$links[] = $link;
			}
		
		$query = 'SELECT * FROM symbols';
		$symbols = Array();
		if( $result = $con->query($query) )
			while($symbol = $result->fetch_object()){
				$symbol->id = intval($symbol->id);
				$symbols[] = $symbol;
			}			
		
		error_log("Nodes: " . json_encode($nodes));
		error_log("Links: " . json_encode($links));
		error_log("Symbols: " . json_encode($symbols));
		
		$object = new stdClass();
		$object->nodes = $nodes;
		$object->links = $links;
		$object->symbols = $symbols;
		
		echo json_encode($object);
		return;
		
	case 'save_article':
		error_log("save article");
		
		$article = Array();
		$article['name'] = $data['headline'];
		$article['text'] = $data['content'];
		$article['symbol'] = $data['symbol'];
		$article['book'] = $data['book'];
		$article['active'] = $data['active'];
		
		$columns = implode(", ",array_keys($article));
		$escaped_values = array_map($con->real_escape_string, array_values($article));
		foreach( $escaped_values as &$val){
			if( !is_numeric($val) )
				$val = "'$val'";
		}
		$values  = implode(", ", $escaped_values);
		
		//if update article
		if( isset($data['id']) ){
			error_log("Update id: ". $data['id']);
			//$article['id'] = $data['id'];
			$query = "UPDATE articles SET";
			$keys = array_keys($article);
			for($i=0; $i<count($keys); $i++){
				if( $i != 0)
					$query .= ", ";
				$query .= " $keys[$i] = '" . $con->real_escape_string($article[$keys[$i]]) ."'";
			}
			$query .= " WHERE articleid = " . intval($data['id']);
		} else {
			//if new article	
			$query = "INSERT INTO articles ($columns) VALUES ($values)";
		}
		
		error_log($query);
		
		if( $result = $con->query($query) ){
			$id = isset($data['id']) ? intval($data['id']) : $con->insert_id;
			error_log("Article ID: " . $id);
			$query = "DELETE FROM articlenodes WHERE articleid = " . intval($id);
			if( $result = $con->query($query) ){
				error_log("Deleted old articlenodes");
				for($i=0; $i<count($data['categories']); $i++){
					$query = "INSERT INTO articlenodes SET articleid = $id, nodeid = " . 
						intval($data['categories'][$i]);
					$result = $con->query($query);
					error_log($data['categories'][$i] . ":" . $result);
				}
				
				//send id
				$ret = new stdClass();
				$ret->id = $id;
				echo json_encode($ret);
				return;
			}			
		}
		
		return;
		
	case 'delete_article':
		
		$id = intval($data['id']);
		$query = "DELETE FROM articles WHERE articleid = $id";
		
		if( !$result = $con->query($query) )
			header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		
		return;
		
	case 'save_nodes':
		
		
		//update nodes (name, position)
		for($i = 0; $i < count($data['nodes']); $i++){
			error_log("node: " + $data['nodes'][$i]['id'] . ": " . $data['nodes'][$i]['name'] );
			$node = "nodeid = '".$data['nodes'][$i]['id']."', 
					name = '".$data['nodes'][$i]['name']."', 
					x = '".$data['nodes'][$i]['x']."', 
					y = '".$data['nodes'][$i]['y']."'";
			$vals = "name = VALUES(name), x = VALUES(x), y = VALUES(y)";
			$query = "INSERT INTO nodes SET $node ON DUPLICATE KEY UPDATE $vals";
			
			if( !$result = $con->query($query) ){
				error_log($con->error);
				header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
				return;
			}
		}
		
		//deleted nodes
		for($i = 0; $i < count($data['deletedNodes']); $i++){
			error_log("deleted: " . $data['deletedNodes'][$i]['id'] . ": " . $data['deletedNodes'][$i]['name'] );
			$query = "DELETE FROM nodes WHERE nodeid = " . intval($data['deletedNodes'][$i]['id']);
			
			if( !$result = $con->query($query) ){
				error_log($con->error);
				header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
				return;
			}
		}
		
		//update links
		for($i = 0; $i < count($data['links']); $i++){
			error_log($data['links'][$i]['source']['id'] . "-> " . $data['links'][$i]['target']['id']);
			$link = "source = " . $data['links'][$i]['source']['id'] . ", 
					target = " . $data['links'][$i]['target']['id'];
			$vals = "target = VALUES(target), source = VALUES(source)";
			$query = "INSERT INTO links SET $link ON DUPLICATE KEY UPDATE $vals";
			
			if( !$result = $con->query($query) ){
				error_log($con->error);
				header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
				return;
			}
		}
		
		//deleted links
		for($i = 0; $i < count($data['deletedLinks']); $i++){
			error_log("deleted: " . $data['deletedLinks'][$i]['source']['id'] . "->" . $data['deletedLinks'][$i]['target']['id'] );
			$source = $data['deletedLinks'][$i]['source']['id'];
			$target = $data['deletedLinks'][$i]['target']['id'];
			$query = "DELETE FROM links WHERE source = $source AND target = $target";
			
			if( !$result = $con->query($query) ){
				error_log($con->error);
				header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
				return;
			}
		}
		
		
		return;
		
	case 'upload':
		
		error_log(json_encode($_FILES));
		error_log(json_encode($_FILES['image']));
		
		$basename = $_FILES['image']['name'];
		$tmp_name = $_FILES['image']['tmp_name'];
		$dst = "/upload/images/";
		$newname = $dst.time()."_".$basename;
		
		//error_log("$basename, $tmp_name");
		
		if ( move_uploaded_file($tmp_name, __DIR__.$newname) )
		{
			error_log("Uploaded $newname");
			
			header('Content-Type: text/html');				
			$ret = "<script>top.$('.mce-btn.mce-open').parent().find('.mce-textbox').val('$newname').closest('.mce-window').find('.mce-primary').click();</script>";
			error_log($ret);
			echo $ret;
			return;
		}			
		
		return;
		
		
	case 'get_symlinks':
		
		$query = "SELECT * FROM symbols";
		
		$ret = new stdClass();
		$ret->symbols = Array();
		$ret->symlinks = Array();
		
		if( $result = $con->query($query) ){
			while ( $symbol = $result->fetch_object() )
				$ret->symbols[] = $symbol;
		} else {
			echo "null";
			return;
		}
		
		$query = "SELECT * FROM symlinks";
		if( $result = $con->query($query) ){
			while ( $link = $result->fetch_object() ){
				$link->source = intval($link->source);
				$link->target = intval($link->target);
				$ret->symlinks[] = $link;
			}
				
		} else {
			echo "null";
			return;
		}
		
		
		echo json_encode($ret);
		return;
		
	case 'newcat' :
		
		$name = $data['name'];
		
		$query = "SELECT count(*) as count FROM nodes WHERE name LIKE '$name'";
		if( $result = $con->query($query) ){
			if(intval($result->fetch_object()->count) > 0){
				echo "null";
				return;
			} else {
				$query = "INSERT INTO nodes (name) VALUES ('$name')";
				if( $result = $con->query($query) ){
					//error_log("id:" . json_encode( $con->insert_id ));
					$ret = new stdClass();
					$ret->id = $con->insert_id;
					$ret->name = $name;
					echo json_encode($ret);					
				} else {
					error_log($con->error);
					echo "null";
					header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
					return;
				}
			}
		} else {
			error_log($con->error);
			echo "null";
			header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
			return;
		}
		
		
		
		error_log(json_encode($name));
		
		return;
	
	case 'nodearticles':
		
		$obj = new stdClass();
		$obj->nodes = Array();
		$obj->links = Array();
		
		error_log("...");
		
		$query = "SELECT nodes . * , COUNT( nodes.nodeid ) AS count
				FROM nodes
				JOIN articlenodes ON nodes.nodeid = articlenodes.nodeid
				GROUP BY nodes.nodeid";
		if( $result = $con->query($query) ){
			while($node = $result->fetch_object()){
				$node->id = intval($node->nodeid);
				$node->x = intval($node->x);
				$node->y = intval($node->y);
				$node->count = intval($node->count);
				$obj->nodes[] = $node;
			}				
		} else {
			error_log($con->error);
		}
		
		$query = "SELECT DISTINCT LEAST(articlenodes.nodeid, an.nodeid) AS s, GREATEST(articlenodes.nodeid, an.nodeid) AS t
					FROM articlenodes, articlenodes AS an
					WHERE articlenodes.nodeid != an.nodeid AND articlenodes.articleid = an.articleid
					ORDER BY articlenodes.articleid";
		if( $result = $con->query($query) ){
			while($artnode = $result->fetch_object()){
				$l = new stdClass();
				$l->source = intval($artnode->s);
				$l->target = intval($artnode->t);
				$obj->links[] = $l;
			}
		} else {
			error_log($con->error);
		}

		//error_log(json_encode($obj));
		echo json_encode($obj);
		
		return;
		
	case 'comments':
		
		$comments = Array();
		
		$query = "SELECT * FROM comments ORDER BY date ASC";
		
		if( $result = $con->query($query) ){
			while($c = $result->fetch_object()){
				$comments[] = $c;
			}
		} else {
			error_log($con->error);
		}
		
		echo json_encode($comments);
		
		return;
}


?>