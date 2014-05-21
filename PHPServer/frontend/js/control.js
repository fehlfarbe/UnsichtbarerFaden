var d3visualizer = angular.module('d3', []);



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


function init() {
	var width = 300;
	var height = 300;
	
	svgContainer = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);
	
	controlGroup = svgContainer.append("g")
				.attr("transform", "translate(150,110)");
	
	
	
	var control = controlGroup.append("circle")
				.data(controlData)
				.attr("r", function(d){return d.r;})
				.style("fill", function(d){return d.fill;})
				.style("stroke", function(d){return d.stroke;})
				.style("stroke-width", function(d){return d.strokeWidth;})
				.style("stroke-opacity", function(d){return d.strokeOpacity;});	
}



function updateControls(symbols) {
	

	var data = [{"symbol":"moeglich","path":"src/svg/wahr.svg#layer1"},
	            {"symbol":"wirklich","path":"path"}
	            ];
	
	var symbols = new Array("moeglich", "oft", "wirklich");
	
	//durch gesamtes json objekt laufen und für jede übereinstimmung link in neues array
	var links = new Array();
	
	for (var i = 0; i < symbols.length; i++) {
		for (var j = 0; j < data.length; j++) {
			if (symbols[i] == data[j].symbol) {
				links.push(data[j]);
			}
		}
	}
	
	console.log(links);
	

	controlGroup.data(data).append("use")
		.attr("xlink:href", function(d){return d.path})
		.attr("cursor", "pointer")
		.on("mouseover", function () {d3.select(this).style("opacity","0.5");})
		.on("mouseout", function() {d3.select(this).style("opacity","1");})
		.on("click", function() { sendSymbol(d.symbol);});

	controlGroup
		.data(data)
		.append("path")
		.attr("d", d3.svg.symbol().type(function(d){return d.d_r;}))
		.attr("transform", function(d){return d.transform;})
		.on("mouseover", function () {d3.select(this).style("opacity","0.5");})
		.on("mouseout", function() {d3.select(this).style("opacity","1");});

//	var moeglichButton = controlGroup.append("path")
//						.attr("d", d3.svg.symbol().type("diamond"))
//						.attr("transform", "translate(-50,-55), scale(2,2)")
//						.attr("cursor", "pointer")
//						.on("mouseover", function () {d3.select(this).style("opacity","0.5");})
//						.on("mouseout", function() {d3.select(this).style("opacity","1");})
//						.on("click", function() { cubes('cubes');});
	
	//console.log(moeglichButton);
	//controlGroup.select(moeglichButton).remove();
	//controlGroup.append(moeglichButton);
	//document.getElementsByTagName("svg").appendChild(moeglichButton.node());
	
//	var wirklichButton = controlGroup.append("circle")
//						.attr("r", "6")
//						.attr("transform", "translate(50,55), scale(2,2)")
//						.attr("cursor", "pointer")
//						.on("mouseover", function () {d3.select(this).style("opacity","0.5");})
//						.on("mouseout", function() {d3.select(this).style("opacity","1");})
//						.on("click", function() { cubes('spheres');});
	
	//console.log(wirklichButton);
//controlGroup.append(moeglichButton);

}
