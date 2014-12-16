<?php
/**
 * Returns all comments in database
 * @param MySQL Connection $con
 * @return multitype:unknown
 */
function getComments($con){
	
	$comments = Array();
	
	$query = "SELECT comments.*, articles.name AS articlename, articles.articleid AS articleid
					FROM comments
					JOIN articles
					ON comments.articleid = articles.articleid
					ORDER BY comments.date ASC";
	
	if( $result = $con->query($query) ){
		while($c = $result->fetch_object()){
			$comments[] = $c;
		}
	} else {
		error_log($con->error);
	}
	
	return $comments;	
}

/**
 * Returns nodes with links 
 * @param MySQL Connection $con
 * @return stdClass
 */
function getNodes($con){
	
	$obj = new stdClass();
	$obj->nodes = Array();
	$obj->links = Array();
	
	$query = "SELECT nodes.* , COUNT( nodes.nodeid ) AS count
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
	
	return $obj;
}

/**
 * 
 * @param mysql Connection $con
 * @param Node name $name
 * @return boolean|stdClass
 */
function addNode($con, $name){
	
	$query = "SELECT count(*) as count FROM nodes WHERE name LIKE '$name'";
	if( $result = $con->query($query) ){
		if(intval($result->fetch_object()->count) > 0){
			return true;
		} else {
			$query = "INSERT INTO nodes (name) VALUES ('$name')";
			if( $result = $con->query($query) ){
				error_log("id:" . json_encode( $con->insert_id ));
				$ret = new stdClass();
				$ret->id = $con->insert_id;
				$ret->name = $name;
				return $ret;
			} else {
				error_log($con->error);
				return false;
			}
		}
	} else {
		error_log($con->error);
		//echo "null";
		//header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
		return false;
	}
	
	return false;
}

/**
 * 
 * @param MySQL COnnection $con
 * @return string|stdClass
 */
function getSymbolsLinks($con){
	$query = "SELECT * FROM symbols";
	
	$ret = new stdClass();
	$ret->symbols = Array();
	$ret->symlinks = Array();
	
	if( $result = $con->query($query) ){
		while ( $symbol = $result->fetch_object() )
			$ret->symbols[] = $symbol;
	} else {
		return "null";
	}
	
	$query = "SELECT * FROM symlinks";
	if( $result = $con->query($query) ){
		while ( $link = $result->fetch_object() ){
			$link->source = intval($link->source);
			$link->target = intval($link->target);
			$ret->symlinks[] = $link;
		}
		return $ret;	
	} else {
		return "null";
	}
}

/**
 * Saves FILE (image) in /uploads/images
 * @return string|boolean
 */
function uploadFile(){
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
		return $ret;
	}
	
	return false;
}

/**
 * Saves nodes/links state
 * @param MySQL Connection $con
 * @param Nodes $nodes
 * @param deleted Nodes $deletedNodes
 * @param Links $links
 * @param deleted Links $deletedLinks
 * @return boolean
 */
function saveNodes($con, $nodes, $deletedNodes, $links, $deletedLinks){
	//update nodes (name, position)
	for($i = 0; $i < count($nodes); $i++){
		//error_log("node: " + $data['nodes'][$i]['id'] . ": " . $data['nodes'][$i]['name'] );
		$node = "nodeid = '".$nodes[$i]['id']."',
					name = '".$nodes[$i]['name']."',
					x = '".$nodes[$i]['x']."',
					y = '".$nodes[$i]['y']."'";
		$vals = "name = VALUES(name), x = VALUES(x), y = VALUES(y)";
		$query = "INSERT INTO nodes SET $node ON DUPLICATE KEY UPDATE $vals";
			
		if( !$result = $con->query($query) ){
			error_log($con->error);
			return false;
		}
	}
	
	//deleted nodes
	for($i = 0; $i < count($deletedNodes); $i++){
		//error_log("deleted: " . $deletedNodes[$i]['id'] . ": " . $deletedNodes[$i]['name'] );
		$query = "DELETE FROM nodes WHERE nodeid = " . intval($deletedNodes[$i]['id']);
			
		if( !$result = $con->query($query) ){
			error_log($con->error);
			return false;
		}
	}
	
	//update links
	for($i = 0; $i < count($links); $i++){
		//error_log($links[$i]['source']['id'] . "-> " . $links[$i]['target']['id']);
		$link = "source = " . $links[$i]['source']['id'] . ",
					target = " . $links[$i]['target']['id'];
		$vals = "target = VALUES(target), source = VALUES(source)";
		$query = "INSERT INTO links SET $link ON DUPLICATE KEY UPDATE $vals";
			
		if( !$result = $con->query($query) ){
			error_log($con->error);
			return false;
		}
	}
	
	//deleted links
	for($i = 0; $i < count($deletedLinks); $i++){
		//error_log("deleted: " . $deletedLinks[$i]['source']['id'] . "->" . $deletedLinks[$i]['target']['id'] );
		$source = $deletedLinks[$i]['source']['id'];
		$target = $deletedLinks[$i]['target']['id'];
		$query = "DELETE FROM links WHERE source = $source AND target = $target";
			
		if( !$result = $con->query($query) ){
			error_log($con->error);
			return false;
		}
	}
	
	return true;
}

/**
 * I think this function deletes an article by Id ;)
 * @param MySQL Connection $con
 * @param article id $id
 * @return boolean
 */
function deleteArticle($con, $id){
	$query = "DELETE FROM articles WHERE articleid = $id";
	if( !$result = $con->query($query) )
		return false;
	return true;
}

/**
 * saves an article
 * @param MySQL Connection $con
 * @param article id (if edit) $id
 * @param article name $name
 * @param article content/text $content
 * @param article symbol $symbol
 * @param article book nr $book
 * @param acrticle active $active
 * @param article nodes/memes $categories
 * @return stdClass
 */
function saveArticle($con, $id, $name, $content, $symbol, $book, $active, $categories ){
	error_log("save article");
	
	$article = Array();
	$article['name'] = $name;
	$article['text'] = $content;
	$article['symbol'] = $symbol;
	$article['book'] = $book;
	$article['active'] = $active;
	
	$columns = implode(", ",array_keys($article));
	$escaped_values = array_map($con->real_escape_string, array_values($article));
	foreach( $escaped_values as &$val){
		if( !is_numeric($val) )
			$val = "'$val'";
	}
	$values  = implode(", ", $escaped_values);
	
	//if update article
	if( isset($id) ){
		error_log("Update id: ". $id);
		//$article['id'] = $data['id'];
		$query = "UPDATE articles SET";
		$keys = array_keys($article);
		for($i=0; $i<count($keys); $i++){
			if( $i != 0)
				$query .= ", ";
			$query .= " $keys[$i] = '" . $con->real_escape_string($article[$keys[$i]]) ."'";
		}
		$query .= " WHERE articleid = " . intval($id);
	} else {
		//if new article
		$query = "INSERT INTO articles ($columns) VALUES ($values)";
	}
	
	//error_log($query);
	
	if( $result = $con->query($query) ){
		$id = isset($id) ? $id : $con->insert_id;
		//error_log("Article ID: " . $id);
		$query = "DELETE FROM articlenodes WHERE articleid = " . intval($id);
		if( $result = $con->query($query) ){
			//error_log("Deleted old articlenodes");
			for($i=0; $i<count($categories); $i++){
				$query = "INSERT INTO articlenodes SET articleid = $id, nodeid = " .
				intval($categories[$i]);
				$result = $con->query($query);
				//error_log($data['categories'][$i] . ":" . $result);
			}	
			//send id
			$ret = new stdClass();
			$ret->id = $id;
			return $ret;
		}
	}
}

/**
 * Returns all Nodes, Links, Symbols
 * @param MySQL Connection $con
 * @return stdClass
 */
function getNodesSymbols($con){
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
	
	//error_log("Nodes: " . json_encode($nodes));
	//error_log("Links: " . json_encode($links));
	//error_log("Symbols: " . json_encode($symbols));
	
	$object = new stdClass();
	$object->nodes = $nodes;
	$object->links = $links;
	$object->symbols = $symbols;
	
	return $object;
}

/**
 * Returns articles
 * @param MySQL COnnection $con
 * @param article id (optional) $id
 * @return multitype:Ambigous <NULL, unknown>
 */
function getArticles($con, $id){
	error_log("Get articles");
	$query = 'SELECT articles.articleid AS id, articles.name AS name, text,  book, active, count, ' .
			'symbols.id AS symID, symbols.name AS symName, symbols.icon AS symIcon, ' .
			'nodes.nodeid AS nodeid, nodes.name AS category ' .
			'FROM articles ' .
			'LEFT JOIN 	articlenodes 	ON articles.articleid = articlenodes.articleid ' .
			'LEFT JOIN  nodes 			ON articlenodes.nodeid = nodes.nodeid ' .
			'JOIN symbols ON articles.symbol = symbols.id';
	
	if( isset($id) ){
		//error_log("Data ID: ". $data['id']);
		$query .= " WHERE articles.articleid = " . intval($id);
	}
	
	$articles = Array();
	if ($result = $con->query($query)) {
		while ($article =  $result->fetch_object()){
			$article->id = intval($article->id);
			$article->book = intval($article->book);
			$article->symID = intval($article->symID);
			$article->active = intval($article->active);
			$article->count = intval($article->count);
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
	
			//error_log("Article: " . json_encode($article));
			$filteredArticles[] = $article;
		}
	}
	
	for($i=0; $i<count($filteredArticles); $i++){
		unset( $filteredArticles[$i]->nodeid );
		unset( $filteredArticles[$i]->screen );
		//if( $filteredArticles[$i]->screen == "" )
		//	$filteredArticles[$i]->screen = null;
	
		//error_log($filteredArticles[$i]->id . " " . $filteredArticles[$i]->name);
		//if( $filteredArticles[$i]->category != null)
		//for($j=0; $j<count($filteredArticles[$i]->category); $j++)
		//	error_log("\t" . $filteredArticles[$i]->category[$j]->id . ":" . $filteredArticles[$i]->category[$j]->name);
	}
	
	return $filteredArticles;
}

/**
 * Sends zipped database dump
 * @param MySQL User $db_user
 * @param MySQL Password $db_password
 * @param MySQL Database $db_database
 */
function getSQLDump($db_user, $db_password, $db_database){
	$filename = "backup-" . date("d-m-Y") . ".sql.gz";
	
	$mime = "application/x-gzip";	
	header( "Content-Type: " . $mime );
	header( 'Content-Disposition: attachment; filename="' . $filename . '"' );
	
	$cmd = "mysqldump -u $db_user --password=$db_password $db_database | gzip --best";
	
	passthru( $cmd );
}

function backupDirectory($directory){
	// Get real path for our folder
	$rootPath = $directory;
	//error_log("PATH: " . $rootPath);
	
	// Initialize archive object
	if( file_exists('file.zip') )
		unlink('file.zip');
	$zip = new ZipArchive;
	$zip->open('file.zip', ZipArchive::CREATE);
	
	// Create recursive directory iterator
	$files = new RecursiveIteratorIterator(
	    new RecursiveDirectoryIterator($rootPath),
	    RecursiveIteratorIterator::LEAVES_ONLY
	);
	
	foreach ($files as $name => $file) {
	    $filePath = $file->getRealPath();
	    if( is_dir($filePath) )
	    	continue;
	    $localName = explode(ltrim($rootPath, '.'), $filePath);
	    $localName = ltrim( $localName[1], '/');
	    $zip->addFile($filePath, $localName);
	}
	$zip->close();
	
	return "file.zip";
}

/**
 * Returns all articles for node id
 * @param MySQL Connection $con
 * @param NodeId $nodeid
 * @return multitype:Array|NULL
 */
function getNodeArticles($con, $nodeid){
	$query = "SELECT articles.articleid, articles.name FROM articles 
			JOIN articlenodes 
			ON articles.articleid = articlenodes.articleid 
			WHERE articlenodes.nodeid = $nodeid";

	$articleNodes = Array();
	if( $result = $con->query($query) ){
		while( $a = $result->fetch_object() )
			$articleNodes[] = $a;
		return  $articleNodes;
	} else {
		error_log("No article with nodeid $nodeid" . $con->error);
		return null;
	}
}


function getNodeLinkStrength($con, $nodeid){
	$query = "
		SELECT nodeid, count(*) AS count FROM articlenodes
		WHERE articleid IN (
			SELECT articleid FROM articlenodes
			WHERE nodeid = $nodeid)
		GROUP BY nodeid
	";
	
	$links = Array();
	if ($result = $con->query($query)) {
		while ($l =  $result->fetch_object()){
			$l->nodeid = intval($l->nodeid);
			$l->count = intval($l->count);
			$links[] = $l;
		}
	} else {
		error_log("Cannot get link strength for node $nodeid");
	}
	
	return $links;	
}
?>