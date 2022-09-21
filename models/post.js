var mongoose = require("mongoose");

var postSchema = mongoose.Schema({
    title : {type:String, required:false},
    content : {type:String, required:false},
    createdAt : {type:Date, default:Date.now},
    image : {type:String, required:false },
    userID : {type:mongoose.Schema.Types.ObjectId, },
    username : {type:String, required:true}, 
    likes : {type:Number, default:0},
    likedBy : {type:Array, default:[]},
});

var Post = mongoose.model("Post", postSchema);

module.exports = Post;