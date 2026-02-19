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
    // --- 1. CONFIGURAÇÕES DE PREÇO ---
    const UNIT_PRICE = 297.00;
    const SHIPPING = 0.00; // Frete Zero conforme solicitado
    let currentQty = 1;

    // --- 2. ELEMENTOS DO DOM ---
    // Modal e Auth
    const modal = document.getElementById('modal-container');
    const closeBtn = document.querySelector('.close-btn');
    const botoesComprar = document.querySelectorAll('.btn-comprar-trigger'); 
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    // Checkout e Preços
    const qtyText = document.getElementById('qty');
    const itemSubtotalText = document.getElementById('item-subtotal');
    const subTotalLabel = document.getElementById('sub-total-label');
    const totalLabel = document.getElementById('total-label');
    const btnPlus = document.getElementById('plus');
    const btnMinus = document.getElementById('minus');
    const checkoutForm = document.getElementById('purchase-form');

    // --- 3. LÓGICA DE PREÇOS (MATEMÁTICA CORRIGIDA) ---
    function updateDisplay() {
        const subtotalValue = currentQty * UNIT_PRICE;
        const totalValue = subtotalValue + SHIPPING;
        
        const formatter = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
        
        if(qtyText) qtyText.innerText = currentQty;
        if(itemSubtotalText) itemSubtotalText.innerText = formatter.format(subtotalValue);
        if(subTotalLabel) subTotalLabel.innerText = formatter.format(subtotalValue);
        if(totalLabel) totalLabel.innerText = formatter.format(totalValue);
    }

    // Eventos de Quantidade
    if(btnPlus) {
        btnPlus.onclick = () => { currentQty++; updateDisplay(); };
    }
    if(btnMinus) {
        btnMinus.onclick = () => { if(currentQty > 1) { currentQty--; updateDisplay(); } };
    }

    // --- 4. MODAL E ALTERNÂNCIA DE TABS ---
    botoesComprar.forEach(botao => {
        botao.addEventListener('click', (e) => {
            e.preventDefault(); 
            if(modal) modal.style.display = 'flex'; 
        });
    });

    if(closeBtn) {
        closeBtn.addEventListener('click', () => modal.style.display = 'none');
    }

    window.onclick = (e) => { 
        if (modal && e.target == modal) modal.style.display = 'none'; 
    }

    // Função global para trocar abas no Modal
    window.switchTab = function(tabName) {
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        // Se o evento existir, marca o botão clicado como ativo
        if(event && event.target) event.target.classList.add('active');

        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));
        const targetForm = document.getElementById(`form-${tabName}`);
        if(targetForm) targetForm.classList.add('active-form');
    }

    // --- 5. MÁSCARAS DE INPUT (UX) ---
    const cpfInput = document.getElementById('cpf-mask');
    if (cpfInput) {
        cpfInput.oninput = (e) => {
            let v = e.target.value.replace(/\D/g, '');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d)/, '$1.$2');
            v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = v.substring(0, 14);
        };
    }

    // --- 6. ENVIOS DE FORMULÁRIOS (API) ---

    // Login
    if(formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const senha = document.getElementById('login-senha').value;
    
            try {
                const res = await fetch('/login', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, senha })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Login realizado com sucesso!');
                    modal.style.display = 'none';
                } else {
                    alert(data.message);
                }
            } catch (err) {
                alert('Erro ao conectar com servidor.');
            }
        });
    }

    // Registro
    if(formRegister) {
        formRegister.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                nome: document.getElementById('reg-nome').value,
                cpf: document.getElementById('cpf-mask') ? document.getElementById('cpf-mask').value : '',
                email: document.getElementById('reg-email').value,              
                senha: document.getElementById('reg-senha').value,
                endereco: document.getElementById('reg-endereco').value,
                cidade: document.getElementById('reg-cidade').value,
                estado: document.getElementById('reg-estado') ? document.getElementById('reg-estado').value : '',
                cep: document.getElementById('reg-cep').value,
                numero_celular: document.getElementById('reg-celular').value
            };
    
            try {
                const res = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    alert('Conta criada com sucesso!');
                    switchTab('login');
                    formRegister.reset();
                } else {
                    const data = await res.json();
                    alert(data.message);
                }
            } catch (err) {
                alert('Erro ao conectar com servidor.');
            }
        });
    }

    // Finalizar Checkout
    if(checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = checkoutForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            const formData = new FormData(checkoutForm);
            const data = Object.fromEntries(formData.entries());
            data.quantidade = currentQty;
            data.total = currentQty * UNIT_PRICE;

            try {
                btn.innerText = "Processando...";
                btn.disabled = true;

                const response = await fetch('/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert('Pedido realizado com sucesso!');
                    window.location.href = '/'; 
                } else {
                    alert('Erro ao processar pedido.');
                }
            } catch (error) {
                alert('Erro na conexão.');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // Inicializa os preços na tela
    updateDisplay();
});