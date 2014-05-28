
var camera, scene, renderer, controls;
var player;

//the actual article object
var object;

var lastObject;

var MAX_MOVETIME = 12000;

//factor for move x-y-velocity of camera
var moveFactor = 1.15;

//indicates the move of the camera
var cameraMove = true;

var auto = false;

var mouse = { x: 0, y: 0 };

//end-Video
var video, videoObject, videoTexture, videoImageContext, videoScreen;

var reloadButton;

var actualTween;

var Element = function ( article ) {

    if (article) {

        var dom = document.createElement('div');
        dom.className = 'article';

        dom.id = article.articleid;

        dom.innerHTML = article.text;

        var object = new THREE.CSS3DObject(dom);
        object.position.x = article.x * 100;
        object.position.y = article.y * 100;
        object.position.z = article.book  * -200;

 

        return object;
    }


};


function initScene() {


    document.body.style.backgroundColor = "#000000";
    //document.body.className = "bg";

    camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 1, 1000 );
    camera.position.z = 5000;

    scene = new THREE.Scene();

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = 0;
    document.getElementById( 'view' ).appendChild( renderer.domElement );

   
   
    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('mousedown', onMouseDown, false);
    document.body.addEventListener('mouseup', onMouseUp, false);

    document.body.addEventListener('mousewheel', onMouseWheel, false);

    //document.body.addEventListener( 'click', function ( event ) {

    //    auto = true;

    //    if ( player !== undefined ) {

    //        player.parentNode.removeChild( player );
    //        player = undefined;

    //    }

    //    new TWEEN.Tween( camera.position )
    //            .to( { x: 0, y: - 25 }, 1500 )
    //            .easing( TWEEN.Easing.Exponential.Out )
    //            .start();

    //}, false );

    window.addEventListener('resize', onWindowResize, false);

    //controls = new THREE.OrbitControls(camera);
    //controls.addEventListener('change', render);

   






    video = document.createElement('video');
    //video.src = "src/video/default.mp4";
    video.src = "src/video/default.webm";
    video.load();

    videoObject = new THREE.CSS3DObject(video);
    videoObject.position.x = 1000000;
    videoObject.position.y = 1000000;
    videoObject.position.z = 10000;

    //var videoImage = document.createElement('canvas');
    //videoImage.width = 1280;
    //videoImage.height = 720;

    //videoImageContext = videoImage.getContext('2d');
    //// background color if no video present
    //videoImageContext.fillStyle = '#000000';
    //videoImageContext.fillRect(0, 0, videoImage.width, videoImage.height);

    //videoTexture = new THREE.Texture(videoImage);
    //videoTexture.minFilter = THREE.LinearFilter;
    //videoTexture.magFilter = THREE.LinearFilter

    //var videoGeometry = new THREE.PlaneGeometry(10, 5.67, 1, 1);
    //var videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture, overdraw: true, side: THREE.DoubleSide });
    //videoScreen = new THREE.Mesh(videoGeometry, videoMaterial);
    //videoScreen.position.set(0, 0, 250);
    //videoScreen.name = "videoScreen";
    //videoScreen.id = "videoScreen";

    scene.add(videoObject);

    reloadButton = document.getElementById("ReloadButton");
    reloadButton.onclick = function () { return window.location.reload(); };
    reloadButton.style.opacity = "0";


    animate();
}



function fillScene(articles) {
    for (var i = 0; i <= articles.length; i++) {
        
       //setTimeout( function () {
            scene.add(new Element(articles[i]));
            //}
            //, function () { articles[i], i * 15; });

    }
}

function moveToArticle(id, delay, time) {
    for (var i = 0; i < scene.children.length; i++) {
        if (scene.children[i].element.id == id) {

            object = scene.children[i];
            if (!lastObject) {
                lastObject = object;
            }
            var articleSizeRatio = 400;

            var width = object.element.clientWidth;
            var height = object.element.clientHeight;

            if (!width == 0) {
                if (width >= height) {
                    console.log("Width goesser");
                    //articleSizeRatio = 1 - width / height / 90;
                    articleSizeRatio = width-100;
                } else {
                    console.log("height goesser");
                    //articleSizeRatio = 1 - height / width / 250;
                    articleSizeRatio = height-100;
                }
            }

            console.log("articleSIze Ratio " + articleSizeRatio );
           // articleSizeRatio = (1 - articleSizeRatio / 100);

            console.log("new z " + object.position.z * articleSizeRatio);

            console.log("movetime " + getMoveTime(object));

            //new TWEEN.Tween({ z: lastObject.position.z })
            //.to({ z: object.position.z  }, 3000)
            //.onUpdate(function () {
            //    camera.position.z += this.z;
            //    console.log("this.z " + this.z);
            //})
            //.onComplete(function () {
            actualTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
                .to({ x: object.position.x, y: object.position.y, z: object.position.z + 400 }, getMoveTime(object))
                .delay(delay)
                .onUpdate(function () {
                    camera.position.z = this.z;
                    camera.position.x = this.x;
                    camera.position.y = this.y;
                })
                .onComplete(function() {
                    console.log("camera z " + camera.position.z);
                    console.log("object z " + object.position.z);
                    lastObject = object;
                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            //})
            //.easing(TWEEN.Easing.Quadratic.In)
            //.start();

            break;
        }
    }
}
			

function getMoveTime(object) {

    var actualValue = ((camera.position.x + camera.position.y + camera.position.z) / 3);

    var lastValue = (object.position.x + object.position.y + object.position.z) / 3;

    var moveTime;

    if (actualValue > lastValue) {
        moveTime = (actualValue - lastValue) * 5;
        if (moveTime < MAX_MOVETIME)
            return moveTime;
    } else {
        moveTime = (lastValue - actualValue) * 5;
        if (moveTime < MAX_MOVETIME)
            return moveTime;
    }

    return MAX_MOVETIME;
}

function moveToEndVideo() {
    console.log("moveToEndVideo");

    
    if (actualTween) {
        actualTween.stop();
    }

    object = videoObject;

    actualTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
                .to({ x: object.position.x, y: object.position.y, z: object.position.z + 400 }, 1000)
                .onUpdate(function () {
                    camera.position.z = this.z;
                    camera.position.x = this.x;
                    camera.position.y = this.y;
                })
                .onComplete(function () {
                    cameraMove = false;
                    document.body.removeEventListener('mouseup', onMouseUp);
                    document.body.removeEventListener('mousemove', onMouseMove);
                    camera.lookAt(videoObject.position);
                    video.play();
                    video.onended = function (e) { reloadButton.style.opacity = 1; };
                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

    
}


function onMouseWheel(event) {
    if (event.wheelDelta > 0) {
        if (camera.position.z >= (object.position.z)) {
            camera.position.z -= event.wheelDelta;
        }
    } else {
        camera.position.z -= event.wheelDelta;
    }
    console.log("camera z mouse wheel " + camera.position.z);
}

function onMouseMove(event) {

    mouse.x = (event.clientX / window.innerWidth) - 0.5;
    mouse.y = (event.clientY / window.innerHeight) - 0.5;

    if (!cameraMove) {
        object.position.x += mouse.x * moveFactor;
        object.position.y -= mouse.y * moveFactor;
    }
}

function onMouseDown(event) {

    cameraMove = false;
    moveFactor = 5.15;
    object.element.style.cursor = 'pointer';
}

function onMouseUp(event) {

    cameraMove = true;
    moveFactor = 1.15;
    object.element.style.cursor = 'default';
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    requestAnimationFrame( animate );

    TWEEN.update();

    if ( auto === true ) {

        move( 1 );
    }

    if (cameraMove) {
        camera.position.x += mouse.x * moveFactor;
        camera.position.y += mouse.y * moveFactor;
    }

    //controls.update();
    render();
}

function render() {
    //if (video.readyState === video.HAVE_ENOUGH_DATA) {
    //    videoImageContext.drawImage(video, 0, 0);
    //    if (videoTexture) {
    //        videoTexture.needsUpdate = true;
    //    }
    //}
    renderer.render(scene, camera);
}