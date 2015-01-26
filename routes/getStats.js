// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// getStats.js

// GET - given a username, return all stats submitted for the given user

/*jslint node: true */
"use strict";

var async = require('async');

module.exports = exports = function(req, res){

	var users = req.db.collection('users');
	
	// Check if the userName exists in the system, if no, return error, if yes, use uid to get all stats
	async.waterfall([
		function(getStatsCallback){
			users.findOne({ userName: req.params.userName},function(getUIDErr,getUID){
				if(getUIDErr){
					return getStatsCallback(getUIDErr);
				}
				if(getUID === null){
					return getStatsCallback("userNotFound");
				}
				return getStatsCallback(null,getUID.uid);
			});
				
		}, function(uid,getStatsCallback){
			
			var stats = req.db.collection('statColl');
			
			stats.find({ uid: uid},{ _id: 0, name: 1, value: 1}).toArray(function(allStatsErr,allStats){
				if (allStatsErr){
					return getStatsCallback(allStatsErr);
				}
				return getStatsCallback(null,allStats);
			});
		}
	], function(getStatWaterErr,allStats){
		if(getStatWaterErr){
			res.writeHead(500, { "Content-Type": "text/html"});
			res.end("There was an error: "+getStatWaterErr);
			return;
		}
		
		res.writeHead(200, { "Content-Type": "text/html"});
		res.end(JSON.stringify(allStats));
	});
};