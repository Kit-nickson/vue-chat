const { createServer } = require("http");
const { Server } = require("socket.io");
const { users_db, chat_db } = require('./database/db.js');
const url = require('url');
const querystring = require('querystring');

const httpServer = createServer((req, res) => {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
  }

  const parsedUrl = url.parse(req.url);
  const queryStr = querystring.parse(parsedUrl.query)
  
  if (req.method === 'GET' && parsedUrl.pathname === '/validate_username') {

    checkUsername(queryStr.username)
    .then((result) => {
      let keys = Object.keys(usersOnline);
      
      if (keys.length === 0 && result.length === 0) {
        res.writeHead(200);
        res.end('okay');
        return;
      } else {
        if (result.length > 0) {
          res.writeHead(200, {'Content-Type': 'text/plain'});
          res.end('Username taken');
          return;
        }

        keys.forEach(key => {
          if (result.length > 0 || usersOnline[key].username.toLowerCase() === queryStr.username.toLowerCase()) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.end('Username taken');
            return;
          }
        });

        if (!res.headersSent) {
          res.writeHead(200);
          res.end('okay');
          return;
        }
      }

    }).catch((err) => {
      console.log(err);
    });
  }
});


const io = new Server(httpServer, { cors: { origin: '*' } });

const usersOnline = {};
const messages = [];

function chackValidUser(username, uuid) {
  return new Promise((resolve, reject) => {
    users_db.query('SELECT * FROM users WHERE name = ?', [username], (err, result) => {
      if (err) {
        reject(err);
      } else {
        if (uuid === result[0].uuid) {
          resolve(result[0].uuid);
        } else {
          reject('wrong user');
        }
      }
    })
  })
}

function checkUsername (username) {
  return new Promise((resolve, reject) => {
    users_db.query('SELECT * FROM users WHERE name = ?', [username], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  })
}

function checkPrivateTable(commonId) {
  return new Promise((resolve, reject) => {
    chat_db.query(
    "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'chats' AND TABLE_NAME = ?",
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
    chat_db.query(`CREATE TABLE ${commonId} (
      id INT PRIMARY KEY AUTO_INCREMENT,
      \`from\` VARCHAR(255) NOT NULL,
      from_name VARCHAR(255) NOT NULL, 
      \`to\` VARCHAR(255) NOT NULL,
      to_name VARCHAR(255) NOT NULL,
      message TEXT NOT NULL)`, [null], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
  })
}


function saveMessage(commonId, from, from_name, to, to_name, message) {
  return new Promise((resolve, reject) => {
    chat_db.query('INSERT INTO ' + commonId + ' (`from`, `from_name`, `to`, `to_name`, `message`) VALUES (?, ?, ?, ?, ?)', 
      [from, from_name, to, to_name, message], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
  });
}


function getMessages(commonId) {
  return new Promise((resolve, reject) => {
    chat_db.query('SELECT * FROM '+commonId, [], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    })
  });
}

io.on("connection", (socket) => {

  io.emit('message', messages);

  socket.on('user-data', (data) => {
    socket.join(data.userId);
    usersOnline[socket.id] = data;
    
    io.emit('users-online', usersOnline);
  })

  socket.on('guest-user-data', (data) => {
    data.username = 'Guest-'+data.username;
    usersOnline[socket.id] = data;

    io.emit('users-online', usersOnline);
  })

  socket.on('message', (message) => {
    messages.push(message);
    io.emit('message', messages);
  });

  socket.on('join-room', (data) => {
    const {commonId, userData} = data;

    chackValidUser(userData.username, userData.id)
    .then(user => {
      if (user) {
        checkPrivateTable(commonId)
        .then((tableExists) => {      
        if (tableExists) {
          // getMessages
          getMessages(commonId).then((messages) => {
            io.to(commonId).emit('get-private-messages', [commonId, messages]);
          }).catch((err) => {
            console.log(err);
          });
        }
        }).catch((err) => {
          console.log('error on teble check');
          console.log(err);
        });
      }
    }).catch(err => {
      console.log(err);
      socket.emit('join-error');
    });

    socket.join(commonId);
  })

  socket.on('private-message', (message) => {

    const commonId = [message.from.userId, message.to.id].sort().join('_');

    checkPrivateTable(commonId)
      .then((tableExists) => {      
        if (!tableExists) {
          createChatTable(commonId)
          .then((created) => {
            if (created) {
              saveMessage(commonId, message.from.userId, message.from.username, message.to.id, message.to.username, message.message)
              .then(() => {
                io.to(commonId).emit('private-message', [commonId, message]);
                io.to(message.to.id).emit('notification', message.from.userId);
              }).catch((err) => {
                console.log(err);
              })
            }
          }).catch((err) => {
            console.log('error on teble create');
            console.log(err);
          })
        } else {
          saveMessage(commonId, message.from.userId, message.from.username, message.to.id, message.to.username, message.message)
          .then(() => {
            io.to(commonId).emit('private-message', [commonId, [message]]);
            io.to(message.to.id).emit('notification', message.from.userId);
          }).catch((err) => {
            console.log(err);
          })
        }
    }).catch((err) => {
      console.log('error on teble check');
      console.log(err);
    });

    io.to(message.to.id).emit('notification', message.from.userId);
  })


  socket.on("disconnect", (reason) => {
    delete usersOnline[socket.id];

    io.emit('users-online', usersOnline);
  });
});

httpServer.listen(3000);