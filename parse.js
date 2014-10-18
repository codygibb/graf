var lazy = require('lazy');
var fs = require('fs');
var when = require('when');
var node_fn = require('when/node');
var request = require('request');
var requestP = node_fn.lift(request);
var unzip = require('unzip');
var path = require('path');

var graf_array = [];
var path_set = [];

function cleanGraph() {
	for (var i = 0; i < graf_array.length; i++) {
		Object.keys(graf_array[i].neighbors).forEach(function(path) {
			if (path_set.indexOf(path) < 0) {
				console.log(path);
				delete graf_array[i].neighbors[path];
			}
		});
	}
}

function process(data, fileName) {
	if (typeof fileName != 'string') {
		return;
	}
	lines = data.split("\n");
	module_path_map = identifyModules(lines, fileName); // var name - full_path
	module_counts = measureModuleUsage(lines, module_path_map); // fullPath - counts
	console.log(module_counts);

	module_object = {
		"fullPath": fileName,
		"line_num": lines.length,
		"neighbors": module_counts
	};

	path_set.push(fileName);
	graf_array.push(module_object);
}


function identifyModules(lines, fileName) {

	var rx = new RegExp(/[_A-Za-z][_A-Za-z0-9]*[ \t]*=[ \t]*require\(["'].+["']\)/);

	module_path_map = {};  // maps module abrev to module path

	lines.forEach(function(line) {
		
		if (rx.test(line)) {
			console.log(line);
			var array = line.split('=');

			var right = array[1];
			var rel_path = "";
			if (right.indexOf('\'') > -1) {
				rel_path = right.split('\'')[1];
			} else { // contains ""
				rel_path = right.split('\"')[1];
			}
		
			var dirname = path.dirname(fileName);
			var fullPath = path.resolve(dirname, rel_path).replace(__dirname + '/', '');
			fullPath = fullPath + '.js';


			left = array[0].trim();
			left_array = left.split(/[ \t]+/);
			if (left_array.length == 1) {
				module_path_map[left_array[0]] = fullPath;
			} else {
				module_path_map[left_array[1]] = fullPath;
			}
		}

	});
	return module_path_map;
}

function measureModuleUsage(lines, modules) {
	module_count = {};
	var rx_string  = "(^NAME\.|[=+\*\/\\(\[\{\-]{1}NAME\.)";
	for (var i = 0; i < lines.length; i++) {
		line = lines[i].replace(/\s/g, '');
		Object.keys(modules).forEach(function(module) {
			var rx = new RegExp(rx_string.split("NAME").join(module));
			if (rx.test(line)) {
				if (module in module_count) {
					module_count[modules[module]]++;
				} else {
					module_count[modules[module]] = 1;
				}
			}
		});
	}
	return module_count;
}

// function parse_file(data) {
// 	// first discover modules
// 	var modules = {}  // map module abreviation to full path

// 	// count occurances of those models in the file
// 	var module_counts = {};  // mapping module abreviation to count
// 	var lines = data.split('/n');

// 	var rx_string  = /(^NAME\.|[=+\*\/\\(\[\{\-]{1}NAME\.)/;
// 	for (var i = 0; i < lines.length(); i++) {
// 		line = lines[i].replace(/ /g, '');
// 		for each module in modules.keys() {}
// 			var rx = new RegExp(rx_string.split("NAME").join(module));
// 			if (rx.test(line)) {
// 				if (module in module_counts) {
// 					modules[module]++;
// 				} else {
// 					modules[module] = 1;
// 				}
// 			}
// 		}
// 	}
// 	console.log()
// };

//var url = 'https://github.com/codygibb/code-cache';
var url = 'https://github.com/ryanewing/PubStar';

//function buildGraf(url) {
	var tempZipFilePath = './tmp/' + new Date().getTime() + Math.random();

	request({
		url: url + '/archive/master.zip',
		method: 'GET'
	})
	.pipe(unzip.Parse())
	.on('entry', function (entry) {
	    var fileName = entry.path;
	    var type = entry.type; // 'Directory' or 'File'
	    var size = entry.size;
	    if (fileName.slice(-3) == '.js' && (fileName.length < 7 || fileName.slice(-7) != '-min.js')) {
		    // exclude min.js and makes sure we only check files >7 chars
			var data = '';
			//console.log(fileName);
			// var required = '../../mymodule.js';
			// var requiredPath = path.normalize(path.dirname(fileName) + '/' + required);
			entry.on('data', function(chunk) {
				data += chunk;
			});
			entry.on('end', function() {
				process(data, fileName);
			});
	    } else {
	      entry.autodrain();
	    }
	  })
	.on('close', function() {
		//console.log("yay");
		
		cleanGraph();
		console.log(graf_array);
		var graf = {
			"repo_link": url,
			"array": graf_array
		}
		return graf;
	});
//}

// , function(err, res, body) {
// 	console.log(body);
// 	if (err)
// 		return console.log(err);

// 	var output = './output.zip';

// 	fs.writeFileSync(output, body);

// 	fs.createReadStream(output)
// 		.pipe(unzip.Parse())
// 		.on('entry', function(entry) {
// 			console.log('hey');
// 		    var type = entry.type; // 'Directory' or 'File'
// 		    var size = entry.size;
// 		    console.log(type, size);
// 		})
// })

// var urlArr = testUrl.split('/');
// var username = urlArr[0];
// var repo = urlArr[1];


// var github = new GitHubApi({
// 	version: "3.0.0"
// });

// console.log(username, repo);


// getContentP('/')
// 	.then(function(data) {
// 		console.log(data);
// 		var results = [];
// 		return getMoreP(data, results)
// 			.then(function() {
// 				return results;
// 			});
// 	})
// 	.then(function(results) {
// 		// console.log(results);
// 	})
// 	.catch(function(err) {
// 		console.log(err);
// 	})

// function getMoreP(data, results) {
// 	if (Object.prototype.toString.call(data) === '[object Array]') {
// 		console.log('array');
// 		var promises = [];
// 		data.forEach(function(item) {
// 			promises.push(getMoreP(item));
// 		});
// 		return when.all(promises);
// 	} else {
// 		console.log('object');
// 		return getContentP(data.path)	
// 			.then(function(file) {
// 				console.log('file', file.name);
// 				results.push(file);
// 			});
// 	}
// }

// function getContentP(path) {
// 	var deferred = when.defer();

// 	github.repos.getContent({
// 		headers: {
// 		'User-Agent': 'codygibb'
// 		},
// 		user: 'codygibb',
// 		repo: 'code-cache',
// 		path: path
// 	}, function(err, data) {
// 		if (err) {
// 			deferred.reject(err);
// 		} else {
// 			deferred.resolve(data);
// 		}
// 	});

// 	return deferred.promise
// 		.then(function(data) {
// 			console.log(data);
// 			if (data.meta) {
// 				return requestP({
// 					url: data.meta.location.replace('/%2', ''),
// 					method: 'GET',
// 					headers: {
// 						'User-Agent': 'sfelker'
// 					},
// 					json: true
// 				})
// 				.spread(function(res, body) {
// 					return body;
// 				});
// 			} else {
// 				return data;
// 			}
// 		});
// }



// var l = new lazy(fs.createReadStream('./app.js'));
// var dependencies = {}; // mapping assigned name to path
// 	//var l = new lazy(fs.createReadStream(foo));
// 	l.lines.forEach(function(element) {
// 		line = element.toString();
// 		var rx2 = /(var)/;
// 		var rx = /(var [_A-Za-z][_A-Za-z0-9]+[ \t]*=[ \t]*require\(["'].+["']\);)/;
// 		//console.log(line);
// 		if (rx2.test(line)) {
// 			array = line.split('=');
// 			module_name = array[0].trim().split(/[ \t]+/)[1];
// 			console.log(module_name);
// 		}
// 	});

// var headers = { 'Content-Type' : 'application/vnd.github.v3+json'};

// request({
//     //url: 'https://raw.githubusercontent.com/codygibb/code-cache/master/app.js',
//     uri: 'https://github.com/codygibb/code-cache',
//     method: 'GET',
//     headers: headers
// }, function(err, res, body) {
// 	if (err) {
// 		return console.log(err);
// 	}
// 	console.log(body);
// });



// var headers = { 'Content-Type' : 'application/vnd.github.VERSION.raw' }

// request({
//     //url: 'https://raw.githubusercontent.com/codygibb/code-cache/master/app.js',
//     uri: '',
//     method: 'GET',
//     headers: headers
// }, function(err, res, body) {
// 	if (err) {
// 		return console.log(err);
// 	}
// 	//console.log(body);
// });

// function scanRepo(repo_url) {
// 	$.ajax({
//     url: repo_url,
//     dataType: 'jsonp',
//     success: function(results)
//     {
//         var content = results.data.content;
//         console.log(content);
//     }
// });

// function parse(file) {
// 	var l = new lazy(fs.createReadStream(file));
// 	var dependencies = {}; // mapping assigned name to path
// 	l.lines.forEach(function(element) {
// 		line = element.toString();
// 		var rx2 = /(var)/;
// 		var rx = /(var [_A-Za-z][_A-Za-z0-9]+[ \t]*=[ \t]*require\(["'].+["']\);)/;
// 		//console.log(line);
// 		if (rx2.test(line)) {
// 			array = line.split('=');
// 			module_name = array[0].trim().split(/[ \t]+/)[1];
// 			console.log(module_name);
// 		}
// 	});
// };

//module.exports = parse;