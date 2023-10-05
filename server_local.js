// Import necessary modules and libraries
const path = require("path");                  
const http = require("http");                  
const express = require("express");            
const socketio = require("socket.io");         
const formatMessage = require("./utils/messages"); 

// Import utility functions for managing users in the chat
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

// Create an Express application
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

// Event handler when a client connects to the server
io.on("connection", (socket) => {
  // Event handler when a user joins a room
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Welcome message to the current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // Broadcast message when a user joins the chat
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room information to all clients in the room
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // Event handler for handling chat messages
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    // Emit the message to all clients in the room
    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  // Event handler when a client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      // Broadcast a message when a user leaves the chat
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      // Send updated users and room info to all clients in the room
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
