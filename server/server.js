const { createServer } = require("http");
const { Server } = require("socket.io");
const db = require('./database/db.js');

const httpServer = createServer();


const io = new Server(httpServer, { cors: { origin: '*' } });

const usersOnline = {};
const messages = [];
const privateMessages = {};


function checkPrivateTable(commonId) {
  return new Promise((resolve, reject) => {
    db.query(
    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'node_db' AND TABLE_NAME = ?",
    [commonId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result[0]['COUNT(*)'] === 1);
        }
      })
    }
  );
}


function createChatTable(commonId) {
  return new Promise((resolve, reject) => {
    db.query(`CREATE TABLE ${commonId} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      \`from\` VARCHAR(255) NOT NULL, 
      \`to\` VARCHAR(255) NOT NULL,
      message TEXT NOT NULL)`, [null], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
  })
}

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

    const commonId = [message.from.userId, message.to].sort().join('_');

    checkPrivateTable(commonId)
      .then((tableExists) => {      
        if (!tableExists) {
          createChatTable(commonId)
          .then((created) => {
            if (created) {
              db.query('INSERT INTO ' + commonId + ' (`from`, `to`, `message`) VALUES (?, ?, ?)', 
              [message.from.userId, message.to, message.message], (err, result) => {
                console.log(result);
              })
              console.log('created');
            }
          }).catch((err) => {
            console.log('error on teble create');
            console.log(err);
          })
        } else {
          db.query('INSERT INTO ' + commonId + ' (`from`, `to`, `message`) VALUES (?, ?, ?)', 
              [message.from.userId, message.to, message.message], (err, result) => {
                console.log(result);
              })
        }
    }).catch((err) => {
      console.log('error on teble check');
      console.log(err);
    });
    
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