// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// sendStat.js

// POST only since every call is for a new stat, not for modifying old stats
// The implementation uses upsert because at this point there's no need to
// keep the old stat, since we don't want repeats in the leaderboard

// Feels overloaded because of the user creation

// TODO: async
// TODO: findOne instead of find on user
// TODO: logging
// TODO: decide on error handling and success response

/*jslint node: true */
"use strict";

module.exports = exports = function(req, res){
	
	var users = req.db.collection('users');
	var statColl = req.db.collection('statColl');
	
	var findUserQuery = { userName: req.body.userName };
	var findUserProjection = { uid: 1, _id: 0 };
	
	users.find(findUserQuery,findUserProjection).toArray(function(findErr,findUserArray){
		if(findErr){
			throw findErr;
		}
		
		if(findUserArray.length === 0){
			
			// Get new userID
			getNextUID(req.db,function(err,uid) {
			
				// Inser the new user, with new userID (uid) into the users collection
				users.insert({ userName: req.body.userName, uid: uid },function(insertUserErr) {
					if(insertUserErr){
						throw insertUserErr;
					}
					
					// Insert because if the user hasn't been created, there is no chance of the stat already being in the system, if only the API calls have been used
					statColl.insert({ name: req.body.statName, value: req.body.statValue, uid: uid, created_at: new Date() }, function(err) {
						if(err){
							throw err;
						}
						res.writeHead(200, { "Content-Type": "text/html"});
						res.end("Damn that went well");
						
					});
				});
			});
		} else {
				
			var setObject = { value: req.body.statValue, created_at: new Date() };
			
			// Upsert the new stat, in case the given user alredy has data for that value
			statColl.update({ uid: findUserArray[0].uid, name: req.body.statName},{ $set: setObject }, { upsert: true },function(err) {
				if(err){
					throw err;
				}
				res.writeHead(200, { "Content-Type": "text/html"});
				res.end("Damn that went well");
			});
		}
	});

	
};


// Code lifted straight from
// http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
 
function getNextUID(db,callback) {
	db.collection('counters').findAndModify( { _id: "uid" }, {}, { $inc: { seq: 1 } }, { new: true }, function(err,ret) {
		console.log(JSON.stringify(err));
		console.log(JSON.stringify(ret));
		console.log(ret);
		callback(err,ret.seq);
	});
}