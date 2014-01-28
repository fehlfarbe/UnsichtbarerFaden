/**
 * The webgl scene
 */
var scene, renderer, camera, composer, group, skyBox, meshArray, clock, lastTime, width, height, waitTime;

var cssRenderer, cssScene, cssCamera, cssObject;

var articleDiv;

var particleForm, numberOfParticles, bgColor, articleSrc;

var lastParticleForm, lastBgColor, lastNumberOfParticles;

var numberOfLastArticles, totalArticleCount;

var cameraZStartPoint = 10;

var mouse = {x : 0, y : 0};

var xMovement, yMovement;

var bgObject, bgMaterial;

var particleSystem, particleCount, particles;

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


function initParticles() {
	console.log("initParticles");
	particleCount = 1024,
	particles = new THREE.Geometry();
	var pMaterial = new THREE.ParticleBasicMaterial({
		size:0.5,
		map: THREE.ImageUtils.loadTexture("src/particles/white_circle.png"),
		// blending: THREE.AdditiveBlending,
		transparent: true
	});
	
    for (var i = 0; i < particleCount; i++) {
    	var px = 5000,
    		py = 5000,
    		pz = 5000,
    		particle = new THREE.Vector3(px,py,pz);
			particle.velocity = new THREE.Vector3(0,-Math.random(), 0);
    
    		particles.vertices.push(particle);
    }
    
    particleSystem = new THREE.ParticleSystem(particles, pMaterial);
    particleSystem.sortParticles = true; 
    particleSystem.position.set(0,0,-cameraZStartPoint);
	
	console.log(particles.vertices.length);
	console.log(numberOfParticles);
	
	addParticlesToView();
    scene.add(particleSystem);
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
	if (!particleSystem) {
		initParticles();
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
	
	lastNumberOfParticles = numberOfParticles
	lastParticleForm = particleForm;
	lastBgColor = bgColor;
	
	numberOfLastArticles = article.lastArticles.length;
	articleSrc = article.text;
	numberOfParticles = Math.pow(2, article.book);
	switch (article.symbol) {
	case 1:
		particleForm = 'triangle';
		bgColor = 0xfafafa;
		break;
	case 2:
		particleForm = 'square';
		bgColor = 0x000000;
		break;
	case 3:
		particleForm = 'square';
		bgColor = 0xfafafa;
		break;
	case 4:
		particleForm = 'end';
		bgColor = 0x000000;
		break;
	case 5:
		particleForm = 'triangle';
		bgColor = 0x000000;
		break;
	case 6:
		particleForm = 'circle';
		bgColor = 0x000000;
		break;
	case 7:
		particleForm = 'circle';
		bgColor = 0xfafafa;
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


function updateParticleColor(particle) {
	if (bgColor == 0x000000) {
		particle.material.color.setHex(0xA4A4A4);
	} else if (bgColor == 0xfafafa) {
		particle.material.color.setHex(0x151515);
	}
}


function updateParticles() {
	
	var stringPath = "src/particles/";

	if (lastBgColor != bgColor || lastParticleForm != particleForm) {
		if (bgColor == 0x000000) {
			stringPath += "white";
		} else if (bgColor == 0xfafafa) {
			stringPath += "black";
		}
		
		switch(particleForm) {
		case 'square':
			stringPath += "_square";
			break;
		case 'triangle':
			stringPath += "_triangle";
			break;
		case 'circle':
			stringPath += "_circle";
			break;
		}
	particleSystem.material.map = THREE.ImageUtils.loadTexture(stringPath + ".png");
	}
	//TODO anzahl
	
	if (lastNumberOfParticles != numberOfParticles) {
		removeAllParticlesFromView();
		addParticlesToView();
	
	}
}

function removeAllParticlesFromView() {
	for (var i = 0; i < numberOfParticles; i++) {
		particles.vertices[i].x = 5000;
		particles.vertices[i].y = 5000;
		particles.vertices[i].z = 5000;
	}
	particleSystem.geometry.__dirtyVertices = true;
}	
	
function addParticlesToView() {
	for (var i = 0; i < numberOfParticles; i++) {
		particles.vertices[i].x = Math.random() * 32 - 16;
		particles.vertices[i].y = Math.random() * 16 - 8;
		particles.vertices[i].z = Math.random() * 20 - 10;
	}
	particleSystem.geometry.__dirtyVertices = true;
}	
	
function updateNumberOfParticles() {
	if (lastnumberOfParticles > numberOfParticles) {
		var particlesToRemove = lastnumberOfParticles - numberOfParticles;
		for (var i = 0; i < particlesToRemove; i++) {
		    meshArray.pop();
//		    scene.children.pop();
//		    console.log("pop");
		}
	} else if (lastnumberOfParticles < numberOfParticles) {
		var particlesToAdd = numberOfParticles - lastnumberOfParticles;
		for (var i = 0; i < particlesToAdd; i++) {
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

	
/** Helper function fills the scene */
function fillScene() {
	
	if (particleForm == 'end') {
		var k = 1 - numberOfLastArticles/totalArticleCount;
		var spritey = makeTextSprite( "The End",
        { fontsize: 24*k, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
		spritey.position.set(-10*k,5*k,0);
		
		for (var i = 0; i < scene.children.length; i++) {
			console.log("remove " + scene.children[i].name);
			scene.remove(scene.children[i]);
		}
		//cssScene.remove(cssObject);
		
		scene.add( spritey );
		
		console.log(scene);
		
		//animate;
		//return;
	} else {

		//cleanScene();
		updateParticles();
		for (var i = 0; i < meshArray.length; i++) {
			scene.add(meshArray[i]);
		}
		
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
			if (particleForm != 'end')
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

	requestAnimationFrame(animate);
	TWEEN.update();
	
	if (particleForm != 'end') {
		if (cssScene.children[0]) {
			//cssScene.children[0].rotation.y += Math.PI * 2  * 0.001;
		}
		
		//bgObject.rotation.y += Math.PI * 2  * 0.0001;
		// if ((clock.getElapsedTime() - lastTime) > waitTime) {
			// bgObject.position.x += xMovement * 0.000001;
		// } else {
			// bgObject.position.x -= xMovement * 0.000001;
		// }
		
		var j = 1;
		// for (var i = 0; i < particles.vertices.length; i++) {
			// if (i%2)
				// j = -1;
			// else
				// j = 1;
				
			
		// }
		
		// if ((clock.getElapsedTime() - lastTime) > waitTime) {

				// j = -j
			// }
			
			// if (clock.getElapsedTime() - lastTime > waitTime*2) {
				// waitTime = rand(0,9);
				// lastTime = clock.getElapsedTime();
			// }
		
		
		//Mousemove
		camera.position.x += (mouse.x*0.5 - camera.position.x);
		camera.position.y += (mouse.y*0.5 - camera.position.y);
		cssCamera.position.x += (mouse.x*0.15 - cssCamera.position.x);
		cssCamera.position.y += (mouse.y*0.15 - cssCamera.position.y);
		camera.lookAt( scene.position );
		cssCamera.lookAt(cssScene.position);

		bgMaterial.uniforms[ 'time' ].value = .0025 * (clock.getElapsedTime());
		
		
		particleSystem.rotation.x += Math.PI * xMovement * 0.00000008;
		particleSystem.rotation.y += Math.PI * yMovement * 0.00000008;
		particleSystem.rotation.z += Math.PI * (xMovement+yMovement)/2 * 0.00000008;
		
		// var pCount = particleCount;
		// while (pCount--) {
			// var particle = particles.vertices[pCount];
			
			// if (particle.y < -200) {
				// particle.y = 200;
				// particle.velocity.y = 0;
			// }
			// particle.velocity.y -= Math.random() * 0.1;
			// particle.add(particle.velocity);
		// }
		// particleSystem.geometry.__dirtyVertices = true;
	}
	
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

