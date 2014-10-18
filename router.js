var express = require('express');

var router = new express.Router();

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/visualize', function(req, res) {
	res.render('visualize');
});

module.exports = router;