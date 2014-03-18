
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

var Element = function ( article ) {

    if (article) {

        var dom = document.createElement('div');
        dom.className = 'article';
        //dom.style.top = "100px";
        //dom.style.color = "white";

        dom.id = article.articleid;

        dom.innerHTML = article.text;

        //var image = document.createElement( 'img' );
        //image.style.position = 'absolute';
        //image.style.width = '480px';
        //image.style.height = '360px';
        //image.src = entry.media$group.media$thumbnail[ 2 ].url;
        //dom.appendChild( image );

        //var button = document.createElement( 'img' );
        //button.style.position = 'absolute';
        //button.style.left = ( ( 480 - 86 ) / 2 ) + 'px';
        //button.style.top = ( ( 360 - 61 ) / 2 ) + 'px';
        //button.style.visibility = 'hidden';
        //button.style.WebkitFilter = 'grayscale()';
        //button.src = 'data:image/png;base64,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';
        //dom.appendChild( button );

        //var blocker = document.createElement( 'div' );
        //blocker.style.position = 'absolute';
        //blocker.style.width = '480px';
        //blocker.style.height = '360px';
        //blocker.style.background = 'rgba(0,0,0,0.5)';
        //blocker.style.cursor = 'pointer';
        //dom.appendChild( blocker );

        var object = new THREE.CSS3DObject(dom);
        object.position.x = article.x * 50;
        // object.position.y = Math.random() * 2000 - 1000;
        object.position.y = article.y * 50;
        object.position.z = article.book  * -1000;

        //

        //image.addEventListener( 'load', function ( event ) {

        //    button.style.visibility = 'visible';

        //    new TWEEN.Tween( object.position )
        //        .to( { y: Math.random() * 2000 - 1000 }, 2000 )
        //        .easing( TWEEN.Easing.Exponential.Out )
        //        .start();

        //}, false );

        //dom.addEventListener( 'mouseover', function () {

        //    button.style.WebkitFilter = '';
        //    blocker.style.background = 'rgba(0,0,0,0)';

        //}, false );

        //dom.addEventListener( 'mouseout', function () {

        //    button.style.WebkitFilter = 'grayscale()';
        //    blocker.style.background = 'rgba(0,0,0,0.75)';

        //}, false );

        //dom.addEventListener('click', function (event) {

        //    event.stopPropagation();

        //    //auto = false;

        //    //if ( player !== undefined ) {

        //    //    player.parentNode.removeChild( player );
        //    //    player = undefined;

        //    //}

        //    //player = document.createElement( 'iframe' );
        //    //player.style.position = 'absolute';
        //    //player.style.width = '480px';
        //    //player.style.height = '360px';
        //    //player.style.border = '0px';
        //    //player.src = 'http://www.youtube.com/embed/' + entry.id.$t.split( ':' ).pop() + '?rel=0&autoplay=1&controls=1&showinfo=0';
        //    //this.appendChild( player );

        //    //

        //    var prev = object.position.z + 400;

        //    new TWEEN.Tween(camera.position)
        //        .to({ x: object.position.x, y: object.position.y, z: object.position.z + 250 }, 1500)
        //        .onUpdate(function () {
        //            camera.position.z = this.z;
        //            camera.position.x = this.x;
        //            camera.position.y = this.y;

        //            console.log("camera z " + camera.position.z);
        //            console.log("object z " + object.position.z);
        //        })
        //        .easing(TWEEN.Easing.Exponential.Out)
        //        .start();

        //    //new TWEEN.Tween( { value: prev } )
        //    //    .to( { value: 0  }, 2000 )
        //    //    .onUpdate( function () {

        //    //        move( this.value - prev );
        //    //        prev = this.value;

        //    //    } )
        //    //    .easing( TWEEN.Easing.Exponential.Out )
        //    //    .start();

        //}, false);

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

    animate();
}

function search( query ) {

    //window.location.hash = query;

    for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

        ( function () {

            var object = scene.children[ i ];
            var delay = i * 15;

            new TWEEN.Tween( object.position )
                .to( { y: - 2000 }, 1000 )
                .delay( delay )
                .easing( TWEEN.Easing.Exponential.In )
                .onComplete( function () {

                    scene.remove( object );

                } )
                .start();

        } )();

    }

    var request = new XMLHttpRequest();
    request.addEventListener('load', onData, false);
    console.log(window.location);
    request.open('GET', window.location.protocol + "//" + window.location.host + '/agent.php' + '?symbol=' + 2 + '&lastArticles=[' + ']', true);
    request.send( null );
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
            var articleSizeRatio;

            var width = object.element.clientWidth;
            var height = object.element.clientHeight;

            if (width >= height) {
                console.log("Width goesser");
                //articleSizeRatio = 1 - width / height / 90;
                articleSizeRatio = width-100;
            } else {
                console.log("height goesser");
                //articleSizeRatio = 1 - height / width / 250;
                articleSizeRatio = height-100;
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
                new TWEEN.Tween({ x: camera.position.x, y: camera.position.y, z: camera.position.z })
                .to({ x: object.position.x, y: object.position.y, z: object.position.z + articleSizeRatio }, getMoveTime(object))
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


function onData( event ) {

    console.log(event);

    var data = JSON.parse(event.target.responseText);
    scene.add(new Element(data.text));
    //var entries = data.feed.entry;

    //console.log( data );

    //for ( var i = 0; i < entries.length; i ++ ) {

    //    ( function ( data, time ) {

    //        setTimeout( function () {

    //            scene.add( new Element( data ) );

    //        }, time );

    //    } )( entries[ i ], i * 15 );
				
    //}

}

function move( delta ) {

    //for ( var i = 0; i < scene.children.length; i ++ ) {

    //    var object = scene.children[ i ];

    //    object.position.z += delta;

    //    if ( object.position.z > 0 ) {

    //        object.position.z -= 5000;

    //    } else if ( object.position.z < - 5000 ) {

    //        object.position.z += 5000;

    //    }

    //}

    camera.position.z -= delta;

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
    renderer.render(scene, camera);
}