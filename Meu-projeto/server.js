const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require('path');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// ROTA DE REGISTRO/COMPRA
app.post('/register', async (req, res) => {
    // 1. Recebe os dados do formulário (SEM O PREÇO)
    const { nome, email, senha, endereco, cidade, estado, cep, numero_celular } = req.body;

    // 2. Define o preço fixo aqui no servidor (Segurança)
    const precoFixo = 299.00;

    if (!email || !senha || !nome) {
        return res.status(400).json({ message: 'Preencha os campos obrigatórios.' });
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashSenha = await bcrypt.hash(senha, salt);

        // 3. Salva tudo no banco, incluindo o preço fixo e os dados de endereço
        const sql = `INSERT INTO usuarios 
        (nome, email, senha, endereco, cidade, estado, cep, numero_celular, preco_valor_pago) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        
        await db.query(sql, [
            nome, 
            email, 
            hashSenha, 
            endereco, 
            cidade, 
            estado, 
            cep, 
            numero_celular, 
            precoFixo // Usa a variável segura criada acima
        ]);
        
        res.status(201).json({ message: 'Compra de R$ 299,00 realizada com sucesso!' });
    } catch (error) {
        console.error("Erro no servidor:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Este e-mail já realizou uma compra.' });
        }
        res.status(500).json({ message: 'Erro interno ao processar compra.' });
    }
});

// ROTA DE LOGIN
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: 'Email não encontrado.' });

        const usuario = rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha);
        if (!senhaValida) return res.status(401).json({ message: 'Senha incorreta.' });

        res.json({ message: 'Login realizado!', usuario: { nome: usuario.nome } });
    } catch (error) {
        res.status(500).json({ message: 'Erro interno.' });
    }
});

// Porta do Servidor (3000)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));