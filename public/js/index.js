
var text_file = $('#text_file').text();
//$('#text_file').hide();
//console.log('text_file', text_file);

// var parser = PEG.buildParser(grammar);

// result = parser.parse("var fs = require('fs');");
//console.log(result);


//var result = parse("var myAwesomeModule = require('../../core/controllers/myAwesomeModule'); var lane = require('../../lane');" +
//	"function foo() { return 0; } foo();");
//console.log(text_file);
var result = parse(text_file);
console.log(result);
//console.log(text_file);
//console.log("B");
// search(result);




function search(obj) {
	if (typeof obj == 'object') {
		Object.keys(obj).forEach(function(key) {
			search(obj[key]);
		});
	} else if (Object.prototype.toString.call(obj) === '[object Array]') {
		obj.forEach(function(element) {
			search(element);
		});
	} else {
		console.log(obj);
	}
}