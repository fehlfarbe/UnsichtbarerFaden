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
		controller : 'nodeeditor',
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
App.controller('articleoverview', function($scope, $http) {
	
	console.log('Hello from the Article overview Controller');
	
	//Testarticles
	$scope.articles = $http.get('/get/articles')
	.then(function(result) {
         //resolve the promise as the data
         return result.data;
     });
});

//backend new article controller
App.controller('newarticle', function($scope) {
	tinymce.init({
	    selector: "textarea",
	    plugins: "save image media", 
	    file_browser_callback: 
	    	function(field_name, url, type, win) {
	    		if (type=='media' || type=='image') $('#upload_form input').click();
	    	},
	    toolbar: "save",
	    body_id: "sad",
	    save_enablewhendirty: false,
	    save_onsavecallback: 
	    	function() {
	    		document.body.innerHTML = document.body.innerHTML + tinymce.activeEditor.getContent();
//		    	html2canvas(tinymce.activeEditor.getBody(),  {
//		    		onrendered: function(canvas) {
//		    			document.body.appendChild(canvas);
//		    		}
//		    	});
//	    	console.log("Save");
		    	
	    }
	 });

	console.log('Hello from the newarticle Controller');
});

App.controller('nodeeditor', function($scope, $http) {
	//controls are in nodeeditor module
	console.log('Hello from the node editor Controller');
});


/********* FUNCTIONS *****************/

