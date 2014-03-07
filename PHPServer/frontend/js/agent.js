/**  Agent fuer control **/

var App = angular.module('agent', []);
	
var scope;
var lastArticles = new Array();

//all symbols with path
var data = [{"symbol":"1","path":"src/svg/moeglich.svg#layer1"},
            {"symbol":"2","path":"src/svg/notwendig.svg#layer1"},
            {"symbol":"3","path":"src/svg/wahr.svg#layer1"},
            {"symbol":"4","path":"src/svg/nicht.svg#layer1"},
            {"symbol":"5","path":"src/svg/kontingent.svg#layer1"},
            {"symbol":"6","path":"src/svg/unendlich.svg#layer1"},
            {"symbol":"7","path":"src/svg/wirklich.svg#layer1"}
            ];


/*****************************
 * 
 * create an app router for url management and redirect
 * 
 *****************************/
App.config(function ($routeProvider, $httpProvider) {
    
    $routeProvider.when('/faden', {
        templateUrl: 'partials/faden.html',
        controller: 'agentController'
    });
    $routeProvider.when('/kontakt', {
        templateUrl: 'partials/kontakt.html',
        //		controller : 'symbols'
    });
    $routeProvider.when('/intro', {
        templateUrl: 'partials/intro.html',
        //controller: 'startPageController',
    });
    $routeProvider.when('/start', {
        templateUrl: 'partials/start.html',
        controller: 'startPageController',
    });
    $routeProvider.otherwise({
        redirectTo: '/start'
    });
    
});


App.controller('startPageController', ['$scope', '$location', '$http', function($scope, $location, $http) {
    

}]);


App.controller('agentController', ['$scope', '$location', '$http', function ($scope, $location, $http) {

        //scene parameter
        var shapeForm, bgColor, numberOfSymbols;

        $http.get("/agent.php" + "?symbol=1&lastArticles=[]")
            .success(function(article) {
                console.log(article);
                lastArticles = article.lastArticles;
                this.symbols = article.symbols;
                updateControl(article.symbols);
                updateSceneParameters(article);				
                displayNewScene();
            })
            .error(function(err){
                console.error(err);
            });
	
	
        $scope.symbolOnClick = function(symbol) {
            $http.get("/agent.php" + "?symbol=" + symbol + "&lastArticles=[" + lastArticles + "]")
                .success(function (article) {
                    console.log(article);
                    lastArticles = article.lastArticles;
                    updateControl(article.symbols);
                    updateSceneParameters(article);
                    displayNewScene();
                    updateGraph(article.book);
                })
                .error(function(err){
                    console.error(err);
                });
        };
	

        /** Helper function, update the control with new symbols */
        function updateControl(symbols) {
            //durch gesamtes json objekt laufen und für jede übereinstimmung mit symbols link in neues array(zwecks d3 databinding)
            var links = new Array();
            for (var i = 0; i < symbols.length; i++) {
                for (var j = 0; j < data.length; j++) {
                    if (symbols[i].id == data[j].symbol) {
                        links.push(data[j]);
                    }
                }
            }
					
            //update symbols
            var use = d3.select("#controlGroup").selectAll("use").data(links, function(d){return links.indexOf(d);});
            use.enter().append("use").attr("xlink:href", function(d){return d.path;});
            use.exit().remove();
            use.attr("cursor", "pointer")
                .on("mouseover", function () {d3.select(this).style("opacity","0.5");})
                .on("mouseout", function() {d3.select(this).style("opacity","1");})
                .on("click", function(d) { return scope.onClick({item: d.symbol});});
        }
		
}]);


	

    /** directive tag <agent-control>, ermoeglicht Verknuepfung angular und d3 **/
    App.directive('agentControl', function() {
        return {
            restrict:'E',
            scope:{onClick:'&'},
            link: function(scope, element, attrs) {
			
                //directive scope global setzen fuer link setzen beim update der symbols
                this.scope = scope;
			
  
                var controlData = [{
                    "r": 75,
                    "fill": "none",
                    "stroke": "gray",
                    "strokeWidth": 55,
                    "strokeOpacity": 0.5}];
			
                var controlGroup;
                var svgContainer;

                var width = 255;
                var height = 255;
			
                svgContainer = d3.select(element[0])
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("position", "absolute")
                .style("z-index", "2")
                .style("top", "64%");
			
                controlGroup = svgContainer.append("g")
                            .attr("id", "controlGroup")
                            .attr("transform", "translate(150,110)");
						
				
                var control = controlGroup.append("circle")
                            .data(controlData)
                            .attr("r", function(d){return d.r;})
                            .style("fill", function(d){return d.fill;})
                            .style("stroke", function(d){return d.stroke;})
                            .style("stroke-width", function(d){return d.strokeWidth;})
                            .style("stroke-opacity", function(d){return d.strokeOpacity;});
			
			
                //initaliseren der Symbole vor erstem Klick
                function initControlSymbols() {
			
                    //durch gesamtes json objekt laufen und für jede übereinstimmung link in neues array
                    var links = new Array();
			
                    for (var j = 0; j < 4; j++) {
                        links.push(data[j]);
                    }
			
                    var use = controlGroup.selectAll("use").data(links, function(d){return links.indexOf(d);});
                    use.exit().remove();
                    use.enter().append("use").attr("xlink:href", function(d){return d.path;});
                    use.attr("cursor", "pointer")
                        .on("mouseover", function () {d3.select(this).style("opacity","0.5");})
                        .on("mouseout", function() {d3.select(this).style("opacity","1");})
                        .on("click", function(d) { return scope.onClick({item: d.symbol});});	
                };
            }};
    });