var mongoose = require("mongoose");

var chatSchema = mongoose.Schema({
    message:{ type:String },
    messagedAt: {type: String },
    userID : {type:mongoose.Schema.Types.ObjectId, },
    username : {type:String, },
});

var Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;