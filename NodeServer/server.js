var express = require('express');
var mysql = require('mysql');

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
		
		connection.query('SELECT src AS source, dst AS target FROM noderelations', function(err, links, fields) {
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
	
	console.log('TODO: set nodes...');
	
	res.send('OK');
});


/******************************************************************
 * 
 *  start server 
 *  
 *  **************************************************************/
app.listen(8888);