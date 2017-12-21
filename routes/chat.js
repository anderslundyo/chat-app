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
            res.json({success: false, msg: 'Failed to save message'});
        } else{
            res.json({success: true, msg: 'Message saved'});
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
            res.json({success: false, msg: 'Failed to create new room'});
        } else{
            res.json({success: true, msg: Chatroom.roomname+ ' has been created'});
            router.notifyClientsRooms();
        }
    })
});
//How many sockets is connected on connect
router.clients = [];
router.addClient = function (client) {
    router.clients.push(client);
    router.notifyclients(client);
    console.log('Connected: %s sockets connected', router.clients.length);
};
// Notify users about the new message
router.clients = [];
router.addClient = function (client) {
    router.clients.push(client);
    router.notifyclients(client);
};
// Notifyclients about new msg
router.notifyclients = function (currentRoom) {
    message.find({chatroom: currentRoom}).exec(function (err, message) {
        if (err)
            return console.error(err);
            io.in(currentRoom).emit('reload msgs', message);
        })
    };

// Notifyclients about new room
router.notifyClientsRooms = function () {
    Chatroom.find({}).exec(function (err, rooms) {
        if (err)
            return console.error(err);

        router.clients.forEach(function(socket){
            socket.emit('refresh chatrooms', rooms);
        })
    });
};
//How many sockets are connected on disconnect
router.disconnectClient = (client) => {
    router.clients.splice(router.clients.indexOf(client), 1);
    console.log('Disconnected: %s sockets connected', router.clients.length);
};
//export the router
module.exports = router;