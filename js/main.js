
// Set the scene size.
const WIDTH = 1280;
const HEIGHT = 720;

// Set some camera attributes.
const FOV = 90;
const ASPECT = WIDTH / HEIGHT;
const NEAR = 0.1;
const FAR = 1000;

// Set Game Attributes
let scene, camera, renderer, mesh;
let keybindings = {};
let USE_WIREFRAME = false;

// Set up Floor
let floor;

// Set up Objects & textures
let crate, crateTexture, crateNormalMap, crateBumpMap;
var textureLoader;

// Set up Player
let player = { height: 2.5, speed: 0.2, turnSpeed: Math.PI * 0.005};
let armLeft, armRight, legLeft, legRight;

//Set up Lights
let ambientLight;
let light;

// An object to hold all the things needed for our loading screen
var loadingScreen = {
	scene: new THREE.Scene(),
	camera: new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, 100),
	box: new THREE.Mesh(
		new THREE.BoxGeometry(0.5,0.5,0.5),
		new THREE.MeshBasicMaterial({ color:0x4444ff })
	)
};
var loadingManager = null;
var RESOURCES_LOADED = false;

function init(){

    // Create camera and a scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
    
	// Set up the loading screen's scene.
	// It can be treated just like our main scene.
	loadingScreen.box.position.set(0,0,5);
	loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
    
    // Create a loading manager to set RESOURCES_LOADED when appropriate.
	// Pass loadingManager to all resource loaders.
    loadingManager = new THREE.LoadingManager();
    
    loadingManager.onProgress = function(item, loaded, total){
		console.log(item, loaded, total);
	};
	
	loadingManager.onLoad = function(){
		console.log("loaded all resources");
		RESOURCES_LOADED = true;
	};
        
    mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1,1,1),
        new THREE.MeshPhongMaterial({color:0xff9999, wireframe:USE_WIREFRAME})
    );
    mesh.position.y += 1;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    textureLoader = new THREE.TextureLoader(loadingManager);

    // Add Player
    addPlayer();

    // Add Crate
    addCrate();

    // Create floor
    addFloor(10,10);

    // Add Lights
    setLights();

    // Add a Mesh to the scene.
    scene.add(mesh);    

    // Model/material loading!  
    modelLoading();
   
    // Set Camera
    camera.position.set(0,player.height,-5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));   

    // Create a WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Attach the renderer-supplied DOM element.
    document.body.appendChild(renderer.domElement);

    animate();
}

function animate(){
    // This block runs while resources are loading.
    if( RESOURCES_LOADED == false ){
        requestAnimationFrame(animate);
        
        loadingScreen.box.position.x -= 0.05;
        if( loadingScreen.box.position.x < -10 ) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);
        
        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return; // Stop the function here.
    }

    requestAnimationFrame(animate);

    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.02;
 
    inputHandler();
    
    renderer.render(scene, camera);
    
    light.position.set(camera.position.x, camera.position.y, camera.position.z + 1);

    resize();

    updateLimbs();
}


function modelLoading(){

	var mtlLoader = new THREE.MTLLoader(loadingManager);
	mtlLoader.load("../images/basicCharacter.obj.mtl", function(materials){
		
		materials.preload();
		var objLoader = new THREE.OBJLoader(loadingManager);
		objLoader.setMaterials(materials);
		
		objLoader.load("../images/basicCharacter.obj", function(mesh){
		
			mesh.traverse(function(node){
				if( node instanceof THREE.Mesh ){
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
		
			scene.add(mesh);
			mesh.position.set(-5, 0, 4);
			mesh.rotation.y = -Math.PI/4;
		});
		
	});
}

function setLights(){
    ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    light = new THREE.PointLight(0xffffff, 0.8, 18);
    light.position.set(camera.position.x, camera.position.y, camera.position.z + 1);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 25;

    scene.add(ambientLight);  
    scene.add(light);
}

// Create object functions
function addFloor(width, height){
    floor = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height, 20,20),
        new THREE.MeshPhongMaterial({color:0xffffff, wireframe:USE_WIREFRAME})
    );
    floor.rotation.x -= Math.PI / 2;
    floor.receiveShadow = true;

    scene.add(floor); 
}

function addCrate(){
    // Texture Loading
	
	crateTexture = textureLoader.load("../images/crate_diffuse.png");
	crateBumpMap = textureLoader.load("../images/crate_bump.png");
	crateNormalMap = textureLoader.load("../images/crate_normal.png");
	
	// Create mesh with these textures
	crate = new THREE.Mesh(
		new THREE.BoxGeometry(3,3,3),
		new THREE.MeshPhongMaterial({
			color:0xffffff,
			
			map:crateTexture,
			bumpMap:crateBumpMap,
			normalMap:crateNormalMap
		})
	);
	scene.add(crate);
	crate.position.set(2.5, 3/2, 2.5);
	crate.receiveShadow = true;
	crate.castShadow = true;
}

function addPlayer(){
    armRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.2,0.2,1.2),
        new THREE.MeshPhongMaterial({color:0xff9999, wireframe:USE_WIREFRAME})
    );
    armRight.position.set(
        camera.position.x -1, camera.position.y + 1 , camera.position.z - 4
    );
    armRight.receiveShadow = true;
    armRight.castShadowd = true;

    armLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.2,0.2,1.2),
        new THREE.MeshPhongMaterial({color:0xff9999, wireframe:USE_WIREFRAME})
    );
    armLeft.position.set(
        camera.position.x +1, camera.position.y + 1 , camera.position.z - 4
    );
    armLeft.receiveShadow = true;
    armLeft.castShadow = true;

    scene.add(armRight); 
    scene.add(armLeft);
}

function updateLimbs(){
    
    armRight.position.set(
        camera.position.x - 0.5, camera.position.y - 0.5, camera.position.z + 0.5
    );
    armLeft.position.set(
        camera.position.x + 0.5, camera.position.y - 0.5, camera.position.z + 0.5
    );
}

// Set Input functions
function keyDown(event){
    keybindings[event.keyCode] = true;
}
function keyUp(event){
    keybindings[event.keyCode] = false;
}
function inputHandler(){
    if(keybindings[87]){  // W key
        camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
        camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }
    if(keybindings[83]){  // S key
        camera.position.x += Math.sin(camera.rotation.y) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }
    if(keybindings[65]){  // A key
        camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;       
    }
    if(keybindings[68]){  // D key
        camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
        camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
    }

    if(keybindings[37]){  // left arrow key
       camera.rotation.y -= Math.PI * player.turnSpeed;      
    }
    if(keybindings[39]){  // right arrow key
        camera.rotation.y += Math.PI * player.turnSpeed; 
    }

    // Arm movement
    if(keybindings[69]){  // E key
        armRight.position.z += 0.5;    
    }
    if(keybindings[81]){  // Q key
        armLeft.position.z += 0.5; 
    }
}

// Window function
function resize(){
    renderer.setSize(WIDTH, HEIGHT);
    camera.aspect = ASPECT;

    camera.updateProjectionMatrix();
}


// Key Eventlisteners
window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

// Initialize Three functions
window.onload = init();
