var express = require('express');
var http = require('http');
var path = require("path");
var bodyParser = require('body-parser');
var rateLimit = require("express-rate-limit");
const db = require("./db")
const session = require('express-session');
const loginRouter = require("./routes/login");
const homeRouter = require("./routes/home");
const signupRouter = require("./routes/signup");
const flash = require("express-flash");

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
app.use(flash());
  
//Route to MainPage
app.use("/", homeRouter);

// Signup
app.use("/add", signupRouter)

//Login
app.use("/auth", loginRouter);
  



server.listen(3000,function(){ 
	console.log("Server listening on port: 3000")});