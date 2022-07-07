const express = require("express");
const router = express.Router();
const db = require("../db")



router.post('/', function(req, res, next) {
	//input fields
	var login_username = req.body.login_username;
	var login_password = req.body.login_password;

	if (login_username && login_password) {
		
		db.query('SELECT * FROM users WHERE username = ? AND password = ?', [login_username, login_password], function(error, results, fields) {
			// output error
			if (error) throw error;
			// If the account exists
			if (results.length > 0) {
				// Authenticate the user
				    req.session.loggedin = true;
				    req.session.username = login_username;
				// Redirect to home page
				res.redirect('auth/home');
			} else {
				res.send('Incorrect Username and/or Password!');
			}			
			res.end();
		});
	} else {
		res.send('Please enter Username and Password!');
		res.end();
	}
});

//home
router.get('/home', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

module.exports = router;
