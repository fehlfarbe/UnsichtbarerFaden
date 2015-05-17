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
	    	//console.log("update", ko.unwrap(valueAccessor()), element, element.id);
	    	
	    	var val = ko.unwrap(valueAccessor());
	    	// Set the dimensions of the canvas / graph
	    	var margin = {top: 20, right: 20, bottom: 20, left: 20},
	    	    width = $(element).width() - margin.left - margin.right,
	    	    height = $(element).height() - margin.top - margin.bottom;

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
	    }
	};
	
	ko.bindingHandlers.three = {
		    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		        // This will be called when the binding is first applied to an element
		        // Set up any initial state, event handlers, etc. here
		    	console.log("init three", element, $(element).width(), $(element).height());
		    	self.scene = new THREE.Scene();
		    	self.scene.updated = false;
		    	self.camera = new THREE.PerspectiveCamera( 90, $(element).width() / $(element).height(), 0.1, 5000 );
		    	self.renderer = new THREE.WebGLRenderer({antialias:true});
		    	renderer.setSize( $(element).width(), $(element).height() );
		    	element.appendChild( self.renderer.domElement );
		    	
		    	function onMouseWheel(event) {
		        	//console.log(event, event.wheelDelta, event.detail);
		        	var value = 0;
		        	if( event.wheelDelta == undefined)
		        		value = event.detail * -50;
		        	else
		        		value = event.wheelDelta;
		        	
		            if (value > 0) {
		                self.camera.position.z -= value;
		            } else {
		                self.camera.position.z -= value;
		            }
		        }
		    	
		    	var lastX = 0,
		    		lastY = 0;
		    	function onMouseMove(event) {		    		
		    		if(lastX == 0)
		    			lastX = event.clientX;
		    		if(lastY == 0)
		    			lastY = event.clientY;
		    		if(event.buttons != 0){
			    		self.camera.position.x += (event.clientX-lastX)*5;
			    		self.camera.position.y += (lastY-event.clientY)*5;
		    		}
		    		
		    		lastX = event.clientX;
		    		lastY = event.clientY;
		    	}
		    	
		    	document.body.addEventListener('DOMMouseScroll', onMouseWheel, false);
		    	document.body.addEventListener('mousewheel', onMouseWheel, false);
		    	document.body.addEventListener('mousemove', onMouseMove, false);

		    },
		    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
		        // This will be called once when the binding is first applied to an element,
		        // and again whenever any observables/computeds that are accessed change
		        // Update the DOM element based on the supplied values here.
		    	console.log("update", ko.unwrap(valueAccessor()), element, element.id);
		    	var articles = ko.unwrap(valueAccessor());

		    	if( self.scene.updated || articles.length == 0 )
		    		return;
		    	
		    	self.scene_objects = [];
		    	for( var i=0; i<articles.length; i++){
		    		var id = articles[i].id;
		    		texture = THREE.ImageUtils.loadTexture("/texture/" + id);
		    		texture.minFilter = THREE.NearestFilter;
		    		//console.log("texture", texture, texture.image);
		            object = new THREE.Mesh(new THREE.PlaneBufferGeometry(300, 200), new THREE.MeshBasicMaterial({map:texture}));
		            object.overdraw = true;
		            
		            object.rotation_value = {
		            		x : (Math.random()-0.5) / 200.0,
		            		y : (Math.random()-0.5) / 200.0
		            }
		            object.position.x = articles[i].x*10;//randomInt(-400,400)/100 * 4000 -2000;
		            object.position.y = articles[i].y*8;//randomInt(200,800)/100 * 4000 -2000;
		            object.position.z = -articles[i].z*50;//randomInt(0, 30)/-5 * 5000;
		            self.scene_objects.push(object);
		            self.scene.add(object);
		    	}
		    	
		    	self.scene.updated = true;
		    	
		    	console.log("articles", articles);
		    	self.camera.position.z = 700;
		    	self.camera.position.y = 1700;
		    	
		    	
		    	function render() {
		    		requestAnimationFrame( render );
		    		
		    		for(var i=0; i<self.scene_objects.length; i++){
		    			var obj = self.scene_objects[i]
		    			if( self.currentArticle() != null && self.currentArticle().id == obj.id){
			    			//console.log(self.currentArticle());
			    			
			    			obj.rotation.x = 0;
			    			obj.rotation.y = 0;
	    					self.camera.position.x = obj.position.x;
	    					self.camera.position.y = obj.position.y
	    					//self.camera.position.z = obj.position.z+500;
			    		} else {
			    			obj.rotation.x += obj.rotation_value.x;
			    			obj.rotation.y += obj.rotation_value.y;
			    		}
		    		}
		    		
		    		renderer.render( self.scene, self.camera );
		    	}
		    	render();
		    }
	};
	
	this.loadArticleTextures = function(){
		$.getJSON('/agent/articletextures', function(data){
			//console.log("all articles", data);
			self.allArticles(data);
		});
	}
	
	this.initModel = function(symbol){
		console.log("load game with symbol", symbol);
		
		// init 3D engine
		
		// load article textures
		self.loadArticleTextures();
		
		// load first article
		self.nextArticle(symbol);
	}
	
	
	/** INIT **/
	this.initModel(startSymbol);
};

//apply viewModel
//var model = AppViewModel();
//ko.applyBindings(model);