
/*
Game 0
This is a ThreeJS program which implements a simple game
The user moves a cube around the board trying to knock balls into a cone

*/

	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam, leftCam, rightCam;  // we have two cameras in the main scene
	var avatar;
	// here are some mesh objects ...
	var intensity = 10;
var light_l;
	var cone;
	var npc;
	var playing = false;
	var endScene, loseScene, startScene, endCamera, loseCamera, startCamera, endText, startText;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false, npcSpeed:5, npcFwd:false,
				fireballSpeed:7, fireBallFwd: false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, scene:'start', camera:'none' }

	 var button = document.createElement("button");
		var insideText = document.createTextNode("reset")
		button.appendChild(insideText);
		var body = document.getElementsByTagName("body")[0];
		document.body.appendChild(button);

	// Here is the main game control
  init(); //
	initControls();
	animate();  // start the animation loop!

	function createEndScene(){
		endScene = initScene();
		endText = createSkyBox('youwon.png',10);
		//endText.rotateX(Math.PI);
		endScene.add(endText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		endScene.add(light1);
		endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		endCamera.position.set(0,50,1);
		endCamera.lookAt(0,0,0);
	}

	function createStartScene() {
		startScene = initScene();
		startText = createSkyBox('start.png',10);
		//endText.rotateX(Math.PI);
		startScene.add(startText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		startScene.add(light1);
		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		startCamera.position.set(0,50,1);
		startCamera.lookAt(0,0,0);
	}


	function createLoseScene(){
		loseScene = initScene();
		loseText = createSkyBox('youlose.png',10);
		//endText.rotateX(Math.PI);
		loseScene.add(loseText);
		var light1 = createPointLight();
		light1.position.set(0,200,20);
		loseScene.add(light1);
		loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		loseCamera.position.set(0,50,1);
		loseCamera.lookAt(0,0,0);
	}

	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
      initPhysijs();
			scene = initScene();
			createEndScene();
			createLoseScene();
			createStartScene();
			initRenderer();
			createMainScene();
	}

	function createMainScene(){
      // setup lighting
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);



			// create the ground and the skybox
			var ground = createGround('grass.png');
			scene.add(ground);
			var skybox = createSkyBox('sky.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			createAvatar();

			gameState.camera = avatarCam;

			addBalls();

			cone = createConeMesh(4,6);
			cone.position.set(10,3,7);
			scene.add(cone);

			npc = createBoxMesh(0x0000ff,1,2,4);
			npc.position.set(30,3,-30);
			scene.add(npc);
			npc.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("npc hit the avatar");
						soundEffect('loseClank.wav');
						gameState.health -= 1;  //reduce health
						if (gameState.health==0) {
							gameState.scene='youlose';
						}
						var currIntensity=2;
						var c1 = 0xff0040;
						var distance = 100;
						var decay = 2.0;
						light_l = new THREE.PointLight( c1, currIntensity, distance, decay );
						scene.add(light_l);

						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.x = this.position.x - randN(100);
						this.__dirtyPosition = true;
						contronpcFwd = false;
					}
				}
			)
			//playGameMusic();

	}


	function randN(n){
		return Math.random()*n;
	}




	function addBalls(){
		var numBalls = 2


		for(i=0;i<numBalls;i++){
			var ball = createBall(1, 16, 16);
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==cone){
						console.log("ball "+i+" hit the cone");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score==numBalls) {
							gameState.scene='youwon';
						}
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
				}
			)
		}
	}

	function addAttackBalls(){
			var fireball = createBall(.1, .8, .8);
			fireball.position.set(Math.floor(npc.position.x), Math.floor(npc.position.y), Math.floor(npc.position.z));
			scene.add(fireball);
			fireball.lookAt(avatar.position);
			fireball.setLinearVelocity(fireball.getWorldDirection().multiplyScalar(controls.fireballSpeed));

			fireball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("fireball touched monkey");
						soundEffect('loseClank.wav');
						gameState.health -= 1;  // add one to the score
						if (gameState.health==0) {
							gameState.scene='youlose';
						}
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
				}
			}
		)
	}



	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){
		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

  function initPhysijs(){
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
  }
	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}


	function createBoxMesh(color,w,h,d){
			var geometry = new THREE.BoxGeometry( w, h, d);
			var material = new THREE.MeshLambertMaterial( { color: color} );
			mesh = new Physijs.BoxMesh( geometry, material );
			//mesh = new Physijs.BoxMesh( geometry, material,0 );
			mesh.castShadow = true;
			return mesh;
		}

	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}



	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '../images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}

	function createAvatar(){
			var loader = new THREE.JSONLoader();
			loader.load("../models/suzanne.json",
					function ( geometry, materials ) {

						var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
						var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
						var mesh = new Physijs.BoxMesh( geometry, pmaterial );
						mesh.setDamping(0.1,0.1);
						mesh.castShadow = true;
						avatar = mesh;

						avatarCam.position.set(0,4.5,4);
						avatarCam.lookAt(0,4,10);
						mesh.add(avatarCam);

						avatar.translateY(20);
						avatarCam.translateY(-4);
						avatarCam.translateZ(3);
						scene.add(avatar);
					},
					function(xhr){
						console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
					function(err){console.log("error in loading: "+err);}
				)

		//var mesh = new THREE.Mesh( geometry, material );


	}



	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '../images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}


	function createBall(radius, width, height){
		var geometry = new THREE.SphereGeometry( radius, width, height);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, material );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}


	var clock;

	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		console.log("Keydown:"+event.key);
		if (gameState.scene == 'start' && event.key=='p') {
			gameState.scene = 'main';
			gameState.score = 0;
			addBalls();
			return;
		}
		//console.dir(event);
		// first we handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			addBalls();
			return;
		}


		if(gameState.scene=='youlose') {
			if(event.key=='r') {
				gameState.health=10;
				gameState.score = 0;
				gameState.scene = 'main';
				addBalls();
				return;
			}

		}

		// this is the regular scene
		switch (event.key){
			// change the way the avatar is moving
			case "w": controls.fwd 		= true; break;
			case "s": controls.bwd 		= true; break;
			case "a": controls.left 	= true; break;
			case "d": controls.right	= true; break;
			case "r": controls.up 		= true; break;
			case "f": controls.down		= true; break;
			case "m": controls.speed 	= 30; 	break;
      case " ": controls.fly 		= true; break;
      case "h": controls.reset 	= true; break;

			// switch cameras
			case "1": gameState.camera = camera; 		break;
			case "2": gameState.camera = avatarCam; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft"	: 	avatarCam.translateY(1);	break;
			case "ArrowRight"	: 	avatarCam.translateY(-1);	break;
			case "ArrowUp"		: 	avatarCam.translateZ(-1);	break;
			case "ArrowDown"	: 	avatarCam.translateZ(1);	break;
			case "q"					: 	avatarCam.rotateY(.05);break;
			case "e"					: 	avatarCam.rotateY(-.05); break;
		}

	}

	function keyup(event){
		//console.log("Keydown:"+event.key);
		//console.dir(event);
		switch (event.key){
			case "w": controls.fwd   = false; break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; 		break;
      case " ": controls.fly 	 = false; break;
      case "h": controls.reset = false; break;
		}
	}

	function updateNPC(){
			npc.lookAt(avatar.position);
			var time = new Date().getTime() / 100;
			var distance = npc.position.distanceTo(avatar.position);

			if(distance <= 25 && distance > 5){
				//console.log("the x position is " + npc.position.x);
				controls.npcFwd = true;
			}
			if (distance <= 2){
				controls.npcFwd = false;
			}
			if (controls.npcFwd){
				// npc.__dirtyPosition = true;
				npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(controls.npcSpeed));
				if((Math.floor(time) + Math.floor(distance)) / 8 % 3 == 0){
					addAttackBalls();
					/*
					var fireball = createBall(.25, 1, 1);
					fireball.position.set(Math.floor(npc.position.x), Math.floor(npc.position.y), Math.floor(npc.position.z));
					scene.add(fireball);
					fireball.lookAt(avatar.position);
					fireball.setLinearVelocity(fireball.getWorldDirection().multiplyScalar(controls.fireballSpeed));
					*/
				}
			}
		}


  function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

    if (controls.reset){
      avatar.__dirtyPosition = true;
      avatar.position.set(40,10,40);
    }


	}



	function animate() {

		requestAnimationFrame( animate );

		switch(gameState.scene) {

			case "youwon":
				endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
				break;
			case "start":
				console.log("starta")
				loseText.rotateY(0.005);
				console.log(startScene)
				renderer.render(startScene, startCamera );
				break;
			case "main":
				updateAvatar();
				updateNPC();
	    	scene.simulate();
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				// if (gameState.health == 0){
				// 	gameState.scene = 'youlose';
				// }
				break;

		case "youlose":
		console.log("losing")
			loseText.rotateY(0.005);
			renderer.render(loseScene, loseCamera );
			break;


			default:
			  console.log("don't know the scene "+gameState.scene);

		}

		//draw heads up display ..
	  var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + ' Health: ' + gameState.health + '</div>';
	}
