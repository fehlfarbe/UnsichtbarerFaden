//var connect = require('connect');
//
////start server
//var server = connect().
//	use(connect.static(__dirname+'/html')).
//	listen(8080);
//
//console.log("Server started and listen to http://127.0.0.1:8080");

var express = require('express');
var app = express();

app.use(express.compress()); // compress content
app.use(express.static(__dirname + '/html'));

app.get('/get/articles', function(req, res) {

	articles = [ {
		id : 1,
		name : 'So ist das Leben',
		text : 'Hallo Leute. So ist das Leben..',
	}, {
		id : 2,
		name : 'So ist das Leben 2',
		text : 'Hallo Leute. So ist das Leben..eben!',
	}, {
		id : 3,
		name : 'So ist das Leben immer noch',
		text : 'Hallo Leute. So ist das Leben..und weiter gehts',
	}, ];
	
	console.log("get articles list");
	console.log(articles);
	
	res.send(articles);
});

app.listen(8888);