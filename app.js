// Events
window.addEventListener( 'resize', onWindowResize, false );

// Colors
const cyan = new THREE.Vector3(82.0/255.0, 207.0/255.0, 227.0/255.0);
const orange2 = new THREE.Vector3(199.0/255.0, 82.0/255.0, 8.0/255.0);
const yellow2 = new THREE.Vector3(248.0/255.0, 166.0/255.0, 10.0/255.0);
const black = new THREE.Vector3(.0, .0, .0);
const nebulablue = new THREE.Vector3(84.0/255.0, 104.0/255.0, 1.0);
const gustopink = new THREE.Vector3(1.0, 0.0, 102.0/255.0);

const gray10 = new THREE.Vector3(.1, .1, .1);
const gray20 = new THREE.Vector3(.2, .2, .2);
const gray30 = new THREE.Vector3(.3, .3, .3);
const gray40 = new THREE.Vector3(.4, .4, .4);
const gray50 = new THREE.Vector3(.5, .5, .5);
const gray60 = new THREE.Vector3(.6, .6, .6);
const gray70 = new THREE.Vector3(.7, .7, .7);
const gray80 = new THREE.Vector3(.8, .8, .8);
const gray90 = new THREE.Vector3(.9, .9, .9);
const white = new THREE.Vector3(1.0, 1.0, 1.0);

const scene = new THREE.Scene();

// Create a renderer with Antialiasing
const renderer = new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio( window.devicePixelRatio);
renderer.setClearColor("#333333");
renderer.setSize( window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

const vertexShader = fetchShader('shader/vertexShader.glsl');
const fragmentShader = fetchShader('shader/fragmentShader.glsl');

// Camera
const orthoCameraAperture = 7;
const aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.OrthographicCamera( - orthoCameraAperture * aspect, orthoCameraAperture * aspect, orthoCameraAperture, - orthoCameraAperture, 1, 1000 );
var cameraControls = new THREE.OrbitControls( camera, renderer.domElement );
var cameraTarget = new THREE.Vector3(-2.15, 0, 0);
camera.position.set( -2.15, 0, 30 ); // all components equal
camera.lookAt( cameraTarget.x, cameraTarget.y, cameraTarget.z ); // or the origin

var algoliaMaterial = new THREE.ShaderMaterial({
    uniforms: {
        blend: { value: false },
        colors: { type: "fv", value: [
            ...gustopink.toArray(),
            ...yellow2.toArray(),
            ...nebulablue.toArray(),
            ...gustopink.toArray(),
            ...yellow2.toArray(),
            ...nebulablue.toArray()
        ] }
    },
    vertexShader,
    fragmentShader,
});

var catchphraseMaterial = new THREE.ShaderMaterial({
    uniforms: {
        blend: { value: false },
        colors: { type: "fv", value: [
            ...gray70.toArray(),
            ...gray90.toArray(),
            ...white.toArray(),
            ...gray70.toArray(),
            ...gray90.toArray(),
            ...white.toArray(),
        ] },
        alpha: { value: 0.0 },
    },
    transparent: true,
    blending: THREE.NormalBlending,
    depthTest: true,
    vertexShader,
    fragmentShader,
});

const objLoader = new THREE.OBJLoader();
objLoader.load('objs/algolia3.obj', (obj) => {
    scene.add(prepare(obj.children[1], algoliaMaterial));
    scene.add(prepare(obj.children[0], algoliaMaterial));
});

var catchPhrase;
objLoader.load('objs/catchphrase.obj', (obj) => {
    catchPhrase = prepare(obj.children[0], catchphraseMaterial);
    scene.add(catchPhrase);
});


var cam = camera.position;

// Render Loop
const start = new Date();
function render() {

    const delta = new Date() - start;

    if (delta > 3000 && delta < 10000) {
        camera.position.set(cam.x-=0.15, cam.y-=0.2, cam.z+=0.15);
    }

    if (delta > 4500 && delta < 10000) {
        catchphraseMaterial.uniforms.alpha.value += 0.05;
    }

    camera.lookAt( cameraTarget.x, cameraTarget.y, cameraTarget.z ); // or the origin

    // Render the scene
    renderer.render(scene, camera);

    requestAnimationFrame( render );
};

render();

function buildfNormals(faces) {
    var fNormals = [];
    for (var i=0; i < faces.length; i++) {
        for (var j = 0; j < 3; j++) {
            fNormals[i*9+j*3] = faces[i].normal.x;
            fNormals[i*9+j*3+1] = faces[i].normal.y;
            fNormals[i*9+j*3+2] = faces[i].normal.z;
        }
    }

    return fNormals;
}

function prepare(model, material) {

    var geometry = new THREE.Geometry();

    for (var i = 0; i < model.geometry.attributes.position.count; i++) {
        geometry.vertices.push(new THREE.Vector3(model.geometry.attributes.position.array[i*3], model.geometry.attributes.position.array[i*3+1], model.geometry.attributes.position.array[i*3+2]));
    }

    for (var i = 0; i < geometry.vertices.length; i+=3) {
        geometry.faces.push(new THREE.Face3(i, i+1, i+2));
    }

    geometry.computeFaceNormals();

    model.material = material;
    model.geometry.addAttribute('fNormal', new THREE.Float32BufferAttribute(buildfNormals(geometry.faces), 3));
    model.position.set(0, 0, 0);

    return model
}

function onWindowResize(){

    // notify the renderer of the size change
    renderer.setSize(window.innerWidth, window.innerHeight);

    var aspect = window.innerWidth / window.innerHeight;

    // update the camera
    camera.left = -orthoCameraAperture * aspect;
    camera.right = orthoCameraAperture * aspect;
    camera.top = orthoCameraAperture;
    camera.bottom = -orthoCameraAperture;
    camera.updateProjectionMatrix();

}

function fetchShader(url) {
    var request = new XMLHttpRequest();
    request.overrideMimeType("text/plain");
    request.open('GET', url, false);  // `false` makes the request synchronous
    request.send(null);

    if (request.status === 200) {
        return request.responseText;
    }

    throw new Error(request);
}