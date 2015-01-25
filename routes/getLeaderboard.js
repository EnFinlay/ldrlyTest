// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// getLeaderboard.js

// Returns a leadboard based off the given stat
// Option to limit the size of the leaderboard with the limit parameter

/*jslint node: true */
"use strict";

module.exports = exports = function(req, res){
	// Log the leaderboard request
	// get
	
	// Set up collections for easier use
	var users = req.db.collection('users');
	var stats = req.db.collection('statColl');
	
	var sort = { value: -1 };
	
	if(typeof(req.params.limit) === "undefined") {
		// Limit 0 is the same as having no value at all
		req.params.limit = 0;
	}
	
	// Find all values of statName, get value and uid, sort value DESC, optional limit, store as array
	stats.find({ name: req.params.statName}, { _id: 0, value : 1, uid: 1 }).sort({ value: -1}).limit(parseInt(req.params.limit,10)).toArray(function(err,dbResponse){
		if(err){
			throw err;
		}
		
		// debugging TODO remove
		console.log(JSON.stringify(dbResponse));

		// Create array of UIDs
		var UIDArray = [];
		for(var i = 0; i < dbResponse.length; i++){
			UIDArray.push(dbResponse[i].uid);
		}
		
		// Find all usernames that match the UIDs
		users.find({ uid: { $in: UIDArray } }, { _id: 0, userName: 1, uid: 1}).toArray(function(err,rows){
			if(err){
				throw err;
			}
			
			// n^2 yo!
			// Match UID and usernames
			// Looking for better way of doing this, obviously
			for(var k = 0 ; k<dbResponse.length; k++){
				for(var j = 0; j < rows.length; j++){
					if(rows[j].uid === dbResponse[k].uid){
						dbResponse[k].userName = rows[j].userName;
						continue;
					}
				}
				dbResponse[k].rank = k+1;
			}
			
			console.log(JSON.stringify(dbResponse));
			
			res.writeHead(200, { "Content-Type": "text/html"});
			res.end(JSON.stringify(dbResponse));
			
		});
		
		
	});
}