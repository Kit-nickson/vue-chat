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

                if (names.length > 0) {
                    res.writeHead(409, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Name already in use' }));
                    return;
                } else {
                    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
                        if (error) {
                            console.error(error);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Server error' }));
                            return;
                        }
                      
                        if (results.length > 0) {
                            res.writeHead(409, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'Email already in use' }));
                            return;
                        }
        
                        const encrypted = encryptData(password);
                        db.query('INSERT INTO users (name, email, password, salt, uuid) VALUES (?, ?, ?, ?, ?)', [name, email, encrypted.hash, encrypted.salt, 'null'], (error, results) => {
                            if (error) {
                                console.error(error);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({ message: 'Server error' }));
                                return;
                            }
                          
                            res.writeHead(201, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ message: 'User created' }));
                        });
                    });
                }
            }); 
        });
    }
});

server.listen(8080);

