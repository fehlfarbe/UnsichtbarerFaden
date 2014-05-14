/**
 * The webgl scene
 */
var scene, renderer, camera, composer, group, skyBox, clock, lastTime, width, height, waitTime;

var cssRenderer, cssScene, cssCamera, cssObject;

var articleDiv;

var bgColor, articleSrc;

var particleForm, lastParticleForm, lastBgColor, lastNumberOfParticles;

var numberOfLastArticles, totalArticleCount;

var cameraZStartPoint = 10;

var mouse = {x : 0, y : 0};

var xMovement, yMovement;

var startText;

var hblur, vblur;

var video, videoScreen, videoTexture, videoImageContext;

var dotScreenShader;

var reloadButton;

var controls;

function initScene() {
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
    } 

    THREEx.WindowResize(cssRenderer, cssCamera);  
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
	  

	renderer.setSize(width, height);
	renderer.domElement.style.position = 'absolute';
	//renderer.domElement.style.top = -10;
	renderer.domElement.style.zIndex = 0;
	//renderer.setClearColor(bgColor, 1);
	
	cssRenderer = new THREE.CSS3DRenderer();
	cssRenderer.setSize(width-100, height-100);
    cssRenderer.domElement.style.position = 'absolute';
    //cssRenderer.domElement.style.left = 25 + '%';
    
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(cssRenderer.domElement);

	cssScene = new THREE.Scene();

	var skyBoxGeometry = new THREE.CubeGeometry(1000,1000,1000);
	var skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.BackSide });
	skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
	skyBox.name = "skyBox";
	scene.add(skyBox);

    document.addEventListener('mousemove', function(event){
    mouse.x = (event.clientX / window.innerWidth ) - 0.5
    mouse.y = (event.clientY / window.innerHeight) - 0.5
    }, false)


    clock = new THREE.Clock(true);
    lastTime = clock.getElapsedTime();
    waitTime = rand(0,9);
    
    
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene,camera));
    
    dotScreenShader = new THREE.ShaderPass(THREE.DotScreenShader);
    dotScreenShader.uniforms['scale'].value = 4;
	composer.addPass(dotScreenShader);

    
//    var effect = new THREE.ShaderPass(THREE.RGBShiftShader);
//    effect.uniforms['amount'].value = 0.0015;
    dotScreenShader.renderToScreen = true;
    
	hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
	hblur.uniforms['h'].value = 0.005;
	composer.addPass( hblur );
	hblur.renderToScreen = false;

	vblur = new THREE.ShaderPass( THREE.VerticalBlurShader );
	vblur.uniforms['v'].value = 0.005;
	composer.addPass(vblur);
    vblur.renderToScreen = false;
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
    articleDiv.className = "zoom";
    articleDiv.style.background = '#ffffff';
    articleDiv.style.color =  '#000000';  //'#008B8B';
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
	articleDiv.style.maxWidth = '870px';
	articleDiv.style.maxHeight = '652px';
    articleDiv.style.height = 'auto';
	articleDiv.style.opacity = '0';
	articleDiv.style.overflow = 'auto';
//    
//    articleDiv.style.backgroundImage = "url('src/div_bg.png')";
   // console.log("bg: " + articleDiv.style.backgroundImage);
    // articleDiv.style.border = 'solid';
    // articleDiv.style.borderColor = 'black';
	
	cssObject = new THREE.CSS3DObject(articleDiv);
	cssObject.position.z = -320;
	cssScene.add(cssObject);
	
	video = document.createElement('video');
	//video.type = "video/mp4";
	video.src = "src/video/default.mp4";
	//video.style.zIndex="10";
	//video.autoplay=true;
	
	//video = document.getElementById('myVideo');
	video.load();
	//video.play();
	//document.body.appendChild(video);
	
	var videoImage = document.createElement('canvas');
	videoImage.width = 1280;
	videoImage.height = 720;
	
	videoImageContext = videoImage.getContext( '2d' );
    // background color if no video present
    videoImageContext.fillStyle = '#000000';
    videoImageContext.fillRect( 0, 0, videoImage.width, videoImage.height );
	
	videoTexture = new THREE.Texture(videoImage);
	videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter
	
	var videoGeometry = new THREE.PlaneGeometry(10,5.67, 1, 1);
	var videoMaterial = new THREE.MeshBasicMaterial({map: videoTexture, overdraw: true, side:THREE.DoubleSide});
	videoScreen = new THREE.Mesh(videoGeometry, videoMaterial);
	videoScreen.position.set(0,0, 250);
	videoScreen.name = "videoScreen";
	scene.add(videoScreen);
	
    animate();
    
	
	$("#ReloadButton").click(function() {
		window.location.reload();
	});
	$("#ReloadButton").css("opacity","0");

	//controls = new THREE.OrbitControls(camera);
	//controls.addEventListener('change', render);
}

function updateVideo(path) {
	video.src = path;
	video.load();
}

/** Display new Scene, fade between changes in meshForm and Background */
function startScene() {
    fadeIn(cssObject);
    fillScene();
}

/** Display new Scene, fade between changes in meshForm and Background */
function displayNewScene() {
	fadeOutIn(cssObject);
	fillScene();
}


/** helper function, update the parameters for the new scene */
function updateSceneParameters(article) {

	if (totalArticleCount === undefined) {
		totalArticleCount = article.totalCount;
	}
	
	numberOfLastArticles = article.lastArticles.length;
	articleSrc = article.text;
	switch (article.symbol) {
	case 1:
		bgColor = 0xfafafa;
		break;
	case 2:
		bgColor = 0x000000;
		break;
	case 3:
		bgColor = 0xfafafa;
		break;
	case 4:
	    particleForm = 'end';
		bgColor = 0x000000;
		break;
	case 5:
		bgColor = 0x000000;
		break;
	case 6:
		bgColor = 0x000000;
		break;
	case 7:
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


function updateArticleDiv(text) {
	articleDiv.innerHTML = text;
}

	
/** Helper function, cleaning the scene except videoScreen */
function cleanScene() {
	for (var i = 0; i < scene.children.length; i++) {
		if (scene.children[i].name != "videoScreen") {
			scene.remove(scene.children[i]);
		 }
	}
	cssScene.remove(cssObject);
}
	
/** Helper function fills the scene */
function fillScene() {
	if (particleForm == 'end') {
		cleanScene();
		moveCameraToVideoScreen();
	} else {
		moveCamera();
	}
}

function moveCamera() {
	var newZPosition = (1 - numberOfLastArticles/totalArticleCount) * cameraZStartPoint;
	console.log("camera.position.z " + camera.position.z);
	console.log("newZPosition " + newZPosition);
	if (newZPosition > 0) {
		new TWEEN.Tween({z: camera.position.z})
		.to({z: newZPosition}, 2000)
		.easing(TWEEN.Easing.Sinusoidal.InOut)
		.onUpdate(function() {
			camera.position.z = this.z;
		}).start();
	} else {
		updateVideo("src/video/end.mp4");
		$("#ReloadButton").html("Start");
		camera.position.z = 0;
		particleForm = 'end';
		moveCameraToVideoScreen();
	}
}

function moveCameraToVideoScreen() {
    console.log("moveCameraToVideoScreen");
    var posX = camera.position.x,
    posY = camera.position.y,
    posZ = camera.position.z;
    new TWEEN.Tween({x:posX,y:posY,z:posZ})
		    .to({x: videoScreen.position.x,y: videoScreen.position.y,z: videoScreen.position.z+3}, 1000)
		    .easing(TWEEN.Easing.Sinusoidal.InOut)
		    .onStart(function() {
			    //camera.position.z += 1;
			    //console.log("camera.position.z s" + camera.position.z);
		    })
		    .onUpdate(function() {
			    camera.position.x = this.x;
			    camera.position.y = this.y;
			    camera.position.z = this.z;
		    })
		    .onComplete(function() {
			    cleanScene();
			    camera.lookAt(videoScreen.position);
			    video.play();
			    video.onended = function(e) { reloadButton.style.opacity = 1;};
		    }).start();
}

function changeBgColor() {
	new TWEEN.Tween({hex: lastBgColor})
	.to({hex: bgColor}, 500)
	.easing(TWEEN.Easing.Back.Out)
	.onUpdate( function () {
	    updateSkyBoxColor(this.hex);  
	}).start();
}

function fadeOutIn(object) {
	var time = rand(2000,2500);
	new TWEEN.Tween({v: 1.0})
	.to({v: 0.0}, time)
	.easing(TWEEN.Easing.Sinusoidal.InOut)
	.onUpdate( function () {
			object.element.style.opacity = this.v-0.1;
	       
	})
	.onComplete(function () {
		console.log("complete!!!");
		fadeIn(object);
	    })
	    .start();
}

function fadeIn(object, startScreen) {
	var time = rand(3000,3500);
    new TWEEN.Tween( {v: 0.0} )
        .to( {v: 1.0}, time)
        .easing(TWEEN.Easing.Sinusoidal.InOut)
		.delay(500)
        .onStart(function () {
			updateArticleDiv(articleSrc);
        })
        .onUpdate(function() {
			if (particleForm != 'end')
				object.element.style.opacity = this.v-0.1;
        })
        .onComplete(function () {
        	console.log("complete!!!");
		}).start();
}

/** Update the Color of the SkyBox/Background */
function updateSkyBoxColor(color) {
	skyBox.material.color.setHex(color);
}

function animate() {

	requestAnimationFrame(animate);
	TWEEN.update();
	
	if (particleForm != 'end') {
		
		//Mousemove
		camera.position.x += (mouse.x*0.5 - camera.position.x);
		camera.position.y += (mouse.y*0.5 - camera.position.y);
		cssCamera.position.x += (mouse.x*0.15 - cssCamera.position.x);
		cssCamera.position.y += (mouse.y*0.15 - cssCamera.position.y);
		camera.lookAt( scene.position );
		cssCamera.lookAt(cssScene.position);

	}
	
	render();
}

/** Helper function computes random values between max, min */
function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {
	
	if ( video.readyState === video.HAVE_ENOUGH_DATA )
        {
                videoImageContext.drawImage( video, 0, 0 );
					//console.log("video ready state true");
                if ( videoTexture ) {
                        videoTexture.needsUpdate = true;
				}
        }
	renderer.render(scene,camera);
	//composer.render(scene, camera);
	cssRenderer.render(cssScene, cssCamera);
}