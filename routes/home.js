var express = require("express");
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var ensureAuthenticated = require("../auth/auth").ensureAuthenticated;
var router = express.Router();
var Post = require("../models/post");
var multer = require("multer");
var crypto = require("crypto");
var ObjectId = require("mongoose").Types.ObjectId;

var storage = multer.diskStorage({
   destination:'./uploads/images',
   filename: function(req, file, cb){
      //crypto.pseudoRandomBytes(16, function(err, raw){ raw.toString('hex')
         cb(null,file.fieldname  + Date.now() + path.extname(file.originalname));
      //});
   }
});

var upload = multer({storage:storage});

router.get("/", function (req, res) {
   // console.log("hello I'm on the start page");
   res.render("main");
   //res.sendFile(path.join(__dirname,"../public/main.html"));
});

router.get("/home",ensureAuthenticated, function (req, res) {
   User.findById(req.user._id, function(err, user){
      if(err){ console.log(err); }
      else
      {
         Post.find({}).exec(function(err, homeposts){
            if(err){ console.log(err); }
      
            res.render("home", {homeposts:homeposts,user:user});
         });
      }
   });
   
  
   //res.sendFile(path.join(__dirname,"../public/home.html"));
});

router.get("/message",ensureAuthenticated, function(req, res){
   res.render("message");
});

router.get("/profile",ensureAuthenticated,async function (req, res) {
   User.findById(req.user._id, function(err, user){
      if(err){ console.log(err); }
      else
      {
         Post.find({userID:req.user._id}).exec(function(err, posts){
            if(err){console.log(err);}
      
            res.render("profile", {posts:posts,user:user});
         });
      }
   });
 });

router.get("/login", function (req, res){
  res.render("login");
  //res.sendFile(path.join(__dirname,"../public/login.html"));
})

router.post("/add",upload.single('image'), function(req, res){
var name;
User.findById(req.user._id, function(err, user){
   if(err){ console.log(err); }
   else{

      var newPost = new Post({
         content : req.body.content,
         userID : req.user._id,
         image : req.file.path,
         username : user.username,
      });
   
      newPost.save(function(err, post){
         if(err){console.log(err);}
         res.redirect("/home");
      });
      console.log(newPost);
      
   }
});

});

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
   var currentYear = new Date().getFullYear()

   if(passout>currentYear)
   {
      var isAlumni = false;
   }
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
         isAlumni : isAlumni,
      });

      newUser.save(next);

   });

}, passport.authenticate("signup", {
   successRedirect: "/login",
   failureRedirect: "/login",
   failureFlash: true
}));

module.exports = router;
