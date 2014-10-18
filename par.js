var PEG = require("cdnjs.cloudflare.com/ajax/libs/pegjs/0.7.0/peg.min.js");

var art = require("arithmetic.pegjs");

var parser = PEG.buildParser(art);

result = parser.parse("2*3+4");
console.log(result);
