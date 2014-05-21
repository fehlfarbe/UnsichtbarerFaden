var callbackProgress = function (progress, result) {

    var bar = 250,
        total = progress.totalModels + progress.totalTextures,
        loaded = progress.loadedModels + progress.loadedTextures;

    if (total)
        bar = Math.floor(bar * loaded / total);

    $("bar").style.width = bar + "px";

    count = 0;
    for (var m in result.materials) count++;

    handle_update(result, Math.floor(count / total));

}

function $(id) {

    return document.getElementById(id);

}

var callbackSync = function (result) {

    /*

    // uncomment to see progressive scene loading

    scene = result.scene;
    camera = result.currentCamera;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    */

    //handle_update( result, 1 );

}

var callbackFinished = function (result) {

    loaded = result;

    $("message").style.display = "none";
    $("progressbar").style.display = "none";
    $("start").style.display = "block";
    $("start").className = "enabled";

    handle_update(result, 1);

    result.scene.traverse(function (object) {

        if (object.userData.rotating === true) {

            rotatingObjects.push(object);

        }

        if (object instanceof THREE.MorphAnimMesh) {

            morphAnimatedObjects.push(object);

        }

        if (object instanceof THREE.SkinnedMesh) {

            if (object.geometry.animation) {

                THREE.AnimationHandler.add(object.geometry.animation);

                var animation = new THREE.Animation(object, object.geometry.animation.name);
                animation.play();

            }

        }

    });

}