// https://www.youtube.com/watch?v=jD7FnbI76Hg

const express = require('express');
const path = require('path');
const http = require("http");
const socketio = require('socket.io');

const port = 3001;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')))

// Run when client connects
io.on('connection', socket => {
    // console.log('Connected..')

    // Emit message to single client who just joined
    socket.emit('message', 'Welcome to my chatroom!')
    
    // Broadcast when a user connects(message is send to everybody except the new user who is connecting)
    socket.broadcast.emit('message', 'User joined the chatroom!');

    // Emit message to all the client
    // io.emmit()

    //Runs when the client disconnects
    socket.on('disconnect', () => {
        // Everyone will get the message that someone has left the chat
        io.emit('message', 'User left the chat')
    })

    // Listen for chatMessage
    socket.on('chatMessage', msg=>{
        console.log(msg);
    })
})


// app.listen(port, () => console.log(`App running on port ${port}`))
server.listen(port, () => console.log(`App running on port ${port}`))









