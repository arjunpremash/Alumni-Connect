var bcrypt = require("bcryptjs");
var mongoose = require("mongoose");

const SALT_FACTOR = 10;

var userSchema = mongoose.Schema({
    username:{type:String, required:true, unique:true},
    email:{type:String, required:true, unique:true},
    password:{type:String, required:false},
    fullname:{type:String},
    dob:{type:Date},
    passout:{type:String},
    mobile:{type:Number},
    dept:{type:String},
    isAlumni:{type:Boolean},
    createdAt:{type:Date, default:Date.now},
    coverPhoto : {type:String, required:false },
    followings: {
        type: Array,
        default: [],
    },
    followers: {
        type: Array,
        default: [],
    },
    notification: {
        type: Array,
        default : [],
    }
});

userSchema.pre("save", function(done){
    var user = this;

    if(!user.isModified("password")){
        return done();
    }

    bcrypt.genSalt(SALT_FACTOR, function(err,salt){
        if(err){return done(err);}
        bcrypt.hash(user.password, salt, function(err, hashedPassword){
            if(err) {return done(err);}
            user.password = hashedPassword;
            done();
        });
    });

});

userSchema.methods.checkPassword = function(guess, done){
    if(this.password != null){
            bcrypt.compare(guess,this.password, function(err, isMatch){
            done(err, isMatch);
        });
    }
}

var User = mongoose.model("User", userSchema);

module.exports = User;