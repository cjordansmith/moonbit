var express = require('express');
var request = require("sync-request");
var url = require("url");
var qs = require("qs");
var querystring = require('querystring');
var cons = require('consolidate');
var randomstring = require("randomstring");
var __ = require('underscore');
__.string = require('underscore.string');

// Create our app
var app = express();

app.engine('html', cons.underscore);
app.set('view engine', 'html');
app.set('views', 'public');

// authorization server information
var authServer = {
	authorizationEndpoint: 'https://www.fitbit.com/oauth2/authorize',
	tokenEndpoint: 'https://api.fitbit.com/oauth2/token'
};

// client information
var client = {
	"client_id": "22846M",
	"client_secret": "14f10fcb0e6b142bcc54260fdb1452ee",
	"redirect_uris": ["http://localhost:9000/callback"]
};

var protectedResource = 'https://api.fitbit.com/1/user/-/profile.json';

var state = null;

var access_token = null;
var scope = 'profile activity';

//
// homepage of the my application
// contains one button that sends user to /authorize
// contains one button that fetches the protected resource
//
app.get('/', function (req, res) {
	res.render('index', {access_token: access_token, scope: scope});
});


//
// send an HTTP redirect to the user's browser
// which will send thenm to the authorization endpoint
//
app.get('/authorize', function(req, res){

	access_token = null;

	state = randomstring.generate();

	var authorizeUrl = buildUrl(authServer.authorizationEndpoint, {
		response_type: 'code',
		client_id: client.client_id,
		scope: scope,
		redirect_uri: client.redirect_uris[0],
		expires_in: '2000',
		state: state
	});

	console.log("redirect", authorizeUrl);


	res.redirect(authorizeUrl);

});


//
// where the user will be redirected back to the client application with the AUTH code
// look at the input parameters and read back the AUTH code from the AUTH server in the CODE parameter
//
app.get('/callback', function(req, res){

	if (req.query.error) {
		// it's an error response, act accordingly
		res.render('error', {error: req.query.error});
		return;
	}

	// check the 'state' value that's passed in to the 'redirect_uri'
	// compare it to our saved value from earlier
	if (req.query.state != state) {
		console.log('State DOES NOT MATCH: expected %s got %s', state, req.query.state);
		res.render('error', {error: 'State value did not match'});
		return;
	}

	// read back the AUTH code in code form
	var code = req.query.code;

	// take this AUTH code and send it directly to the token endpoint using an HTTP POST
	var form_data = qs.stringify({
		grant_type: 'authorization_code',
		code: code,
		redirect_uri: client.redirect_uris[0]
	});

	// send a few headers to tell the server that this is an HTTP form-encoded request
	// authenticate our client using HTTP Basic
	var headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'Authorization': 'Basic ' + encodeClientCredentials(client.client_id, client.client_secret)
	};

	// wire in the headers and the form_data POST request
	// send to the server's authorization endpoint
	var tokRes = request('POST', authServer.tokenEndpoint, {
			body: form_data,
			headers: headers
	});

	console.log('Requesting access token for code %s',code);

	if (tokRes.statusCode >= 200 && tokRes.statusCode < 300) {

		// application reads the result of the POST request and parse the JSON object
		// to retrieve the access token value
		var body = JSON.parse(tokRes.getBody());

		// client saves this token to use for later
		access_token = body.access_token;

		console.log('Got access token: %s', access_token);

		res.render('index', {access_token: body.access_token, scope: scope});
	} else {
		res.render('error', {error: 'Unable to fetch access token, server response: ' + tokRes.statusCode})
	}
});


//
// make a call to the protected resource and include the access token in on of the three valid locations
// our client will send the token in the Authroization HTTP header
//
app.get('/fetch_resource', function(req, res) {

	// make sure we have an access token
	if (!access_token) {
		res.render('error', {error: 'Missing Access Token'});
		return;
	}

	console.log('Making request with access token %s', access_token);

	// send the token using the OAuth-defined Authorization: Bearer header
	// with the token as the value of the header
	var headers = {
		'Authorization': 'Bearer ' + access_token
	};

	var resource = request('POST', protectedResource,
		{headers: headers}
	);

	// if successful, parse the returned JSON and hand it to our data template
	if (resource.statusCode >= 200 && resource.statusCode < 300) {

		var body = JSON.parse(resource.getBody());

		console.log("User Name:", body.user.fullName);
		console.log("Age:", body.user.age);
		console.log("Gender:", body.user.gender);
		console.log("Daily Steps:", body.user.averageDailySteps);

		res.render('data', {resource: body});
		return;
	} else {

		access_token = null;

		res.render('error', {error: resource.statusCode});

		return;
	}
});


//
// build the URL to send the user to the servers authoriation endpoint
// include all appropriate query parameters on that URL
//
var buildUrl = function(base, options, hash) {
	var newUrl = url.parse(base, true);
	delete newUrl.search;
	if (!newUrl.query) {
		newUrl.query = {};
	}
	__.each(options, function(value, key, list) {
		newUrl.query[key] = value;
	});
	if (hash) {
		newUrl.hash = hash;
	}

	return url.format(newUrl);
};

var encodeClientCredentials = function(clientId, clientSecret) {
	return new Buffer(querystring.escape(clientId) + ':' + querystring.escape(clientSecret)).toString('base64');
};










app.use(express.static('public'));

var server = app.listen(9000, 'localhost', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('OAuth Client is listening at http://%s:%s', host, port);
});
