/**
 * 
*/
function draw() {

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
	
	

	
	var width = 300;
	var height = 300;
	
	var testheight = 20;
	
	
	
	
	var x = d3.scale.linear()
			.domain([0,40-2])
			.range([0, width]);
//	
	var y = d3.scale.linear()
			.domain([-1,1])
			.range([height,0]);
	
	
	var random = d3.random.normal(0,.2),
	data = d3.range(50).map(random);
	

	
	
	var svgContainer = d3.select("body")
				.append("svg")
				.attr("width", width)
				.attr("height", height);
	
	var line = d3.svg.line()
	.interpolate("basis")
	.x(function(d,i){return x(i);})
	.y(function(d,i){return y(d);});
	
//	var path = svgContainer
//				.append("g")
//				.append("path")
//			 	.datum(data)
//				.style("fill", "none")
//				.style("stroke","black")
//				.style("stroke-width", + 1.5 + "px")
//				.attr("d", line);
				
	
	var controlGroup = svgContainer.append("g")
				.attr("transform", "translate(150,110)");
	
	
	
	var control = controlGroup.append("circle")
				.data(controlData)
				.attr("r", function(d){return d.r;})
				.style("fill", function(d){return d.fill;})
				.style("stroke", function(d){return d.stroke;})
				.style("stroke-width", function(d){return d.strokeWidth;})
				.style("stroke-opacity", function(d){return d.strokeOpacity;});
	
	
	
	var rhombusButton = controlGroup.append("path")
						.attr("d", d3.svg.symbol().type("diamond"))
						.attr("transform", "translate(-50,-55), scale(2,2)")
						.attr("cursor", "pointer")
						.on("mouseover", function () {d3.select(this).style("opacity","0.5");})
						.on("mouseout", function() {d3.select(this).style("opacity","1");})
						.on("click", function() { cubes('cubes');});
	
	var circleButton = controlGroup.append("circle")
						.attr("r", "6")
						.attr("transform", "translate(50,55), scale(2,2)")
						.attr("cursor", "pointer")
						.on("mouseover", function () {d3.select(this).style("opacity","0.5");})
						.on("mouseout", function() {d3.select(this).style("opacity","1");})
						.on("click", function() { cubes('spheres');});
	
	//tick();
	//tick2();

	function  createCircles() {
		var random = d3.random.normal(960,200);
		data = d3.range(50).map(random);
		var bar = svgContainer.selectAll("g")
		.data(data).enter().append("g").attr("transform", function (d,i) {return "translate(" + d + "," + (i * testheight + 10) + ")";});
		bar.append("circle")
		.attr("r", "20")
		.attr("width", function(d){return x(d);})
		.attr("height", testheight -1)
		.style("fill", "steelblue");
		bar.exit().remove();
		};	
		
	
		
	function  createRhombuses() {
		var random = d3.random.normal(960,200);
		data = d3.range(50).map(random);
		var bar = svgContainer.selectAll("g")
				.data(data).enter().append("g")
				.attr("transform", function (d,i) {return "translate(" + d + "," + (i * testheight + 10) + ")";});
		bar.append("path")
		.attr("d", d3.svg.symbol().type("diamond"))
		.attr("width", function(d){return x(d);})
		.attr("height", testheight -1)
		.style("fill", "steelblue");
		svgContainer.selectAll("g")
		.data(data).exit().remove();
		};
		
		
		function tick() {
			
			data.push(random());
			
			data.shift();
			
			path.transition()
				.duration(500)
				.ease("linear")
				.attr("d", line)
				.each("end", tick);
		}
	
	function tick2() {
			
			data.push(random());
			
			path
				.attr("d", line)
				.attr("transform", null)
				.transition()
				.duration(200)
				.ease("linear")
				.attr("transform", "translate(" + x(-1) + ",0)")
				.each("end", tick2);
			
			data.shift();
		}
	
	
};




	

