document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const modal = document.getElementById('modal-container');
    const closeBtn = document.querySelector('.close-btn');
    const botoesComprar = document.querySelectorAll('.btn-comprar-trigger'); 
    const forms = {
        login: document.getElementById('form-login'),
        register: document.getElementById('form-register')
    };

    // --- 1. ABRIR MODAL (Em todos os botões de compra) ---
    botoesComprar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault(); 
            modal.style.display = 'flex'; 
        });
    });

    // --- 2. FECHAR MODAL ---
    if(closeBtn) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; }

    // --- 3. ALTERNAR ENTRE ABAS (LOGIN / CADASTRO) ---
    window.switchTab = function(tabName) {
        // Atualiza estilo dos botões (abas)
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        if(event) event.target.classList.add('active');

        // Mostra o formulário correto
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));
        if(forms[tabName]) forms[tabName].classList.add('active-form');
    }

    // --- 4. SISTEMA DE LOGIN ---
    if(forms.login) {
        forms.login.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;
    
            try {
                const res = await fetch('http://localhost:3000/login', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('Login realizado com sucesso! Bem-vindo(a).');
                    modal.style.display = 'none';
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Erro ao conectar com servidor.');
            }
        });
    }

    // --- 5. SISTEMA DE CADASTRO (ATUALIZADO) ---
    if(forms.register) {
        forms.register.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Captura os dados do formulário HTML
            // OBS: Não pegamos mais o preço aqui. O servidor define 299.00 sozinho.
            const payload = {
                nome: document.getElementById('reg-nome').value,
                email: document.getElementById('reg-email').value,
                senha: document.getElementById('reg-senha').value,
                endereco: document.getElementById('reg-endereco').value,
                cidade: document.getElementById('reg-cidade').value,
                estado: document.getElementById('reg-estado').value,
                cep: document.getElementById('reg-cep').value,
                numero_celular: document.getElementById('reg-celular').value
            };
    
            try {
                const res = await fetch('http://localhost:3000/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    // Mensagem de sucesso confirmando o valor fixo
                    alert('Compra de R$ 299,00 confirmada! Conta criada com sucesso.');
                    
                    // Muda para a tela de login automaticamente
                    switchTab('login');
                    
                    // (Opcional) Limpa o formulário
                    forms.register.reset();
                } else {
                    alert(data.message);
                }
            } catch (err) {
                console.error(err);
                alert('Erro ao tentar registrar. Verifique se o servidor está rodando.');
            }
        });
    }
});r