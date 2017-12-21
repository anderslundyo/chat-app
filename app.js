const debug = require('debug')('MEAN2:server');
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const passport = require('passport');
const config = require('./config/database');

//creates server
const server = http.createServer(app);
const io = require('socket.io').listen(server);

// Export so we can use it later
module.exports = io;

//View Engine
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Gets our database connection on localhost
mongoose.connect(config.database);

//Connection successfull message
mongoose.connection.on('connected', () =>{
    console.log("Database connection established " + config.database);
});

// On error
mongoose.connection.on('error', (error) =>{
    console.log("Error when trying to connect to databse: " + error);
});

//Use bodyparser to get inputs from client
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// We need to use passport to create a user, and a connection
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

//Serve static files
app.use(express.static(path.join(__dirname, 'public')));


/** Get port from environment and store in Express. */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Create routes for requests
const u = require('./routes/users');
app.use('/users', u);
const c = require('./routes/chat');
app.use('/chat', c);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

/** Listen on provided port, on all network interfaces. **/
server.listen(port);
server.on('error', onError);
io.sockets.on('connection', function (socket) {

    socket.on('connect to chat', (nickname) => {
        socket.nickname = nickname;
        chat.addSocket(socket);
        chat.notifyClientsRooms();
    });

    //Chatroom information
    let currentRoom = '';

    socket.on('current room', (room) =>{
        currentRoom = room;
        console.log("You've moved to: " + room);
        chat.notifyclients(currentRoom);
    });

    socket.on('change room', function(newRoom){
        socket.leave(currentRoom, null);
        currentRoom = newRoom;
        socket.join(newRoom);
    });


    socket.on('disconnect', function(){
        console.log("disconnected");
        chat.disconnectSocket(socket)
    });
});
server.on('listening', onListening);



/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
    console.log('Listening on ' + bind);
}
