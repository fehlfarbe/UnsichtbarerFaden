
var lastObject;
var MAX_MOVETIME = 10000;
var MIN_MOVETIME = 1000;

var moveFactor = 5;

//end-Video
var video, videoObject, videoTexture, videoImageContext, videoScreen;

var reloadButton;

var actualTween;

var mouse = { x: 0, y: 0 };

var mouseDown = false;

//indicates the move of the camera
var cameraMove = true;

var camera, renderer;
var controls;

var scene = new THREE.Scene();
//init();

var objects = [];

var objectsInScene = 0;


//WebGL
var webGLRenderer, webGLScene, webGLCamera;
var NUMBER_OF_WEBGL_OBJECTS = 623;

function fillScene(articles) {

    for (var i = 0; i < articles.length; i++) {
        var article = articles[i];
        var element = document.createElement('div');
        element.className = 'article';
        element.id = article.articleid;
        element.innerHTML = article.text;
        

        var object = new THREE.CSS3DObject(element);
        object.position.x = article.x / 100 * 4000 - 2000;
        object.position.y = article.y / 100 * 4000 - 2000;
        object.position.z = article.book / -5 * 5000;
        //object.rotation.x = Math.random() * 4 - 2;
        object.rotation.y = Math.random() * 0.4 - 0.2;
        //object.rotation.z = Math.random() * 4 - 2;

        objects.push(object);
    }
    addRandomObjectsToScene();
}

//check for object in scene, when not in scene remove first object and add new
function addObjectToScene(id) {
    for (var i = 0; i < scene.children.length; i++) {
        if (id == scene.children[i].element.id) {
            return;
        }
    }

    for (var i = 0; i < objects.length; i++) {
        if (objects[i].element.id == id) {
            if (scene.children[0].name != "video") {
                scene.remove(scene.children[0]);
            } else {
                scene.remove(scene.children[1]);
            }
            scene.add(objects[i]);

            return objects[i];
        }
    }

}


function addRandomObjectsToScene() {
    objects = shuffleArray(objects);
    for (var i = 0; i < 25; i++) {
        scene.add(objects[i]);
    }
}

function addRandomWebGLObjects(number) {
    var object, texture;
    for (var i = 1; i <= number; i++) {
        texture = THREE.ImageUtils.loadTexture("src/thumbnails/" + i + ".jpg");
        object = new THREE.Mesh(new THREE.PlaneGeometry(300, 200), new THREE.MeshBasicMaterial({map:texture}));
        object.overdraw = true;
        
        object.rotation.y = Math.random() * 0.4 - 0.2;
        object.position.x = randomInt(-400,400)/100 * 4000 -2000;
        object.position.y = randomInt(200,800)/100 * 4000 -2000;
        object.position.z = randomInt(0, 30)/-5 * 5000;
        webGLScene.add(object);
    }
        

}

function initScene() {
    $("body").css({backgroundColor:"#000"});
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;
    camera.position.y = 8000;

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.zIndex = '1';
    document.getElementById('view').appendChild(renderer.domElement);


    document.body.addEventListener('mousemove', onMouseMove, false);
    document.body.addEventListener('mousedown', onMouseDown, false);
    document.body.addEventListener('mouseup', onMouseUp, false);
    document.body.addEventListener('mousewheel', onMouseWheel, false);

    window.addEventListener('resize', onWindowResize, false);

    video = document.createElement('video');
    //video.src = "src/video/default.mp4";
    video.src = "src/video/default.webm";
    video.load();

    videoObject = new THREE.CSS3DObject(video);
    videoObject.position.x = 1000000;
    videoObject.position.y = 1000000;
    videoObject.position.z = 10000;
    videoObject.name = "video";

    scene.add(videoObject);

    reloadButton = document.getElementById("ReloadButton");
    reloadButton.onclick = function () { return window.location.reload(); };
    reloadButton.style.opacity = "0";

    webGLRenderer = new THREE.WebGLRenderer({antialias:true});
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.domElement.style.position = 'absolute';
    webGLRenderer.domElement.style.zIndex = '0';
    document.getElementById('view').appendChild(webGLRenderer.domElement);

    webGLCamera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 10, 30000);
    webGLCamera.position.z = camera.position.z;
    webGLCamera.position.y = camera.position.y;

    webGLScene = new THREE.Scene();
    addRandomWebGLObjects(NUMBER_OF_WEBGL_OBJECTS);

    animate();
}




function moveToArticle(id, delay, time) {

    addObjectToScene(id);

    //make img undraggable
    $("img").bind('dragstart', function () {
        console.log("make undraggable");
        return false;
    });

    for (var i = 0; i < scene.children.length; i++) {
        if (id == scene.children[i].element.id) {

            var object = scene.children[i];

            if (!lastObject) {
                lastObject = object;
            }
            
            actualTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z, yR: camera.rotation.y })
                .to({ x: object.position.x, y: object.position.y, z: object.position.z + 1200, yR: object.rotation.y }, getMoveTime(object))
                .delay(delay)
                .onUpdate(function () {
                    camera.position.z = this.z;
                    camera.position.x = this.x;
                    camera.position.y = this.y;
                    camera.rotation.y = this.yR;

                    webGLCamera.position.z = this.z;
                    webGLCamera.position.x = this.x;
                    webGLCamera.position.y = this.y;
                    webGLCamera.rotation.y = this.yR;
                })
                .onComplete(function () {
                    lastObject = object;
                    //camera.lookAt(object);
                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();


            break;
        }
    }
}


function getMoveTime(object) {

    var actualValue = ((camera.position.x + camera.position.y)/8 + camera.position.z) / 3;

    var lastValue = ((object.position.x + object.position.y)/8 + object.position.z) / 3;

    var moveTime;

    if (actualValue > lastValue) {
        moveTime = (actualValue - lastValue) * 6;
        if (moveTime < MAX_MOVETIME && moveTime > MIN_MOVETIME)
            return moveTime;
    } else {
        moveTime = (lastValue - actualValue) * 6;
        console.log("moveTime " + moveTime);
        if (moveTime < MAX_MOVETIME && moveTime > MIN_MOVETIME)
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
                .to({ x: object.position.x, y: object.position.y, z: object.position.z + 1600 }, 1000)
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

/**
* Randomize array element order in-place.
* Using Fisher-Yates shuffle algorithm.
*/
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}

function onMouseWheel(event) {
    if (event.wheelDelta > 0) {
        //if (camera.position.z >= (object.position.z)) {
        camera.position.z -= event.wheelDelta;
        //}
    } else {
        camera.position.z -= event.wheelDelta;
    }
}

function onMouseMove(event) {

    mouse.x = (event.clientX / window.innerWidth) - 0.5;
    mouse.y = (event.clientY / window.innerHeight) - 0.5;

    //if (!cameraMove) {
    //    object.position.x += mouse.x * moveFactor;
    //    object.position.y -= mouse.y * moveFactor;
    //}
}

function onMouseDown(event) {



    //cameraMove = false;
    //moveFactor = 5.15;
    //object.element.style.cursor = 'pointer';
    mouseDown = true;
}

function onMouseUp(event) {

    //cameraMove = true;
    //moveFactor = 1.15;
    //object.element.style.cursor = 'default';

    mouseDown = false;
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    render();

}

function animate() {

    requestAnimationFrame(animate);

    TWEEN.update();

    //controls.update();
    render();

    if (mouseDown) {
        camera.position.x += mouse.x * moveFactor;
        camera.position.y -= mouse.y * moveFactor;
    }

    //webGLCamera.rotation.x += Math.PI/180 * 2;
    //webGLCamera.rotation.y += Math.PI * 45;
    //webGLCamera.rotation.z += Math.PI * 45;

}

function render() {

    renderer.render(scene, camera);
    webGLRenderer.render(webGLScene, webGLCamera);
}

function randomInt(min,max)
{
    return Math.floor(Math.random()*(max-(min+1))+(min+1));
}