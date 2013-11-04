//define a global application
var App = angular.module('App', []);

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

//backend articel overview controller
App.controller('articleoverview', function($scope) {
	console.log('Hello from the Article overview Controller');
});

//backend new articel controller
App.controller('newarticle', function($scope) {
	console.log('Hello from the newarticle Controller');
});


/********* FUNCTIONS *****************/

App.articleList = function($scope, $http) {
	//Testarticles
	/*
	$scope.articles = [ {
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
	*/
	$scope.articles = $http.get('/get/articles')
	.then(function(result) {
         //resolve the promise as the data
         return result.data;
     });
}