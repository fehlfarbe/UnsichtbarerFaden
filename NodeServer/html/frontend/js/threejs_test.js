/**
 * 
 */
var scene, renderer, camera, composer, group, skyBox, shapeMesh, clock, lastTime, width, height, waitTime;

var cssRenderer, cssScene;

function init() {
	scene = new THREE.Scene(); 
	
	width = window.innerWidth/2;
	height = window.innerHeight/2;

//    var width = 50;
//    var height = 10;
    //camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000 );
    camera = new THREE.PerspectiveCamera(100, width/height, 1, 20000);
    camera.position.z = 5; 
    camera.lookAt(scene.position);
    
    

    renderer = new THREE.WebGLRenderer({antialias:true});
	renderer.setSize(width, height);
	renderer.domElement.style.position = 'absolute';
	renderer.domElement.style.top = -10;
	renderer.domElement.style.zIndex = 0;
	
	cssRenderer = new THREE.CSS3DRenderer();
	cssRenderer.setSize(width, height);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = -10;
    cssRenderer.domElement.style.zIndex = 1;
    cssRenderer.domElement.style.margin = 0;
    cssRenderer.domElement.style.padding = 0;
    
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(cssRenderer.domElement);

	cssScene = new THREE.Scene();

	THREEx.WindowResize(renderer, camera);
//	THREEx.WindowResize(cssRenderer, camera);
	
	var skyBoxGeometry = new THREE.CubeGeometry(1000,1000,1000);
	var skyBoxMaterial = new THREE.MeshBasicMaterial({color:0x000000, side:THREE.BackSide });
	skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
	skyBox.name = "skyBox";
	scene.add(skyBox);

	//scene.fog = new THREE.FogExp2( 0x9999ff, 0.00025 );
	

	shapeMesh = new Array();


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
    
    
    //var light = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1.00 );
    //light.position.set( 0.75, 1, 0.25 );
    //scene.add( light );
    
    var pointLight = new THREE.PointLight( 0xffffff, 1, 20 ); 
    pointLight.position.set( 0, 0, 5 ); 
    pointLight.name = "pointLight";
    scene.add( pointLight );
    
    //scene.add(cubes('tedra'));
    
    
    triangle();

}


function triangle() {
	// Triangle

var shape = new THREE.Shape();
shape.moveTo( 0, 0 );
shape.lineTo( 2, 0 );
shape.lineTo( 1, 1.5 );
shape.lineTo( 0, 0 ); // close path

var geometry = new THREE.ShapeGeometry(shape);

var material = new THREE.MeshLambertMaterial({
		color: 0xffffff
	});

//shapeMesh.push(new THREE.Mesh(geometry, material));
//shapeMesh.name = 'triangle';
//shapeMesh[0].name = 'triangle';
//scene.add(shapeMesh[0]);

updateShapes('triangle', 8);
animate();
}

	
function makeTextSprite( message, parameters )
{
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
	
	

/** Update the Form and Number of the shapes */
function updateShapes(shapeForm, number, bgColor) {
		
	//remove old shapes from scene
	for (var i = scene.children.length -1; i >= 0; i--) {
		if (scene.children[i].name == shapeMesh.name) {
			scene.remove(scene.children[i]);
		}
	}

	//reset Array
	this.shapeMesh = new Array();
	
	
	if (shapeForm == 'end') {
			var spritey = makeTextSprite( "The End",
            { fontsize: 24, borderColor: {r:255, g:0, b:0, a:1.0}, backgroundColor: {r:255, g:100, b:100, a:0.8} } );
			spritey.position.set(-10,5,0);
			scene.add( spritey );
			updateSkyBoxColor('0x000000');
			animate;
			return;
	} else {

		for (var i = 0; i < number; i++) {
			var shape = new THREE.Shape();
			
			switch(shapeForm) {
			case 'cube':
				shape.moveTo(-1,-1);
				shape.lineTo(1,-1);
				shape.lineTo(1,1);
				shape.lineTo(-1,1);
				shape.lineTo(-1,-1);
				break;
			case 'triangle':
				shape.moveTo(-1,-1);
				shape.lineTo(1,-1);
				shape.lineTo(0,0.5);
				shape.lineTo(-1,-1);
				break;
			case 'point':
				shape.absarc( 0, 0, 1, 0, Math.PI*2, false );
				break;
			}
		
			var geometry = new THREE.ShapeGeometry(shape);
			
			var material = new THREE.MeshLambertMaterial({
					color: 0xffffff
				});
			this.shapeMesh.push(new THREE.Mesh(geometry, material));
			this.shapeMesh.name = shapeForm;
			this.shapeMesh[i].name = shapeForm;
			this.shapeMesh[i].material.depthWrite = true;
			this.shapeMesh[i].material.transparent = true;
	//		this.shapeMesh[i].material.opacity = 0.5;
			//for (var i = 0; i < shapeMesh.length; i++) {
			
			if (i%2)
				j = -1;
			else
				j = 1;
	
				
			this.shapeMesh[i].position.set(rand(width/100 * -1,width/100), rand(height/100 * -1,height/100), rand(0,2));
			//shapeMesh[i].position.z += i*1*j;
			
			scene.add(this.shapeMesh[i]);
			//}
		}
		//console.log(scene);
		//console.log(camera);
			updateSkyBoxColor(bgColor);
		animate();
	}
}

	
function displayArticle(src) {
	
//	if (cssScene.children[1]) {
//		console.log("animchil1 ");
//		console.log(cssScene.children[1]);
//		animateArticleChange(cssScene.children[1]);
////		cssScene.remove(cssScene.children[0]);
//	}
		

	//remove old shapes from scene
	//for (var i = cssScene.children.length -1; i >= 0; i--) {
		//animateArticleChange(cssScene.children[i]);
	if (cssScene.children[0]) {
		console.log(cssScene.children[0].position.z);
		new TWEEN.Tween( { z: cssScene.children[0].position.z, v: 1.0} )
        .to( { z: -1000, v: 0.0}, 4000 )
        //.easing( TWEEN.Easing.Elastic.Out )
        .onUpdate( function () {
            //cssScene.children[0].position.x += this.x ;
            //cssScene.children[0].position.z = this.z ;
            cssScene.children[0].element.style.opacity = this.v;
        } )
        .onComplete(function () {
        	console.log("complete!!!");
        	cssScene.remove(cssScene.children[0]);
        	drawNewArticle(src);
		    })
		    .start();
	} else {
		drawNewArticle(src);
	}
	
    /* position and scale the object */

    
//    cssObject.position.y = 15;
    

//    var scale = 1 / ( window.innerWidth / 6 );
//
//    cssObject.scale.x = scale;
//    cssObject.scale.y = scale;
//    cssObject.scale.z = scale;




	
//	cssRenderer.setSize(width,height);
//	cssRenderer.domElement.style.position = 'absolute';
//	cssRenderer.domElement.style.top = 0;
//	cssRenderer.domElement.style.margin = 0;
//	cssRenderer.domElement.style.padding = 0;
	
	
//	
//	renderer.domElement.style.position = 'absolute';
//    renderer.domElement.style.top = 0;
//	renderer.domElement.style.zIndex = 1;	
	//cssRenderer.domElement.appendChild(renderer.domElement);
}
	
function drawNewArticle(src) {
	var div = document.createElement('div');
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
		
		
	div.innerHTML = src;
    div.style.background = '#fff';
    var ratio = 10 / 16.2;
    var width = window.innerWidth;
    var height = width * ratio;
    //iframe.style.width = '500px';
    //iframe.style.height = '100px';
    //iframe.style.opacity = '0.5';
    div.style.border = 'solid';
    //document.body.appendChild(iframe);
    
    var cssObject = new THREE.CSS3DObject(div);
    cssObject.position.z = -120;
    //cssObject.position.x = -400;
    //cssObject.position.y = -20;
//    cssObject.position.x = 20;
    cssScene.add(cssObject);
    
    
    new TWEEN.Tween( {v: 0.0, x: cssScene.children[0].position.x, y: cssScene.children[0].position.y } )
        .to( {v: 1.0, x: 0, y: 0 }, 4000 )
        //.easing( TWEEN.Easing.Elastic.In )
        .onUpdate( function () {
            //cssScene.children[0].position.x = this.x ;
            cssScene.children[0].element.style.opacity = this.v;
            //cssScene.children[0].position.y = this.y ;
        } )
        .onComplete(function () {
        	console.log("complete!!!");
		}).start();
}

	
/** Update the Color of the SkyBox/Background */
function updateSkyBoxColor(color) {
	skyBox.material.color.setHex(color);
}




function generateCity() {
	var geometry = new THREE.CubeGeometry(1,1,1);
	//pivot to bottom
	geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0.5,0));
	//remove bottom face
	geometry.faces.splice(3,1);
	geometry.faceVertexUvs[0].splice( 3, 1 );
	// change UVs for the top face
	// - it is the roof so it wont use the same texture as the side of the building
	// - set the UVs to the single coordinate 0,0. so the roof will be the same color
	//   as a floor row.
//	geometry.faceVertexUvs[0][2][0].set( 0, 0 );
//	geometry.faceVertexUvs[0][2][1].set( 0, 0 );
//	geometry.faceVertexUvs[0][2][2].set( 0, 0 );
	//geometry.faceVertexUvs[0][2][3].set( 0, 0 );

	
	var buildingMesh = new THREE.Mesh(geometry);
	
	var light = new THREE.Color(0xffffff)
	var shadow = new THREE.Color(0x303050)
	
	var cityGeometry = new THREE.Geometry();

	for (var i = 0; i < 2000; i ++) {
	
		//compute random position
		buildingMesh.position.x = Math.floor(Math.random() * 200 - 100) * 10;
		buildingMesh.position.z = Math.floor(Math.random() * 200 - 100) * 10;
		
		//compute random rotation
		buildingMesh.rotation.y = Math.random() * Math.PI * 2;
		
		//compute random scale, Math.random multiply to get closer to zero
		buildingMesh.scale.x = Math.random() * Math.random() * Math.random() * Math.random() * 50 + 10;
		buildingMesh.scale.y = (Math.random() * Math.random() * Math.random() * buildingMesh.scale.x) * 8 + 8;	
		buildingMesh.scale.z = buildingMesh.scale.x;

		var value = 1 - Math.random() * Math.random();
		var baseColor = new THREE.Color().setRGB(value + Math.random() * 0.1, value, value + Math.random() * 0.1);

		
		var geometry = buildingMesh.geometry;
		for (var j = 0, jl = geometry.faces.length; j < jl; j++) {
			geometry.faces[j].vertexColors = [baseColor, baseColor, baseColor, baseColor];
		}
		
		
		//merge single Buildings for performance
		THREE.GeometryUtils.merge(cityGeometry, buildingMesh);
	}
	
	
	
	var texture = new THREE.Texture(generateTextureCanvas());
	texture.anisotropy = renderer.getMaxAnisotropy();
	texture.needsUpdate = true;
	
	var material = new THREE.MeshLambertMaterial({
		color: 0xffffff
	});
	
	var mesh = new THREE.Mesh(cityGeometry, material);
	
	scene.add(mesh);
	render();
//	renderer.render(scene,camera);
	
	//return mesh;
	
	function generateTextureCanvas() {

		var canvas = document.createElement('canvas');
		canvas.width = 32;
		canvas.height = 64;
		var context = canvas.getContext('2d');
		context.fillStyle = '#ffffff';
		context.fillRect(0,0,32,64);
		for (var y = 2; y < 64; y += 2) {
			for (var x = 0; x < 32; x += 2) {
				var value = Math.floor(Math.random() * 64);
				context.fillStyle = 'rgb(' + [value,value,value].join(',') + ')';
				context.fillRect(x,y,2,1);
			}
		}
		
		var canvas2 = document.createElement('canvas');
		canvas2.width = 512;
		canvas2.height = 1024;
		var context = canvas2.getContext('2d');
		context.imageSmoothingEnabled = false;
		context.webkitImageSmoothingEnabled = false;
		context.mozImageSmoothingEnabled = false;
		
		context.drawImage(canvas, 0, 0, canvas2.width, canvas2.height);
		
		return canvas2;
	}
}



function cubes(geoType) {
		
	//var geometry = new THREE.CubeGeometry(1,1,1); 
	
	var l = scene.children.length;
	var theta = 0, radius = 5;
	while(l--) {
		
			scene.remove(scene.children[l]);	
			//alert(l);
	}
	
	
	var model = function(geometry,mesh) {
		this.geometry = geometry;
		var material = new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff });
		this.mesh = new THREE.Mesh(this.geometry, material);
		scene.add(this.mesh);
	};

	
	var cubes = [];
	var j = 0;
	for (var i = 0; i < 10; i++) {
		if (geoType == 'cubes') {
			cubes.push(new model(new THREE.CubeGeometry(1,1,1)));
		} else if (geoType == 'tedra') {
			cubes.push(new model(new THREE.TetrahedronGeometry(1, 0)));
		} else {
			cubes.push(new model(new THREE.SphereGeometry(1,10,10)));
		}
			
		var cube = cubes[i];
		
		if (j > 0) {
			j = i*-1;
		} else {
			j = i;
		}
		cube.mesh.position.x = j * 1.5;
//		cube.mesh.position.y = Math.random() * 1.5;
		
	}
	
	
	var light = new THREE.PointLight(0xffffff, 1, 100);
	light.position.x = 2;
	light.position.y = 2;
	light.position.z = 2;
	
	scene.add(light);
	
	
	
//	var sphere = new THREE.CircleGeometry(2,32,0,2*3.5);
//	var mat = new THREE.MeshBasicMaterial({color: 0x2204A0});
//	var me = new THREE.Mesh(sphere, mat);
//	scene.add(me);
	
	var animate = function () { 
		
//		requestAnimationFrame(animate); 
//		for (var i = 0; i < 10; i++) {
//			cubes[i].mesh.rotation.x += Math.random() * 0.01; 
//			cubes[i].mesh.rotation.y += Math.random() * 0.01;
//			cubes[i].mesh.rotation.z += Math.random() * 0.01; 
//		}
//		
//		theta += 0.1;
//
//		camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
//		camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
//		camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
//		camera.lookAt( cubes[0].mesh.position );

		//composer.render(scene, camera);
		
		render();
		
	}; 
	
	
	
	animate();
	
	
}


function animateArticleChange(article) {
	console.log("article");
	console.log(article);
	requestAnimationFrame(animateArticleChange);
	if (article) {
		article.position.x += 4;
	}
}



function animate() {
//	console.log("e" + clock.elapsedTime);
//	console.log("l" + lastTime);
//	console.log(clock.getElapsedTime() - lastTime);
	requestAnimationFrame(animate);
	TWEEN.update();
	var j = 1;
	for (var i = 0; i < shapeMesh.length; i++) {
		if (i%2)
			j = -1;
		else
			j = 1;
			
		if ((clock.getElapsedTime() - lastTime) > waitTime) {
			shapeMesh[i].position.x += Math.random() * 0.001 * j;
			shapeMesh[i].position.y += Math.random() * 0.001 * j;
			shapeMesh[i].position.z += Math.random() * 0.001 * j;
			if (shapeMesh[i].material.opacity < 1.0)
				shapeMesh[i].material.opacity += Math.random() * 0.004;
			if (cssScene.children[0]) {
			//console.log(cssScene.children[0].element);
				//cssScene.children[0].position.x += Math.random() * 2;
				//if (cssScene.children[0].element.style.opacity < 1.0)
					//cssScene.children[0].element.style.opacity += Math.random() * 0.004;
			}
		} else {
			shapeMesh[i].position.x -= Math.random() * 0.001 * j;
			shapeMesh[i].position.y -= Math.random() * 0.001 * j;
			shapeMesh[i].position.z -= Math.random() * 0.001 * j;
			if (shapeMesh[i].material.opacity > 0.0)
				shapeMesh[i].material.opacity -= Math.random() * 0.004;
			if (cssScene.children[0]) {
				//cssScene.children[0].position.x -= Math.random() * 2;
				//if (cssScene.children[0].element.style.opacity > 0.0)
					//cssScene.children[0].element.style.opacity -= Math.random() * 0.004;
			}
		}
		
		if (clock.getElapsedTime() - lastTime > waitTime*2) {
			waitTime = rand(0,9);
			lastTime = clock.getElapsedTime();
		}
	}
	render();
}

/** Helper function computes random values between max, min */
function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}



function render() {
	
	renderer.render(scene,camera);
	//composer.render(scene, camera);
	cssRenderer.render(cssScene, camera);
}

