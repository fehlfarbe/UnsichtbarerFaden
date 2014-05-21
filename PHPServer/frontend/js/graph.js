/**
* 
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

    //console.log("graph width: " + w);
    //console.log("graph height: " + h);

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

    
    //focus = graph.append("g")
    //            .attr("class", "focus")
    //            .style("display", "none");

    //focus.append("circle")
    //                .attr("r", "4.5");

    //focus.append("text")
    //  .attr("x", 9)
    //  .attr("dy", ".35em");

    //graph.append("rect")
    //.attr("class", "overlay")
    //.attr("width", "500px")
    //.attr("height", "100px")
    //.on("mouseover", function () { focus.style("display", null); })
    //.on("mouseout", function () { focus.style("display", "none"); })
    //.on("mousemove", mMove);
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
    //.data(bookNumbers)
           .attr("d", line(bookNumbers));
           //.on("mouseover", tip.show)
           //.on("mouseout", tip.hide);

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


    //focus = graph.append("g")
    //            .attr("class", "focus")
    //            .style("display", "none");

    //focus.append("circle")
    //            .attr("r", "4.5");

    //focus.append("text")
    //        .attr("class", "text")
    //        .attr("x", "-0")
    //        .attr("y", "-1.5em");

    //focus.append("rect")
    //        .attr("fill", "#000")
    //        .attr("x", "-0")
    //        .attr("width", "10px")
    //        .attr("height", "10px")
    //        .attr("y", "-1em");


    //graph.append("rect")
    //.attr("class", "overlay")
    //.attr("width", "500%")
    //.attr("height", "100%")
    //.on("mouseover", function () { focus.style("display", null); })
    //.on("mouseout", function () { focus.style("display", "none"); })
    //.on("mousemove", mMove);

    //if (value != lastBookNumber)
    //{
    //d3.select("#graph").append("div").attr("id","#graphLabel").html(bookNumbers);
    //graph.append("svg:text").text(bookNumbers);
    //}
    //lastBookNumber = value;
}

function mMove()
{
    //var m = d3.mouse(this);
    //d3.select("#path").select("title").text(d);

    //var x0 = x.invert(d3.mouse(this)[0]),
    //    i = d3.bisect(bookNumbers, x0, 1),
    //    d0 = bookNumbers[i - 1],
    //    d1 = bookNumbers[i],
    //    d = x0 - d0 > d1 - x0 ? d1 : d0;
    //focus.attr("transform", "translate(" + x.invert(i) + "," + y(d0) + ")");
    //focus.select("text").text(d);
}