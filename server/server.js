const { createServer } = require("http");
const { Server } = require("socket.io");
//const DB = require('./database/db.js');

const httpServer = createServer();


const io = new Server(httpServer, { cors: { origin: '*' } });

const usersOnline = {};
const messages = [];
const privateMessages = {};



io.on("connection", (socket) => {

  io.emit('message', messages);

  socket.on('user-data', (data) => {
    socket.join(data.userId);
    usersOnline[socket.id] = data;
    
    io.emit('users-online', usersOnline);
  })

  socket.on('message', (message) => {
    messages.push(message);
    io.emit('message', messages);
  });

  socket.on('join-room', (roomId) => {
    socket.join(roomId);

    if (!privateMessages.hasOwnProperty(roomId)) {
      privateMessages[roomId] = [];
    }
    
    io.to(roomId).emit('private-message', [roomId, privateMessages[roomId]]);
  })

  socket.on('private-message', (message) => {

    const commonId = [message.from.userId, message.to].sort().join('-');
    
    if (!privateMessages.hasOwnProperty(commonId)) {
      privateMessages[commonId] = [];
      privateMessages[commonId].push(message);
    } else {
      privateMessages[commonId].push(message);
    }

    io.to(commonId).emit('private-message', [commonId, privateMessages[commonId]]);
    io.to(message.to).emit('notification', message.from.userId);
  })


  socket.on("disconnect", (reason) => {
    delete usersOnline[socket.id];

    io.emit('users-online', usersOnline);
  });
});

httpServer.listen(3000);