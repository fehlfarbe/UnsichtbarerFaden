<?php

include_once 'agent.inc';

/******************
 * AGENT
 *****************/

/// Set header to JSON for return type
header('Content-Type: application/json');

if( isset($_GET['action']) && @$_GET['action'] == 'getthumbnails' ){
	$thumbs = json_encode(getThumbs($con));
	//error_log($thumbs);
	echo $thumbs;
	return;
}

//symbol clicked
if ( empty($_GET['symbol']))
	$symbol = 0;
else 
	$symbol = intval($_GET['symbol']);
$agentSymbol = $symbol;

//last Articles
if ( empty($_GET['lastarticles']) ){
	$lastArticles = Array();
}	
else 
	$lastArticles = json_decode($_GET['lastarticles']);

//last articleId
if( count($lastArticles) > 0){
	$lastArticleId = $lastArticles[count($lastArticles)-1];
}	
else{
	//no last articles? so choose a start article
	$lastArticleId = null;
	$agentSymbol = 0;
}


error_log("Symbol clicked: $symbol");
error_log( json_encode($lastArticles) );
error_log( "Last article ID $lastArticleId");

/***************************
 * 
 * Agent Switch Loop
 * 
 ***************************/ 

switch ($agentSymbol){
	
	case 0: //startarticle
		/* Select one random article from book 0 with symbol $symbol*/
		error_log("\n*** Agent: startarticle ***\n");
		
		$query = "SELECT articles.articleid AS id, text, symbol, book  
				FROM articles
				WHERE book = 0 AND symbol = $symbol
				ORDER BY RAND()";

		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
				//ToDo: restart
			}
			
			//error_log(json_encode($article));
			
			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log("Article: ".json_encode($article));
			echo json_encode($article);
			return;
		}
		
		break;		
	
	case 1: //moeglich
		/* book >= lastbook, minimum 1 equal tag */
		error_log("\n*** Agent: possible ***\n");
		
		
		$lastArticle = getArticle($con, $lastArticleId);
		$lastCategories = getCategories($con, $lastArticleId);
		
		error_log("lastArticle". json_encode($lastArticle));
		error_log("lastCats". json_encode($lastCategories));
		
		$query = "SELECT articles.articleid AS id, text, symbol, book FROM articles " .
				"JOIN articlenodes " .
				"ON articles.articleid = articlenodes.articleid " .
				"WHERE articles.book >= $lastArticle->book AND articlenodes.nodeid IN ("
						. arrayToString($lastCategories).") " .
				"AND articles.articleid NOT IN (" .
					arrayToString($lastArticles).") " .
				"GROUP BY articles.articleid " .
				"ORDER BY book ASC " .
				"LIMIT 1";

		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
			
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
				//ToDo: restart
			}
			
			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;			
		}

		break;
		
	case 2: //notwendig
		/* book >= lastbook, max(tag==tag)*/
		error_log("\n*** Agent: necessary ***\n");

		$lastArticle = getArticle($con, $lastArticleId);
		$lastCategories = getCategories($con, $lastArticleId);
		
		error_log("lastArticle". json_encode($lastArticle));
		error_log("lastCats". json_encode($lastCategories));
		
		$query = "SELECT articles.articleid AS id, text, symbol, book, count(articles.articleid) AS amount FROM articles " .
				"JOIN articlenodes " .
				"ON articles.articleid = articlenodes.articleid " .
				"WHERE articles.book >= $lastArticle->book AND articlenodes.nodeid IN ("
				. arrayToString($lastCategories).") " .
				"AND articles.articleid NOT IN (" .
				arrayToString($lastArticles).") " .
				"GROUP BY id, text, symbol, book " .
				"ORDER BY amount DESC, book ASC " .
				"LIMIT 1";
		
		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
		
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
				//ToDo: restart
			}
			unset($article->amount);
			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;
		}
		break;
		/*
		$lastArticle = getArticle($con, $lastArticleId);
		$lastCategories = getCategoriesEnv($con, $lastArticleId);
		
		error_log("lastArticle". json_encode($lastArticle));
		error_log("lastCats". json_encode($lastCategories));
		
		$query = "SELECT articles.articleid AS id, text, symbol, book FROM articles " .
				"JOIN articlenodes " .
				"ON articles.articleid = articlenodes.articleid " .
				"WHERE articles.book >= $lastArticle->book AND articlenodes.nodeid IN ("
						. arrayToString($lastCategories).") " .
				"AND articles.articleid NOT IN (" .
					arrayToString($lastArticles).") " .
				"GROUP BY articles.articleid " .
				"ORDER BY book ASC " .
				"LIMIT 1";
		
		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
				
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
				//ToDo: restart
			}

			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;
		}
		break;
		*/
	
	case 3: //wahr
		/* book >= lastbook */
		error_log("\n*** Agent: true ***\n");
		
		$lastArticle = getArticle($con, $lastArticleId);
		$lastCategories = getCategories($con, $lastArticleId);
		
		error_log("lastArticle". json_encode($lastArticle));
		error_log("lastCats". json_encode($lastCategories));

		$query = "SELECT articleid AS id, text, symbol, book " .
				"FROM articles " .
				"WHERE articles.book >= $lastArticle->book " .
				"AND articles.articleid NOT IN (" .
					arrayToString($lastArticles).") " .
				"GROUP BY articles.articleid " .
				"ORDER BY book ASC " .
				"LIMIT 1";
		
		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
				
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
			}
		
			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;
		}
		
		break;
		
	
	case 4: //nicht -> ausstieg
		/* Print END article */
		error_log("\n*** Agent: end, not ***\n");
		echo json_encode(null);
		return;
		break;
	
	case 5: //kontigent
		/* mind one tag */
		error_log("\n*** Agent: kontigent ***\n");
		
		$lastArticle = getArticle($con, $lastArticleId);
		$lastCategories = getCategories($con, $lastArticleId);
		
		error_log("lastArticle". json_encode($lastArticle));
		error_log("lastCats". json_encode($lastCategories));
		
		$query = "SELECT articles.articleid AS id, text, symbol, book FROM articles " .
				"JOIN articlenodes " .
				"ON articles.articleid = articlenodes.articleid " .
				"WHERE articlenodes.nodeid IN ("
						. arrayToString($lastCategories).") " .
				"AND articles.articleid NOT IN (" .
					arrayToString($lastArticles).") " .
				"GROUP BY articles.articleid " .
				"ORDER BY RAND() " .
				"LIMIT 1";

		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
			
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
				//ToDo: restart
			}
			
			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;			
		}

		break;
		
	case 6: //unendlich
		/* Select a random article */
		error_log("\n*** Agent: infinity ***\n");
		
		$query = "SELECT articleid AS id, text, symbol, book " .
				"FROM articles " .
				"WHERE articleid != $lastArticleId " .
				"ORDER BY RAND() " .
				"LIMIT 1";
		
		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
			
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
			}

			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;
		}
		
		break;
		
	case 7: //wirklich
		/* max(tag==tag)*/
		error_log("\n*** Agent: real ***\n");		
		
		$lastArticle = getArticle($con, $lastArticleId);
		$lastCategories = getCategories($con, $lastArticleId);
		
		error_log("lastArticle". json_encode($lastArticle));
		error_log("lastCats". json_encode($lastCategories));
		
		$query = "SELECT articles.articleid AS id, text, symbol, book, count(articles.articleid) AS amount FROM articles " .
				"JOIN articlenodes " .
				"ON articles.articleid = articlenodes.articleid " .
				"WHERE articlenodes.nodeid IN ("
					. arrayToString($lastCategories).") " .
				"AND articles.articleid NOT IN (" .
					arrayToString($lastArticles).") " .
				"GROUP BY id, text, symbol, book " .
				"ORDER BY amount DESC " .
				"LIMIT 1";
		
		if ($result = $con->query($query)) {
			$article = $result->fetch_object();
			$result->close();
		
			if( $article == null){
				error_log("No article was found!");
				echo json_encode(null);
				return;
				//ToDo: restart
			}
			
			unset($article->amount);
			$article = addArticleInfo($con, $article, $symbol, $lastArticles);
			error_log(json_encode($article));
			echo json_encode($article);
			return;
		}
		break;
		
	default: // no/unknown symbol
		
		
		break;
}

?>