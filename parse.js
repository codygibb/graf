var lazy = require('lazy');
var fs = require('fs');
var when = require('when');
var node_fn = require('when/node');
var request = require('request');
var requestP = node_fn.lift(request);
var curl = require('node-curl');
var unzip = require('unzip');
var http = require('http');
var AdmZip = require('adm-zip');
var mkdirp = require('mkdirp');
var BufferJoiner = require('bufferjoiner');


// var GitHubApi = require('github');

var testUrl = 'https://github.com/codygibb/code-cache';

var tempZipFilePath = './tmp/' + new Date().getTime() + Math.random();

request({
	url: testUrl + '/archive/master.zip',
	method: 'GET'
})
.pipe(unzip.Parse())
.on('entry', function (entry) {
    var fileName = entry.path;
    var type = entry.type; // 'Directory' or 'File'
    var size = entry.size;
    // console.log(fileName, type, size);
    if (fileName.slice(-3) == '.js') {
    	// var bf = new BufferJoiner();
    	var data = '';
    	entry.on('data', function(chunk) {
    		// bf.add(new Buffer(chunk));
    		data += chunk;
    	});
    	entry.on('end', function() {
    		console.log(data);
    		// console.log(bf);
    	});
      // entry.pipe(fs.createWriteStream('output/path'));
    } else {
      entry.autodrain();
    }
  });

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