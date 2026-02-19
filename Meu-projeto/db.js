const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        endereco TEXT,
        cidade TEXT,
        estado TEXT,
        cep TEXT,
        numero_celular TEXT,
        preco_valor_pago REAL,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log("Banco de dados SQLite conectado.");

module.exports = db;