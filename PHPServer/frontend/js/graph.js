/**
 * 
 */
 
 var graph;
 
 var bookNumbers, line;

 function initPersonalGraph(width, height) {
     console.log("height " + height);
	// define dimensions of graph
	var m = [5, 10, 5, 10]; // margins
	var w = width - m[1] - m[3]; // width
	var h = height - m[0] - m[2]; // height
	
	// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
	bookNumbers = [0];

	// X scale will fit all values from data[] within pixels 0-w
	var x = d3.scale.linear().domain([0, 100]).range([0, w]);
	// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
	var y = d3.scale.linear().domain([0, 10]).range([h, 0]);
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
	graph = d3.select("#graph").append("svg")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2])
		  .append("g")
		  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

		console.log("append graph");
		
			// Add the line by appending an svg:path element with the data line we created above
		// do this AFTER the axes above so that the line is above the tick-lines
			graph.append("path").attr("d", line(bookNumbers));	
			console.log("append path");
}


 
 
 function updateGraph(value) {

     console.log("Booknumber " + value);
	 bookNumbers.push(value);
	 graph.append("path").attr("d", line(bookNumbers));	
	 
	 console.log("update Graph");
 }
 
    