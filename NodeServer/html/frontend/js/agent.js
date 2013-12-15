/**  Agent fuer control **/

var agent = angular.module('agent', []);
	
//global Variable to store the computed symbols
var symbols = new Array();
var scope;

//all symbols with path
var data = [{"symbol":"moeglich","path":"src/svg/moeglich.svg#layer1"},
            {"symbol":"wirklich","path":"src/svg/wirklich.svg#layer1"},
            {"symbol":"nicht","path":"src/svg/nicht.svg#layer1"},
            {"symbol":"unendlich","path":"src/svg/unendlich.svg#layer1"},
            {"symbol":"wahr","path":"src/svg/wahr.svg#layer1"},
            {"symbol":"notwendig","path":"src/svg/notwendig.svg#layer1"},
            {"symbol":"kontingent","path":"src/svg/kontingent.svg#layer1"}
            ];


function agentController($scope, $http) {

		$scope.symbolOnClick = function(symbol) {
			switch (symbol) {
			case "moeglich":
				symbols = new Array("wirklich", "notwendig", "unendlich");
				break;
			case "notwendig":
				symbols = new Array("nicht", "kontingent");
				break;
			case "wahr":
				symbols = new Array("kontingent");
				break;
			case "nicht":
				symbols = new Array();
				break;
			case "kontingent":
				symbols = new Array("moeglich", "wirklich", "unendlich", "nicht");
				break;	
			case "unendlich":
				symbols = new Array("wirklich", "wahr", "kontingent");
				break;
			case "wirklich":
				symbols = new Array("wahr", "unendlich", "nicht", "moeglich");
				break;
			}
		
			//durch gesamtes json objekt laufen und für jede übereinstimmung mit symbols link in neues array(zwecks d3 databinding)
			var links = new Array();
			
			for (var i = 0; i < symbols.length; i++) {
				for (var j = 0; j < data.length; j++) {
					if (symbols[i] == data[j].symbol) {
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
		
		
			console.log(symbol);
		
			
			$http.post("/post/agent", symbol)
				.success(function(actualArticle) {
					
					$scope.actualArticle = actualArticle;
					console.log("aktueller Artikel " + $scope.actualArticle);
				})
				.error(function(err){
					
				});
		};
		
		
		console.log($scope.actualArticle);

//		$http.get('/get/agent')
//			.success(function(symbols) {
//				console.log("Daten erhalten " + symbols);
//				updateControls(symbols);	
//
//			})
//			.error(function(err) {
//				console.log("Error " + err);
//			});
//		
//		$scope.clickedSymbol;
//		
		
};


/** directive tag <agent-control>, ermoeglicht Verknuepfung angular und d3 **/
agent.directive('agentControl', function() {
	return {
		restrict:'E',
		scope:{onClick:'&'},
		link: function(scope, element, attrs) {
			
			//directive scope global setzen fuer link setzen beim update der symbols
			this.scope = scope;
			
			var controlGroupData = [
		     {
		      "cx": 200,
			  "cy": 700}];
  
			var controlData = [{
				  	"r": 75,
				  	"fill": "none",
				  	"stroke": "gray",
				  	"strokeWidth": 55,
				  	"strokeOpacity": 0.5}];
			
			var controlGroup;
			var svgContainer;

			var width = 300;
			var height = 300;
			
			svgContainer = d3.select(element[0])
			.append("svg")
			.attr("width", width)
			.attr("height", height);
			
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
			
			initControlSymbols();
			
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