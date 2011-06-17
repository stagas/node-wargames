var path = require('path')
process.title = 'node-wargames';
process.addListener('uncaughtException', function (err, stack) {
	console.log('Caught exception: ' + err);
	console.log(err.stack.split('\n'));
});
var connect = require('connect');
var assetManager = require('connect-assetmanager');
var assetHandler = require('connect-assetmanager-handlers');
var express = require('express');
var assets = assetManager({
	'js': {
		'route': /\/static\/js\/[0-9]+\/.*\.js/
		, 'path': path.join(__dirname, 'public/js/')
		, 'dataType': 'js'
		, 'files': [
			'http://code.jquery.com/jquery-latest.js'
			, 'http://cdn.socket.io/stable/socket.io.js'
			, 'raphael.js'
			, 'map.js'
			, 'jquery.wargames.js'
		]
		, 'preManipulate': {
			'^': [
				function (file, path, index, isLast, callback) {
					if (path.match(/jquery.wargames/)) {
						callback(file.replace(/'#socketIoPort#'/, port));
					} else {
						callback(file);
					}
				}
			]
		}
	}, 'css': {
		'route': /\/static\/css\/[0-9]+\/.*\.css/
		, 'path': path.join(__dirname, 'public/css/')
		, 'dataType': 'css'
		, 'files': [
			'wargames.css'
		]
	}
});

var port = process.env.POLLA_PORT || 8585;
var app = module.exports = express.createServer();

app.configure(function() {
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, 'views'));
});

app.configure(function() {
  app.use(function(req, res, next) {
    req.headers['x-real-ip'] = req.headers['x-real-ip'] || req.headers.ip || req.connection.remoteAddress
    next()
  })
	app.use(connect.logger({ format: ':req[x-real-ip]\t:status\t:method\t:url\t' }));
	app.use(assets);
	app.use(connect.static(path.join(__dirname, 'public')));
});

app.dynamicHelpers({
	'cacheTimeStamps': function(req, res) {
		return assets.cacheTimestamps;
	}
});
app.get(/.*/, function(req, res) {
	res.render('layout');
});

app.listen(port, process.env.POLLA_HOST || 'localhost');

var Wargames = require(path.join(__dirname, 'lib/wargames'));
new Wargames(app, {
	ircNetwork: 'global.irc.gr'
	, ircChannel: '#hellas'
	, ircBotNick: 'MrWarGames'
	, ircUserName: 'MrWarGames'
	, ircRealName: 'MrWarGames'
  , ircPort: 6667
	, cachePath: path.join(__dirname, 'cache.json')
}, process.env.POLLA_HOST || 'localhost');