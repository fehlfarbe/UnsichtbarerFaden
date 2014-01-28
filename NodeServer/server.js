var express = require('express');
var mysql = require('mysql');
var qs = require('querystring');
var url = require('url');
var crypto = require('crypto');
var fs = require('fs');
var http = require("http");
var https = require("https");
var connect = require('connect');
var multiparty = require('multiparty');
var random = require('random');
var us = require('underscore')._;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

/******************************************************************
 * 
 * setup https
 * 
 *****************************************************************/
var HTTPSoptions = {
		  key: fs.readFileSync('privatekey.pem').toString(),
		  cert: fs.readFileSync('certificate.pem').toString()
};


	
/******************************************************************
 * 
 *  setup mySQL connection 
 *  
 *  **************************************************************/
var connection = mysql.createConnection({
	  	host     	: 'kolbe.no-ip.org',
		//host		: 'localhost',
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
 * setup login
 * 
 *****************************************************************/
passport.use(new LocalStrategy(function(username, password, done) {
	// insert your MongoDB check here. For now, just a simple hardcoded check.
	console.log("Login", username);
	var query = "SELECT * FROM user WHERE username = ? AND password = PASSWORD(?)";

	// get symbols
	connection.query(query, [username, password], function(err, user, fields) {
		if (err)
			throw err;
		
		if( user != undefined && user.length > 0)
			done(null, { id: user.id, username: user.username });
		else
			done(null, false);
	});
}));

passport.serializeUser(function(user, done) {
	console.log("serialize", user);
	done(null, user);
});

passport.deserializeUser(function(id, done) {
	console.log("deserialize", id);
	done(null, id);
});

var auth = function(req, res, next) {

	if (!req.isAuthenticated())
		res.send(401);
	else
		next();
};


/*******************************************************************************
 * 
 * setup server
 * 
 ******************************************************************************/
var port = 8888;
var app = express();


app.use(express.compress()); // compress content
app.use(express.static(__dirname + '/html'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());
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
 * Returns the number of articles with the same book Id
 */
function getBookCount(bookId, callback){

	var query = "SELECT count(book) AS bookCount FROM articles " +
				"WHERE book = " + bookId; // ? doesn't work...however?

	connection.query(query,function(err, books, fields) {
		if(err) throw err;
		
		console.log("Articles with Book: " + bookId, books[0]);
		
		callback(books[0].bookCount);
	});	
}

/*
 * Returns total article count
 */
function getArticleCount(callback){
	
	var query = "SELECT count(*) AS total FROM articles";
	connection.query(query,function(err, count, fields) {
		if(err) throw err;
		
		console.log("Total articles ", count[0].total);
		
		callback(count[0].total);
	});
}

/*
 * returns nodes connected with article
 */
function getNodes(articleId, callback){
	
	var query = "SELECT nodes.nodeid, nodes.name, x, y " +
			"FROM articles " +
			"JOIN articlenodes " +
			"ON articles.articleid = articlenodes.articleid " +
			"JOIN nodes " +
			"ON articlenodes.nodeid = nodes.nodeid " +
			"WHERE articles.articleid = ?";
	
	connection.query(query, articleId, function(err, nodes, fields) {
		if(err) throw err;
		
		console.log("Nodes for article " + articleId, nodes);
		
		callback(nodes);
	});
}

/*
 * Adds:
 * symbols,
 * the number of articles with the same book Id,
 * total article count
 * nodes with coords
 */
function addArticleInfo(article, callback){
	getSymbols(article, function(article){
		getBookCount(article.book, function(bookCount){
			article.bookCount = bookCount;
			getArticleCount(function(count){
				article.totalCount = count;
				getNodes(article.id, function(nodes){
					article.nodes = nodes;
					callback(article);
				});
			});
		});
	});
}

/*
 * Agent loop...
 */
function agent(param, callback){
	
	var lastSymbol = 0;
	console.log("PARAM", param);
	
	if(param.symbol != null)
		lastSymbol = parseInt(param.symbol);
	
	var lastArticles = new Array();
	if(param.lastArticles != null){
		if( param.lastArticles instanceof Array)
			lastArticles = param.lastArticles;
		else
			lastArticles = JSON.parse(param.lastArticles);
	}
	else
		lastSymbol = 0; //no lastArticles == startPage 
	
	var lastArticleId = 0;
	if( lastArticles.length > 0)
		lastArticleId = lastArticles[lastArticles.length-1];	
	
	console.log(lastSymbol);
	console.log(lastArticles);
	
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
					
					//no article was found
					if(articles.length == 0){
						param.symbol = 6; //random
						agent(param, callback);
						return;
					}		
					
					var article = articles[0];
					addArticleInfo(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						callback(article);
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
					
					//no article was found
					if(articles.length == 0){
						param.symbol = 6; //random
						agent(param, callback);
						return;
					}					
					
					var article = articles[0];
					addArticleInfo(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						callback(article);
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
					
					//no article was found
					if(articles.length == 0){
						param.symbol = 6; //random
						agent(param, callback);
						return;
					}
					
					var article = articles[0];
					
					//delete amount because we don't need it
					delete article.amount;
					
					addArticleInfo(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						callback(article);
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
			addArticleInfo(article, function(article){
				lastArticles.push(article.id);
				article.lastArticles = lastArticles;
				callback(article);
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
					addArticleInfo(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						callback(article);
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
			addArticleInfo(article, function(article){
				lastArticles.push(article.id);
				article.lastArticles = lastArticles;
				callback(article);
			});	
		});
		break;
	case 7: //wirklich
		/* max(tag==tag)*/
		console.log("Agent: real");
		
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
					
					addArticleInfo(article, function(article){
						lastArticles.push(article.id);
						article.lastArticles = lastArticles;
						callback(article);
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
			addArticleInfo(article, function(article){
				lastArticles.push(article.id);
				article.lastArticles = lastArticles;
				callback(article);
			});	
		});
	}
	
}

/*
 * The agent is called by the frontend. It selects articles by defined rules (last articles, clicked symbol..)
 */
app.get('/agent', function(req, res){
	
	//Setup params
	var url_parts = url.parse(req.url, true);
	var getParam = url_parts.query;
	console.log("Agent GET parameters", getParam);
	
	agent(getParam, function(article){
		res.send(article);
	});
	
});

/****************************************************
 * 
 * BACKEND
 * 
 * 
 ***************************************************/

/*********
 * LOGIN 
 ********/
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
	res.send(req.isAuthenticated() ? req.user : '0');
});

// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
	user = req.body.username;
	req.login(user, function(err) {
		if (err) {
			throw err;
			return next(err);
		}
		
		res.send({ username : user});
	});
});
// route to log out
app.post('/logout', function(req, res) {
	req.logOut();
	res.send(200);
});

/**** Save article ******/
app.post('/save/article', auth, function(req, res) {
    if (req.method == 'POST') {
        	
    	var data = req.body;
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
    } else {
    	res.send("Error", 500);
    }
});

/**** Image Upload ******/

app.post('/upload', auth, function(req, res) {
	
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
app.get('/get/articles', auth, function(req, res) {
	
	var query = 'SELECT articles.articleid AS id, articles.name AS name, text,  book, ' +
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

app.post('/delete/article', auth, function(req, res) {
	
	if (req.method == 'POST') {
		console.log("Body", req.body);
    	var id = req.body.id;
    	console.log("delete artice", id);
    	connection.query("DELETE FROM articles WHERE articleid = ?", id, function(err, result) {
			if(err) throw err;
			
			res.send('OK');
		});
	}	
	
});

/*** nodes ***/
app.get('/get/nodessymbols', auth, function(req, res) {
	
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

app.post('/set/nodes', auth, function(req, res) {
	
	console.log('save nodes...');
	
    if (req.method == 'POST') {
        var data = req.body;
                    
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
    }
});


/******************************************************************
 * 
 *  start server 
 *  
 *  **************************************************************/
//Create an HTTP service.
//http.createServer(app).listen(port);
// Create an HTTPS service identical to the HTTP service.
https.createServer(HTTPSoptions, app).listen(port+1); 	//https
http.createServer(app).listen(port);					//http
//app.listen(port);
console.log("Server started on port " + port);