const http = require('http');
const mysql = require('mysql');
const crypto = require('crypto');

const db = mysql.createPool({
  connectionLimit : 10,
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'node_db'
});

function encryptData(data) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
    return { salt, hash };
}

function createUuid(username) {
    const time = Math.floor(Date.now() / 1000).toString();
    const hash = crypto.pbkdf2Sync(username, time, 1000, 8, 'sha512').toString('hex');
    return hash;
}

function encryptPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/register') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const data = JSON.parse(body);
            
            const name = data.username;
            const email = data.email;
            const password = data.password;
          
            if (!name || !email || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Name, email, and password are required' }));
                return;
            }

            db.query('SELECT * FROM users WHERE name = ?', [name], (error, names) => {
                if (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Server error' }));
                    return;
                }

                // check if names are equal in upper or lower case

                if (names.length > 0) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Name already in use' }));
                    return;
                } else {
                    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {                      
                        if (results.length > 0) {
                            res.writeHead(403, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Email already in use' }));
                            return;
                        }
        
                        const encrypted = encryptData(password);
                        const uuid = createUuid(name);
                        const token = createUuid(email);
                        
                        db.query('INSERT INTO users (name, email, password, salt, uuid, token) VALUES (?, ?, ?, ?, ?, ?)', [name, email, encrypted.hash, encrypted.salt, uuid, token], (error, results) => {
                            if (error) {
                                console.error(error);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Server error' }));
                                return;
                            }
                          
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ uuid: uuid, token: token }));
                            return;
                        });
                    });
                }
            }); 
        });
    }

    if (req.method === 'POST' && req.url === '/login') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const data = JSON.parse(body);
            
            const name = data.username;
            const password = data.password;
            
            if (!name || !password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Name, email, and password are required' }));
                return;
            }
            
            db.query('SELECT * FROM users WHERE name = ?', [name], (error, userData) => {

                if (userData.length <= 0) {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Wrong user data' }));
                    return;
                }

                if (error) {
                    console.error(error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Server error' }));
                    return;
                }

                const encryptedPassword = encryptPassword(password, userData[0].salt);
                
                if (userData[0].password === encryptedPassword) {
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ uuid: userData[0].uuid, token: userData[0].token }));
                    return;
                } else {
                    res.writeHead(403, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Wrong user data' }));
                    return;
                }
            })
        })
    
        }
 

    if (req.method === 'POST' && req.url === '/check_data') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const data = JSON.parse(body);

            const name = data.userdata.username;
            const uuid = data.userdata.userId;
            const token = data.token;

            
            db.query('SELECT * FROM users WHERE name = ?', [name], (error, result) => {
                if (uuid === result[0].uuid && token === result[0].token) {                    
                    res.end('okay');
                } else {
                    res.end('wrong');
                }
            })
        });
    }
});

server.listen(8080);

