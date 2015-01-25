// Jan 24, 2015, Eric Finlay, LDRLY RESTful Server Test

// app.js

// Core file that creates the server and mongoDB connection
// Server is on Port 8000
// Uses bodyParser.json for POST JSON requests
// Includes the db connection as part of the request

/*jslint node: true */
"use strict";

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	MongoClient = require('mongodb').MongoClient,
	bunyan = require('bunyan'),
	routes = require('./routes');
	
// DB name: ldrlyTest
var url = 'mongodb://localhost:27017/ldrlyTest';

// One connection to rule them all 
MongoClient.connect(url, function(err,db){
	if (err) {
		console.log(err);
		// log error
		// return
	};
	
	app.use( bodyParser.json() ); 
	
	app.use(function(req,res,next){
	    req.db = db;
	    next();
	});

	// Points to routes/index.js, lists valid paths
	routes(app);
	
	app.listen(8000);
	// log server started

});

