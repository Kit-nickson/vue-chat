const sql = require('mysql');

const chat_db = sql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'chats'
})

const users_db = sql.createPool({
    connectionLimit : 10,
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'node_db'
})

module.exports = { users_db, chat_db };