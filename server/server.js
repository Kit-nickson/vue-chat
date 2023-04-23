const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

const usersOnline = {};
const messages = {
  main: []
};

io.on("connection", (socket) => {

  io.emit('message', messages);

  socket.on('user-data', (data) => {
    usersOnline[socket.id] = data;
    
    io.emit('users-online', usersOnline);
  })

  socket.on('message', (message) => {
    messages.main.push(message);
    io.emit('message', messages);
  });

  socket.on('private-message', (message) => {
    messages.private.push(message);
    io.to(message.to.id).emit(message);
  })


  socket.on("disconnect", (reason) => {
    delete usersOnline[socket.id];

    io.emit('users-online', usersOnline);
  });
});

httpServer.listen(3000);