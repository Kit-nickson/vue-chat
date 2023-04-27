const sql = require('mysql');

const connection = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'node_db'
})

connection.connect((err) => {
    if (err) throw err;
});

module.exports = connection;