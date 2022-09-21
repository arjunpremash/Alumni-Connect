var mongoose = require("mongoose");

var jobSchema = new mongoose.Schema({
    title : {type:String, required : true},
    company : {type : String, required : true},
    //eligibility : {type : String, required : true},
    cgpa : {type : String, required : false},
    salary : {type : String, required : true},
    location : {type : String, required : true},
    link : {type : String, required : true},
    dept : {type : String, required : true},
});

var Job = mongoose.model("Job", jobSchema);

module.exports = Job;