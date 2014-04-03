//define a global application
var App = angular.module('App', ['nodeeditor']);

/****************************
 * 
 * Login service
 * 
 ***************************/
App.factory('UserService', [function() {
	var sdo = {
		isInit: false,
		isLogged: false,
		username: ''
	};
	
	return sdo;
}]);

/*****************************
 * 
 * create an app router for url management and redirect
 * 
 *****************************/
App.config(function($routeProvider, $httpProvider) {
	$routeProvider.when('/login', {
		templateUrl : 'partials/login.html',
		controller : 'login',
		access: {
			isFree: true
		}
	});
	$routeProvider.when('/frontpage', {
		templateUrl : 'partials/frontpage.html',
		controller : 'login'
	});
	$routeProvider.when('/symbols', {
		templateUrl : 'partials/symbols.html',
//		controller : 'symbols'
	});
	$routeProvider.when('/articleoverview', {
		templateUrl : 'partials/article_overview.html',
		controller : 'articleoverview',
	});
	$routeProvider.when('/newarticle', {
		templateUrl : 'partials/new_article.html',
		controller : 'newarticle',
	});
	$routeProvider.when('/nodeeditor', {
		templateUrl : 'partials/nodeeditor.html',
		controller : 'nodeeditor',
	});
	$routeProvider.when('/nodeoverview', {
		templateUrl : 'partials/node_overview.html',
		//controller : 'nodeeditor',
	});
	$routeProvider.otherwise({
		redirectTo : '/login'
	});

	$httpProvider.responseInterceptors.push(function($q, $location) {
		return function(promise) {
			return promise.then( // Success: just return the response
			function(response) {
				return response;
			}, // Error: check the
			// error status to
			// get only the 401
			function(response) {
				if (response.status === 401){
					$location.url('/login.php');
				}
					
				return $q.reject(response);
			});
		};
	});
});

/** ******** CONTROLLER ************ */
App.controller('loginController', ['$scope', '$http', '$location', 'UserService', function($scope, $http, $location, User) {
	console.log('loginController');
	
	$scope.isError = false;
	$scope.errorText = '';
	
	$scope.login = function(user) {
		
		$scope.errorText = '';
		$scope.isError = false;
		
		if(user == undefined){
			$scope.errorText += "Keine Daten eingegeben! " +
					"Achtung! Bei Autofill durch den Browser kann es zu Problemen kommen. " +
					"Logindaten am besten noch mal per Hand eintippen.";
			$scope.isError = true;
			return;
		} else if(user.name == undefined){
			$scope.errorText += "Kein Benutzername eingegeben!";
			$scope.isError = true;
			return;
		} else if(user.password == undefined){
			$scope.errorText += "Kein Passwort eingegeben!";
			$scope.isError = true;
			return;
		}
		
		var data = {username : user.name, password : user.password}; // configuration object

		$http.post('/login.php', data)
		.success(function(data, status, headers, config) {
			console.log("status", status, data);
			console.log("Succ");
			if (status == 200) {
				// succefull login
				User.isInit = true;
				User.isLogged = true;
				User.username = data.username;
				$location.url('/frontpage');
			}
			else {
				User.isLogged = false;
				User.username = '';
				$scope.errorText = 'Falsche Logindaten!';
				$scope.isError = true;
			}
		})
		.error(function(data, status, headers, config) {
			console.log("Error", status);
			User.isLogged = false;
			User.username = '';
			$scope.errorText = 'Falsche Logindaten!';
			$scope.isError = true;
		});
	};
}]);


App.controller('HeaderController', ['$scope', '$location', '$http', 'UserService',function($scope, $location, $http, User) {
	
	//which menu is active?
	$scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };
    
    //test if I'm already logged in
    if( !User.isInit ){
    	console.log("Not init!", User);
    	$http.get('/loggedin.php').success(function(user) {
    		User.isInit = true;
    		console.log(user);
    		// Authenticated
    		if (user !== '0'){
    			User.isLogged = true;
    			User.username = user;
    		}
    		// Not Authenticated
    		else {
    			$location.url('/login');
    		}
    	});
    }
    
    //I'm logged in?
    $scope.isLogged = function(){
    	return User.isLogged;
    };
    
    //logout
    $scope.logout = function(){
    	$http.post('/logout.php')
		.success(function(data, status, headers, config) {
			console.log("status", status, data);
			if (status == 200) {
				// succefull logout
				User.isLogged = false;
				User.username = '';
				$location.url('/login');
			}
			else {
				User.isLogged = true;
				User.username = '';
			}
		})
		.error(function(data, status, headers, config) {
			console.log("Error", status);
			User.isLogged = false;
			User.username = '';
		});
    };
    
}]);

// backend frontpage controller
App.controller('login', ['$scope', '$location', 'UserService',function($scope, $location, User) {

    if( !User.isLogged ){
    	$location.url('/login');
    }
    
	$scope.name = User.username;
}]);


App.symbols = function($scope, $http, $route, $location) {
	console.log("Hello from symbols");
	
	$scope.symbols = $http.post('/backend.php?action=get_symlinks')
	.then(function(result) {
		console.log(result.data);
		var links = Array();
		
		for(var i=0; i < result.data.symlinks.length; i++){
			
			var s = result.data.symlinks[i].source-1;
			//console.log(result.data.symbols[s].links);
			if ( result.data.symbols[s].links == undefined )
				result.data.symbols[s].links = Array();
			
			result.data.symbols[s].links.push(result.data.symbols[result.data.symlinks[i].target-1]);
			//result.data.symbols
		}
		console.log(result.data.symbols);
        return result.data;
     });
}

//backend article overview controller
App.controller('articleoverview', function($scope, $http) {
	
	console.log('Hello from the Article overview Controller');
	
	//Get article
	$('#articleList').block({ message : "<h2>Lade Einträge</h2>"} );
	$scope.articles = $http.post('/backend.php?action=articles')
	.then(function(result) {
		console.log(result.data);
		$('#articleList').unblock();
        return result.data;
     });
});

/************************************************************************
 * 
 * backend new article controller
 * 
 ***********************************************************************/
App.controller('newarticle', function($scope, $http, $location) {
	var id = ($location.search()).id;
	
	$scope.showSymbolSelection = false;
	
	$scope.changeBookNumber = function(){
		console.log("change Number", $('#book').val());
		if( parseInt($('#book').val()) == 0 )
			$scope.showSymbolSelection = true;
		else
			$scope.showSymbolSelection = false;
	};
	
	$scope.preview = "null";
	
	$("#articleWrapper").block({message : "<h2>initialisiere Editor...</h2>"});
	
	/*******************************
	 * Setup TinyMCE
	 *******************************/ 
	var editor = tinymce.init({
	    selector: "textarea",
	    plugins: "save image media", 
	    file_browser_callback: 
	    	function(field_name, url, type, win) {
		    	console.log("Filebrowser", field_name, url, type, win);
		    	$("#upload_form").bind('ajax:complete', function(x) {
		            console.log("submit", x);
		        });
	    	
	    		if (type=='media' || type=='image')
	    			$('#upload_form input').click();
	    		console.log("clicked");
	    	},
	    body_id: "sad",
	    toolbar: "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | link image | fontselect fontsizeselect | forecolor backcolor",
	    content_css : "http://fonts.googleapis.com/css?family=Sanchez,http://fonts.googleapis.com/css?family=Ceviche+One",
	    font_formats: 	"Ceviche One=ceviche one;"+
	    				"Sanchez=sanches;"+
	    				"Andale Mono=andale mono,times;"+
				        "Arial=arial,helvetica,sans-serif;"+
				        "Arial Black=arial black,avant garde;"+
				        "Book Antiqua=book antiqua,palatino;"+
				        "Comic Sans MS=comic sans ms,sans-serif;"+
				        "Courier New=courier new,courier;"+
				        "Georgia=georgia,palatino;"+
				        "Helvetica=helvetica;"+
				        "Impact=impact,chicago;"+
				        "Symbol=symbol;"+
				        "Tahoma=tahoma,arial,helvetica,sans-serif;"+
				        "Terminal=terminal,monaco;"+
				        "Times New Roman=times new roman,times;"+
				        "Trebuchet MS=trebuchet ms,geneva;"+
				        "Verdana=verdana,geneva;"+
				        "Webdings=webdings;"+
				        "Wingdings=wingdings,zapf dingbats",
	    force_br_newlines : true,
        force_p_newlines : false,
        onchange_callback : function(a){
        	console.log("callback", a);
        },
        setup : function(ed) {
        	console.log("ed", ed, ed.editorManager);
            ed.on('change', function(a){
            	console.log("onchange");
            	$('#preview').html(tinymce.activeEditor.getContent());
            });
        },
	 });
	
	// chosen init
	$("#category").chosen();
	$("#symbol").chosen();
	$http.get('/backend.php?action=nodessymbols').then(function(result) {
		
		//categories
		var categories = result.data.nodes;		
		for(var i=0; i<categories.length; i++)
			$("#category").append("<option value='" + categories[i].id + "'>" + categories[i].name + "</option>");		
		$("#category").trigger("chosen:updated");
		
		var symbols = result.data.symbols;
		for(var i=0; i<symbols.length; i++)
			$("#symbol").append("<option value='" + symbols[i].id + "'>" + symbols[i].icon + ' ' + symbols[i].name + "</option>");		
		$("#symbol").trigger("chosen:updated");
		
		//// edit article
		if( id != undefined ){
			var data = new Object();
			data.id = id;
			$http.post('/backend.php?action=articles', data)
			.then(function(result) {			
				for(var i=0; i<result.data.length; i++)
					if(result.data[i].id == id){
						var article = result.data[i];
						console.log(article);
						console.log('editor', $('#editortext'));						
						
						//set headline, book id, editor text
						$('#headline').val(article.name);
						$('#book').val(article.book);
						tinyMCE.activeEditor.selection.setContent(article.text);
						$('#preview').html(tinymce.activeEditor.getContent());
						
						//set chosen categories
						console.log("categories:", article.category);
						console.log($("#category"));
						if(article.category != null){
							var selectedCategories = Array();
							for(var j=0; j<article.category.length; j++){
								selectedCategories.push(article.category[j].id);
							}
							console.log(selectedCategories);
							
							for(var j=0; j<$("#category")[0].length; j++){
								if(selectedCategories.indexOf(parseInt($("#category")[0][j].value)) >= 0){
									$("#category")[0][j].selected = true;
									$("#category").trigger("chosen:updated");
								}
							}					
						}
						
						//set symbol
						if( article.symID != null){
							$('#symbol').val(article.symID);
							$("#symbol").trigger("chosen:updated");
						}
						
						$("#articleWrapper").unblock();
						return;
					}
		     });
		} else {
			$("#articleWrapper").unblock();
		}
	});
	
	//Save article
	$scope.saveArticle = function() {
		console.log("SAVE");
		$("#articleWrapper").block({message : "<h2>Speichern...</h2>"});
		//document.body.appendChild(canvas);
		//setup data
		var article = new Object();
		article.screen = '';
		article.headline = $('#headline').val();
		article.content = tinymce.activeEditor.getContent();
		article.categories = $("#category").val();
		article.symbol = $("#symbol").val();
		article.book = $('#book').val();
		if( id != undefined )
			article.id = id;
				    			
		//replace newlines at end of text
		article.content = article.content.replace(new RegExp(/<p>&nbsp;<\/p>/g), '')
							.replace(new RegExp(/\n/g), '');

		console.log("send article", article);
		
		if( article.headline == ""){
			alert("Keine Überschrift!");
			$("#articleWrapper").unblock();
			return;
		} else if ( article.content == "" ){
			alert("Kein Text!");
			$("#articleWrapper").unblock();
			return;
		} else if( article.categories == null ){
			alert("Achtung! Keine Kategorien gewählt");
			$("#articleWrapper").unblock();
			return;
		} else if( article.symbol == null){
			alert("Achtung! Kein Symbol gewählt");
			$("#articleWrapper").unblock();
			return;
		} else if( isNaN(parseInt(article.book)) || parseInt(article.book) < 0 ){
			alert("Fehler bei Buchnummer!");
			$("#articleWrapper").unblock();
			return;
		}
		
		console.log(parseInt(article.book));
		
		$http.post('/backend.php?action=save_article', article)
		.success(function(data, status, headers, config){
			console.log("article saved!", data);
			$("#articleWrapper").unblock();
			$location.search('id', data.id);
		}).error(function(data, status, headers, config){
			alert("I can't do this, Dave!");
			console.log(data, status, headers);
			$("#articleWrapper").unblock();
		});
	};
	
	$scope.newCategory = function(){
		console.log("TODO new cat");
		var name = prompt("eingeben:");
		
		if( !name )
			return;
		
		$("#category").block();
		
		var duplicate = false;
		$('#category').find("option").each(function(id, elem) {
			if(name.toLowerCase() == elem.innerHTML.toLowerCase()){
				duplicate = true;
				return;
			}
		});
		
		if( duplicate ){
			alert(name + " existiert schon!");
			return;
		}
		
		var data = new Object();
		data.name = name;
		$http.post('/backend.php?action=newcat', data)
		.success(function(data, status, headers, config){
			console.log("success!", data);
			$("#category").append("<option value='" + data.id + "'>" + data.name + "</option>");		
			$('#category').find("option").each(function(id, elem) {
				if( elem.value == data.id){
					elem.selected = true;
					return;
				}
			});
			$("#category").trigger("chosen:updated");
			$("#category").unblock();
			
		}).error(function(data, status, headers, config){
			alert("I can't do this, Dave!");
			console.log(data, status, headers);
			$("#category").unblock();
		});
	}
});

App.controller('nodeeditor', function($scope, $http) {
	//controls are in nodeeditor module
	console.log('Hello from the node editor Controller');
});


/********* FUNCTIONS *****************/

//Sort array
App.filter('orderObjectBy', function(){
	 return function(input, attribute) {
	    if (!angular.isObject(input)) return input;

	    var array = [];
	    for(var objectKey in input) {
	        array.push(input[objectKey]);
	    }

	    array.sort(function(a, b){
	        a = parseInt(a[attribute]);
	        b = parseInt(b[attribute]);
	        return a - b;
	    });
	    
	    return array;
	 };
});

App.nodeList = function($scope, $http, $route, $location) {

	console.log('Hello from the Nodes overview Controller');
	
	//Get article
	$scope.nodes = $http.post('/backend.php?action=nodessymbols')
	.then(function(result) {
		console.log("Nodes", result.data);
        return result.data.nodes;
     });
	
}

App.articleList = function($scope, $http, $route, $location) {

	$scope.editArticle = function(id){
		console.log("editiere..." + id);
		$location.search('id', id).path('/newarticle');
	};
	
	$scope.sortArticles = function(type){
		
		
		if( $scope.predicate == type )
			if($scope.reverse)
				$scope.reverse = !$scope.reverse;
			else
				$scope.reverse = true;
		else
			$scope.reverse = false;
		//console.log($scope.reverse);
		
		$scope.predicate = type;
	};
	
	$scope.deleteArticle = function(id){
		
		if( confirm("Artikel wirklich löschen?") ){
			$('#articleList').block();
			var data = new Object();
			data.id = id;
			$http.post('/backend.php?action=delete_article', data)
			.success(function(data, status, headers, config){
				console.log("article deleted!");
				$route.reload();
			}).error(function(data, status, headers, config){
				alert("I can't do this, Dave!");
				console.log(data, status, headers);
			});
		}	
	};
};

