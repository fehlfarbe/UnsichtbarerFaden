/**
 * The webgl scene
 */
var scene, renderer, camera, composer, group, skyBox, meshArray, clock, lastTime, width, height, waitTime;

var cssRenderer, cssScene, cssCamera, cssObject;

var articleDiv;

var meshForm, numberOfMeshes, bgColor, articleSrc;

var lastmeshForm, lastBgColor, lastnumberOfMeshes;

var numberOfLastArticles, totalArticleCount;

var cameraZStartPoint = 10;

var mouse = {x : 0, y : 0};

var xMovement, yMovement;

var bgObject, bgMaterial;

function init() {
	scene = new THREE.Scene(); 
	
	width = window.innerWidth;
	height = window.innerHeight;

//    var width = 50;
//    var height = 10;
    //camera = new THREE.OrthographicCamera(width / - 64, width / 64, height / 64, height / - 64, 1, 1000 );
    camera = new THREE.PerspectiveCamera(100, width/height, 1, 1000);
    camera.position.z = cameraZStartPoint; 

    camera.lookAt(scene.position);
    
    cssCamera = new THREE.PerspectiveCamera(100, width/height, 1, 1000);
    cssCamera.position.z = 5; 

    if (Detector.webgl){
    	renderer = new THREE.WebGLRenderer({antialias:true});
    } else {
    	/* TODO: Message kein Web GL ausgeben */
//        renderer = new THREE.CanvasRenderer();
    }
    
    THREEx.WindowResize(cssRenderer, cssCamera);  
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	  

	renderer.setSize(width, height);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = -10;
	renderer.domElement.style.zIndex = 0;
	//renderer.setClearColor(bgColor, 1);
	
	cssRenderer = new THREE.CSS3DRenderer();
	cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = 'absolute';
    //cssRenderer.domElement.style.left = 25 + '%';
    
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(cssRenderer.domElement);

	cssScene = new THREE.Scene();


	
	var skyBoxGeometry = new THREE.CubeGeometry(1000,1000,1000);
	var skyBoxMaterial = new THREE.MeshBasicMaterial({color:0xffffff, side:THREE.BackSide });
	skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
	skyBox.name = "skyBox";
	scene.add(skyBox);

	
	//scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );



    document.addEventListener('mousemove', function(event){
    mouse.x = (event.clientX / window.innerWidth ) - 0.5
    mouse.y = (event.clientY / window.innerHeight) - 0.5
    }, false)



	meshArray = new Array();


    clock = new THREE.Clock(true);
    lastTime = clock.getElapsedTime();
    //clock.start();
    waitTime = rand(0,9);
    
    
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene,camera));
    
    var effect = new THREE.ShaderPass(THREE.DotScreenShader);
    effect.uniforms['scale'].value = 4;
    //composer.addPass(effect);
    
//    var effect = new THREE.ShaderPass(THREE.RGBShiftShader);
//    effect.uniforms['amount'].value = 0.0015;
    effect.renderToScreen = true;
    composer.addPass(effect);
//    var filmEffect = new THREE.FilmPass( 0.35, 0.025, 648, false );
//    filmEffect.renderToScreen = true;
//    composer.addPass(filmEffect);
    
//    var light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.00 );
//    light.position.set( 0.75, 1, 0.25 );
//    scene.add( light );
    
    var pointLight = new THREE.PointLight( 0xffffff, 1,0); 
    pointLight.position.set( 0, 0, 10 ); 
    pointLight.name = "pointLight";
    scene.add( pointLight );
    
    //scene.add(new THREE.Mesh(new THREE.CubeGeometry(1,1,1), new THREE.MeshLambertMaterial({color: 0xff0000})));
    //scene.add(cubes('tedra'));
    
    articleDiv = document.createElement('div');
    articleDiv.innerHTML = "ads";
    articleDiv.style.background = '#D3D3D3';
    articleDiv.style.color = '#008B8B';
    articleDiv.style.fontFamily = 'Courier';
    articleDiv.style.fontWeight = 'bold';
    //articleDiv.style.top = -50 + '%';
    articleDiv.style.zIndex = '1';
    //articleDiv.style.marginLeft = width/2 + 'px';
    articleDiv.style.padding = '5px';
    //articleDiv.style.left = '50%';
    articleDiv.style.position = 'absolute';
    //articleDiv.style.textAlign = 'center';
    articleDiv.style.width = 'auto';
    articleDiv.style.height = 'auto';
//    
//    articleDiv.style.backgroundImage = "url('src/div_bg.png')";
    console.log("bg: " + articleDiv.style.backgroundImage);
    articleDiv.style.border = 'solid';
    articleDiv.style.borderColor = 'black';
    
    bgMaterial = new THREE.ShaderMaterial( {
    uniforms: {
        time: { // float initialized to 0
            type: "f",
            value: 0.0
        }
    },
    vertexShader: document.getElementById( 'vertexShader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
    wireframe:true
} );

    //bgObject = new THREE.Mesh(new THREE.CubeGeometry(10,10,10,100,100,100), material);
    //bgObject = new THREE.Mesh(new THREE.SphereGeometry(1,32,16, 0, Math.PI*2, 0, Math.PI), material);
    bgObject = new THREE.Mesh(new THREE.IcosahedronGeometry( 10, 4 ), bgMaterial);
    bgObject.position.z = -1 * cameraZStartPoint;
    bgObject.name = "bgObject";

    scene.add(bgObject);

    //render();
//    meshForm = 'cube';
//    numberOfMeshes = 5;
//    fillScene();
    //animate();
    //triangle();

    
    

}




	
function makeTextSprite( message, parameters ) {
        if ( parameters === undefined ) parameters = {};
        
        var fontface = parameters.hasOwnProperty("fontface") ?
                parameters["fontface"] : "Arial";
        
        var fontsize = parameters.hasOwnProperty("fontsize") ?
                parameters["fontsize"] : 18;
        
        var borderThickness = parameters.hasOwnProperty("borderThickness") ?
                parameters["borderThickness"] : 4;
        
        var borderColor = parameters.hasOwnProperty("borderColor") ?
                parameters["borderColor"] : { r:255, g:0, b:255, a:1.0 };
        
        var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
                parameters["backgroundColor"] : { r:255, g:0, b:0, a:1.0 };

        var spriteAlignment = THREE.SpriteAlignment.topLeft;
                
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        context.font = "Bold " + fontsize + "px " + fontface;
    
        // get size data (height depends only on font size)
        var metrics = context.measureText( message );
        var textWidth = metrics.width;
        
        // background color
        context.fillStyle = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                                                 + backgroundColor.b + "," + backgroundColor.a + ")";
        // border color
        context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                                                 + borderColor.b + "," + borderColor.a + ")";

        context.lineWidth = borderThickness;
        //roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
        // 1.4 is extra height factor for text below baseline: g,j,p,q.
        
        // text color
        //context.fillStyle = "rgba(255, 0, 0, 1.0)";

        context.fillText( message, borderThickness, fontsize + borderThickness);
        
        // canvas contents will be used for a texture
        var texture = new THREE.Texture(canvas);
        texture.needsUpdate = true;

        var spriteMaterial = new THREE.SpriteMaterial(
                { map: texture, useScreenCoordinates: false, alignment: spriteAlignment } );
        var sprite = new THREE.Sprite( spriteMaterial );
        sprite.scale.set(40,40,40);
        return sprite;        
}	
	
	

/** Display new Scene, fade between changes in meshForm and Background */
function displayNewScene() {
	
	//first Start of Page
	if (meshArray.length == 0) {
		initMeshArray();
		updateSkyBoxColor(bgColor);
	} /*else {
		updateMeshes();
	}*/
	
	

	if (cssScene.children.length == 0) {
		console.log("fadeIn");
		fadeIn();
	} else {
		console.log("fadeInOut");
		fadeOutIn();
		//fadeIn();
	}
	moveCamera();
	//moveObjects();
	animate();
}


/** helper function, update the parameters for the new scene */
function updateSceneParameters(article) {

	if (totalArticleCount === undefined) {
		totalArticleCount = article.totalCount;
	}
	
	lastnumberOfMeshes = numberOfMeshes
	lastmeshForm = meshForm;
	lastBgColor = bgColor;
	
	numberOfLastArticles = article.lastArticles.length;
	articleSrc = article.text;
	numberOfMeshes = Math.pow(2, article.book);
	switch (article.symbol) {
	case 1:
		meshForm = 'triangle';
		bgColor = 0xffffff;
		break;
	case 2:
		meshForm = 'cube';
		bgColor = 0x000000;
		break;
	case 3:
		meshForm = 'cube';
		bgColor = 0xffffff;
		break;
	case 4:
		meshForm = 'end';
		bgColor = 0x000000;
		break;
	case 5:
		meshForm = 'triangle';
		bgColor = 0x000000;
		break;
	case 6:
		meshForm = 'point';
		bgColor = 0x000000;
		break;
	case 7:
		meshForm = 'point';
		bgColor = 0xffffff;
		break;
	}
		
	xMovement = 0;
	yMovement = 0;

	for (var i = 0; i < article.nodes.length; i++) {
		xMovement += article.nodes[i].x;
		yMovement += article.nodes[i].y;
	}

	xMovement /= article.nodes.length;
	yMovement /= article.nodes.length;

}


	
/** Helper function, cleaning the scene */
function cleanScene() {
	
	// if shapes are the same, and new number is lower remove only the difference from scene
//	if (lastmeshForm == meshForm) {
//		if (lastnumberOfMeshes > numberOfMeshes) {
//			var shapesToRemove = lastnumberOfMeshes - numberOfMeshes;
//			
//
//			for (var i = 0; i < shapesToRemove; i++) {
//			    scene.traverse (function (object){
//			    	if (object instanceof THREE.Mesh)
//			    	{
//			    		if (object.name === meshArray.name) {
//			    			console.log("scene removed object");
//			    			scene.remove(object);
//			    		}
//			    			
//			    	}
//			    });
//			}
//		}
//	} else {
		for (var i = scene.children.length -1; i >= 0; i--) {
			if (scene.children[i] instanceof THREE.Mesh && scene.children[i].name != "bgObject" && scene.children[i].name != "skyBox") {
				scene.remove(scene.children[i]);
			}
		}
//		meshArray = []
//	}
}


function updateMeshColor(mesh) {
	if (bgColor == 0x000000) {
		mesh.material.color.setHex(0xffffff);
	} else if (bgColor == 0xffffff) {
		mesh.material.color.setHex(0x000000);
	}
}


function updateMeshes() {
	if (lastnumberOfMeshes != numberOfMeshes) {
		updateNumberOfMeshes();
	}
	
	if (lastmeshForm != meshForm) {
		for (var i = 0; i < meshArray.length; i++) {
			updateMeshGeometry(meshArray[i]);
		}
	}
	
	if (lastBgColor != bgColor) {
		for (var i = 0; i < meshArray.length; i++) {
			updateMeshColor(meshArray[i]);
		}
	}
}
	
	
function updateNumberOfMeshes() {
	if (lastnumberOfMeshes > numberOfMeshes) {
		var meshesToRemove = lastnumberOfMeshes - numberOfMeshes;
		for (var i = 0; i < meshesToRemove; i++) {
		    meshArray.pop();
//		    scene.children.pop();
//		    console.log("pop");
		}
	} else if (lastnumberOfMeshes < numberOfMeshes) {
		var meshesToAdd = numberOfMeshes - lastnumberOfMeshes;
		for (var i = 0; i < meshesToAdd; i++) {
			addMesh();
			//TODO BUG!!!!

//			var tempMesh = meshArray.slice(0,1);
//			console.log(tempMesh);
//			//tempMesh.position.set(rand(-4,4)* camera.position.z/2, rand(-1,1)* camera.position.z/2, rand(-0.5,0));
//		    meshArray.push(tempMesh);
//		    this.meshArray.push(new THREE.Mesh(getMeshGeometry(), getMeshMaterial()));
//			updateMeshColor();
			//this.meshArray.name = meshForm;
			//this.meshArray[i].name = meshForm;
//			this.meshArray[i].position.set(rand(-4,4) * camera.position.z/2, rand(-1,1)* camera.position.z/2, rand(-6.5,0));
//		    scene.add(meshArray[meshArray.length-1]);
//		    console.log("push and add");
		}		
	}
}

function updateMeshGeometry(mesh) {
	//cleanScene();
	var tempArray = meshArray.slice();
	meshArray = [];
	for (var i = 0; i < numberOfMeshes; i++) {
		addMesh(tempArray[i].position);
	}
	
	//mesh.geometry = getMeshGeometry();
	
	
	
//	mesh.setGeometry(getMeshGeometry());
}

	
	
/** Helper function, determines the geometry from meshForm */	
function getMeshGeometry() {
	//Shape kann entfernt werden, wenn Objekte 3D bleiben
	
	var shape = new THREE.Shape();
	var geometry;
	switch(meshForm) {
	case 'cube':
		shape.moveTo(-1,-1);
		shape.lineTo(1,-1);
		shape.lineTo(1,1);
		shape.lineTo(-1,1);
		shape.lineTo(-1,-1);
		geometry = new THREE.CubeGeometry(2,2,2);
		break;
	case 'triangle':
		shape.moveTo(-1,-1);
		shape.lineTo(1,-1);
		shape.lineTo(0,0.5);
		shape.lineTo(-1,-1);
		geometry = new THREE.CylinderGeometry(0, 1, 1, 4, false); 
		break;
	case 'point':
		shape.absarc( 0, 0, 1, 0, Math.PI*2, false );
		geometry = new THREE.SphereGeometry(1,32,16, 0, Math.PI*2, 0, Math.PI);
		break;
	}
	return geometry;
}

function initMeshArray() {
	for (var i = 0; i < numberOfMeshes; i++) {
		addMesh();
	}	
}

function getMeshMaterial() {
	var material = new THREE.MeshBasicMaterial({wireframe: true});
	return material;
}


function addMesh(position) {
	var mesh = new THREE.Mesh(getMeshGeometry(), getMeshMaterial());
	updateMeshColor(mesh);
	mesh.name = meshForm;
	if (!position) {
		mesh.position.set(rand(-4,4) * camera.position.z/2, rand(-1,1) * camera.position.z/2, rand(-6.5,0));
	} else {
		mesh.position.set(position.x, position.y, position.z);
	}
	meshArray.name = meshForm;
	meshArray.push(mesh);
	
//	scene.add(mesh);
}	
	
/** Helper function fills the scene */
function fillScene() {
	
	if (meshForm == 'end') {
		var k = 1 - numberOfLastArticles/totalArticleCount;
		var spritey = makeTextSprite( "The End",
        { fontsize: 24, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
		spritey.position.set(-10*k,5*k,0);
		scene.add( spritey );
		//animate;
		//return;
	} else {

		cleanScene();
		updateMeshes();
		for (var i = 0; i < meshArray.length; i++) {
			scene.add(meshArray[i]);
		}
	}
	
	
	
	

//	if (lastmeshForm == meshForm) {
//		if (lastnumberOfMeshes > numberOfMeshes) {
//			var shapesToRemove = lastnumberOfMeshes - numberOfMeshes;
//			for (var i = 0; i < shapesToRemove; i++) {
////			    meshArray.pop();
////			    console.log("pop");
//			}
//		} else if (lastnumberOfMeshes < numberOfMeshes) {
//			var shapesToAdd = numberOfMeshes - lastnumberOfMeshes;
//			for (var i = 0; i < shapesToAdd; i++) {
//				
//				//TODO BUG!!!!
//
////				var tempMesh = meshArray.slice(0,1);
////				console.log(tempMesh);
////				//tempMesh.position.set(rand(-4,4)* camera.position.z/2, rand(-1,1)* camera.position.z/2, rand(-0.5,0));
////			    meshArray.push(tempMesh);
////			    scene.add(meshArray[meshArray.length-1]);
////			    console.log("push and add");
//			}		
//		}
//		updateMeshColor();
//	} else {
		//reset Array
//		this.meshArray = new Array();
//		var k = 1 - numberOfLastArticles/totalArticleCount;
//		if (meshForm == 'end') {
//			var spritey = makeTextSprite( "The End",
//	        { fontsize: 24, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
//			spritey.position.set(-10*k,5*k,0);
//			scene.add( spritey );
//			//animate;
//			//return;
//		} else {
//			for (var i = 0; i < numberOfMeshes; i++) {
//				
//			
//				//geometry = new THREE.ShapeGeometry(shape);
//				//geometry = new THREE.SphereGeometry(1,32,16, 0, Math.PI*2, 0, Math.PI);
//				
//				var material = new THREE.MeshBasicMaterial({wireframe: true});
//						
//				this.meshArray.push(new THREE.Mesh(geometry, material));
//				
//				updateMeshColor();
//				
//				this.meshArray.name = meshForm;
//				this.meshArray[i].name = meshForm;
////				this.meshArray[i].material.depthWrite = true;
////				this.meshArray[i].material.transparent = true;
//				//this.meshArray[i].material.opacity = 1;
//	
//	//			var j;
//	//			if (i%2) 
//	//				j = -1;
//	//			else
//	//				j = 1;
//	
//				
//				console.log("k" + k);
//		
//				this.meshArray[i].position.set(rand(-4,4) * camera.position.z/2, rand(-1,1)* camera.position.z/2, rand(-6.5,0));
//				console.log("meshArray.positon.x " + meshArray[i].position.x);
//				scene.add(this.meshArray[i]);
//			}
			//animate();
			//render();
//		}
//	}
	//updateSkyBoxColor(bgColor);

			//var div = document.createElement('div');
	//	element.src = src;
	//	console.log(src);
	//	var elementWidth = 256;
	//	var aspectRatio = planeHeight/planeWidth;
	//	var elementHeight = elementWidth * aspectRatio;
	//	element.style.width = elementWidth + "px";
	//	element.style.height = elementHeight + "px";
	//	
	//	var cssObject = new THREE.CSS3DObject(element);
	//	cssObject.position = planeMesh.position;
	//	cssObject.rotation = planeMesh.rotation;
	//	
	//	//planeMesh.position.x = 10;
	//	var percentBorder = 0.05;
	//    cssObject.scale.x /= (1 + percentBorder) * (elementWidth / planeWidth);
	//    cssObject.scale.y /= (1 + percentBorder) * (elementWidth / planeWidth);
	//	cssScene.add(cssObject);
		
		
		
	    //document.body.appendChild(iframe);
		articleDiv.innerHTML = articleSrc;
	    cssObject = new THREE.CSS3DObject(articleDiv);
	    cssObject.position.z = -320;
	    //cssObject.position.x = -400;
	    //cssObject.position.y = -20;
	//    cssObject.position.x = 20;
	    if (!cssScene.children[0]) {
	    	cssScene.add(cssObject);
	    }
	    console.log("add cssObject");

}

function moveCamera() {
	
	var newZPosition = (1 - numberOfLastArticles/totalArticleCount) * cameraZStartPoint;
	console.log("camera.position.z " + camera.position.z);
	if (newZPosition >= 0) {
		//console.log("Number articles " + numberOfLastArticles);
		new TWEEN.Tween({z: camera.position.z})
		.to({z: newZPosition})
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.onUpdate(function() {
			//console.log("camera.position.z " + camera.position.z);
			camera.position.z = this.z;
		}).start();
	}

}

function fadeOutIn() {
	var time = rand(2000,3000);
	new TWEEN.Tween({v: 1.0, hex: lastBgColor})
	.to({v: 0.0, hex: bgColor}, 1000)
	.easing(TWEEN.Easing.Sinusoidal.InOut)
	.onUpdate( function () {
			cssScene.children[0].element.style.opacity = this.v-0.1;
	    


//	    if (lastmeshForm == meshForm) {
//	    	if (lastnumberOfMeshes > numberOfMeshes) {
//			    var difference = lastnumberOfMeshes - numberOfMeshes;
//			    for (var i = 1; i <= difference; i++) {
//			    	meshArray[meshArray.length-i].material.opacity = this.v;
//			    }
//		    }
//	    } else {
//	    	for (var i = 0; i < meshArray.length; i++) {
//		    	meshArray[i].material.opacity = this.v;
//		    }
//	    }
	    
	    if (lastBgColor != bgColor) {
	    	updateSkyBoxColor(this.hex);
	    	//document.getElementsByTagName('canvas')[0].style.opacity = this.v;
	    }
	    
	    //renderer.setClearColor(composer.getClearColor(), this.v);
//	    scene.traverse (function (object){
//	    	if (object instanceof THREE.Mesh)
//	    	{
//	    		if (object.name === 'skyBox') {
//	    			console.log("found SkyBox");
//	    			console.log(object);
//	    			object.material.opacity = this.v;
//	    		}
//	    			
//	    	}
//	    });
	    
	})
	.onComplete(function () {
		console.log("complete!!!");
		//cssScene.remove(cssScene.children[0]);
		//cleanScene();
		//fillScene();
		fadeIn();
	    })
	    .start();
}

function fadeIn() {
	var time = rand(2000,3000);
    new TWEEN.Tween( {v: 0.0} )
        .to( {v: 1.0}, time)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
        .onStart(function () {
        	fillScene();
        })
        .onUpdate(function() {
            cssScene.children[0].element.style.opacity = this.v-0.1;
//            if (lastmeshForm == meshForm) {
//            	if (lastnumberOfMeshes < numberOfMeshes) {
//	    		    var difference = numberOfMeshes - lastnumberOfMeshes;
//	    		    for (var i = 1; i <= difference; i++) {
//	    		    	meshArray[meshArray.length-i].material.opacity = this.v;
//	    		    }
//    		    }
//    	    } else {
//    	    	for (var i = 0; i < meshArray.length; i++) {
//    		    	meshArray[i].material.opacity = this.v;
//    		    	meshArray[i].geometry
//    		    }
//    	    }
            
            

            //renderer.setClearColor(bgColor, this.v);
//            if (lastBgColor != bgColor) {
//            	updateSkyBoxColor(this.hex);
//            	document.getElementsByTagName('canvas')[0].style.opacity = this.v;
//            }
        })
        .onComplete(function () {
        	console.log("complete!!!");
		}).start();

}



	
/** Update the Color of the SkyBox/Background */
function updateSkyBoxColor(color) {
	skyBox.material.color.setHex(color);
}


function moveObjects() {
	
	for (var i = 0; i < meshArray.length; i++) {
		
		var newXPosition = (1 - numberOfLastArticles/totalArticleCount) + meshArray[i].position.x;
		var	newYPosition = (1 - numberOfLastArticles/totalArticleCount) + meshArray[i].position.y;
		console.log("newYPosition " + newYPosition);
		new TWEEN.Tween({x:meshArray[i].position.x,y:meshArray[i].position.y})
		.to({x:newXPosition,y:newYPosition}, 5000)
		.yoyo(true)
		.repeat(100)
		.onUpdate(function() {
			
				console.log("y " + this.y);
				
				meshArray[i].position.x = this.x;
				meshArray[i].position.y = this.y;
		
		}).start();
	
	}
}


function animate() {
//	console.log("e" + clock.elapsedTime);
//	console.log("l" + lastTime);
//	console.log(clock.getElapsedTime() - lastTime);
	if (cssScene.children[0]) {
		//cssScene.children[0].rotation.y += Math.PI * 2  * 0.001;
	}
	
	//bgObject.rotation.y += Math.PI * 2  * 0.0001;
	if ((clock.getElapsedTime() - lastTime) > waitTime) {
		bgObject.position.x += xMovement * 0.000001;
	} else {
		bgObject.position.x -= xMovement * 0.000001;
	}
	
	requestAnimationFrame(animate);
	TWEEN.update();
	var j = 1;
	for (var i = 0; i < meshArray.length; i++) {
		if (i%2)
			j = -1;
		else
			j = 1;
			
		if ((clock.getElapsedTime() - lastTime) > waitTime) {
			meshArray[i].position.x += xMovement * 0.00001 * j;
			meshArray[i].position.y += yMovement * 0.00001 * j;
			meshArray[i].position.z += 2 * 0.00001 * j;
			
			meshArray[i].rotation.x += Math.PI * 0.000001 * xMovement;
			meshArray[i].rotation.y += Math.PI * 0.000001 * yMovement;
			meshArray[i].rotation.z += Math.PI * 0.000001 * (xMovement+yMovement)/2;
			//meshArray[i].position.z += Math.random() * 0.001 * j;
//			if (meshArray[i].material.opacity < 1.0)
//				meshArray[i].material.opacity += Math.random() * 0.004;
//			if (cssScene.children[0]) {
			//console.log(cssScene.children[0].element);
				//cssScene.children[0].position.x += Math.random() * 2;
				//if (cssScene.children[0].element.style.opacity < 1.0)
					//cssScene.children[0].element.style.opacity += Math.random() * 0.004;
//			}
		} else {
			meshArray[i].position.x -= xMovement * 0.00001 * j;
			meshArray[i].position.y -= yMovement * 0.00001 * j;
			meshArray[i].position.z -= 2 * 0.00001 * j;
			
			meshArray[i].rotation.x -= Math.PI * 0.000001 * xMovement;
			meshArray[i].rotation.y -= Math.PI * 0.000001 * yMovement;
			meshArray[i].rotation.z -= Math.PI * 0.000001 * (xMovement+yMovement)/2;
			//meshArray[i].position.z -= Math.random() * 0.001 * j;
//			if (meshArray[i].material.opacity > 0.0)
//				meshArray[i].material.opacity -= Math.random() * 0.004;
//			if (cssScene.children[0]) {
				//cssScene.children[0].position.x -= Math.random() * 2;
				//if (cssScene.children[0].element.style.opacity > 0.0)
					//cssScene.children[0].element.style.opacity -= Math.random() * 0.004;
//			}
		}
		
		if (clock.getElapsedTime() - lastTime > waitTime*2) {
			waitTime = rand(0,9);
			lastTime = clock.getElapsedTime();
		}
	}
	
	//Mousemove
	camera.position.x += (mouse.x*0.5 - camera.position.x);
    camera.position.y += (mouse.y*0.5 - camera.position.y);
	cssCamera.position.x += (mouse.x*0.15 - cssCamera.position.x);
    cssCamera.position.y += (mouse.y*0.15 - cssCamera.position.y);
    camera.lookAt( scene.position );
    cssCamera.lookAt(cssScene.position);

    bgMaterial.uniforms[ 'time' ].value = .0025 * (clock.getElapsedTime());

	render();
}

/** Helper function computes random values between max, min */
function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}



function render() {
	
	//renderer.render(scene,camera);
	composer.render(scene, camera);
	cssRenderer.render(cssScene, cssCamera);
}

