const express = require("express");
const router = express.Router();
const db = require("../db")

router.post('/', function(req,res){
	// let email = req.body.email;
	// let password = req.body.password;
	// const errors = validationResult(req);
	// if(!errors.isEmpty()){
	// 	return res.status(400).json({ errors: errors.array() })
	// }
      db.query('INSERT INTO users(username,fullname,email,mobile,dob,dept,passout,password) VALUES(?,?,?,?,?,?,?,?)', [req.body.username, req.body.fullname, req.body.email, req.body.mobile, req.body.dob, req.body.dept, req.body.passout, req.body.password], function(err) {
        if (err) {
          return console.log(err.message);
        }
        console.log("New User is Added");
        res.send("New user has been added into the database with ID = "+req.body.username+ " and Name = "+req.body.fullname);
      });
  });

  module.exports = router;
