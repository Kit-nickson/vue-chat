const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, { cors: { origin: '*' } });

const usersOnline = {};

io.on("connection", (socket) => {
  socket.on('user-data', (data) => {
    data.clientId = socket.id;

    usersOnline[socket.id] = data;
    
    io.emit('users-online', usersOnline);
  })

  socket.on('message', (message) => {
    io.emit('message', message);
  })


  socket.on("disconnect", (reason) => {
    delete usersOnline[socket.id];

    io.emit('users-online', usersOnline);
  });
});

httpServer.listen(3000);