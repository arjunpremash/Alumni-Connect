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
      console.log(newPost);
      
   }
});

});

router.put('/home', ensureAuthenticated, (req, res)=>{
   var searchName = req.body.search;
   User.find({username:searchName}, function(err, user){
      if (err) { return next(err); }
      User.findById(user.userID, function(err, user){
               user.updateOne({_id:req.params.id}, {$push: {followings: user._id}});
               user.updateOne({_id: user._id},{$push: {followers: req.params.id}});
      });
   });

   //follow
   router.put("/follow", async (req, res) => {
      if (req.body.userId !== req.params.id) {
         try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body.userId);
            if (!user.followers.includes(req.body.userId)) {
            await user.updateOne({ $push: { followers: req.body.userId } });
            await currentUser.updateOne({ $push: { followings: req.params.id } });
            res.status(200).json("user has been followed");
            } else {
            res.status(403).json("you allready follow this user");
            }
         } catch (err) {
            res.status(500).json(err);
         }
      } else {
      res.status(403).json("you cant follow yourself");
      }
   });


   // User.findById(req.params.id)
   // .then((otherUser)=>{
   //     if(!otherUser.followers.includes(req.userInfo._id)){
   //         Promise.all([
   //             user.updateOne({_id:req.userInfo._id}, {$push: {followings: req.params.id}}),
   //             user.updateOne({_id: otherUser._id},{$push: {followers: req.userInfo._id}})
   //         ]).then(()=>{
   //             res.json({message: "following user"});
   //         })
   //         .catch((e)=>{
   //             res.json(e);
   //         }); 
   //     }else{
   //         return res.json({message: "Already following user"});
   //     }
   // })
   });
   

   //like
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

      router.put("/home/like", async(req, res) => {
         try {
            const post =await Post.findById(req.body.likebtn);
            const updateLikes = await post.updateOne({likes: post.likes + 1});

            //res.redirect('/home');
         } catch (err){
            res.status(500).json(err);
         }
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
