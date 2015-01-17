module.exports = function(app){
	'use strict';

	var config = require('../config.js'),
		oauth = require('oauth'),
		sys = require('util'),
		_tumblrConsumerKey = config.TUMBLR_CONSUMER_KEY,
    	_tumblrConsumerSecret = config.TUMBLR_CONSUMER_SECRET,

    	// oauth consumer
    	consumer = function(){
			return new oauth.OAuth(
				'http://www.tumblr.com/oauth/request_token', 
				'http://www.tumblr.com/oauth/access_token', 
				_tumblrConsumerKey, 
				_tumblrConsumerSecret, 
				"1.0A", 
				'http://localhost:3000/tumblr/sessions/callback', 
				"HMAC-SHA1"
			);
    	},
    	
    	// start the oauth process
    	oauthConnect = function(req, res) {
			console.log('/sessions/connect called');
			consumer().getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){ 
				//callback with request token
				if (error) {
					console.log("Error getting OAuth request token");
					res.send("Error getting OAuth request token : " + sys.inspect(error), 500);
				} else { 
					console.log("results>>"+sys.inspect(results));
					console.log("oauthToken>>"+oauthToken);
					console.log("oauthTokenSecret>>"+oauthTokenSecret);

					req.session.oauthRequestToken = oauthToken;
					req.session.oauthRequestTokenSecret = oauthTokenSecret;
					res.redirect("http://www.tumblr.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);    
				}
			});
    	},

    	oauthCallback = function(req, res) {
			console.log("oauthRequestToken>>"+req.session.oauthRequestToken);
			console.log("oauthRequestTokenSecret>>"+req.session.oauthRequestTokenSecret);
			console.log("oauth_verifier>>"+req.query.oauth_verifier);
			consumer().getOAuthAccessToken(
				req.session.oauthRequestToken, 
				req.session.oauthRequestTokenSecret, 
				req.query.oauth_verifier, 
				function(error, oauthAccessToken, oauthAccessTokenSecret, results) { //callback when access_token is ready
					if (error) {
						res.send("Error getting OAuth access token : " + sys.inspect(error), 500);
					} else {
					req.session.oauthAccessToken = oauthAccessToken;
					req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
					console.log("oauthAccessToken>>"+req.session.oauthAccessToken);
					console.log("oauthAccessTokenSecret>>"+req.session.oauthAccessTokenSecret);
					// make an api call using the new auth credentials to make sure they work
					// probably not necessary?
					consumer().get("http://api.tumblr.com/v2/user/info/", 
						req.session.oauthAccessToken, 
						req.session.oauthAccessTokenSecret, 
						function (error, data, response) {  //callback when the data is ready
							if (error) {
								res.send("Error making auth'ed request: " + sys.inspect(error), 500);
							} else {
								console.log(data);
								res.redirect('/');
							}  
					});  
				}
			});
		},

		authRequest = function(req, res, request, queryString) {
			var apiRoot = 'http://api.tumblr.com/v2/';
			console.log(apiRoot + request + queryString);
			console.log(JSON.stringify(req.session));
			consumer().get( apiRoot + request + queryString,
							req.session.oauthAccessToken, 
							req.session.oauthAccessTokenSecret,
							function(error, data, response) {
								if (error) {
									console.log(error);
									res.send(error.statusCode, error.data.meta);
								} else {
									res.set('Content-Type', 'application/json');
									res.send(data);
								} 
							});
		};

		app.get('/tumblr/*', function(req, res){
			var request = req.params[0],
				queryString = req.originalUrl.replace('/tumblr/'+request, '');

			console.log(req.params[0]);
			console.log('queryString: '+queryString);
			// console.log(request === 'sessions/connect');

			if (request === 'sessions/connect') {
				console.log('sessions/connect should call');
				oauthConnect(req, res);
			} else if (request === 'sessions/callback') {
				console.log('sessions/callback should call');
				oauthCallback(req, res);
			} else {
				console.log('authRequest should call');
				authRequest(req, res, request, queryString);
			}

		});
}