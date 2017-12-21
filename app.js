const debug = require('debug')('MEAN2:server');
const express = require('express');
const http = require('http');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const config = require('./config/database');
const mongoose = require('mongoose');

//Create HTTP server
const server = http.createServer(app);
const io = require('socket.io').listen(server);

// Export io to be used in router
module.exports = io;

//View Engine
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

// Connect to database
mongoose.connect(config.database);

// On connection
mongoose.connection.on('connected', () =>{
    console.log("Connected to database " + config.database);
});

// On error
mongoose.connection.on('error', (err) =>{
    console.log("Database error: " + err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport')(passport);

/** Get port from environment and store in Express. */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

// Anything that accesses the /users will be using the /routes/users file
const users = require('./routes/users');
const chat = require('./routes/chat');
app.use('/users', users);
app.use('/chat', chat);

//hello
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
        chat.addClient(socket);
        chat.notifyClientsRooms();
    });
    //Room stuff starts here
    let currentRoom = '';

    socket.on('current room', (data) =>{
        currentRoom = data;
        console.log("Current room on the server is: " + data);
        chat.notifyclients(currentRoom);
    });

    socket.on('change room', function(data){
        socket.leave(currentRoom, null);
        currentRoom = data;
        socket.join(data);
    });

    socket.on('disconnect user', function(){
        // console.log("disconnected");
        chat.disconnectClient(socket);
    });

    socket.on('disconnect', function(){
        console.log("disconnected");
        chat.disconnectClient(socket)
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
