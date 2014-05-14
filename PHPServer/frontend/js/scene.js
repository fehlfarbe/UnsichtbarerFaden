
var lastObject;
var MAX_MOVETIME = 10000;
var MIN_MOVETIME = 5000;

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
            console.log("name: " + scene.children[0].name);
            if (scene.children[0].name != "video") {
                scene.remove(scene.children[0]);
                console.log("remove 0");
            } else {
                scene.remove(scene.children[1]);
                console.log("remove 1");
            }
            scene.add(objects[i]);
            console.log("added " + objects[id]);
            console.log(objects[id]);

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


function initScene() {
    

    $("body").css({backgroundColor:"#000"});
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 1000;

    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
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

    animate();
}




function moveToArticle(id, delay, time) {

    //make img undraggable
    $("img").bind('dragstart', function(){
        return false; 
    });

    addObjectToScene(id);
    for (var i = 0; i < scene.children.length; i++) {
        if (id == scene.children[i].element.id) {

            var object = scene.children[i];

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
                    articleSizeRatio = width - 100;
                } else {
                    console.log("height goesser");
                    //articleSizeRatio = 1 - height / width / 250;
                    articleSizeRatio = height - 100;
                }
            }

            console.log("articleSIze Ratio " + articleSizeRatio);
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
            actualTween = new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z, yR: camera.rotation.y })
                .to({ x: object.position.x, y: object.position.y, z: object.position.z + 1200, yR: object.rotation.y }, getMoveTime(object))
                .delay(delay)
                .onUpdate(function () {
                    camera.position.z = this.z;
                    camera.position.x = this.x;
                    camera.position.y = this.y;
                    camera.rotation.y = this.yR;
                })
                .onComplete(function () {
                    console.log("camera z " + camera.position.z);
                    console.log("object z " + object.position.z);
                    lastObject = object;
                    //camera.lookAt(object);
                })
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            //new TWEEN.Tween({ x: camera.rotation.x, y: camera.rotation.y, z: camera.rotation.z })
            //.to({ x: object.rotation.x, y: object.rotation.y, z: object.rotation.z + 400 }, getMoveTime(object))
            //.delay(delay)
            //.onUpdate(function () {
            //    camera.rotation.z = this.z;
            //    camera.rotation.x = this.x;
            //    camera.rotation.y = this.y;
            //})
            //.onComplete(function() {
            //    console.log("camera z " + camera.rotation.z);
            //    console.log("object z " + object.rotation.z);
            //    lastObject = object;
            //})
            //.easing(TWEEN.Easing.Quadratic.Out)
            //.start();


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
        moveTime = (actualValue - lastValue) * 8;
        console.log("moveTime " + moveTime);
        if (moveTime < MAX_MOVETIME && moveTime > MIN_MOVETIME)
            return moveTime;
    } else {
        moveTime = (lastValue - actualValue) * 8;
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

}

function render() {

    renderer.render(scene, camera);

}

