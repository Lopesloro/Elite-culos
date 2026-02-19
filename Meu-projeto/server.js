const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require('path');
const nodemailer = require('nodemailer');

require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// CONFIGURAÇÃO DO EMAIL
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ================= REGISTER =================
app.post('/register', async (req, res) => {
    const { nome, cpf, email, senha, endereco, cidade, estado, cep, numero_celular } = req.body;
    const precoFixo = 299.00;

    if (!email || !senha || !nome || !cpf) {
        return res.status(400).json({ message: 'Preencha todos os campos obrigatórios.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        const stmt = db.prepare(`
            INSERT INTO usuarios
            (nome, cpf, email, senha, endereco, cidade, estado, cep, numero_celular, preco_valor_pago)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(nome, cpf, email, hashSenha, endereco, cidade, estado, cep, numero_celular, precoFixo);

        // ===== EMAIL CLIENTE =====
        const mailOptionsCliente = {
            from: `"VisionProtect" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Pedido Confirmado! - VisionProtect',
            html: `
                <h2>Obrigado, ${nome}!</h2>
                <p>Seu pedido foi confirmado.</p>
                <p><strong>Valor:</strong> R$ 299,00</p>
                <p>${endereco}, ${cidade} - ${estado} | CEP: ${cep}</p>
            `
        };

        // ===== EMAIL ADMIN =====
        const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_ADMIN,
            subject: `Nova venda - ${nome}`,
            text: `
Cliente: ${nome}
Email: ${email}
Telefone: ${numero_celular}
CPF: ${cpf}
Endereço: ${endereco}, ${cidade} - ${estado} | CEP ${cep}
            `
        };

        transporter.sendMail(mailOptionsCliente).catch(err => console.log(err));
        transporter.sendMail(mailOptionsAdmin).catch(err => console.log(err));

        res.status(201).json({ message: 'Compra realizada com sucesso!' });

    } catch (error) {
        console.error(error);

        if (error.message && error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Este e-mail já existe.' });
        }

        res.status(500).json({ message: 'Erro interno ao cadastrar.' });
    }
});

// ================= LOGIN =================
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const usuario = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);
        if (!usuario) return res.status(401).json({ message: 'Email não encontrado.' });

        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ message: 'Senha incorreta.' });

        res.json({ message: 'Login realizado!', usuario: { nome: usuario.nome } });

    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
});

app.get('/pagamento', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'pagamento.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
