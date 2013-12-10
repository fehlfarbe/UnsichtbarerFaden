//define a global application
var App = angular.module('App', ['nodeeditor']);

//create an app router for url management and redirect
App.config(function($routeProvider) {
	$routeProvider.when('/frontpage', {
		templateUrl : 'partials/frontpage.html',
		controller : 'frontpage',
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
		controller : 'newarticle',
	});
	$routeProvider.when('/uploads', {
		templateUrl : 'uploads/images/test.html',
		controller : 'newarticle',
	});
	
	$routeProvider.otherwise({
		redirectTo : '/frontpage'
	});
});

/********** CONTROLLER *************/
//backend frontpage controller
App.controller('frontpage', function($scope) {
	console.log('Hello from the Frontpage Controller');
	$scope.name = 'Nutzer';
});

//backend article overview controller
App.controller('articleoverview', function($scope) {
	console.log('Hello from the Article overview Controller');
});

//backend new article controller
App.controller('newarticle', function($scope, $http) {
	tinymce.init({
	    selector: "textarea",
	    plugins: "save image", image_advtab:true, 
	    file_browser_callback: 
	    	function(field_name, url, type, win) {
	    		if (type=='image') $('#upload_form input').click();
	    	},
	    toolbar: "save",
	    body_id: "sad",
	    save_enablewhendirty: false,
	    save_onsavecallback: 
	    	function() {
		    	html2canvas(tinymce.activeEditor.getBody(),  {
		    		onrendered: function(canvas) {
		    			$('#editor').block();
		    			//document.body.appendChild(canvas);
		    			//setup data
		    			var article = new Object();
		    			article.screen = canvas.toDataURL();
		    			article.headline = $('#headline').val();
		    			article.content = tinymce.activeEditor.getContent();
		    			article.categories = $("#category").val();
		    					    			
		    			console.log(article);
		    			
		    			if( article.headline == ""){
		    				alert("Keine Überschrift!");
		    				$('#editor').unblock();
		    				return;
		    			} else if ( article.content == "" ){
		    				alert("Kein Text!");
		    				$('#editor').unblock();
		    				return;
		    			} else if( article.categories == null ){
		    				alert("Achtung! Keine Kategorien gewählt");
		    			}
		    			
		    			$http.post('/save/article', article)
		    			.success(function(data, status, headers, config){
		    				console.log("article saved!");
		    				$('#editor').unblock();
		    			}).error(function(data, status, headers, config){
		    				alert("I can't do this, Dave!");
		    				console.log(data, status, headers);
		    				$('#editor').unblock();
		    			});
		    			console.log("saved!");
		    		}
		    	});
	    }
	 });
	
	// chosen init
	$("#category").chosen();
	$("#categoryContainer").block({message : "Lade Kategorien...", css : ""});
	$http.get('/get/nodes').then(function(result) {
		console.log(result);
		var categories = result.data.nodes;
		
		for(var i=0; i<categories.length; i++)
			$("#category").append("<option value='" + categories[i].id + "'>" + categories[i].name + "</option>");
		
		$("#category").trigger("chosen:updated");
		
		$("#categoryContainer").unblock();
	});

	console.log('Hello from the newarticle Controller');
});

App.controller('nodeditor', function($scope) {
	console.log('Hello from the node editor Controller');
});


/********* FUNCTIONS *****************/

App.articleList = function($scope, $http) {
	//Testarticles
	$scope.articles = $http.get('/get/articles')
	.then(function(result) {
		console.log(result.data);
         return result.data;
     });
};
