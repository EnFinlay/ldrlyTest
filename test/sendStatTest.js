var http = require("http");

// Fixed list of stat names for populating the db

var statNames = [ "kills", "shots", "deaths", "points", "score", "jumps", "distance", "money", "percentLikeBatman","reputation"];

var counter = 0;

var intervalID = setInterval( function() {
	
	if(counter >= 1000) {
		clearInterval(intervalID);
		return;
	}
	callSendStat("Username"+Math.floor(counter/10),statNames[counter % 10]);
	console.log("Username"+Math.floor(counter/10));
	console.log("StatName: "+counter% 10);
	counter++;
	
},50)

// Modified old call
// TODO: Make appropriate for this use

//callSendStat("Billy","jumps");

function callSendStat(userName,statName) {

	var options = {
		host: 'localhost',
		port: 8000,
		path: '/sendStat',
		method: 'POST',
		headers: { "content-type": 'application/json'}
	};
	
	var req = http.request(options, function(res) {
	  //console.log('STATUS: ' + res.statusCode);
	  //console.log('HEADERS: ' + JSON.stringify(res.headers));
	  res.setEncoding('utf8');
	  var responseData = '';
	  var responseDataJSON = '';
	  res.on('data', function (chunk) {
	  	responseData += chunk.toString();
	    //console.log('BODY: ' + chunk);
	  });
	  
	  res.on('end', function() {
	  	try {
	  		JSONObject = JSON.parse(responseData);
	  	}
	  	catch (e) {
	  		console.log('Parse JSON error: '+e);
	  		return;
	  	}
	  	if (JSONObject.error) {
	  		console.log('Current Rank Error');
	  		return;
	  	}
	  	if (!JSONObject.status || !JSONObject.rank || !JSONObject.prize) {
	  		console.log('Current Rank missing fields');
	  		return;
	  	}
	  	console.log('Okay');
	  });
	});
	
	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
	});
	
	// write data to request body
	
	req.write('{ "userName": "'+userName+'",  "statName": "'+statName+'","statValue": '+Math.floor(Math.random()*100)+'}');
	req.end();
}
	
