var express = require('express');
var mysql = require('mysql');
var qs = require('querystring');

/******************************************************************
 * 
 *  setup mySQL connection 
 *  
 *  **************************************************************/
var connection = mysql.createConnection({
	  host     : 'localhost',
	  user     : 'faden',
	  password : 'unsichtbar',
	  database : 'derunsichtbarefaden',
});

connection.connect(function(err) {
	if( err ){
		console.log("Database error!");
		console.log(err);
	}
});

/******************************************************************
 * 
 *  setup server 
 *  
 *  **************************************************************/
var app = express();
app.use(express.compress()); // compress content
app.use(express.static(__dirname + '/html'));

/******************************************************************
 * 
 *  sites 
 *  
 *  **************************************************************/

/*** articels ***/
app.get('/get/articles', function(req, res) {
	
	connection.query('SELECT articleid AS id, name, text FROM articles', function(err, articles, fields) {
		  if (err) throw err;

		  console.log(articles);
		  res.send(articles);
	});
});

/*** nodes ***/
app.get('/get/nodes', function(req, res) {
	
	connection.query('SELECT nodeid AS id, nodes.name AS name FROM nodes', function(err, nodes, fields) {
		if (err) throw err;
		
		connection.query('SELECT src AS source, dst AS target, relation AS type FROM noderelations', function(err, links, fields) {
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
            	console.log(--datalength);
            	if(datalength <= 0){
            		console.log("data saved!");
            		res.send('OK');
            	}
            }
            
            //update nodes
            for(var i = 0; i < data.nodes.length; i++){
            		console.log("node: " + data.nodes[i].id + ": " + data.nodes[i].name );
            		var node = {nodeid: data.nodes[i].id, name: data.nodes[i].name};
            		connection.query("REPLACE INTO nodes SET ?", node, function(err, result) {
            			if(err) throw err;
            			decraseDatalength()
            		});            	
            }
            //deleted nodes
            for(var i = 0; i < data.deletedNodes.length; i++){
            	console.log("deleted: " + data.deletedNodes[i].id + ": " + data.deletedNodes[i].name );
            	//var node = {nodeid: data.nodes[i].id, name: data.nodes[i].name};
        		connection.query("DELETE FROM nodes WHERE nodeid = ?", data.deletedNodes[i].id, function(err, result) {
        			if(err) throw err;
        			decraseDatalength()
        		}); 
            }
            
            
            //update links
            console.log(data.links);
            for(var i = 0; i < data.links.length; i++){
            	console.log(data.links[i].source.id + "-> " + data.links[i].target.id + "(" + data.links[i] + ")");
            	var link = {src: data.links[i].source.id, dst: data.links[i].target.id, relation: data.links[i].type};
        		connection.query("REPLACE INTO noderelations SET ?", link, function(err, result) {
        			if(err) throw err;
        			decraseDatalength()
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
app.listen(8888);