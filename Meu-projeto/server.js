const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const db = require('./db');
const path = require('path');
const nodemailer = require('nodemailer'); // <--- 1. ADICIONADO: Importar o nodemailer

// Carrega variáveis de ambiente (caso o db.js não tenha carregado globalmente)
require('dotenv').config();

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- 2. ADICIONADO: Configuração do E-mail (Gmail) ---
const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail (do arquivo .env)
        pass: process.env.EMAIL_PASS  // Sua senha de app (do arquivo .env)
    }
});

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
            CPF, 
            hashSenha, 
            endereco, 
            cidade, 
            estado, 
            cep, 
            numero_celular, 
            precoFixo 
        ]);

        // --- 3. ADICIONADO: Lógica de Envio de E-mails ---
        
        // E-mail A: Para o Cliente (Confirmação Bonita em HTML)
        const mailOptionsCliente = {
            from: `"VisionProtect" <${process.env.EMAIL_USER}>`,
            to: email, // Envia para o e-mail que a pessoa cadastrou
            subject: 'Pedido Confirmado! - VisionProtect',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h1 style="color: #2da44e;">Obrigado, ${nome}!</h1>
                    <p>Seu pedido dos óculos <strong>VisionProtect Pro</strong> foi recebido.</p>
                    <hr>
                    <h3>Resumo do Pedido:</h3>
                    <p><strong>Valor:</strong> R$ 299,00</p>
                    <p><strong>Endereço de Entrega:</strong><br>
                    ${endereco}, ${cidade} - ${estado}<br>
                    CEP: ${cep}</p>
                    <hr>
                    <p>Em breve enviaremos o código de rastreio.</p>
                </div>
            `
        };

        // E-mail B: Para Você/Admin (Alerta de Venda Simples)
        const mailOptionsAdmin = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_ADMIN, // Seu e-mail pessoal (definido no .env)
            subject: `💰 Nova Venda: ${nome}`,
            text: `
                NOVA VENDA REALIZADA!
                
                Cliente: ${nome}
                E-mail: ${email}
                WhatsApp: ${numero_celular}
                Endereço: ${endereco} - ${cidade}/${estado}
                CEP: ${cep}
                CPF: ${CPF}
            `
        };

        // Dispara os e-mails (não trava o servidor se der erro no envio)
        transporter.sendMail(mailOptionsCliente).catch(err => console.error("Erro e-mail cliente:", err));
        transporter.sendMail(mailOptionsAdmin).catch(err => console.error("Erro e-mail admin:", err));

        // --- FIM DA LÓGICA DE E-MAIL ---
        
        res.status(201).json({ message: 'Compra de R$ 299,00 realizada com sucesso! Verifique seu e-mail.' });

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