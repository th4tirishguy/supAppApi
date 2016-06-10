// BASE SETUP
// ==================================================

// LOAD PACKAGES
var express = require('express');			//load express
var app = express();						//define our app using express
var bodyParser = require('body-parser');	//load body-parser
var morgan = require('morgan');				//load morgan
var mongoose = require('mongoose');			//load mongoose

var jwt = require('jsonwebtoken');			//load jonswebtoken
var config = require('./config');			//load the config.js file
var User = require('./models/user');	//load the User model

// CONFIGURATION
// ==================================================

//connect to database
mongoose.connect(config.database);

//set secret variable
app.set('superSecret', config.secret);

//Configure the app to use bodyParser()
//Used to get data from POST requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//configure the port
var port = process.env.PORT || 8000

//use morgan to log requests to the console
app.use(morgan('dev'));

// DEFINE ROUTES FOR API
// ==================================================

var router = express.Router();				//get an instance of the express router

// Route to signup a new user
// Uses plaintext password with no hashing

router.post('/signup', function(req, res) {
	if (req.body.name && req.body.password) {
		User.findOne({
		name: req.body.name
		}, function(err, user) { //Check that the name provided is unique
			if (!user) {
				var user = new User({
				name: req.body.name,
				password: req.body.password,
				admin: false
				});

				user.save(function(err) {
					if (err) throw err;

					console.log('User: ' + req.body.name + ' saved to database');
					res.json({ success: true, message: 'User saved'});
				});
			}
			else {
				res.json({ success: false, message: "Name is taken"});
			}
		});
	}
	else {
		res.json({ success: false, message: "Name and Password cannot be blank"});
	}
})

// Route to authenticate a user through POST request
// Must be above the middleware which verifys the token
router.post('/authenticate', function(req, res) {

	// find the user
	User.findOne({
		name: req.body.name
	}, function(err, user) {
		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found'});
		}
		else if (user) {
			// check if passwords match
			if (user.password != req.body.password) {
				res.json({ success: false, message: 'Authentication failed. Password is incorrect'});
			}
			else {
				//if user is found and passwords match
				//create token
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresIn: "24h" // expires in 24 hours
				});

				// return the information including token as JSON
				res.json({
					success: true,
					message: 'Authentication successful.',
					token: token
				});
			}
		}
	});
});

// Route Middleware to verify the token
router.use(function(req, res, next) {
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	//decode token
	if (token) {
		//verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'), function(err, decoded) {
			if (err) {
				return res.json({ success: false, message: "Failed to authenticate token!"});
			}
			else {
				//If the token is authenticated, save to request to use in other routes
				req.decoded = decoded;
				console.log(decoded);
				next();
			}
		});
	}
	else {
		//If there is no token
		//Return an error
		return res.status(403).send({
			success: false,
			message: "Must be authenticated to access protected route"
		});
	}
});

//Test route to verify everything is set up correctly
router.get('/', function(req, res) {
	res.json({message: 'hooray! welcome to the api!'});
});

// Route that returns all users as json object
router.get('/users', function(req, res) {
	User.find({}, function(err, users) {
		res.json(users);
	});
});

//Route to add a user as a friend
router.get('/add/:name', function(req, res) {
	User.findOne({name: req.decoded._doc.name}, function(err, user) {
		if (err) throw err;
		//console.log(req.decoded._doc.name);
		User.findOne({name: req.params.name}, function(err, friend) {
			if (err) {
				return res.json({success: false, message: 'User not found'});
			}
			else {
				//console.log(user.name);
				//console.log(friend.name)
				user.addFriend(friend);
				//console.log(user.friends.findOne({name: friend.name}));
				//console.log(user.friends.indexOf(friend._id));
			}
		});
	});
	res.json({message: 'ggg'});
});

// Route used to create a sample user in the database
// router.get('/setup', function(req, res) {
// 	//create the sample user
	
// 	var user = new User({
// 		name: "test user",
// 		password: "testpassword1",
// 		admin: true
// 	});

// 	//save the user
// 	user.save(function(err) {
// 		if (err) throw err;

// 		console.log('User saved succrssfully');
// 		res.json({ success: true });
// 	});
// });

//More routes will go here

// REGISTER THE ROUTES WITH THE APP
// ==================================================

//All routes from 'router' will have the prefix 'api'
app.use('/api', router);

// START THE SERVER
//===================================================
app.listen(port)
console.log('Server running on port: ' + port);