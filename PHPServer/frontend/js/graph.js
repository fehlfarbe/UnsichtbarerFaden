/**
* Der Graph, welcher in der unteren Leiste angezeigt wird
*/

var x, y;

var svg, graph, rect, tip;

var bookNumbers, line;

//width and height of the graph box
var w, h;

//the highest reached booknumber to create dynamically graph
var highestBookNumber;

//var lastBookNumber;


function initPersonalGraph(width, height)
{
    // define dimensions of graph
    var m = [5, 10, 5, 10]; // margins

    w = width - m[1] - m[3]; // width
    h = height - m[0] - m[2]; // height

    // create a simple data array that we'll plot with a line (this array represents only the Y values, X will just be the index location)
    bookNumbers = [0];

    highestBookNumber = 1;

    scaleGraph();

    tip = d3.tip()
        .attr("class", "tip")
        .offset([-5, 0])
        .html(function (d) { return d; });

    // Add an SVG element with the desired dimensions and margin.
    svg = d3.select("#graph").append("svg")
          .attr("id", "svgGraph")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2]);

    svg.call(tip);

    graph = svg.append("g")
            .attr("id", "graphG")
		    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("path").attr("d", line(bookNumbers))
                        .on("mouseover", tip.show)
                        .on("mouseout", tip.hide);

    rect = svg.append("g")
            .attr("id", "graphR")
            .attr("transform", "translate(" + m[3] + "," + m[0] * -1 + ")");

}

function scaleGraph()
{
    // X scale will fit all values from data[] within pixels 0-w
    x = d3.scale.linear().domain([0, 100]).range([0, w]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    y = d3.scale.linear().domain([0, highestBookNumber]).range([h, 0]);

    // create a line function that can convert data[] into x and y points
    line = d3.svg.line()
    // assign the X function to plot our line as we wish
		.x(function (d, i)
		{
		    // return the X coordinate where we want to plot this datapoint
		    return x(i);
		})
		.y(function (d)
		{
		    // return the Y coordinate where we want to plot this datapoint
		    return y(d);
		});

}

// Update Graph nach Click
function updateGraph(value)
{
    if (parseInt(value, 10) >= parseInt(highestBookNumber, 10))
    {
        highestBookNumber = value;
        scaleGraph();
    }
    $("#graphG").empty();
    $("#graphR").empty();
    bookNumbers.push(value);
    graph.append("path")
         .attr("d", line(bookNumbers));


    rect.selectAll(".rect")
        .data(bookNumbers)
        .enter()
        .append("svg:rect")
        .attr("class", "rect")
        .attr("x", line.x())
        .attr("y", line.y())
        .attr("width", 12)
        .attr("height", 30)
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);
}