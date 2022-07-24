var express = require("express");
var passport = require("passport");
var path = require("path");
var User = require("../models/user");

var router = express.Router();


router.get("/", function (req, res) {
   // console.log("hello I'm on the start page");
   res.sendFile(path.join(__dirname,"../public/main.html"));
});

router.get("/home", function (req, res) {
   res.sendFile(path.join(__dirname,"../public/home.html"));
});

router.get("/login", function (req, res){
  res.sendFile(path.join(__dirname,"../public/login.html"));
})


router.post("/login", passport.authenticate("login", {
   successRedirect: "/home",
   failureRedirect: "/login",
   failureFlash: true
}));


router.post("/signup", function (req, res, next) {
   var username = req.body.username;
   var email = req.body.email;
   var password = req.body.password;
   var fullname = req.body.fullname;
   var dob = req.body.dob;
   var passout = req.body.passout;
   var dept = req.body.dept;
   var mobile = req.body.mobile;

   User.findOne({ email: email }, function (err, user) {
      if (err) { return next(err); }
      if (user) {
         req.flash("error", "There's already an account with this email");
         return res.redirect("/signup");
      }

      var newUser = new User({
         username: username,
         password: password,
         email: email,
         fullname : fullname,
         mobile : mobile,
         dept : dept,
         dob : dob,
         passout : passout,
      });

      newUser.save(next);

   });

}, passport.authenticate("signup", {
   successRedirect: "/",
   failureRedirect: "/signup",
   failureFlash: true
}));

module.exports = router;
