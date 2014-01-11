/**  Agent fuer control **/

var agent = angular.module('agent', []);
	
//global Variable to store the computed symbols
var symbols = new Array();
var scope;
var firstCall = true;
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


function agentController($scope, $http) {
	
		$http.get("/agent" + "?symbol=0&lastArticles=[]")
			.success(function(article) {
				lastArticles = article.lastArticles;
				firstCall = false;
				this.symbols = article.symbols;
				console.log(article);
				console.log(symbols);
				console.log("nur einmal bitte");
				updateControl();
			})
			.error(function(err){
				console.error("Error" + err);
			});
		
		
		$scope.symbolOnClick = function(symbol) {
		
			$http.get("/agent" + "?symbol=" + symbol + "&lastArticles=[" + lastArticles + "]")
				.success(function(article) {
					lastArticles = article.lastArticles;
					this.symbols = article.symbols;
					console.log(article);
					updateControl();
					
					var numberOfSymbols = Math.pow(2, article.book);
					
					
					switch (article.symbol) {
						case 1:
							updateShapes('triangle', numberOfSymbols, '0xffffff');
							break;
						case 2:
							updateShapes('cube', numberOfSymbols, '0x000000');
							break;
						case 3:
							updateShapes('cube', numberOfSymbols, '0xffffff');
							break;
						case 4:
							updateShapes('end', 0);
							break;
						case 5:
							updateShapes('triangle', numberOfSymbols, '0x000000');
							break;
						case 6:
							updateShapes('point', numberOfSymbols, '0x000000');
							break;
						case 7:
							updateShapes('point', numberOfSymbols, '0xffffff');
							break;
					}
					
					displayArticle(article.text);

				})
				.error(function(err){
					console.error("Error" + err);
				});

		};
		
		

/** Helper function, update the control with new symbols */
function updateControl() {
	//durch gesamtes json objekt laufen und für jede übereinstimmung mit symbols link in neues array(zwecks d3 databinding)
	var links = new Array();
	console.log("sa " + symbols.length);
	for (var i = 0; i < symbols.length; i++) {
		for (var j = 0; j < data.length; j++) {
			if (symbols[i].id == data[j].symbol) {
				console.log(symbols[i].id);
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
			
			//initControlSymbols();
			
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