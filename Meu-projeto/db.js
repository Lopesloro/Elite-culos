const mysql = require('mysql2');
require('dotenv').config();

// Cria um pool de conexões (mais eficiente que conexão única)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Transforma callbacks em Promises para usar async/await
const promisePool = pool.promise();

console.log("Conectado ao pool do MySQL.");

module.exports = promisePool;