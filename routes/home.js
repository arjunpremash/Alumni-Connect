var express = require("express");
var passport = require("passport");
var path = require("path");
var User = require("../models/user");
var ensureAuthenticated = require("../auth/auth").ensureAuthenticated;
var router = express.Router();
var Post = require("../models/post");
var multer = require("multer");
var crypto = require("crypto");
const { authenticate } = require("passport");
var ObjectId = require("mongoose").Types.ObjectId;
var Jobs = require("../models/jobs");
var message = "";
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
      const ntfcn = user.notification;
      if(err){ console.log(err); }
      else
      {
         Post.find({}).exec(function(err, homeposts){
            if(err){ console.log(err); }
      
            res.render("home", {homeposts:homeposts, user : user, ntfcn : ntfcn});
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
      const following = user.followings;
      var f = [];
      following.forEach(function(following){
         User.findById(following, function(err, name){
            f.push(name.fullname);
         });
      });
      if(err){ console.log(err); }
      else
      {
         Post.find({userID:req.user._id}).exec(function(err, posts){
            if(err){console.log(err);}
      
            res.render("profile", {posts:posts,user:user,f:f});
         });
      }
   });
});

router.get("/jobspot/:dept", async (req, res)=>{
   try{
      var dept;
      switch(req.params.dept){
         case "mech" :
            dept = "Mechanical Engineering";
            break;
         case "cs" :
            dept = "Computer Science & Engineering";
            break;
         case "it" :
            dept = "Information Technology";
            break;
         case "eee" :
            dept = "Electrical & Electronics Engineering";
            break;
         case "ec" :
            dept = "Electronics Communication Engineering";
            break;
      }
      const jobs = await Jobs.find({ dept : req.params.dept })
      res.render("job", {jobs: jobs, dept: dept});
   }catch(error) {
      res.render.status(500).json(error);
   }

   
})

//searching profiles
router.post("/search",ensureAuthenticated,async function (req, res) {
   User.findOne({username: req.body.search}, function(err, user){
      const following = user.followings;
      var f = [];
      following.forEach(function(following){
         User.findById(following, function(err, name){
            f.push(name.fullname);
         });
      });
      if(err){ console.log(err); }
      else
      {
         Post.find({userID:user._id}).exec(function(err, posts){
            if(err){console.log(err);}
      
            res.render("profile", {posts:posts,user:user,f:f});
         });
      }
   });
});

router.get("/login", function (req, res){
   res.render("login");
  //res.sendFile(path.join(__dirname,"../public/login.html"));
});

router.get('/logout', function(req, res, next) {
   // remove the req.user property and clear the login session
      req.logout(function(err) {
         if (err) { return next(err); }
         req.session = null;
         res.redirect('/login');
      });
   

});

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
      
   }
});
});


router.post("/cover",upload.single('cover'), function(req, res){
   var name;
   User.findById(req.user._id, function(err, user){
      if(err){ console.log(err); }
      else{
         user.updateOne({ $set: {coverPhoto : req.file.path} });
         res.redirect("/profile");
      }
   });
});

   //follow
   router.post("/folllow", async (req, res) => {
      if (req.user._id != req.body.follow) {
         try {
            const user = await User.findById(req.body.follow);
            const currentUser = await User.findById(req.user._id);
            if (!user.followers.includes(req.user._id)) {
               await user.updateOne({ $push: { followers: req.user._id } });
               await currentUser.updateOne({ $push: { followings: req.body.follow } });
               await user.updateOne({ $push: { notification: req.user.username + " started following you"}});
            } else {
               message = req.flash("info", "you already follow this user");
            }
         } catch (err) {
            res.status(500).json(err);
         }
      } else {
         message = req.flash("you cant follow yourself");
      }
      res.redirect("/profile");
   });



   //like/unlike post
   router.post("/post/like", async (req, res) => {
      try {
         const post = await Post.findById(req.body.likebtn);
            if (!post.likedBy.includes(req.user._id)) {
               await post.updateOne({ $push: { likedBy: req.user._id } });
               const updateLikes = await post.updateOne({likes: post.likes + 1});
                  //res.status(200).json("The post has been liked");
               } else {
                  await post.updateOne({ $pull: { likedBy: req.user._id } });
                  const updateLikes = await post.updateOne({likes: post.likes - 1});
                  //res.status(200).json("The post has been disliked");
               }
            res.redirect('/home');
      } catch (err) {
         res.status(500).json(err);
      }
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
         return res.redirect("/login");
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
   successRedirect: "/home",
   failureRedirect: "/login",
   failureFlash: true
}));

module.exports = router;
