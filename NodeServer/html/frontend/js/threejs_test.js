/**
 * 
 */
var scene, renderer, camera, composer;
function init() {
	scene = new THREE.Scene(); 
	renderer = new THREE.WebGLRenderer(); 
    renderer.setSize(1500, 300);
    camera = new THREE.PerspectiveCamera(75, 1500/300, 0.1, 1000);
    camera.position.y = 80; 
    
//	renderer.setSize(window.innerWidth , window.innerHeight);
//    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 3000 );
//    camera.position.y = 80;
    
    document.body.appendChild(renderer.domElement);
    
    composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene,camera));
    
    var effect = new THREE.ShaderPass(THREE.DotScreenShader);
    effect.uniforms['scale'].value = 4;
    composer.addPass(effect);
    
    var effect = new THREE.ShaderPass(THREE.RGBShiftShader);
    effect.uniforms['amount'].value = 0.0015;
    effect.renderToScreen = true;
    composer.addPass(effect);
    
    
    var light = new THREE.HemisphereLight( 0xfffff0, 0x101020, 1.25 );
    light.position.set( 0.75, 1, 0.25 );
    scene.add( light );
    
    var material        = new THREE.MeshBasicMaterial({ color: 0x1f1012 });
    var geometry        = new THREE.PlaneGeometry( 2000, 2000 );
    var plane        = new THREE.Mesh( geometry, material );
    plane.rotation.x= - 90 * Math.PI / 180;
    scene.add( plane );
    scene.add(generateCity());

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
		} else {
			cubes.push(new model(new THREE.SphereGeometry(1,10,10)));
		}
			
		var cube = cubes[i];
		
		if (j > 0) {
			j = i*-1;
		} else {
			j = i;
		}
		cube.mesh.position.x = j*1.5;
		cube.mesh.position.y = Math.random() * 1.5;
		
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
		
		requestAnimationFrame(animate); 
		for (var i = 0; i < 10; i++) {
			cubes[i].mesh.rotation.x += Math.random() * 0.01; 
			cubes[i].mesh.rotation.y += Math.random() * 0.01;
			cubes[i].mesh.rotation.z += Math.random() * 0.01; 
		}
		
		theta += 0.1;

		camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
		camera.position.y = radius * Math.sin( THREE.Math.degToRad( theta ) );
		camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta ) );
		camera.lookAt( scene.position );
		//camera.lookAt(THREE.Vector3(1, 1, 1));
//		cube.rotation.x += 0.1; 
//		cube.rotation.y += 0.1;
		//plane.rotation.x += 0.1;
		//plane.rotation.y += 0.1;
		//plane.rotation.z += 0.1;
		composer.render(scene, camera);
		
		
	}; 
	
	
	
	animate();
	
	
}


function render() {
	
	//renderer.render(scene,camera);
	composer.render(scene, camera);
}

