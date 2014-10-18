function createGraph() {
	return {
		nodes: ['my/file/path1', 'some/file/path2', 'random/file/path3', 'i/heart/three.js', 'we/have/node.js', 'meow/moo/roof.py', 'some/other/path7', 'put/moo.fj', 'cheetos/rule.js', 'some/long/long/long/random/path/woooo/meow.js'],
		lineNums: [50, 200, 500, 10, 8, 300, 897, 150, 140, 120],
		edges: {
			'some/file/path2': {
				'put/moo.fj': 30
			},
			'my/file/path1': {
				'some/file/path2': 5,
				'random/file/path3': 10,
				'i/heart/three.js': 11
			},
			'i/heart/three.js': {
				'meow/moo/roof.py': 2,
				'we/have/node.js': 3,
				'cheetos/rule.js': 16
			},
			'some/other/path7': {
				'we/have/node.js': 15,
				'some/file/path2': 12,
				'put/moo.fj': 21,
				'cheetos/rule.js': 30,
				'some/long/long/long/random/path/woooo/meow.js': 1
			}
		}
	};
}

function zDistanceToCamera(position) {
	return camera.forward.dot(position.clone().sub(camera.position));
}

// // Text bubble-related variables
// var textBubbleTexWidth = 520;
// var textBubbleTexHeight = 64;
// var textBubbleSize = 1/60.0;
// var textBubbleGeometry = new THREE.PlaneGeometry(textBubbleTexWidth/textBubbleTexHeight, 1);
// var textBubbleCanvas = document.createElement('canvas');
// var textBubbleContext = textBubbleCanvas.getContext('2d');
// textBubbleCanvas.width = textBubbleTexWidth;
// textBubbleCanvas.height = textBubbleTexHeight;
// textBubbleContext.font = "Bold "+(textBubbleTexHeight-10)+"px Courier New";

// function TextBubble(node) {
// 	this.node = node;
// 	this.visible = false;
// 	this.texture = new THREE.Texture(textBubbleCanvas);
// 	this.material = new THREE.MeshBasicMaterial({map: this.texture});
// 	this.material.transparent = false;
// 	this.mesh = new THREE.Mesh(textBubbleGeometry, this.material);
// }

// TextBubble.prototype.redraw = function(text) {
// 	textBubbleContext.fillStyle = 'black';
// 	textBubbleContext.fillRect(0, 0, textBubbleTexWidth, textBubbleTexHeight);
// 	textBubbleContext.fillStyle = 'white';
// 	textBubbleContext.fillText(text, 8, textBubbleTexHeight-16);
// 	this.texture.needsUpdate = true;
// };

// /*
// * Scale the text bubble such that it is always the same size on the screen
// * irrespective of it's distance from the camera. The camera distance should
// * be provided as an argument to this function.
// */
// TextBubble.prototype.scaleForDistance = function(distance) {
// 	var scale = distance*textBubbleSize;
// 	this.mesh.scale.set(scale, scale, scale);
// 	this.mesh.position.set(0, 0.5+this.node.scale/2+scale/2, 1);
// };

var nodes = [];
var edges = [];
var maxNeighbors = 1;
// var dpGeometry = new THREE.PlaneGeometry(0.82, 0.82);

function Node(filepath, numNeighbors, lineNum) {
	this.filepath = filepath;

	// this.geometry = new THREE.SphereGeometry(100, 100, 100);
	// this.object = new THREE.Mesh(this.geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));
	
	this.color = new THREE.Color();

	console.log(numNeighbors, '/', maxNeighbors);
	var red = ((numNeighbors - 1) * 1.0 / (maxNeighbors - 1));
	var blue = 1 - red;
	var green = 0.1;
	console.log(red, blue);

	this.color.setRGB(red, green, blue);

	var map = THREE.ImageUtils.loadTexture('../images/sprite.png');
	var material = new THREE.SpriteMaterial({ map: map, color: this.color, fog: true, opacity: 0.9 });
	this.object = new THREE.Sprite(material);
	this.object.scale.normalize().multiplyScalar(20 + 2 * Math.sqrt(lineNum));

	// var material = new THREE.SpriteCanvasMaterial({
	// 	color: 0x0,
	// 	program: function(context) {
	// 		context.beginPath();
	// 		context.arc(0, 0, 0.5, 0, Math.PI * 2, true);
	// 		context.fill();
	// 	}
	// });
	// this.object = new THREE.Sprite(material);
	// this.object.scale.normalize().multiplyScalar(50 * numNeighbors);
	console.log(filepath, numNeighbors);

	this.pos = this.object.position;
	this.pos.set(Math.random() * 200, Math.random() * 200, Math.random() * 200);

	// this.textGeo = new THREE.TextGeometry(this.filepath);
	// this.label = new THREE.Mesh(this.textGeo, new THREE.MeshPhongMaterial({ color: 0x0 }));
	// this.label.position.set(this.pos.x, this.pos.y - 100, this.pos.z);

	// var canvas = document.createElement('canvas');
	// canvas.width = 1000;
	// canvas.height = 100;

	// var context = canvas.getContext('2d');
	// context.fillStyle = 'yellow';
	// context.fillRect(0, 0, 1000, 100);
	// context.font = '24pt Arial';
	// context.textAlign = 'center';
	// context.textBaseline = 'middle';
	// context.fillStyle = 'white';
	// context.fillText(this.filepath, 0, 0);

	// var texture = new THREE.Texture(canvas);
	// texture.needsUpdate = true;
	// this.label = new THREE.Sprite({
	// 	map: texture,
	// 	useScreenCoordinates: false
	// });
	
	this.label = makeTextSprite(this.filepath, {
		fontsize: 32,
		fontface: "Arial",
		borderColor: {
			r:255, g:255, b:255, a:1.0
		}
	});

	this.label.position.set(this.pos.x, this.pos.y, this.pos.z + 1);

	// this.label.needsUpdate = true;

	this.object.castShadow = true;
	this.object.receiveShadow = true;
	this.label.castShadow = true;
	this.label.receiveShadow = true;

	// this.object.position.set(Math.random() * 200-100, Math.random() * 200-100, Math.random() * 200-100);
	// this.object.position.set(0,0,0);
	// this.scale = 1;
	// this.textBubble = new TextBubble(this);

	// var defaultImg = THREE.ImageUtils.loadTexture('/images/Sea_otters_holding_hands.jpg');
	// this.material = new THREE.MeshBasicMaterial({ map: defaultImg });
	// this.mesh = new THREE.Mesh(dpGeometry, this.material);
	// this.object.add(this.material);
	this.object.currentHex = this.object.material.color.getHex();
	this.object.material.color.setHex( this.object.currentHex );
	console.log(this.object.material.color);
}

Node.prototype.draw = function() {
	// this.object.add(this.textBubble.mesh);
	// scene.add(this.textBubble.mesh);
	scene.add(this.label);
	scene.add(this.object);
	
};

Node.prototype.update = function() {
	this.label.position.set(this.pos.x, this.pos.y, this.pos.z + 1);
	// this.label.quaternion.copy(camera.quaternion);
	// this.textBubble.redraw(this.filepath);
	// this.textBubble.scaleForDistance(zDistanceToCamera(this.object.position));
}

  function positionAppearingNodes(appearingNodes, centrePosition) {
    // Space the new nodes to be shown around this node
    var n = appearingNodes.length;
    var dlong = Math.PI*(3-Math.sqrt(5));
    var dz = 2.0/n;
    var long = 0;
    var z = 1 - dz/2;
    for (var k = 0; k < n; ++k) {
      var r = Math.sqrt(1-z*z)*150;
      var pos = appearingNodes[k].pos;
      pos.copy(centrePosition);
      pos.x += Math.cos(long)*r;
      pos.y += Math.sin(long)*r;
      pos.z += z * 150;
      z = z - dz;
      long = long + dlong;
    }
  }

function Edge(startNode, endNode, weight) {
	edges.push(this);
	this.startNode = startNode;
	this.endNode = endNode;
	this.weight = weight;

	this.geometry = new THREE.Geometry();

	this.geometry.vertices.push(this.startNode.pos);
	this.geometry.vertices.push(this.endNode.pos);

	this.line = new THREE.Line(this.geometry, new THREE.LineBasicMaterial({
		linewidth: weight * .9,
		color: 0xffffff , 
		opacity: 0.9,
		transparent: false
	}));
}

Edge.prototype.update = function() {
	this.geometry.vertices[0] = this.startNode.pos;
	this.geometry.vertices[1] = this.endNode.pos;

	this.geometry.verticesNeedUpdate = true;

	// this.line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5 } ) );
}

Edge.prototype.draw = function() {
	scene.add(this.line);
}

var container, stats;
var camera, controls, scene, projector, renderer;
var plane;
var objects = [];
var effectFXAA;
var composer;
var sunPosition = new THREE.Vector3( 0, 0, 0);
var sunColor = 0xffee00;
var bgColor = 0x000000;
var sphereMesh, materialDepth
var postprocessing = { enabled : true };
var margin = 100;
var height = window.innerHeight - 2 * margin;
var screenSpacePosition = new THREE.Vector3();

var mouse = new THREE.Vector2(),
offset = new THREE.Vector3(),
INTERSECTED, SELECTED;

init();
animate();

document.addEventListener('mousemove', function(event){
	event.preventDefault();
})

function init() {
	var graph = createGraph();

	var numNeighbors = {};
	graph.nodes.forEach(function(n) {
		
		var currEdges = graph.edges[n];

		if (currEdges) {
			Object.keys(currEdges).forEach(function(k) {
				if (numNeighbors[k]) {
					numNeighbors[k]++;
					numNeighbors[n] = (numNeighbors[n]) ? numNeighbors[n] + 1 : 1;
				} else {
					numNeighbors[k] = 1;
					numNeighbors[n] = (numNeighbors[n]) ? numNeighbors[n] + 1 : 1;
				}
				maxNeighbors = Math.max(maxNeighbors, numNeighbors[k], numNeighbors[n]);
			});
		}
	});

	var i = 0;
	graph.nodes.forEach(function(n) {

		if (!numNeighbors[n]) {
			numNeighbors[n] = 0;
		}
		nodes.push(new Node(n, numNeighbors[n], graph.lineNums[i]));
		i++;
	});

	for (var i in graph.nodes) {
		var n = nodes[i];
		var currEdges = graph.edges[graph.nodes[i]];
		if (currEdges) {
			Object.keys(currEdges).forEach(function(neighborKey) {
				var neighborIndex = graph.nodes.indexOf(neighborKey);
				var neighbor = nodes[neighborIndex];
				var weight = currEdges[neighborKey];
				edges.push(new Edge(n, neighbor, weight));
			});
		}
	}

	nodes.forEach(function(n) {
		objects.push(n.object);
	});

	container = document.createElement( 'div' );
	document.body.appendChild( container );
	projector = new THREE.Projector();
	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 500;
	camera.forward = projector.unprojectVector(new THREE.Vector3(0, 0, 0.5), camera).sub(camera.position).normalize();

	controls = new THREE.TrackballControls( camera );
	controls.rotateSpeed = 1.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.0001 );

	scene.add( new THREE.AmbientLight( 0x505050 ) );

	var light = new THREE.SpotLight( 0xffffff, 1.5 );
	light.position.set( 0, 500, 2000 );
	light.castShadow = true;

	light.shadowCameraNear = 200;
	light.shadowCameraFar = camera.far;
	light.shadowCameraFov = 50;

	light.shadowBias = -0.00022;
	light.shadowDarkness = 0.5;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;

	scene.add( light );

	// var geometry = new THREE.BoxGeometry( 40, 40, 40 );

	// for ( var i = 0; i < 200; i ++ ) {

	// 	var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

	// 	object.material.ambient = object.material.color;

	// 	object.position.x = Math.random() * 1000 - 500;
	// 	object.position.y = Math.random() * 600 - 300;
	// 	object.position.z = Math.random() * 800 - 400;

	// 	object.rotation.x = Math.random() * 2 * Math.PI;
	// 	object.rotation.y = Math.random() * 2 * Math.PI;
	// 	object.rotation.z = Math.random() * 2 * Math.PI;

	// 	object.scale.x = Math.random() * 2 + 1;
	// 	object.scale.y = Math.random() * 2 + 1;
	// 	object.scale.z = Math.random() * 2 + 1;

	// 	object.castShadow = true;
	// 	object.receiveShadow = true;

	// 	scene.add( object );

	// 	objects.push( object );

	// }
	// for (var i in nodes) {
	// 	nodes[i].update();
	// }
	// for (var i in edges) {
	// 	edges[i].update();
	// }
	for (var i in nodes) {
		
		nodes[i].draw();
	}
	for(var i in edges) {
		edges[i].draw();
	}
	positionAppearingNodes(nodes , new THREE.Vector3(0, 0, 0));

	plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	plane.visible = false;
	scene.add( plane );

	

	// renderer = new THREE.WebGLRenderer( { antialias: true } );
	// renderer.setClearColor( 0x000000 );
	// renderer.setSize( window.innerWidth, window.innerHeight );
	// renderer.sortObjects = false;

	// renderer.shadowMapEnabled = true;
	// renderer.shadowMapType = THREE.PCFShadowMap;
	
	materialDepth = new THREE.MeshDepthMaterial();

	var materialScene = new THREE.MeshBasicMaterial( { color: 0x000000, shading: THREE.FlatShading } );
	var geo = new THREE.SphereGeometry( 1, 20, 10 );
	sphereMesh = new THREE.Mesh( geo, materialScene );

	var sc = 20;
	sphereMesh.scale.set( sc, sc, sc );

	scene.add( sphereMesh );

	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(bgColor, 1);
	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

	// var info = $('body').append( 'div' );
	// info.style.position = 'absolute';
	// info.style.top = '10px';
	// info.style.width = '100%';
	// info.style.textAlign = 'center';
	// info.innerHTML = '<a href="http://threejs.org" target="_blank">three.js</a> webgl - draggable cubes';
	// container.append( info );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	renderer.domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
	renderer.domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
	renderer.domElement.addEventListener( 'mouseup', onDocumentMouseUp, false );

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectBloom = new THREE.BloomPass( .9 );
	var effectCopy = new THREE.ShaderPass( THREE.CopyShader );

	effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );

	var width = window.innerWidth || 2;
	var height1 = window.innerHeight || 2;

	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / width, 1 / height1 );

	effectCopy.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectFXAA );
	composer.addPass( effectBloom );
	composer.addPass( effectCopy );

	initPostprocessing();

	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
	effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );	
	composer.reset();

}

function onDocumentMouseMove( event ) {
	event.preventDefault();

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

	//

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );


	if ( SELECTED ) {

		var intersects = raycaster.intersectObject( plane );
		SELECTED.position.copy( intersects[ 0 ].point.sub( offset ) );
		return;

	}

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		if ( INTERSECTED != intersects[ 0 ].object ) {

			// if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			// INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		// if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

		INTERSECTED = null;

		container.style.cursor = 'auto';

	}

}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	var vector = new THREE.Vector3( mouse.x, mouse.y, 0.5 );
	projector.unprojectVector( vector, camera );

	var raycaster = new THREE.Raycaster( camera.position, vector.sub( camera.position ).normalize() );

	var intersects = raycaster.intersectObjects( objects );

	if ( intersects.length > 0 ) {

		controls.enabled = false;

		SELECTED = intersects[ 0 ].object;

		var intersects = raycaster.intersectObject( plane );
		offset.copy( intersects[ 0 ].point ).sub( plane.position );

		container.style.cursor = 'move';

	}

}

function onDocumentMouseUp( event ) {

	event.preventDefault();

	controls.enabled = true;

	if ( INTERSECTED ) {

		plane.position.copy( INTERSECTED.position );

		SELECTED = null;

	}

	container.style.cursor = 'auto';

}

//

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	controls.update();

	for (var i in nodes) {
		nodes[i].update();
	}
	for (var i in edges) {
		edges[i].update();
	}

	// camera.lookAt(scene.position);

	// for (var i in nodes) {
		
	// 	nodes[i].draw();
	// }
	// for(var i in edges) {
	// 	edges[i].draw();
	// }
	// 
	var time = Date.now() * 0.0005;

	camera.lookAt( scene.position ); 

	var time = Date.now() / 4000;

	sphereMesh.position.x = 200 * Math.cos( time );
	sphereMesh.position.z = 200 * Math.sin( time ) - 100;
	if ( postprocessing.enabled ) {
			// Find the screenspace position of the sun

			screenSpacePosition.copy( sunPosition );
			projector.projectVector( screenSpacePosition, camera );

			screenSpacePosition.x = ( screenSpacePosition.x + 1 ) / 2;
			screenSpacePosition.y = ( screenSpacePosition.y + 1 ) / 2;

			// Give it to the god-ray and sun shaders

			postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
			postprocessing.godrayGenUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

			postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.x = screenSpacePosition.x;
			postprocessing.godraysFakeSunUniforms[ "vSunPositionScreenSpace" ].value.y = screenSpacePosition.y;

			// -- Draw sky and sun --

			// Clear colors and depths, will clear to sky color

			renderer.clearTarget( postprocessing.rtTextureColors, true, true, false );

			// Sun render. Runs a shader that gives a brightness based on the screen
			// space distance to the sun. Not very efficient, so i make a scissor
			// rectangle around the suns position to avoid rendering surrounding pixels.

			var sunsqH = 0.74 * height; // 0.74 depends on extent of sun from shader
			var sunsqW = 0.74 * height; // both depend on height because sun is aspect-corrected

			screenSpacePosition.x *= window.innerWidth;
			screenSpacePosition.y *= height;

			renderer.setScissor( screenSpacePosition.x - sunsqW / 2, screenSpacePosition.y - sunsqH / 2, sunsqW, sunsqH );
			renderer.enableScissorTest( true );

			postprocessing.godraysFakeSunUniforms[ "fAspect" ].value = window.innerWidth / height;

			postprocessing.scene.overrideMaterial = postprocessing.materialGodraysFakeSun;
			renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureColors );

			renderer.enableScissorTest( false );

			// -- Draw scene objects --

			// Colors

			scene.overrideMaterial = null;
			renderer.render( scene, camera, postprocessing.rtTextureColors );

			// Depth

			scene.overrideMaterial = materialDepth;
			renderer.render( scene, camera, postprocessing.rtTextureDepth, true );

			// -- Render god-rays --

			// Maximum length of god-rays (in texture space [0,1]X[0,1])

			var filterLen = 1.0;

			// Samples taken by filter

			var TAPS_PER_PASS = 6.0;

			// Pass order could equivalently be 3,2,1 (instead of 1,2,3), which
			// would start with a small filter support and grow to large. however
			// the large-to-small order produces less objectionable aliasing artifacts that
			// appear as a glimmer along the length of the beams

			// pass 1 - render into first ping-pong target

			var pass = 1.0;
			var stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

			postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
			postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureDepth;

			postprocessing.scene.overrideMaterial = postprocessing.materialGodraysGenerate;

			renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays2 );

			// pass 2 - render into second ping-pong target

			pass = 2.0;
			stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

			postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
			postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays2;

			renderer.render( postprocessing.scene, postprocessing.camera, postprocessing.rtTextureGodRays1  );

			// pass 3 - 1st RT

			pass = 3.0;
			stepLen = filterLen * Math.pow( TAPS_PER_PASS, -pass );

			postprocessing.godrayGenUniforms[ "fStepSize" ].value = stepLen;
			postprocessing.godrayGenUniforms[ "tInput" ].value = postprocessing.rtTextureGodRays1;

			renderer.render( postprocessing.scene, postprocessing.camera , postprocessing.rtTextureGodRays2  );

			// final pass - composite god-rays onto colors

			postprocessing.godrayCombineUniforms["tColors"].value = postprocessing.rtTextureColors;
			postprocessing.godrayCombineUniforms["tGodRays"].value = postprocessing.rtTextureGodRays2;

			postprocessing.scene.overrideMaterial = postprocessing.materialGodraysCombine;

			renderer.render( postprocessing.scene, postprocessing.camera );
			postprocessing.scene.overrideMaterial = null;
	} else {

		// renderer.render( scene, camera );
		renderer.clear();
		composer.render();
	}

}

function makeTextSprite( message, parameters ) {
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 18;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 1;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:0, g:0, b:0, a:1.0 };

	var spriteAlignment = THREE.SpriteMaterial.alignment;
		
	var canvas = document.createElement('canvas');
	var context = canvas.getContext('2d');
	console.log(context);
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

	context.lineWidth = borderThickness;
	roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 2);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(255, 255, 255, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	
	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, useScreenCoordinates: false } );

	// spriteMaterial.alignment.set(0, 0);

	var sprite = new THREE.Sprite( spriteMaterial );

	sprite.position.normalize();
	sprite.scale.set(100, 50, 1.0);


	return sprite;	
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}


function initPostprocessing() {

	postprocessing.scene = new THREE.Scene();

	postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2,  height / 2, height / - 2, -10000, 10000 );
	postprocessing.camera.position.z = 100;

	postprocessing.scene.add( postprocessing.camera );

	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat };
	postprocessing.rtTextureColors = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

	// Switching the depth formats to luminance from rgb doesn't seem to work. I didn't
	// investigate further for now.
	// pars.format = THREE.LuminanceFormat;

	// I would have this quarter size and use it as one of the ping-pong render
	// targets but the aliasing causes some temporal flickering

	postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, height, pars );

	// Aggressive downsize god-ray ping-pong render targets to minimize cost

	var w = window.innerWidth / 4.0;
	var h = height / 4.0;
	postprocessing.rtTextureGodRays1 = new THREE.WebGLRenderTarget( w, h, pars );
	postprocessing.rtTextureGodRays2 = new THREE.WebGLRenderTarget( w, h, pars );

	// god-ray shaders

	var godraysGenShader = THREE.ShaderGodRays[ "godrays_generate" ];
	postprocessing.godrayGenUniforms = THREE.UniformsUtils.clone( godraysGenShader.uniforms );
	postprocessing.materialGodraysGenerate = new THREE.ShaderMaterial( {

		uniforms: postprocessing.godrayGenUniforms,
		vertexShader: godraysGenShader.vertexShader,
		fragmentShader: godraysGenShader.fragmentShader

	} );

	var godraysCombineShader = THREE.ShaderGodRays[ "godrays_combine" ];
	postprocessing.godrayCombineUniforms = THREE.UniformsUtils.clone( godraysCombineShader.uniforms );
	postprocessing.materialGodraysCombine = new THREE.ShaderMaterial( {

		uniforms: postprocessing.godrayCombineUniforms,
		vertexShader: godraysCombineShader.vertexShader,
		fragmentShader: godraysCombineShader.fragmentShader

	} );

	var godraysFakeSunShader = THREE.ShaderGodRays[ "godrays_fake_sun" ];
	postprocessing.godraysFakeSunUniforms = THREE.UniformsUtils.clone( godraysFakeSunShader.uniforms );
	postprocessing.materialGodraysFakeSun = new THREE.ShaderMaterial( {

		uniforms: postprocessing.godraysFakeSunUniforms,
		vertexShader: godraysFakeSunShader.vertexShader,
		fragmentShader: godraysFakeSunShader.fragmentShader

	} );

	postprocessing.godraysFakeSunUniforms.bgColor.value.setHex( bgColor );
	postprocessing.godraysFakeSunUniforms.sunColor.value.setHex( sunColor );

	postprocessing.godrayCombineUniforms.fGodRayIntensity.value = 0.2;

	postprocessing.quad = new THREE.Mesh( new THREE.PlaneGeometry( window.innerWidth, height ), postprocessing.materialGodraysGenerate );
	postprocessing.quad.position.z = -9900;
	postprocessing.scene.add( postprocessing.quad );

}
// // MAIN

// var WIDTH = window.innerWidth;
// var HEIGHT = window.innerHeight;

// $container = $('#container');

// var scene = new THREE.Scene();
// var camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT, 0.1, 10000);
// var renderer = new THREE.WebGLRenderer();

// camera.position.z = 300;
// scene.add(camera);
// renderer.setSize(WIDTH, HEIGHT);

// $container.append(renderer.domElement);

// window.addEventListener('resize', function(event) {
// 	renderer.setSize(window.innerWidth, window.innerHeight);
// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();
// });

// var n = new Node('my/random/filepath.js');
// n.show();

// // var edges = [];

