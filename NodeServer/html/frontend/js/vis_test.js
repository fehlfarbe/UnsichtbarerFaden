/**
 * 
*/


function generateCity() {
	var geometry = new THREE.CubeGeometry(1,1,1);
	//pivot to bottom
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));
	//remove bottom face
	geometry.faces.splice(3,1);
	geometry.faceVertexUvs[0].splice( 3, 1 );
	// change UVs for the top face
	// - it is the roof so it wont use the same texture as the side of the building
	// - set the UVs to the single coordinate 0,0. so the roof will be the same color
	//   as a floor row.
//	geometry.faceVertexUvs[0][2][0].set( 0, 0 );
//	geometry.faceVertexUvs[0][2][1].set( 0, 0 );
//	geometry.faceVertexUvs[0][2][2].set( 0, 0 );
	//geometry.faceVertexUvs[0][2][3].set( 0, 0 );

	
	var buildingMesh = new THREE.Mesh(geometry);
	
	var light = new THREE.Color(0xffffff)
	var shadow = new THREE.Color(0x303050)
	
	var cityGeometry = new THREE.Geometry();

	for (var i = 0; i < 2000; i ++) {
	
		//compute random position
		buildingMesh.position.x = Math.floor(Math.random() * 200 - 100) * 10;
		buildingMesh.position.z = Math.floor(Math.random() * 200 - 100) * 10;
		
		//compute random rotation
		buildingMesh.rotation.y = Math.random() * Math.PI * 2;
		
		//compute random scale, Math.random multiply to get closer to zero
		buildingMesh.scale.x = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
		buildingMesh.scale.y = (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;	
		buildingMesh.scale.z = buildingMesh.scale.x;

		var value = 1 - Math.random() * Math.random();
		var baseColor = new THREE.Color().setRGB(value + Math.random() * 0.1, value, value + Math.random() * 0.1);

		
		var geometry = buildingMesh.geometry;
		for (var j = 0, jl = geometry.faces.length; j < jl; j++) {
			geometry.faces[j].vertexColors = [baseColor, baseColor, baseColor, baseColor];
		}
		
		
		//merge single Buildings for performance
		THREE.GeometryUtils.merge(cityGeometry, buildingMesh);
	}
	
	
	
	var texture = new THREE.Texture(generateTextureCanvas());
	texture.anisotropy = renderer.getMaxAnisotropy();
	texture.needsUpdate = true;
	
	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff
	});
	
	var mesh = new THREE.Mesh(cityGeometry, material);
	
	scene.add(mesh);
	render();
//	renderer.render(scene,camera);
	
	//return mesh;
	
	function generateTextureCanvas() {

		var canvas = document.createElement('canvas');
		canvas.width = 32;
		canvas.height = 64;
		var context = canvas.getContext('2d');
		context.fillStyle = '#ffffff';
		context.fillRect(0,0,32,64);
		for (var y = 2; y < 64; y += 2) {
			for (var x = 0; x < 32; x += 2) {
				var value = Math.floor(Math.random() * 64);
				context.fillStyle = 'rgb(' + [value,value,value].join(',') + ')';
				context.fillRect(x,y,2,1);
			}
		}
		
		var canvas2 = document.createElement('canvas');
		canvas2.width = 512;
		canvas2.height = 1024;
		var context = canvas2.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		
		context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
		
		return canvas2;
	}
}



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




	

