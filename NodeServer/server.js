var express = require('express');
var mysql = require('mysql');
var qs = require('querystring');
var fs = require('fs');
var connect = require('connect');
var multiparty = require('multiparty');
var random = require('random');


//global variables for agent
var clickedSymbol, nextSymbol;
var symbols = new Array("Moeglich", "Notwendig", "Wahr", "Nicht", "Kontingent", "Unendlich", "Wirklich");

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
	
	
	
	

	//Get clicked symbol
	//var choosedSymbol = req...;
	
	// ToDo: implement agent
	
	//clickedSymbol = nextSymbol;
	res.send("moeglich");
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
	
	connection.query('SELECT articleid AS id, name, text FROM articles', function(err, articles, fields) {
		  if (err) throw err;

		  console.log(articles);
		  res.send(articles);
	});
});

/*** nodes ***/
app.get('/get/nodes', function(req, res) {
	
	connection.query('SELECT nodeid AS id, nodes.name AS name, x, y FROM nodes', function(err, nodes, fields) {
		if (err) throw err;
		
		connection.query('SELECT * FROM links', function(err, links, fields) {
			if (err) throw err;
			
			var list = new Object();
			list.nodes = nodes;
			list.links = links;
			
			console.log(list);
			res.send(list);
			
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
            
            var datalength = data.nodes.length + data.deletedNodes.length + data.links.length;
            
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
            		connection.query("REPLACE INTO nodes SET ?", node, function(err, result) {
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
            console.log(data.links);
            for(var i = 0; i < data.links.length; i++){
            	console.log(data.links[i].source.id + "-> " + data.links[i].target.id + "(" + data.links[i] + ")");
            	var link = {source: data.links[i].source.id, target: data.links[i].target.id};
        		connection.query("REPLACE INTO links SET ?", link, function(err, result) {
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