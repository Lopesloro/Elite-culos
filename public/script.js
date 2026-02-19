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
                cpf: document.getElementById('cpf').value,
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
                    alert( 'Conta criada com sucesso.');
                    
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
});
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checkout-form');
    const paymentRadios = document.querySelectorAll('input[name="metodo_pagamento"]');
    
    // Gerenciar visibilidade dos campos de pagamento
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            document.querySelectorAll('.payment-details').forEach(el => el.classList.add('hidden'));
            document.getElementById(`${e.target.value}-details`).classList.remove('hidden');
        });
    });

    // Envio para a API
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Pagamento processado com sucesso! Você receberá a confirmação por e-mail.');
                window.location.href = '/'; // Redireciona para home
            } else {
                alert('Erro ao processar pagamento. Verifique seus dados.');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Falha na conexão com o servidor.');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const unitPrice = 297.00;
    const shipping = 19.90;
    let currentQty = 1;

    const qtyEl = document.getElementById('qty');
    const itemSubtotalEl = document.getElementById('item-subtotal');
    const subTotalLabel = document.getElementById('sub-total-label');
    const totalLabel = document.getElementById('total-label');
    const btnPlus = document.getElementById('plus');
    const btnMinus = document.getElementById('minus');

    function updateDisplay() {
        const subtotal = currentQty * unitPrice;
        const total = subtotal + shipping;
        
        qtyEl.innerText = currentQty;
        const format = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
        itemSubtotalEl.innerText = format(subtotal);
        subTotalLabel.innerText = format(subtotal);
        totalLabel.innerText = format(total);
    }

    btnPlus.onclick = () => { currentQty++; updateDisplay(); };
    btnMinus.onclick = () => { if(currentQty > 1) { currentQty--; updateDisplay(); } };

    // Máscara básica para CPF
    document.getElementById('cpf-mask').oninput = (e) => {
        let v = e.target.value.replace(/\D/g, '');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d)/, '$1.$2');
        v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        e.target.value = v;
    };
});