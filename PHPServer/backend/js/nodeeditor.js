/**
 * Nodeeditor for Backend
 */
var nodeEditor = angular.module('nodeeditor',[]);

nodeEditor.initNodes = function($scope, $http) {
	
	$scope.nodes = null;
	
	$scope.force = null;
	$scope.linkProp = {length: 300};
	$scope.changeLinkLength = function(){
		console.log($scope.linkProp);
		console.log($scope.force);
		
		if($scope.force != null){
			console.log("change length to", $scope.linkProp.length);
			$scope.force.linkDistance($scope.linkProp.length).start();
		}
	};
	
	$('#grapheditor').block();
	
	
	//save nodes
	$scope.saveNodes = function() {
		$('#grapheditor').block();
		$('#bubbles').block();
		
		var data = $scope.nodes;
		console.log("send data", data);
		$http.post('/backend.php?action=save_nodes', data)
		.success(function(data, status, headers, config){
			console.log("Nodes saved!");
			$('#grapheditor').unblock();
			$('#bubbles').unblock();
		}).error(function(data, status, headers, config){
			alert("I can't do this, Dave!");
			$('#grapheditor').unblock();
			$('#bubbles').unblock();
		});
	};
	
	//reset nodes
	$scope.resetNodes = function(){
		//Todo
	};

	//load relations
	$scope.relations = $http.get('/backend.php?action=nodes').then(function(result) {
		 $scope.nodes = result.data;
         $scope.nodes.deletedNodes = Array();
         $scope.nodes.deletedLinks = Array();
         
         console.log("nodes", result.data);

         // set up initial nodes and links
         //  - nodes are known by 'id', not by index in array.
         //  - reflexive edges are indicated on the node (as a bold black circle).
         //  - links are always source < target; edge directions are set by 'left' and 'right'.
         var nodes = result.data.nodes;
         var lastNodeId = 0;
         for(var i = 0; i < nodes.length; i++)
        	 if( nodes[i].id > lastNodeId )
        		 lastNodeId = nodes[i].id;
         var links = [];
         for(var i = 0; i < result.data.links.length; i++){
        	 var link = result.data.links[i];
        	 var src = null;
        	 var dst = null;
        	 
        	 for(var j = 0; j < nodes.length; j++){
        		 if( nodes[j].id == link.source )
        			 src = nodes[j];
        		 if( nodes[j].id == link.target )
        			 dst = nodes[j];
        		 if(src != null && dst != null)
        			 break;
        	 }
        	 
        	 if(src != null && dst != null)
        		 links.push({source: src, target: dst, left: false, right: true});
         }
         result.data.links = links;
         
         /*********************************
          * 
          *  init D3 force layout
          * 
          **********************************/
         // set up SVG for D3
         var width  = $('#grapheditor').width(),
             height = $('#grapheditor').height(),
             colors = d3.scale.category20();
         
         var outer = d3.select("#grapheditor")
         	.append("svg:svg")
         		.attr("width", width)
         		.attr("height", height)
         		.attr("pointer-events", "all")
           		.on('mousedown', mousedown)
           		.on('mousemove', mousemove)
           		.on('mouseup', mouseup)
           		.on('contextmenu', function(){console.log("CONTEXT");d3.event.preventDefault();})
           		.call(d3.behavior.zoom().on("zoom", redraw));

         var svg = outer
           .append('svg')           	
           .append('svg:g');
         
         // force layout
         $scope.force = d3.layout.force()
             .nodes(nodes)
             .links(links)
             .size([width, height])
             .linkDistance($scope.linkProp.length)
             .charge(-1500)
             .on('tick', tick);
         
         //unblock element
         $('#grapheditor').unblock();

         // line displayed when dragging new nodes
         var drag_line = svg.append('svg:path')
           .attr('class', 'link dragline hidden')
           .attr('d', 'M0,0L0,0');

         // handles to link and node element groups
         var path = svg.append('svg:g').selectAll('path'),
             circle = svg.append('svg:g').selectAll('g');

         // mouse event vars
         var selected_node = null,
             selected_link = null,
             mouseover_node = null,
             mousedown_link = null,
             mousedown_node = null,
             mouseup_node = null,
             lastScale = 1.0,
             lastTranslate = [0, 0];
         
         function nodeExists(name){
             for(var i=0; i<nodes.length; i++){
          	   if(nodes[i].name.toLowerCase() == $.trim(name.toLowerCase()) ){
          		   return true;
          	   }
             }
             
             return false;
         }

         function resetMouseVars() {
           mousedown_node = null;
           mouseup_node = null;
           mousedown_link = null;
         }

         /*****************************************
          * 
          * update force layout (called automatically each iteration)
          * 
          *****************************************/
         function tick(e) {
           // draw directed edges with proper padding from node centers
           path.attr('d', function(d) {
             var deltaX = d.target.x - d.source.x,
                 deltaY = d.target.y - d.source.y,
                 dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
                 normX = deltaX / dist,
                 normY = deltaY / dist,
                 sourcePadding = d.left ? 17 : 12,
                 targetPadding = d.right ? 17 : 12,
                 sourceX = d.source.x + (sourcePadding * normX),
                 sourceY = d.source.y + (sourcePadding * normY),
                 targetX = d.target.x - (targetPadding * normX),
                 targetY = d.target.y - (targetPadding * normY);
             return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
           });

           
//           circle
//           //.each(cluster(10 * e.alpha * e.alpha))
//           .each(collide(.5))
//           .attr("cx", function(d) { return d.x; })
//           .attr("cy", function(d) { return d.y; });
           
           circle.attr('transform', function(d) {
               return 'translate(' + d.x + ',' + d.y + ')';
           });
             
         }
         

      // Move nodes toward cluster focus.
      function gravity(alpha) {
        return function(d) {
          d.y += (d.cy - d.y) * alpha;
          d.x += (d.cx - d.x) * alpha;
        };
      }

      // Resolve collisions between nodes.
      function collide(alpha) {
        var quadtree = d3.geom.quadtree(nodes);
        return function(d) {
          var r = d.radius + 100 + 10,
              nx1 = d.x - r,
              nx2 = d.x + r,
              ny1 = d.y - r,
              ny2 = d.y + r;
          quadtree.visit(function(quad, x1, y1, x2, y2) {
            if (quad.point && (quad.point !== d)) {
              var x = d.x - quad.point.x,
                  y = d.y - quad.point.y,
                  l = Math.sqrt(x * x + y * y),
                  r = d.radius + quad.point.radius + (d.color !== quad.point.color) * 10;
              if (l < r) {
                l = (l - r) / l * alpha;
                d.x -= x *= l;
                d.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
              }
            }
            return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
          });
        };
      }
         
         
         
         /**********************************************************
          * 
          * REDRAW
          * 
          *********************************************************/         
         function redraw(){
        	 
        	 if( !d3.event.scale || d3.event.scale > 10 || d3.event.scale < 0.1 )
        		 return;
        	 
        	 if( d3.event.ctrlKey || mousedown_node || mousedown_link )
        		 return;
        	 
        	 //Firefox
        	 if( d3.event.sourceEvent.type != 'wheel' && d3.event.sourceEvent.buttons < 2)
        		 return;
        	 
        	 //Chrome
        	 if(  d3.event.sourceEvent.type != 'wheel' && d3.event.sourceEvent.buttons == undefined &&  d3.event.sourceEvent.button < 2)
        		 return;
        	 
        	 //console.log(d3.event.sourceEvent);
        	 //console.log("ZOOM REDRAW", d3.event.translate, d3.event.scale);
        	 lastScale = d3.event.scale;
        	 lastTranslate = d3.event.translate;
        	 svg.attr("transform","translate(" + d3.event.translate + ")" +
        			  "scale(" + d3.event.scale + ")");
//        	 path.attr(
//       			  "scale(" + d3.event.scale + ")");
         }

         /********************************************************
          * 
          * update graph (called when needed)
          * 
          *******************************************************/
         function restart() {
           // path (link) group
           path = path.data(links);

           // update existing links
           path.classed('selected', function(d) { return d === selected_link; })
           .classed('active', function(d) { return d.target === mouseover_node || d.source === mouseover_node; })
             .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
             .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
             .classed('hidden', function(d) { 
            	 if( selected_node == null )
            		 return false;
            	 return !(d.target === selected_node || d.source === selected_node);
            });


           // add new links
           path.enter().append('svg:path')
             .attr('class', 'link')
             .classed('selected', function(d) { return d === selected_link; })
             .classed('active', function(d) { return d.target === mouseover_node || d.source === mouseover_node; })
             .classed('hidden', function(d) { 
            	 if( selected_node == null )
            		 return false;
            	 return !(d.target === selected_node || d.source === selected_node);
            })
             //.style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
             //.style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
             .on('mousedown', function(d) {
               if(d3.event.ctrlKey) return;

               // select link
               mousedown_link = d;
               if(mousedown_link === selected_link) selected_link = null;
               else selected_link = mousedown_link;
               selected_node = null;
               restart();
             });

           // remove old links
           path.exit().remove();


           // circle (node) group
           // NB: the function arg is crucial here! nodes are known by id, not by index!
           circle = circle.data(nodes, function(d) { return d.id; });

           // update existing nodes (reflexive & selected visual states)
           circle.selectAll('circle')
             .style('fill', function(d) { 
            	 //console.log("node", mouseover_node, d);
            	 if( mouseover_node === null && selected_node === null)
            		 return colors(d.id);
            	 
            	 return (d === selected_node || d === mouseover_node) ? d3.rgb(colors(d.id)).brighter().toString() : d3.rgb(colors(d.id)).darker().toString();
             
             })
             .classed('hidden', function(d){ 
            	 if( selected_node === null)
            		 return false;
            	 
            	 for( var i=0; i<links.length; i++){
            		 if(selected_node === links[i].target || selected_node === links[i].source){
            			 if( links[i].target === d || links[i].source === d)
            				 return false;
            		 }
            	 }
            	 return d !== selected_node;
            });
             
             
           // add new nodes
           var g = circle.enter().append('svg:g');

           g.append('svg:circle')
             .attr('class', 'node')
             .attr('r', function(d){
            	 return Math.min( 120, Math.max(15, d.count * 10));
              })
             .style('fill', function(d) {
            	 //console.log("node", mouseover_node, d);
            	 if( mouseover_node === null && selected_node === null)
            		 return colors(d.id);
            	             	 
            	 return (d === selected_node || d === mouseover_node) ? d3.rgb(colors(d.id)).brighter().toString() : d3.rgb(colors(d.id)).darker().toString(); })
             .style('stroke', function(d) { return d3.rgb(colors(d.id)).darker().toString(); })
             .on('mouseover', function(d) {
            	 mouseover_node = d;
            	 //d3.select(this).attr('transform', 'scale(1.5)');

               restart();
             })
             .on('mouseout', function(d) {
               //if(!mousedown_node || d === mousedown_node) return;
               // unenlarge target node
            	 mouseover_node = null;
               //d3.select(this).attr('transform', '');
               restart();
             })
             .on('mousedown', function(d) {
               if(d3.event.ctrlKey) return;
               console.log("clicked", d);
               // select node
               mousedown_node = d;
               if(mousedown_node === selected_node) selected_node = null;
               else selected_node = mousedown_node;
               selected_link = null;

               // reposition drag line
               drag_line
                 .style('marker-end', 'url(#end-arrow)')
                 .classed('hidden', false)
                 .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

               restart();
             })
             .on('mouseup', function(d) {
               if(!mousedown_node) return;

               // needed by FF
               drag_line
                 .classed('hidden', true)
                 .style('marker-end', '');

               // check for drag-to-self
               mouseup_node = d;
               if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

               // unenlarge target node
               d3.select(this).attr('transform', '');

               // add link to graph (update if exists)
               // NB: links are strictly source < target; arrows separately specified by booleans
               var source, target, direction;
               if(mousedown_node.id < mouseup_node.id) {
                 source = mousedown_node;
                 target = mouseup_node;
                 direction = 'right';
               } else {
                 source = mouseup_node;
                 target = mousedown_node;
                 direction = 'left';
               }

               var link;
               link = links.filter(function(l) {
                 return (l.source === source && l.target === target);
               })[0];

               if(link) {
                 link[direction] = true;
               } else {
                 link = {source: source, target: target, left: false, right: false};
                 link[direction] = true;
                 links.push(link);
               }

               // select new link
               selected_link = link;
               selected_node = null;
               restart();
             });

           // show node IDs
           //console.log("append text", g);
           circle.selectAll('text').remove();
           circle.append('text')
               .attr('x', 0)
               .attr('y', 4)
               .attr('class', 'id')
               .text(function(d) { return d.name + "(" + d.count + ")"; })
               .classed('hidden', function(d){
            	   if( selected_node == null)
            		   return false;
            	   
            	   for( var i=0; i<links.length; i++){
		          		 if(selected_node === links[i].target || selected_node === links[i].source){
		          			 if( links[i].target === d || links[i].source === d)
		          				 return false;
		          		 }
              	 	}
            	   
            	   return d !== selected_node;
               });
           
           //resize circles by textsize
//           var c = 0;
//           circle.selectAll("text").each(function () {
//        	   //console.log(circle.selectAll("circle"));
//        	   circle.selectAll("circle")[c++][0].setAttribute('r', this.getComputedTextLength()/2+2);
//           });
           
           // remove old nodes
           circle.exit().remove();

           // set the graph in motion
           $scope.force.start();
         }
         
         
         /******************************************
          * 
          * Mousehandler
          * 
          ******************************************/
         function mousedown() {
           // prevent I-bar on drag
           //d3.event.preventDefault();
           
           // because :active only works in WebKit?
           svg.classed('active', true);
           
           if(d3.event.ctrlKey || mousedown_node || mousedown_link || d3.event.button == 2) return;

           // insert new node at point
           var name = $.trim(prompt("Name","Neuer Knoten"));
           if(name == '' || name == null)
        	   return;
           if(nodeExists(name)){
        	   alert("Name existiert bereits!");
    		   return;
           }
           
           var point = d3.mouse(this),
               node = {id: ++lastNodeId, reflexive: false, name: name};
           node.x = point[0];
           node.y = point[1];
           nodes.push(node);
           console.log("Node", nodes);

           restart();
         }

         function mousemove() {
        	 if(d3.event.button == 2){
          	   svg.call(d3.behavior.zoom().on("zoom"), redraw);
          	   return;
             }
        	 
           if(!mousedown_node) return;

           // update drag line
           drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(svg[0][0])[0] + ',' + d3.mouse(svg[0][0])[1]);

           restart();
         }

         function mouseup() {
           if(mousedown_node) {
             // hide drag line
             drag_line
               .classed('hidden', true)
               .style('marker-end', '');
           }

           // because :active only works in WebKit?
           svg.classed('active', false);

           // clear mouse event vars
           resetMouseVars();
         }

         function spliceLinksForNode(node) {
           var toSplice = links.filter(function(l) {
             return (l.source === node || l.target === node);
           });
           toSplice.map(function(l) {
             links.splice(links.indexOf(l), 1);
           });
         }

         /************************************************
          * 
          * KeyBoardHandler
          * 
          ***********************************************/
         // only respond once per keydown
         var lastKeyDown = -1;

         function keydown() {
//           d3.event.preventDefault();

           if(lastKeyDown !== -1) return;
           lastKeyDown = d3.event.keyCode;

           // ctrl
           if(d3.event.keyCode === 17) {
             circle.call($scope.force.drag);
             svg.classed('ctrl', true);
           }

           if(!selected_node && !selected_link) return;
           switch(d3.event.keyCode) {
             case 8: // backspace
             case 46: // delete
               if(selected_node) {
            	   $scope.nodes.deletedNodes.push(selected_node);
            	   nodes.splice(nodes.indexOf(selected_node), 1);
            	   spliceLinksForNode(selected_node);
               } else if(selected_link) {
            	   $scope.nodes.deletedLinks.push(selected_link);
            	   links.splice(links.indexOf(selected_link), 1);
               }
               selected_link = null;
               selected_node = null;
               restart();
               d3.event.preventDefault();
               break;
             case 82: // rename
               if(selected_node) {
                 // toggle node reflexivity
            	 var name = $.trim(prompt("Neuer Name", selected_node.name));
            	 if(name != '' && name != null){
            		 if( name.toLowerCase() != selected_node.name.toLowerCase() && nodeExists(name))
            			 break;
            		 selected_node.name = name;
            		 //console.log(name);
            		 console.log("nodes", nodes);
            		 restart();
            	 }
               }
               d3.event.preventDefault();
               break;
           }
         }

         function keyup() {
           lastKeyDown = -1;

           // ctrl
           if(d3.event.keyCode === 17) {
             circle
               .on('mousedown.drag', null)
               .on('touchstart.drag', null);
             svg.classed('ctrl', false);
           }
         }
         
         d3.select(window)
           .on('keydown', keydown)
           .on('keyup', keyup);
         
         restart();
         
         return result.data;
     });
};


/**********************************************************************************
 * 
 * 
 * 	BUBBLE EDITOR
 * 
 * 
 * 
 * @param $scope
 * @param $http
 **********************************************************************************/
nodeEditor.initBubbles = function($scope, $http, $location) {
	
	//load relations
	//$("#nodeselect").chosen();
	var svg = null;
	$scope.selectedNode = null;
	$scope.mouseoverNode = null;
	$scope.links = null
	$scope.nodeArticles = Array();
	$scope.linkStrength = null;
	
	$scope.loadArticle = function(id){
		$location.search('id', id).path('/newarticle');
	}
	
	/******************************************************
	 * 
	 * Load articles with selected Node
	 * 
	 *****************************************************/
	function loadNodeArticles(node){
		console.log("load articles for node", node);
		$http.post('/backend.php?action=nodearticles', {nodeid:node.id})
		.success(function(data, status, headers, config) {
			$scope.nodeArticles = data;
		})
		.error(function(data, status, headers, config) {
			console.log("Error fetching nodearticles", status);
		});
	}
	
	/******************************************************
	 * 
	 * Load links with linkstrength between nodes
	 *
	 *****************************************************/
	function loadLinkStrength(node) {
		console.log("Load link strength");
		$http.post('/backend.php?action=linkstrength', {nodeid:node.id})
		.success(function(data, status, headers, config) {
			console.log("linkstrength", data);
			$scope.linkStrength = data;
		})
		.error(function(data, status, headers, config) {
			console.log("Error fetching linkstrength for", node, status);
		});
	}
	
	/******************************************************
	 * Get Node from relations
	 *****************************************************/
	function getNode(nodeid){
		for(var i=0; i<$scope.nodes.children.length; i++){
			if( parseInt($scope.nodes.children[i].nodeid) == nodeid )
				return $scope.nodes.children[i];
		}
		return null;
	}
	
	/******************************************************
	 * 
	 * Bubble Style
	 * 
	 *****************************************************/
	var diameter  = $('#bubbles').width(),
    	format = d3.format(",d"),
    	color = d3.scale.category20c();
	
	/*******************************************************
	 *
	 * REDRAW Function
	 * 
	 *******************************************************/
	function redraw(){
		
		/*****************************
		 * draw links between bubbles
		 ****************************/
		if( $scope.selectedNode && $scope.linkStrength && $scope.mouseoverNode ){
			console.log("draw linkstrength");
			for(var i=0; i<$scope.linkStrength.length; i++){
				//console.log($scope.selectedNode, "-->", getNode($scope.linkStrength[i].nodeid));
				var targetNode = getNode($scope.linkStrength[i].nodeid);
				var myLine = svg.append("svg:line")
			    .attr("x1", $scope.selectedNode.x)
			    .attr("y1", $scope.selectedNode.y)
			    .attr("x2", targetNode.x)
			    .attr("y2", targetNode.y)
			    .style("stroke-width", targetNode.count)
			    .style("stroke", "rgb(6,120,155)");
			}
		} else {
			//remove all links
			svg.selectAll("line").remove();
		}
		
		
		var links = $scope.links;
		//console.log("Links", links);
		// Nodes
		$scope.node.selectAll("circle").style("fill", function(d) {
			if (d === $scope.mouseoverNode || d === $scope.selectedNode)
				return d3.rgb(color(d.id)).brighter().toString();

			return color(d.id);
		}).style("stroke", function(d) {
			if (d === $scope.mouseoverNode || d === $scope.selectedNode)
				return d3.rgb(color(d.id)).darker().toString();

			return color(d.id);
		}).classed(
				'hidden',
				function(d) {
					if ($scope.selectedNode == null)
						return false;

					for (var i = 0; i < links.length; i++) {
						if ($scope.selectedNode === links[i].target
								|| $scope.selectedNode === links[i].source) {
							if (links[i].target === d || links[i].source === d)
								return false;
						}
					}

					return d !== $scope.selectedNode;
				}).attr('r', function(d) {
			if (d === $scope.mouseoverNode)
				return Math.max(d.r, 50);
			return d.r;
		});

		// Text
		$scope.node.selectAll("text").classed(
				'hidden',
				function(d) {
					if ($scope.selectedNode == null)
						return false;

					for (var i = 0; i < links.length; i++) {
						if ($scope.selectedNode === links[i].target
								|| $scope.selectedNode === links[i].source) {
							if (links[i].target === d || links[i].source === d)
								return false;
						}
					}

					return d !== $scope.selectedNode;
				}).style("font-size", "1px").each(
				function(d) {
					try {
						var bbox = this.getBBox(), cbbox = this.parentNode
								.getBBox(), scale = Math.min(cbbox.width
								/ bbox.width, cbbox.height / bbox.height);
						d.scale = scale * 0.9;
					} catch (e) {
						// TODO: handle exception
					}
				}).style("font-size", function(d) {
			return d.scale + "px";
		});
		
		
	}
	
	/***************************************************************************
	 * onChange
	 **************************************************************************/
	 $scope.change = function(s) {
		 console.log("redraw", s, $scope.selectedNode);
		 redraw();
	 };
	
	 
	 /*******************************************************************************
	  * 
	  * LOAD DATA
	  *
	  *******************************************************************************/
	$scope.relations = $http.get('/backend.php?action=nodes').then(function(result) {
        
		function compare(a,b) {
			  if (a.name.toLowerCase() < b.name.toLowerCase())
			     return -1;
			  if (a.name.toLowerCase() > b.name.toLowerCase())
			    return 1;
			  return 0;
			}

		$scope.nodes = result.data.nodes;
		$scope.nodes.sort(compare);
		
//		for(var i=0; i<$scope.nodes.length; i++)
//			$("#nodeselect").append("<option value='" + $scope.nodes[i].id + "'>" + $scope.nodes[i].name + "</option>");		
//		$("#nodeselect").trigger("chosen:updated");
        
        var lastNodeId = 0;
        for(var i = 0; i < $scope.nodes.length; i++)
       	 if( $scope.nodes[i].id > lastNodeId )
       		 lastNodeId = $scope.nodes[i].id;
        var links = [];
        for(var i = 0; i < result.data.links.length; i++){
       	 var link = result.data.links[i];
       	 var src = null;
       	 var dst = null;
       	 
       	 for(var j = 0; j < $scope.nodes.length; j++){
       		 if( $scope.nodes[j].id == link.source )
       			 src = $scope.nodes[j];
       		 if( $scope.nodes[j].id == link.target )
       			 dst = $scope.nodes[j];
       		 if(src != null && dst != null)
       			 break;
       	 }
       	 
       	 if(src != null && dst != null)
       		 links.push({source: src, target: dst, left: false, right: true});
         }
        
        /**************************************
         * 
         * Setup Bubble Pack
         * 
         **************************************/
		var bubble = d3.layout.pack()
			.sort(null)
			.value(function(d){ return d.value; })
		    .size([diameter, diameter])
		    .padding(1.5);

		svg = d3.select("#bubbles").append("svg")
		    .attr("width", diameter)
		    .attr("height", diameter)
		    .attr("class", "bubble");
		
		d3.selection.prototype.moveToFront = function() {
			  return this.each(function(){
			    this.parentNode.appendChild(this);
			  });
			};

		/******************************************
		 * 
		 * Setup Nodes
		 *
		 *****************************************/
		for(var i=0; i<$scope.nodes.length; i++){
			$scope.nodes[i].value = $scope.nodes[i].count;
		}
		$scope.nodes = {children: $scope.nodes};
		
		$scope.node = svg.selectAll(".node")
		      .data(bubble.nodes($scope.nodes).filter(function(d) { return !d.children}))
		    .enter().append("g")
		      .attr("class", "node")
		      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
		      .on('mouseover', function(d) {
		    	  $scope.mouseoverNode = d;
		    	  d3.select(this).moveToFront();
		    	  
		    	  //console.log($scope.selected);
		    	  redraw();
		      })
		      .on('mouseout', function(d) {
		    	  $scope.mouseoverNode = null;
		    	  redraw();
		      })
		      /************************************
		       * Onclick
		       ***********************************/
		      .on('mousedown', function(d) {
		    	  
		    	  if( $scope.selectedNode === d){
		    		  $scope.selectedNode = null;
		    		  $scope.nodeArticles = Array();
		    		  $scope.linkStrength = null;
		    	  } else {
		    		  $scope.selectedNode = d;
		    		  loadNodeArticles($scope.selectedNode);
		    		  loadLinkStrength($scope.selectedNode);
		    	  }
		    	  console.log("mousedown", $scope.selectedNode);
		    	  redraw();
		      });
		
		$scope.node.append("title")
	      .text(function(d) { return d.name + "(" + d.count + ")"; });

		$scope.node.append("circle")
	      .attr("r", function(d) { return d.r; })
	      .style("fill", function(d) { return color(d.id); });

		$scope.node.append("text")
	      .attr("dy", ".3em")
	      .style("text-anchor", "middle")
	      .text(function(d) { return d.name + "(" + d.count + ")"; });

		
		/******************************************************
		 * 
		 * Redraw it!
		 *
		 ******************************************************/
		$scope.links = links;
		redraw();
		d3.select("#bubbles").style("height", diameter + "px");
		
		return result.data.nodes;
	});
	
}

