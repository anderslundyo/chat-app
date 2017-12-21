const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const message = require('../models/message');
const Chatroom = require('../models/chatroom');
const database = require('../config/database');
const io = require ('../app');

// POST Message
router.post('/send-message', (req, res, next) => {
    let newMsg = new message({
        name: req.body.name,
        message: req.body.message,
        chatroom: req.body.chatroom
    });

    message.addMessage(newMsg, (err, msg) => {
        if(err){
            res.json({success: false, msg: 'Failed at saving the message'});
        } else{
            res.json({success: true, msg: 'Message was successfully saved'});
            router.notifyclients(newMsg.chatroom);
        }
    })
});
// POST new chatroom
router.post('/new-room', (req, res, next) => {
    let newRoom = new Chatroom({
        roomname: req.body.roomname,
    });

    Chatroom.addChatroom(newRoom, (err, msg) => {
        if(err){
            res.json({success: false, msg: 'Failed at creating a new room'});
        } else{
            res.json({success: true, msg: Chatroom.roomname+ ' was created'});
            router.notifyClientsRooms();
        }
    })
});
//How many sockets is connected on connect
router.allSockets = [];
router.addSocket = function (client) {
    router.notifyclients(client);
    router.clients.push(client);
    console.log('Connected: %s are now connected', router.clients.length);
};
// Notify users about the new message
router.allSockets = [];
router.addSocket = function (socket) {
    router.allSockets.push(socket);
    router.notifyclients(socket);
};
// Notifyclients about new msg. Is called whenever a new message is created
router.notifyclients = function (currentRoom) {
    message.find({chatroom: currentRoom}).exec(function (err, message) {
        if (err)
            return console.error(err);
            io.in(currentRoom).emit('reload msgs', message);
        })
    };

// Notifies clients about a new room. Is called whenever a new room is created
router.notifyClientsRooms = function () {
    Chatroom.find({}).exec(function (err, chatrooms) {
        if (err)
            return console.error(err);

        router.allSockets.forEach(function(socket){
            socket.emit('reload rooms', chatrooms);
        })
    });
};
//Count sockets that are connected
router.disconnectSocket = (user) => {
    router.allSockets.splice(router.allSockets.indexOf(user), 1);
    console.log('Disconnected: %s sockets connected', router.allSockets.length);
};

//export the router
module.exports = router;