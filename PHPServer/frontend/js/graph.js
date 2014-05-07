/**
 * 
 */
 
 var graph;
 
 var bookNumbers, line;

 //width and height of the graph box
 var w, h;

 //the highest reached booknumber to create dynamically graph
 var highestBookNumber;

 function initPersonalGraph(width, height) {
	// define dimensions of graph
	var m = [5, 10, 5, 10]; // margins
	
	w = width - m[1] - m[3]; // width
	h = height - m[0] - m[2]; // height
	
    console.log("graph width: " + w);
    console.log("graph height: " + h);

	// create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
	bookNumbers = [0];

	highestBookNumber = 1;

	scaleGraph();

		// Add an SVG element with the desired dimensions and margin.
	graph = d3.select("#graph").append("svg")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2])
		  .append("g")
          .attr("id", "graphG")
		  .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
		
			// Add the line by appending an svg:path element with the data line we created above
		// do this AFTER the axes above so that the line is above the tick-lines
			graph.append("path").attr("d", line(bookNumbers));	
}

function scaleGraph() {
    // X scale will fit all values from data[] within pixels 0-w
	var x = d3.scale.linear().domain([0, 100]).range([0, w]);
	// Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
	var y = d3.scale.linear().domain([0, highestBookNumber]).range([h, 0]);

	// create a line function that can convert data[] into x and y points
	line = d3.svg.line()
		// assign the X function to plot our line as we wish
		.x(function(d,i) { 
			// return the X coordinate where we want to plot this datapoint
			return x(i); 
		})
		.y(function(d) { 
			// return the Y coordinate where we want to plot this datapoint
			return y(d); 
		})
}
 
 
 function updateGraph(value) {
     console.log("value " + value);
     console.log("bookNumber " + highestBookNumber);
     console.log("vergleich " + (parseInt(value,10) >= parseInt(highestBookNumber, 10)));
     if (parseInt(value,10) >= parseInt(highestBookNumber, 10)) {
         highestBookNumber = value;
         console.log("set highest bookNumber " + highestBookNumber);
         scaleGraph();
         $("#graphG").empty();
     }
  
	 bookNumbers.push(value);
	 graph.append("path").attr("d", line(bookNumbers));	
 }
 
    