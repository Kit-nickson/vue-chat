const sql = require('mysql');

const db = sql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'chats'
})

module.exports = db;