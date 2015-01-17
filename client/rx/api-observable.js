var Rx = require('rx'),
	$ = require('jquery');

var next = 0;

var promise = function(){
	var dfd = new $.Deferred();
	
	url = next > 0 ? '/tumblr/user/dashboard?offset='.next : '/tumblr/user/dashboard';

	$.get(url)
	.done(function(resp){
		console.log(resp);
		dfd.resolve(resp.response.posts);
	});

	return dfd.promise();
};

var apiThing = function(){
    return Rx.Observable.fromPromise(promise());
};


module.exports = apiThing;
