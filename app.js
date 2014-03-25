
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// database mySQL
var mysql = require('mysql');

// passport.js and passport-local.js
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

// passport configuration
app.use( express.cookieParser() );
app.use(express.session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'views')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/helloworld', function(request, response) {
	//response.send("First time");
	response.sendfile("views/main.html");
});
app.get('/users', user.list);

// test node-mysql : database connection
app.get('/database', function(request, response) {
	//connection.connect();
	var connection = mysql.createConnection({
	user     : 'root',
	password : '123456',
	database : 'company'
	});

	connection.query('SELECT * FROM customer', function(err, rows, fields) {
  		if (err) console.log(err);

		result = '';
		for (var i = 0; i < rows.length; ++i) {
	  		console.log('The username[' + i + '] is: ', rows[i].username);
			console.log('The password[' + i + '] is: ', rows[i].password);

			result = result + rows[i].username + ' ' + rows[i].password;
			result = result + "\n\n"; //Tai sao no khong xuong dong???
		}
		response.send(result);
	});
	connection.end();

	//response.send(connection.rows[0].username);
});

app.get('/', function(request, response){
	response.sendfile('views/index.html');
});

// Test supervisor installation
app.get('/test', function(request, response){
response.send("success");
});

// Test login using passport.js and passport-local.js
passport.serializeUser(function(user, done) {
    console.log("Serializing");
    	done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log("Deserializing");
    	done(null, obj);
});

passport.use(new LocalStrategy(
	function(username, password, done) {
		// Check username va password co valid khong
    	// thuong thi nguoi ta se database o day roi deal voi no
    	// Trung's code sample
        /*
        console.log("Trying to login with " + username + " - " + password);
    	if (username == "danh" && password == "123456")
      		return done(null, {username:"danh" });  
    	else return done(null, false, { message: 'Incorrect login info.' });*/
 	
   		var connection = mysql.createConnection({
			user     : 'root',
			password : '123456',
			database : 'company'
			});
		
		connection.query('SELECT * FROM customer', function(err, rows, fields) {
	  		if (err) console.log(err);

			//console.log("Trying to login with " + username + " - " + password);
	  		
			var found = false;

			for (var i = 0; i < rows.length; ++i) {
				//console.log('The username[' + i + '] is: ', rows[i].username);
				//console.log('The password[' + i + '] is: ', rows[i].password);

				if (username == rows[i].username && password == rows[i].password) {
					found = true;
					break;
				}
			}

			if (found) {
				return done(null, { username: username, password: password });
			}
			else {
				return done(null, false, { message: 'Invalid username or password' });	
			}
		});
		connection.end();
  	}
));

app.post('/signin',
  	passport.authenticate('local', {	successRedirect: '/ejstest',
                                   		failureRedirect: '/invalid',
                                   		failureFlash: false //true
                                   	})
);

// Tests ejs 
app.get('/ejstest', function(request, response) {
    response.render('index.ejs', { data: request.user });
});

app.get('/invalid', function(request, response) {
	// All wrong
	//response.send(request.info);
	//response.send(request.info.authInfo);
	//response.send(request.flash('error'));

	response.send("Invalid username or password");
});

app.get('/checklogin', function(request, response){
    //console.log(request);
    if (request.user)
        response.send("You are logged in yeah");
    else response.send("You are not yet logged in");
});

// Registration form
app.get('/register', function(request, response) {
	response.sendfile("views/registration.html");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

