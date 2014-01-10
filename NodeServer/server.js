var express = require('express');
var mysql = require('mysql');
var qs = require('querystring');
var url = require('url');
var fs = require('fs');
var connect = require('connect');
var multiparty = require('multiparty');
var random = require('random');
var us = require('underscore')._;

	
/******************************************************************
 * 
 *  setup mySQL connection 
 *  
 *  **************************************************************/
var connection = mysql.createConnection({
	  	host     	: 'kolbe.no-ip.org',
		user     	: 'faden',
		password 	: 'unsichtbar',
		database 	: 'derunsichtbarefaden'
});

connection.connect(function(err) {
	if( err ){
		console.log("Database error!");
		console.log(err);
		throw err;
	} else {
		console.log("Connected to Database");
	}
});

/******************************************************************
 * 
 *  setup server 
 *  
 *  **************************************************************/
var port = 8888;
var app = express();


app.use(express.compress()); // compress content
app.use(express.static(__dirname + '/html'));
app.use(express.cookieParser());
app.use(express.session({secret: '1234567890QWERTY'}));
app.use(app.router);

//redirect to frontend
app.get('/', function(req, res){
  res.redirect('/frontend');
});

/******************************************************************
 * 
 *  API
 *  
 *  **************************************************************/

/******** AGENT *********/
app.post('/post/agent', function(req, res) {
	
	var self = this;
	

	if (req.method == 'POST') {
		
		var clickedSymbol = '';
		req.on('data', function(data) {
			clickedSymbol += data;	
		});
		
		req.session.last = clickedSymbol;
		req.on('end', function() {
			console.log(clickedSymbol);
			
			//fake agent ;)
			connection.query("SELECT text FROM articles", [], function(err, result) {
					if (err) throw err;
					res.send(result[random.rand(0,result.length - 1)].text);
			});
			
			//get the next symbols from article symbol id
			var symbol = 1; //moeglich
			if( symbol == 4){ 
				//symbol = NICHT --> Exit
				console.log("EXIT");
			}
			
			var query = "SELECT symbols.id, symbols.name, symbols.icon FROM symlinks " +
						"JOIN symbols " +
						"ON symlinks.target = symbols.id " +
						"WHERE source = ?";
			
			connection.query(query, symbol, function(err, symbols, fields) {
				if(err) throw err;
				
				console.log(symbols);
			});


			//get random article ID on start
//			if (self.lastArticleID == null) {
//				connection.query("SELECT articleid FROM articlenodes", [], function(err, result) {
//					if (err) throw err;
//					self.lastArticleID = result[random.rand(0,result.length - 1)].articleid;
//					console.log("actual " + self.lastArticleID);
//					res.send("send" + self.lastArticleID);
//				});
//			} else {
//			
//				var nextArticles = new Array();
//				
//				switch(clickedSymbol) {
//				case "moeglich":
//					connection.query("SELECT nodeid FROM articlenodes WHERE articleid = ?", [self.lastArticleID], function(err, nodes) {
//						if (err) throw err;
//						connection.query("SELECT * FROM articlenodes", [], function(err, articlenodes){
//							for (var i = 0; i < nodes.length; i++) {
//								for (var j = 0; j < articlenodes.length; j++) {
//									if (articlenodes[j].articleid != self.lastArticleID) {
//										if (nodes[i].nodeid == articlenodes[j].nodeid) {
//											nextArticles.push(articlenodes[j].articleid);
//											req.session.last = articlenodes[j].nodeid;
//											console.log("last: " + req.session.last);
//										}
//									}
//								}
//							}
//						});
//					});
//					if (nextArticles.length != 0)
//						self.lastArticleID = us.uniq(nextArticles)[random.rand(0,nextArticles.length-1)];
//					//res.send(self.lastArticleID);
//					break;
//				case "notwendig":
//					connection.query("SELECT nodeid FROM articlenodes WHERE articleid = ?", [self.lastArticleID], function(err, nodes) {
//						if (err) throw err;
//						self.lastArticleID = nodes[random.rand(0,nodes.length - 1)].articleid;
//						console.log(nodes);
//						connection.query("SELECT source, target FROM links ", [nodes.nodeid], function(err, links) {
//							
//							var targets = new Array();
//							for (var i = 0; i < links.length; i++) {
//								for (var j = 0; j < nodes.length; j++) {
//									if (nodes[j].nodeid == links[i].source) {
//										console.log(links[i]);
//										targets.push(links[i].target);
//									}
//								}
//							}
//							connection.query("SELECT articlenodes.articleid  FROM articlenodes, links WHERE articlenodes.nodeid = ?", [targets[random.rand(0,targets.length)]] ,function(err,articleid){
//								
//								console.log(articleid);
//							});
//							
//						});
//						
//						self.lastArticleID = result[random.rand(0,result.length - 1)].articleid;
//					});
//					self.lastArticleID = 10;
//					nextArticles.push(10);
//					console.log("nextArticles " + nextArticles[0]);
//					break;
//				case "wirklich" :
//					connection.query("SELECT * FROM articlenodes ORDER BY articleid", [], function(err, articlenodes) {
//						console.log(articlenodes);
//						if (err) throw err;
//						connection.query("SELECT nodeid FROM articlenodes WHERE articleid = ?", [self.lastArticleID], function(err, nodes) {
//							if (err) throw err;
//							var articleids = new Array();
//							var lastArticleid, nextArticleid;
//							var counter = 0;
//							for (var i = 0; i < nodes.length; i++) {
//								for (var j = 0; j < articlenodes.length; j++) {
//									nextArticleid = articlenodes[j].articleid;
//									if (nextArticleid != self.lastArticleID) {
//										if (nodes[i].nodeid == articlenodes[j].nodeid && lastArticleid == nextArticleid) {
//											
//										}
//									}
//									articleids.push(articlenodes[i].articleid);
	//								if (articleid != lastArticleid[i] || lastArticleid == null) {
	//									lastArticleid.push(articleid);
	//								}
	//								console.log("a: " +lastArticleid);
									//console.log("l: " +lastArticleid);
//								}
//							}
//							
//							articleids = us.uniq(articleids);
//							console.log(articleids);
//							console.log("last: " + req.session.last);
//							nodes;
//						});
//					});
//					
//					//nextArticles.push(10);
//					if (nextArticles.length != 0)
//						self.lastArticleID = 13;
//					
//					//res.send(self.lastArticleID);
//					break;
//				case "unendlich" :
//					connection.query("SELECT articleid FROM articlenodes GROUP BY articleid", [], function(err, articleids) {
//						for (var i = 0; i < articleids.length; i++) {
//							nextArticles.push(articleids[i].articleid);
//						}
//						if (nextArticles.length != 0)
//							self.lastArticleID = nextArticles[random.rand(0,nextArticles.length-1)];
//						console.log("next " + nextArticles);
//						
//						console.log(self.lastArticleID);
//					});
//					console.log("next " + nextArticles);
//					res.send("unendlich " + self.lastArticleID);
//					break;
//				case "wahr" :
//					break;
//				case "kontingent" :
//					break
//				case "nicht" :
//					break;
//				}
//			
//			
//				res.send("d " + self.lastArticleID);
//		}
			
			
			
			
		
		});
	};
	//res.send("asd " + self.lastArticleID);
	//console.log("last " + self.lastArticleID);
});

/*
 * Returns the possiblie navigation symbols for an article
 */
function getSymbols(article, callback){
	//get symbols query
	var symbolQuery = 	"SELECT symbols.id, symbols.name, symbols.icon FROM symlinks " +
						"JOIN symbols " +
						"ON symlinks.target = symbols.id " +
						"WHERE source = ?";
	
	//get symbols
	connection.query(symbolQuery, article.symbol, function(err, symbols, fields) {
		if(err) throw err;
		//console.log("Symbols", symbols);
		article.symbols = symbols;
		
		callback(article);		
	});
}

/*
 * Returns id, text, symbol and book number of an article
 */
function getArticle(articleId, callback){
	var query = "SELECT articleid AS id, text, symbol, book " +
				"FROM articles " +
				"WHERE articleid = ?";
	
	connection.query(query, articleId,function(err, article, fields) {
		if(err) throw err;
		
		callback(article[0]);	
	});
}

/*
 * Returns the categories of an article
 */
function getCategories(articleId, callback){
	var query = "SELECT nodeid FROM articlenodes " +
				"WHERE articleid = ?";

	connection.query(query, articleId,function(err, categories, fields) {
		if(err) throw err;
		
		var catIds = Array();
		for(var i=0; i<categories.length; i++)
			catIds.push(categories[i].nodeid);
		callback(catIds);
	});
}

/*
 * Returns the categories and directly linked categories of an article
 */
function getCategoriesEnv(articleId, callback){
	getCategories(articleId, function(catIds){
	var query = "SELECT * FROM nodes " +
				"JOIN links " +
				"ON nodes.nodeid = links.source OR nodes.nodeid = links.target " +
				"WHERE links.source IN (?) OR links.target IN (?)";
		connection.query(query, [catIds, catIds],function(err, categories, fields) {
			if(err) throw err;
			
			var catIds = Array();
			for(var i=0; i<categories.length; i++)
				catIds.push(categories[i].nodeid);
			
			//remove duplicates
			var temp = new Array();
			catIds.sort();
			for (i = 0; i < catIds.length; i++) {
				if (catIds[i] == catIds[i + 1])
					continue;
				temp[temp.length] = catIds[i];
			}
			
			callback(temp);
		});		
	});
}

/*
 * The agent is called by the frontend. It selects articles by defined rules (last articles, clicked symbol..)
 */
app.get('/agent', function(req, res){
	
	//Setup params
	var url_parts = url.parse(req.url, true);
	var getParam = url_parts.query;
	console.log("Agent GET parameters", getParam);
	
	var lastSymbol = 0;	
	if(getParam.symbol != null)
		lastSymbol = parseInt(getParam.symbol);
	var lastArticles = new Array();
	if(getParam.lastArticles != null)
		lastArticles = JSON.parse(getParam.lastArticles);
	
	var lastArticleId = 0;
	if( lastArticles.length > 0)
		lastArticleId = lastArticles[lastArticles.length-1];	
	
	//select article by symbol function
	switch(lastSymbol){
	case 1: //moeglich
		/* book >= lastbook, minimum 1 equal tag */
		console.log("Agent: possible");		
		
		getArticle(lastArticleId, function(lastArticle){
			console.log("CALLBACK", lastArticle);
			getCategories(lastArticle.id, function(categories){
				console.log(categories);
				
				var query = "SELECT articles.articleid AS id, text, symbol, book FROM articles " +
							"JOIN articlenodes " +
							"ON articles.articleid = articlenodes.articleid " +
							"WHERE articles.book >= ? AND articlenodes.nodeid IN (?) " +
							"AND articles.articleid NOT IN (?) " +
							"GROUP BY articles.articleid " +
							"ORDER BY book ASC " +
							"LIMIT 1";
				connection.query(query, [lastArticle.book, categories, lastArticles],function(err, articles, fields) {
					if(err) throw err;
					
					console.log(articles);
					var article = articles[0];
					getSymbols(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						res.send(article);
					});
				});
			});
		});
		break;
	case 2: //notwendig
		/* book >= lastbook, connected tag*/
		console.log("Agent: possible");
		
		getArticle(lastArticleId, function(lastArticle){
			console.log("Last Article", lastArticle);
			getCategoriesEnv(lastArticle.id, function(categories){
				console.log(categories);
				
				var query = "SELECT articles.articleid AS id, text, symbol, book FROM articles " +
							"JOIN articlenodes " +
							"ON articles.articleid = articlenodes.articleid " +
							"WHERE articles.book >= ? AND articlenodes.nodeid IN (?) " +
							"AND articles.articleid NOT IN (?) " +
							"GROUP BY articles.articleid " +
							"ORDER BY book ASC " +
							"LIMIT 1";
				connection.query(query, [lastArticle.book, categories, lastArticles],function(err, articles, fields) {
					if(err) throw err;
					
					console.log(articles);
					var article = articles[0];
					getSymbols(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						res.send(article);
					});
				});
			});
		});
		break;
	case 3: //wahr
		/* book >= lastbook, max(tag==tag)*/
		console.log("Agent: possible");
		
		getArticle(lastArticleId, function(lastArticle){
			console.log("Last Article", lastArticle);
			getCategories(lastArticle.id, function(categories){
				console.log(categories);
				
				var query = "SELECT articles.articleid AS id, text, symbol, book, count(articles.articleid) AS amount FROM articles " +
							"JOIN articlenodes " +
							"ON articles.articleid = articlenodes.articleid " +
							"WHERE articles.book >= ? AND articlenodes.nodeid IN (?) " +
							"AND articles.articleid NOT IN (?) " +
							"GROUP BY id, text, symbol, book " +
							"ORDER BY amount DESC, book ASC " +
							"LIMIT 1";
				connection.query(query, [lastArticle.book, categories, lastArticles],function(err, articles, fields) {
					if(err) throw err;
					
					console.log(articles);
					var article = articles[0];
					
					//delete amount because we don't need it
					delete article.amount;
					
					getSymbols(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						res.send(article);
					});
				});
			});
		});
		break;
	case 4: //nicht -> ausstieg
		/* Print END article */
		console.log("Agent: not");
		
		var query = "SELECT articleid AS id, text, symbol, book FROM articles WHERE symbol = 4 ORDER BY RAND() LIMIT 1";
		connection.query(query, function(err, articles, fields) {
			if(err) throw err;
			
			var article = articles[0];
			console.log("article", article);
			getSymbols(article, function(article){
				lastArticles.push(article.id);
				article.lastArticles = lastArticles;
				res.send(article);
			});			
		});
		break;
	case 5: //kontigent
		/* connected tags */
		console.log("Agent: possible");
		
		getArticle(lastArticleId, function(lastArticle){
			console.log("Last Article", lastArticle);
			getCategoriesEnv(lastArticle.id, function(categories){
				console.log(categories);
				
				var query = "SELECT articles.articleid AS id, text, symbol, book FROM articles " +
							"JOIN articlenodes " +
							"ON articles.articleid = articlenodes.articleid " +
							"WHERE articles.book >= ? AND articlenodes.nodeid IN (?) " +
							"AND articles.articleid NOT IN (?) " +
							"GROUP BY articles.articleid " +
							"ORDER BY RAND() " +
							"LIMIT 1";
				connection.query(query, [lastArticle.book, categories, lastArticles],function(err, articles, fields) {
					if(err) throw err;
					
					console.log(articles);
					var article = articles[0];
					getSymbols(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						res.send(article);
					});
				});
			});
		});
		break;
	case 6: //unendlich
		/* Select a random article */
		console.log("Agent: infinity");
		
		var query = "SELECT articleid AS id, text, symbol, book " +
					"FROM articles " +
					"WHERE articleid != ? " +
					"ORDER BY RAND() " +
					"LIMIT 1";
		connection.query(query, lastArticleId, function(err, articles, fields) {
			if(err) throw err;
			
			var article = articles[0];
			console.log("article", article);
			getSymbols(article, function(article){
				lastArticles.push(article.id);
				article.lastArticles = lastArticles;
				res.send(article);
			});		
		});
		break;
	case 7: //wirklich
		/* max(tag==tag)*/
		console.log("Agent: possible");
		
		getArticle(lastArticleId, function(lastArticle){
			console.log("Last Article", lastArticle);
			getCategories(lastArticle.id, function(categories){
				console.log(categories);
				
				var query = "SELECT articles.articleid AS id, text, symbol, book, count(articles.articleid) AS amount FROM articles " +
							"JOIN articlenodes " +
							"ON articles.articleid = articlenodes.articleid " +
							"WHERE articlenodes.nodeid IN (?) " +
							"AND articles.articleid != ? " +
							"GROUP BY id, text, symbol, book " +
							"ORDER BY amount DESC, book ASC ";
							//"LIMIT 1";
				connection.query(query, [categories, lastArticleId],function(err, articles, fields) {
					if(err) throw err;
					
					console.log(articles);
					
					//can't select all articles with most same tags, so do it with JS
					var maxTags = new Array();
					for(var i=0; i<articles.length; i++)
						if(articles[i].amount == articles[0].amount)
							maxTags.push(articles[i]);
					
					//choose a random article from most same tags
					var article = maxTags[Math.floor(Math.random() * maxTags.length)];
					
					//delete amount because we don't need it
					delete article.amount;
					
					getSymbols(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						res.send(article);
					});
				});
			});
		});
		break;	
	default: // no/unknown symbol -> startarticle
		/* Select one random article from book 1 */
		console.log("Agent: startarticle");
		
		var query = "SELECT articleid AS id, text, symbol, book FROM articles WHERE book = 1 ORDER BY RAND() LIMIT 1";
		connection.query(query, function(err, articles, fields) {
			if(err) throw err;
			
			var article = articles[0];
			console.log("article", article);
			getSymbols(article, function(article){
				lastArticles.push(article.id);
				article.lastArticles = lastArticles;
				res.send(article);
			});		
		});
	}
	
});	

/**** Save article ******/
app.post('/save/article', function(req, res) {
    if (req.method == 'POST') {
        var body = '';
        
        req.on('data', function (data) {
            body += data;
        });
        
        req.on('end', function () {
        	
        	var data = JSON.parse(body);
        	var catLength = data.categories.length;
        	var article = { name : data.headline, 
        					text : data.content, 
        					screen : data.screen, 
        					symbol : data.symbol,
        					book : data.book };
        	
        	if( data.id != null){
        		//update
        		article.articleid = data.id;
        		console.log("Update!", article);        		
        	}
        	
    		connection.query("INSERT INTO articles SET ? ON DUPLICATE KEY UPDATE ?", [article, article], function(err, result) {
    			if(err) throw err;
    			
    			var id = data.id != null ? data.id : result.insertId;
    			console.log(id);
    			
    			//delete all article->categories
    			connection.query("DELETE FROM articlenodes WHERE articleid = ?", id, function(err, result) {
    				if(err) throw err;
    				
    				//add new article->categories
    				for(var i=0; i<data.categories.length; i++){
        				var c = { articleid : id, nodeid : data.categories[i]};
        				connection.query("INSERT INTO articlenodes SET ?", c, function(err, result) {
        					if(err) throw err;
        					
        					if( --catLength <= 0){
        						var r = new Object();
        						r.id = id;
        						res.send(r);
        					}
        						        						
        				});
        			}
    				
    			});
    		});      	
        });
    } else {
    	res.send("Error", 500);
    }
});

/**** Image Upload ******/

app.post('/upload', function(req, res) {
	
	var form = new multiparty.Form({uploadDir: __dirname + '/html/upload/images'});
    form.parse(req, function(err, fields, files) {
    	var path = files.image[0].path;
    	var imageName = path.substr(path.lastIndexOf('/') +1);
      	fs.readFile(path, function (err, data) {
			if (!imageName) {
				console.log("Error Image Upload");
				res.redirect("/");
				res.end();
			} else {
				var newPath = __dirname + "/images/" + imageName;
				fs.writeFile(newPath, data, function(err) {
					//TODO Fehlermeldung ausgeben
				});
			};
      	});
        res.send("<script>top.$('.mce-btn.mce-open').parent().find('.mce-textbox').val('"+ req.protocol + "://" + req.get('host') + '/upload/images/' + imageName + "').closest('.mce-window').find('.mce-primary').click();</script>");
    });
});


/*** articles ***/
app.get('/get/articles', function(req, res) {
	
	var query = 'SELECT articles.articleid AS id, articles.name AS name, text, screen, book, ' +
						'symbols.id AS symID, symbols.name AS symName, symbols.icon AS symIcon, ' + 
						'nodes.nodeid AS nodeid, nodes.name AS category ' +
				'FROM articles ' +
				'LEFT JOIN 	articlenodes 	ON articles.articleid = articlenodes.articleid ' +
				'LEFT JOIN  nodes 			ON articlenodes.nodeid = nodes.nodeid ' +
				'JOIN symbols ON articles.symbol = symbols.id';
	connection.query(query, function(err, articles, fields) {
		  if (err) throw err;

		  var filteredArticles = Array();
		  var lastId = -1;
		  for(var i=0; i<articles.length; i++){
			  if( articles[i].id == lastId ){
				  filteredArticles[filteredArticles.length-1].category.push({
					  				id: articles[i].nodeid,
					  				name : articles[i].category
				  });
			  } else {
				  lastId = articles[i].id;
				  var article = articles[i];
				  
				  if( Object.prototype.toString.call( article.category ) !== '[object Array]' ) {
					  if( article.category != null)
						  article.category = Array({ id: article.nodeid,name : article.category});
				  }
				  filteredArticles.push(article);
			  }
		  }
		  
		  for(var i=0; i<filteredArticles.length; i++){
			  delete filteredArticles[i].nodeid;
			  if( filteredArticles[i].screen == "" )
				  filteredArticles[i].screen = null;
			  
			  console.log(filteredArticles[i].id + " " + filteredArticles[i].name);
			  if( filteredArticles[i].category != null)
				  for(var j=0; j<filteredArticles[i].category.length; j++)
					  console.log("\t" + filteredArticles[i].category[j].id + ":" +
							  filteredArticles[i].category[j].name);
		  }
		  
		  res.send(filteredArticles);
	});
});

app.post('/delete/article', function(req, res) {
	if (req.method == 'POST') {
        var body = '';
        
        req.on('data', function (data) {
            body += data;
        });
        
        req.on('end', function () {
        	
        	var id = JSON.parse(body);
        	console.log("delete artice "+ id);
        	connection.query("DELETE FROM articles WHERE articleid = ?", id, function(err, result) {
    			if(err) throw err;
    			
    			res.send('OK');
    		});
        	
        });
	}	
});

/*** nodes ***/
app.get('/get/nodessymbols', function(req, res) {
	
	connection.query('SELECT nodeid AS id, nodes.name AS name, x, y FROM nodes', function(err, nodes, fields) {
		if (err) throw err;
		
		console.log("Got nodes...");		
		connection.query('SELECT * FROM links', function(err, links, fields) {
			if (err) throw err;
			
			console.log("Got links...");			
			var list = new Object();
			list.nodes = nodes;
			list.links = links;
			
			connection.query('SELECT * FROM symbols', function(err, symbols, fields) {
				if (err) throw err;

				console.log("Got symbols...");
				list.symbols = symbols;
				console.log(list);
				res.send(list);
			});
			
			
		});
	});
});

app.post('/set/nodes', function(req, res) {
	
	console.log('save nodes...');
	
    if (req.method == 'POST') {
        var body = '';
        
        req.on('data', function (data) {
            body += data;
        });
        
        req.on('end', function () {
            var data = JSON.parse(body);
            
            var datalength = data.nodes.length + data.deletedNodes.length + data.links.length + data.deletedLinks.length;
            
            //call this for every successful query
            function decraseDatalength(){
            	datalength--;
            	if(datalength <= 0){
            		console.log("data saved!");
            		res.send('OK');
            	}
            }
            
            //update nodes
            for(var i = 0; i < data.nodes.length; i++){
            		console.log("node: " + data.nodes[i].id + ": " + data.nodes[i].name );
            		var node = {nodeid: data.nodes[i].id, name: data.nodes[i].name, x: data.nodes[i].x, y:  data.nodes[i].y};
            		connection.query("INSERT INTO nodes SET ? ON DUPLICATE KEY UPDATE ?", [node, node], function(err, result) {
            			if(err) throw err;
            			decraseDatalength();
            		});
            }
            
            //deleted nodes
            for(var i = 0; i < data.deletedNodes.length; i++){
            	console.log("deleted: " + data.deletedNodes[i].id + ": " + data.deletedNodes[i].name );
        		connection.query("DELETE FROM nodes WHERE nodeid = ?", data.deletedNodes[i].id, function(err, result) {
        			if(err) throw err;
        			decraseDatalength();
        		});
            }

            //update links
            for(var i = 0; i < data.links.length; i++){
            	console.log(data.links[i].source.id + "-> " + data.links[i].target.id + "(" + data.links[i] + ")");
            	var link = {source: data.links[i].source.id, target: data.links[i].target.id};
        		connection.query("INSERT INTO links SET ? ON DUPLICATE KEY UPDATE ?", [link, link], function(err, result) {
        			if(err) throw err;
        			decraseDatalength();
        		});
            }
            
            //deleted links
            for(var i = 0; i < data.deletedLinks.length; i++){
            	console.log("deleted: " + data.deletedLinks[i].source.id + "->" + data.deletedLinks[i].target.id );
            	var source = data.deletedLinks[i].source.id;
            	var target = data.deletedLinks[i].target.id;
            	connection.query("DELETE FROM links WHERE source = ? AND target = ?", [source, target], function(err, result) {
        			if(err) throw err;
        			decraseDatalength();
        		});
            }
            
        });
    }
});


/******************************************************************
 * 
 *  start server 
 *  
 *  **************************************************************/
app.listen(port);
console.log("Server started on port " + port);