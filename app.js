// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

// Create an empty scene
var scene = new THREE.Scene();

// Create a basic perspective camera

var aspect = window.innerWidth / window.innerHeight;
var d = 2;

var camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 1000 );
camera.position.set( 20, 20, 20 ); // all components equal
camera.lookAt( scene.position ); // or the origin

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({antialias:true});

// Configure renderer clear color
renderer.setClearColor("#454345");

// Configure renderer size
renderer.setSize( window.innerWidth, window.innerHeight );

// Append Renderer to DOM
document.body.appendChild( renderer.domElement );

// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

// Create a Cube Mesh with basic material
var geometry = new THREE.BoxGeometry( 1, 1, 1 );
//var material = new THREE.MeshBasicMaterial( { color: "#433F81" } );

var material = new THREE.ShaderMaterial({
    vertexShader: `
// switch on high precision floats
#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;

void main()
{
    vec4 rotatedNormal = normalize(modelMatrix * vec4(normal, 1.0));
    vNormal = vec3(rotatedNormal);

    // vec3 rotatedNormal = normalize(normalMatrix * normal);
    // vNormal = rotatedNormal;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
}
    `,
    fragmentShader: `

#define M_PI 3.1415926535897932384626433832795
#ifdef GL_ES
precision highp float;
#endif

varying vec3 vNormal;

void main()
{
    vec3 light = vec3(0.5,0.2,1.0);
    light = normalize(light);
    float intensity = max(0.0, dot(vNormal, light));

    vec3 ambientlight = vec3(1, 0.0, 0.0);
    vec3 cubecolor = vec3(1.0, 1.0, 0.0);

    gl_FragColor = vec4(
        min(1.0, ambientlight.x + cubecolor.x * intensity),
        min(1.0, ambientlight.y + cubecolor.y * intensity),
        min(1.0, ambientlight.z + cubecolor.z * intensity),
        1.0
    );

    /*
    // One colour per axis (https://youtu.be/i0X8-5PpYVg?t=1614)

    vec3 normal = normalize(vNormal);

    float anglex = dot(normal, vec3(1.0, 0.0, 0.0));
    float angley = dot(normal, vec3(0.0, 1.0, 0.0));
    float anglez = dot(normal, vec3(0.0, 0.0, 1.0));

    // 0 => 1, M_PI => 0
    // i = (PI-x) / PI

    vec3 xColor = vec3(0.827, 0.404, 0.007);
    vec3 yColor = vec3(0.373, 0.843, 0.915);
    vec3 zColor = vec3(0.974, 0.706, 0.012);

    vec3 intensity = vec3(
        anglex,
        angley,
        anglez
    );

    vec3 solvedColor = (xColor * intensity.x) + (yColor * intensity.y) + (zColor * intensity.z);

    gl_FragColor = vec4(
        solvedColor.x,
        solvedColor.y,
        solvedColor.z,
        1.0
    );
    */
}
    `,
});

var cube = new THREE.Mesh( geometry, material );

// Add cube to Scene
scene.add( cube );
scene.add( new THREE.AxisHelper( 40 ) );

// // grid
// var geometry = new THREE.PlaneBufferGeometry( 10, 10, 10, 10 );
// var gridmaterial = new THREE.MeshBasicMaterial( { color: "#FF0000", wireframe: true, opacity: 0.5, transparent: true } );
// var grid = new THREE.Mesh( geometry, gridmaterial );
// grid.rotation.order = 'YXZ';
// grid.rotation.y = - Math.PI / 2;
// grid.rotation.x = - Math.PI / 2;
// scene.add( grid );

// Render Loop
var render = function () {
  requestAnimationFrame( render );

  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  // Render the scene
  renderer.render(scene, camera);
};

render();