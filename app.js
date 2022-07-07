var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var rateLimit = require("express-rate-limit");
const db = require("./db")
const session = require('express-session');
const { check, validationResult } = require('express-validator');
const loginRouter = require("./routes/login");
const homeRouter = require("./routes/home");
const signupRouter = require("./routes/signup");


var app = express();
var server = http.createServer(app);

// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 minutes
//     max: 100 // limit each IP to 100 requests per windowMs
//   });

  

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'./public')));

var loginValidate = [
	check('login_username', 'Enter valid Email Address').isEmail().normalizeEmail,
	check('login_password').isLength({ min: 8 }).trim().escape()
	.withMessage('Password Must Be at Least 8 Characters')
	.matches('[0-9]').withMessage('Password Must Contain a Number')
	.matches('[A-Z]').withMessage('Password Must Contain an Uppercase Letter')
];
  

//Route to MainPage
app.use("/", homeRouter);

// Signup
app.use("/add", signupRouter)

//Login
app.use("/auth", loginRouter);
  



server.listen(3000,function(){ 
console.log("Server listening on port: 3000")});