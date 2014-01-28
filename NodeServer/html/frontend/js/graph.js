/**
 * 
 */

 var geometry, renderer, scene, camera, line;
 
 var xDistance = 5;
 
 var numberOfClicks = 1;
 
 var graph;
 
 var bookNumbers, line;

function graph() {
	// define dimensions of graph
	var m = [80, 80, 80, 80]; // margins
	var w = 200 - m[1] - m[3]; // width
	var h = 100 - m[0] - m[2]; // height
	
	// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
	bookNumbers = [0];

	// X scale will fit all values from data[] within pixels 0-w
	var x = d3.scale.linear().domain([0, 10]).range([0, w]);
	// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
	var y = d3.scale.linear().domain([0, 10]).range([0, h]);
		// automatically determining max range can work something like this
		// var y = d3.scale.linear().domain([0, d3.max(data)]).range([h, 0]);

	// create a line function that can convert data[] into x and y points
	line = d3.svg.line()
		// assign the X function to plot our line as we wish
		.x(function(d,i) { 
			// verbose logging to show what's actually being done
			//console.log('Plotting X value for data point: ' + d + ' using index: ' + i + ' to be at: ' + x(i) + ' using our xScale.');
			// return the X coordinate where we want to plot this datapoint
			return x(i); 
		})
		.y(function(d) { 
			// verbose logging to show what's actually being done
			//console.log('Plotting Y value for data point: ' + d + ' to be at: ' + y(d) + " using our yScale.");
			// return the Y coordinate where we want to plot this datapoint
			return y(d); 
		})

		// Add an SVG element with the desired dimensions and margin.
		graph = d3.select("#graph").append("svg:svg")
		      .attr("width", w + m[1] + m[3])
		      .attr("height", h + m[0] + m[2])
		    .append("svg:g")
		      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

//		// create yAxis
//		var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true);
//		// Add the x-axis.
//		graph.append("svg:g")
//		      .attr("class", "x axis")
//		      .attr("transform", "translate(0," + h + ")")
//		      .call(xAxis);
//
//
//		// create left yAxis
//		var yAxisLeft = d3.svg.axis().scale(y).ticks(4).orient("left");
//		// Add the y-axis to the left
//		graph.append("svg:g")
//		      .attr("class", "y axis")
//		      .attr("transform", "translate(-25,0)")
//		      .call(yAxisLeft);
		
			// Add the line by appending an svg:path element with the data line we created above
		// do this AFTER the axes above so that the line is above the tick-lines
			graph.append("svg:path").attr("d", line(bookNumbers));	

}


 
 function initGraph() {

	renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.zIndex = 5;
    document.body.appendChild(renderer.domElement);
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    camera.position.set(0, 0, 100);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene = new THREE.Scene();
    
    var material = new THREE.LineBasicMaterial({
        color: 0x000000,
        linewidth: 3
    });
    
    geometry = new THREE.Geometry();
    //geometry.dynamic = true;

    for (var i = 0; i < 200; i++) {
    	geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    }
    
    //geometry.vertices.push(new THREE.Vector3(10, 0, 0));
//    geometry.vertices.push(new THREE.Vector3(0, 10, 0));
//    geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    
    line = new THREE.Line(geometry, material, THREE.LineStrip);
    console.log(geometry);
    scene.add(line);
    renderer.render(scene, camera);

 }
 
 function updateGraph(value) {
	 
	 //for (var i = scene.children.length -1; i >= 0; i--) {
		//scene.remove(scene.children[0]);
	 //}

//	 geometry.vertices[numberOfClicks] = new THREE.Vector3(numberOfClicks * xDistance, value, 0);
//	 geometry.verticesNeedUpdate = true;
//	    //geometry.dynamic = true;
//
//	 renderer.render(scene,camera);

	 bookNumbers.push(value);
	 graph.append("svg:path").attr("d", line(bookNumbers));	
	 
	 numberOfClicks++;
	 console.log("update Graph");
 }
 
    