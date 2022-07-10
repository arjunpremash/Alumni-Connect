const express = require("express");
const router = express.Router();
const db = require("../db")
const { check, validationResult } = require('express-validator');
const { format } = require("../db");

var validate = [ //validation and sanitation
	check('email', 'Enter valid Email Address').isEmail().normalizeEmail(),
  check('username', 'Enter valid Username Address').isLength({min: 3}).exists().trim().escape(),
	check('password').isLength({ min: 8 }).trim().escape()
	.withMessage('Password Must Be at Least 8 Characters')
	.matches('[0-9]').withMessage('Password Must Contain a Number')
	.matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter')
];

router.post('/', validate, function(req,res){
	// let email = req.body.email;
	// let password = req.body.password;
	const errors = validationResult(req);
	if(!errors.isEmpty()){
	 	return res.status(400).json({ errors: errors.array() })
	}
  else{
      db.query('INSERT INTO users(username,fullname,email,mobile,dob,dept,passout,password) VALUES(?,?,?,?,?,?,?,?)', [req.body.username, req.body.fullname, req.body.email, req.body.mobile, req.body.dob, req.body.dept, req.body.passout, req.body.password], function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New User is Added");
        res.send("New user has been added into the database with ID = "+req.body.username+ " and Name = "+req.body.fullname);
      });
  }
  });

  module.exports = router;
