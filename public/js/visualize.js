function createGraph() {
	return {
		nodes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
		edges: {
			'1': {
				'2': 5,
				'3': 10,
				'4': 10
			},
			'4': {
				'6': 2,
				'5': 2
			},
			'7': {
				'8': 20,
				'9': 30,
				'10': 1
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

// var dpGeometry = new THREE.PlaneGeometry(0.82, 0.82);




function Node(filepath) {
	this.filepath = filepath;

	this.geometry = new THREE.SphereGeometry(100, 100, 100);
	this.object = new THREE.Mesh(this.geometry, new THREE.MeshLambertMaterial({ color: Math.random() * 0xffffff }));

	this.pos = this.object.position;
	this.pos.set(Math.random() * 200, Math.random() * 200, Math.random() * 200);

	this.textGeo = new THREE.TextGeometry(this.filepath);
	this.label = new THREE.Mesh(this.textGeo, new THREE.MeshPhongMaterial({ color: 0x0 }));
	this.label.position.set(this.pos.x, this.pos.y - 100, this.pos.z);

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
}

Node.prototype.draw = function() {
	// this.object.add(this.textBubble.mesh);
	// scene.add(this.textBubble.mesh);
	scene.add(this.object);
	scene.add(this.label);
};

Node.prototype.update = function() {
	this.label.position.set(this.pos.x, this.pos.y - 100, this.pos.z);
	// this.label.quaternion.copy(camera.quaternion);
	// this.textBubble.redraw(this.filepath);
	// this.textBubble.scaleForDistance(zDistanceToCamera(this.object.position));
}

// function positionAppearingNodes(appearingNodes, centrePosition) {
//     // Space the new nodes to be shown around this node
//     var n = appearingNodes.length;
//     // console.log(appearingNodes);
//     var dlong = Math.PI*(3-Math.sqrt(5));
//     var dz = 2.0/n;
//     var long = 0;
//     var z = 1 - dz/2;
//     for (var k = 0; k < n; ++k) {
//     	var r = Math.sqrt(1-z*z);
//     	var pos = appearingNodes[k].object.position;
//     	pos.copy(centrePosition);
//     	pos.x += Math.cos(long)*r;
//     	pos.y += Math.sin(long)*r;
//     	pos.z += z;
//     	z = z - dz;
//     	long = long + dlong;
//     }
// }

function Edge(startNode, endNode, weight) {
	edges.push(this);
	this.startNode = startNode;
	this.endNode = endNode;
	this.weight = weight;

	this.geometry = new THREE.Geometry();

	this.geometry.vertices.push(this.startNode.pos);
	this.geometry.vertices.push(this.endNode.pos);

	this.line = new THREE.Line( this.geometry, new THREE.LineBasicMaterial( { color: 0xffffff, opacity: 0.5 } ) );
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

	graph.nodes.forEach(function(n) {
		nodes.push(new Node(n));
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
	camera.position.z = 1000;
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
	scene.fog = new THREE.FogExp2( 0x000000, 0.001 );

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
	// positionAppearingNodes(nodes, new THREE.Vector3(0, 0, 0));

	plane = new THREE.Mesh( new THREE.PlaneGeometry( 2000, 2000, 8, 8 ), new THREE.MeshBasicMaterial( { color: 0x000000, opacity: 0.25, transparent: true, wireframe: true } ) );
	plane.visible = false;
	scene.add( plane );

	

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setClearColor( 0xf0f0f0 );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;

	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFShadowMap;

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

	window.addEventListener( 'resize', onWindowResize, false );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

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

			if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

			INTERSECTED = intersects[ 0 ].object;
			INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

			plane.position.copy( INTERSECTED.position );
			plane.lookAt( camera.position );

		}

		container.style.cursor = 'pointer';

	} else {

		if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

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

	// for (var i in nodes) {
		
	// 	nodes[i].draw();
	// }
	// for(var i in edges) {
	// 	edges[i].draw();
	// }

	// camera.lookAt( scene.position ); 

	renderer.render( scene, camera );

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

