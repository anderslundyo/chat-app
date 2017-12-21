const mongoose = require('mongoose');

// Message Schema
const chatroomSchema = mongoose.Schema({
    roomname: {
        type: String
    }
});

const Chatroom = module.exports = mongoose.model('Chatroom', chatroomSchema);

module.exports.addChatroom = function(newRoom, callback){
    newRoom.save(callback);
};