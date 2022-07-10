const express = require("express");
const router = express.Router();
const db = require("../db")
const { check, validationResult } = require("express-validator");

var validate = [ //validation and sanitation
	check('login_username', 'Enter valid Username Address').isLength({min: 3}).exists().trim().escape(),
	check('login_password').isLength({ min: 8 }).trim().escape()
	.withMessage('Enter valid password')
];
router.post('/', validate, function(req, res, next) {
	var login_username = req.body.login_username;
	var login_password = req.body.login_password;
	const errors = validationResult(req);
	if(!errors.isEmpty()){  //if there is a validation error
		res.status(400).json({errors : errors.array() })
	}

	else {  //no validation error
		
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
