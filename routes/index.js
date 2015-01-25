// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// index.js

// Lists valid paths
// 3 functions implemented
// sendStat - POSTS new stat information
// getLeaderboard - GET
//		one required parameter (statName)
//		one optional parameter (limit)
// getStats - GET
//		one required parameter (userName)

/*jslint node: true */
"use strict";

var sendStat = require('./sendStat');
var getLeaderboard = require('./getLeaderboard');
var getStats = require('./getStats');

module.exports = exports = function(app){
	
	app.post('/sendStat', sendStat);
	
	app.get('/getLeaderboard/:statName/:limit',getLeaderboard);
	app.get('/getLeaderboard/:statName',getLeaderboard);
	app.get('/getStats/:userName',getStats);
	
	app.get('*', function (req, res) {
		res.writeHead(404,{ "Content-Type": "text/html"});
		res.send('Invalid path, please try again')
	});
}