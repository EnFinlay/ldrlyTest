/*jslint node: true */
"use strict";

var http = require("http");

// Fixed list of stat names for populating the db

var statNames = [ "kills", "shots", "deaths", "points", "score", "jumps", "distance", "money", "percentLikeBatman","reputation"];

var counter = 0;

// Generate usernames and stats with 50 ms delay to prevent UID collision

//var intervalID = setInterval( function() {
//	
//	if(counter >= 1000) {
//		clearInterval(intervalID);
//		return;
//	}
//	
//	callSendStat("Username"+Math.floor(counter/10),statNames[counter % 10]);
//	console.log("Username"+Math.floor(counter/10));
//	console.log("StatName: "+counter% 10);
//	counter++;
//	
//},100);

//Uncomment to test one entry
callSendStat("Billy","jumps");

function callSendStat(userName,statName) {

	var options = {
		host: '54.218.186.53',
		port: 8080,
		path: '/sendStat',
		method: 'POST',
		headers: { "content-type": 'application/json'}
	};
	
	var req = http.request(options, function(res) {
		
		res.setEncoding('utf8');
		var responseData = '';

		res.on('data', function (chunk) {
			responseData += chunk.toString();
		});

		res.on('end', function() {
			console.log(responseData);
		});
	});
	
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	var requestBody = { userName: userName,
		statName: statName,
		statValue: Math.floor(Math.random()*100) 
	};
	
	req.write(JSON.stringify(requestBody));
	req.end();
}
	
