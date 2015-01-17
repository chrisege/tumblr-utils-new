'use strict';

var express = require('express'),
	http = require('http'),
	path = require('path'),
	async = require('async'),
	hbs = require('express-hbs'),
	baucis = require('baucis'),
	mongoose = require('mongoose'),
	oauth = require('oauth'),
	config = require('./config.js');

var sys = require('util');
var app = express();

// all environments
app.configure(function(){
  // app.set('port', config.PORT || 80);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.cookieSession({  secret: config.EXPRESS_SESSION_SECRET, cookie: { maxAge: 60 * 60 * 1000 } }));
  app.use(function(req, res, next){
      res.locals.user = req.session.user;
      next();
    });
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

require('./routes/tumblr')(app);

// set logging
// app.use(function(req, res, next){
//   console.log('%s %s', req.method, req.url);
//   next();
// });

// mount static
app.use(express.static( path.join( __dirname, '../app') ));
app.use(express.static( path.join( __dirname, '../.tmp') ));


// route to index.html
app.get('/', function(req, res){
  res.sendfile( path.join( __dirname, '../app/index.html' ) );
});

//http://www.flickr.com/services/api/flickr.photos.search.html
//http://www.tumblr.com/docs/en/api/v2#posting
// Limit 10 results per search. 100 searches per day.
// Can sign up for more at $5 per 1000 queries: https://developers.google.com/custom-search/json-api/v1/overview 
// https://www.googleapis.com/customsearch/v1?q=lore&cx=006384921217615006859%3Ablvjupkjiuu&num=10&searchType=image&key=***
// https://cloud.google.com/console?redirected=true#/project/apps~lordsoflore-666/apiui/api/customsearch/method/search.cse.list
app.listen(parseInt(config.PORT, 10));


