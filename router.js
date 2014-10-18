var express = require('express');
var parseCtrl = require('./parse');

var router = new express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/visualize', function(req, res) {
	res.render('visualize');
});

router.post('/parse', parseCtrl.buildGraf);

module.exports = router;