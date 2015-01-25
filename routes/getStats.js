// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// getStats.js

// GET - given a username, return all stats submitted for the given user

/*jslint node: true */
"use strict";

module.exports = exports = function(req, res){

	var users = req.db.collection('users');
	
	// Check if the userName exists in the system, if no, return error, if yes, use uid to get all stats
	users.findOne({ userName: req.params.userName},function(err,dbResponse){
		if(err){
			throw err;
		}
		
		// debugging, remove
		console.log(dbResponse);
		console.log(typeof(dbResponse));
		
		if (dbResponse ===  null) {
			res.writeHead(200, {"Content-Type": "text/html"});
			res.end("Username not found");
			return;
		} else {
			var stats = req.db.collection('statColl');
			
			// find all stats for username
			stats.find({ uid: dbResponse.uid},{ _id: 0, name: 1, value: 1}).toArray(function(err,response){
				if (err){
					throw err;
				}
				
				// return them
				res.writeHead(200, { "Content-Type": "text/html"});
				res.end(JSON.stringify(response));
			})
		}		
		
		
		
	});
	
}