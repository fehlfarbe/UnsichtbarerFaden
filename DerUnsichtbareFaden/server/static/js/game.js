function AppViewModel(startSymbol) {
	var self = this;

	this.currentArticle = ko.observable(null);
	this.currentSymbol = ko.observable(null);
	this.currentSymbols = ko.observableArray([]);
	this.allArticles = ko.observableArray([]);
	this.bookLevels = ko.observableArray([]);
	
	
	this.nextArticle = function(symbol){

		if( typeof symbol == 'object')
			symbol = symbol.id;
		
		$.getJSON('/agent/'+symbol, function(data){
			console.log("new article", data);
			
			if( data == null){
				console.log("It's the end!");
				alert("Ende!");
				return;
			}
			
			self.currentArticle(data.article);
			self.currentSymbol(symbol);
			self.currentSymbols(data.symbols);
			self.bookLevels.push(data.article.book);
		});
	}
	
	ko.bindingHandlers.graph = {
	    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        // This will be called when the binding is first applied to an element
	        // Set up any initial state, event handlers, etc. here
	    	//console.log("init", element);
	    	//this.vis = 
	    	//this.vis_width = element.width;
	    	//console.log("init", this)
	    },
	    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
	        // This will be called once when the binding is first applied to an element,
	        // and again whenever any observables/computeds that are accessed change
	        // Update the DOM element based on the supplied values here.
	    	console.log("update", ko.unwrap(valueAccessor()), element, element.id);
	    	
	    	var val = ko.unwrap(valueAccessor());
	    	// Set the dimensions of the canvas / graph
	    	var margin = {top: 20, right: 20, bottom: 20, left: 20},
	    	    width = 500 - margin.left - margin.right,
	    	    height = 200 - margin.top - margin.bottom;

	    	// Define the line
	    	var i=0;
	    	var y_max = Math.max.apply(null, val);
	    	var valueline = d3.svg.line()
	    		.x(function(d) { return margin.left + (width / (val.length-1)) * i++; })
	    		.y(function(d) { return height-(height/y_max)*d+margin.top; })
	    		.interpolate("linear");
	    	
	    	
	    	// Adds the svg canvas
	    	var svg = d3.select("#"+element.id);
	    	svg.selectAll("*").remove();

	        // Add the valueline path.
	        svg.append("path")
	            .attr("class", "line")
	            .attr("d", valueline(val));

	    	console.log("update", svg);
	    }
	};
	
	this.initModel = function(symbol){
		console.log("load game with symbol", symbol);
		
		// init 3D engine
		
		// load first article
		self.nextArticle(symbol);
	}
	
	
	/** INIT **/
	this.initModel(startSymbol);
};

//apply viewModel
//var model = AppViewModel();
//ko.applyBindings(model);