// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// sendStat.js

// POST only since every call is for a new stat, not for modifying old stats
// The implementation uses upsert because at this point there's no need to
// keep the old stat, since we don't want repeats in the leaderboard

// Feels overloaded because of the user creation

/*jslint node: true */
"use strict";

var async = require('async');

module.exports = exports = function(req, res){
	
	var users = req.db.collection('users');
	var statColl = req.db.collection('statColl');
	
	async.waterfall([
		function(sendStatWaterCall){
			console.log('sendStat Waterfall - about to call checkForUser');
			checkForUser(users,req.body.userName,sendStatWaterCall);
			
		},
		function(user,sendStatWaterCall) {
			if(user === null){
				insertUser(req.db,users,statColl,req.body.userName,req.body,sendStatWaterCall);
			} else {
				upsertStat(req.body,user.uid,statColl,sendStatWaterCall);
			}
		}
	],function(waterfallErr) {
		if(waterfallErr){
			console.log('There was an error in the waterfall: '+waterfallErr);
			res.writeHead(500, { "Content-Type": "text/html"});
			res.end("There was an error that looked like: "+waterfallErr);
			return;
		}
		console.log('All went well with sendStat');
		res.writeHead(200, { "Content-Type": "text/html"});
		res.end('{ "status": "success"}');
	});
};

function checkForUser(users,userName,sendStatWaterCall){
	var findUserQuery = { userName: userName };
	var findUserProjection = { uid: 1, _id: 0 };
	
	users.findOne(findUserQuery,findUserProjection,function(findErr,user){
		if(findErr){
			return sendStatWaterCall(findErr);
		}
		if(findErr){
			return sendStatWaterCall("userNotFound");
		}
		return sendStatWaterCall(null,user);
	});
}

function insertUser(db,users,statColl,userName,body,callback){
	// Get new userID
	getNextUID(db,function(err,uid) {
	
		// Insert the new user, with new userID (uid) into the users collection
		users.insert({ userName: userName, uid: uid },function(insertUserErr) {
			if(insertUserErr){
				return callback(insertUserErr);
			}
			
			// Insert because if the user hasn't been created, there is no chance of the stat already being in the system, if only the API calls have been used
			statColl.insert({ name: body.statName, value: body.statValue, uid: uid, created_at: new Date() }, function(insertStatErr) {
				if(insertStatErr){
					return callback(insertUserErr);
				}
				
				return callback();
				
			});
		});
	});
}

function upsertStat(body,uid,statColl,callback){
	var setObject = { value: body.statValue, created_at: new Date() };
	
	// Upsert the new stat, in case the given user alredy has data for that value
	statColl.update({ uid: uid, name: body.statName},{ $set: setObject }, { upsert: true },function(upsertErr) {
		if(upsertErr){
			return callback(upsertErr);
		}
		return callback();
	});
}

// Code lifted straight from
// http://docs.mongodb.org/manual/tutorial/create-an-auto-incrementing-field/
 
function getNextUID(db,callback) {
	db.collection('counters').findAndModify( { _id: "uid" }, {}, { $inc: { seq: 1 } }, { new: true }, function(err,ret) {
		callback(err,ret.seq);
	});
}