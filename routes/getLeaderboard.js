// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// getLeaderboard.js

// Returns a leadboard based off the given stat
// Option to limit the size of the leaderboard with the limit parameter

/*jslint node: true */
"use strict";

var async = require('async');

module.exports = exports = function(req, res){
	// Log the leaderboard request
	// get
	
	// Set up collections for easier use
	var users = req.db.collection('users');
	var stats = req.db.collection('statColl');
	
	async.waterfall([
		function(getLeaderCallback){
			
			if(typeof(req.params.limit) === "undefined") {
				// Limit 0 is the same as having no value at all
				req.params.limit = 0;
			}
			
			var limitInt = parseInt(req.params.limit,10);

			if (isNaN(limitInt)){
				return getLeaderCallback('limitNAN');
			}
			
			var queryObject = { name: req.params.statName };
			var projectionObject = { _id: 0, value : 1, uid: 1 };
			var sortObject = { value: -1 };
			
			// Find all values of statName, get value and uid, sort value DESC, optional limit, store as array
			stats.find(queryObject,projectionObject).sort(sortObject).limit(limitInt).toArray(function(findStatsErr,statArray){
				if(findStatsErr){
					return getLeaderCallback(findStatsErr);
				}
				if(statArray.length === 0){
					return getLeaderCallback("statNotFound");
				}
				
				return getLeaderCallback(null,statArray);
			});
			
		},
		function(statArray,getLeaderCallback){
			
			// create array of UIDs
			var UIDArray = [];
			for(var i = 0; i < statArray.length; i++){
				UIDArray.push(statArray[i].uid);
			}
			
			var findUserNameQuery = { uid: { $in: UIDArray } };
			var findUserNameProj =  { _id: 0, userName: 1, uid: 1};
			
			// Find all usernames that match the UIDs
			users.find(findUserNameQuery,findUserNameProj).toArray(function(findUserNameErr,findUserNameRows){
				if(findUserNameErr){
					return getLeaderCallback(findUserNameErr);
				}
				
				if(findUserNameRows.length === 0){
					return getLeaderCallback("noUserNameRows");
				}
			
				// n^2, bad, don't hire
				// Match UID and usernames
				for(var k = 0 ; k<statArray.length; k++){
					for(var j = 0; j < findUserNameRows.length; j++){
						if(findUserNameRows[j].uid === statArray[k].uid){
							statArray[k].userName = findUserNameRows[j].userName;
							continue;
						}
					}
					statArray[k].rank = k+1;
				}
				return getLeaderCallback(null,statArray);
			});	
		}
	], function(gatherLeaderErr,statArray){
		if(gatherLeaderErr){
			res.writeHead(500, { "Content-Type": "text/html"});
			res.end("There was an error: "+gatherLeaderErr);
			return;
		}
		
		res.writeHead(200, { "Content-Type": "text/html"});
		res.end(JSON.stringify(statArray));
		return;
	});
};
