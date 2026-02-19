
// ---- UTILS ----
function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = 'toast show ' + type;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.className = 'toast'; }, 3500);
}

function maskCPF(v) {
    v = v.replace(/\D/g, '').substring(0, 11);
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d)/, '$1.$2');
    v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    return v;
}

function maskPhone(v) {
    v = v.replace(/\D/g, '').substring(0, 11);
    if (v.length <= 10) v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    return v;
}

function maskCEP(v) {
    v = v.replace(/\D/g, '').substring(0, 8);
    v = v.replace(/(\d{5})(\d{0,3})/, '$1-$2');
    return v;
}

function applyMask(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', e => { e.target.value = fn(e.target.value); });
}

// ---- NAVBAR SCROLL ----
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// ---- MOBILE MENU ----
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
        link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
}

// ---- BOTÕES COMPRAR → redireciona para /pagamento ----
document.querySelectorAll('.btn-comprar-trigger').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        window.location.href = '/pagamento';
    });
});

// ---- CHECKOUT PAGE (/pagamento) ----
const UNIT_PRICE = 299.00;
let qty = 1;

const qtyEl = document.getElementById('qty');
const subTotalLabel = document.getElementById('sub-total-label');
const totalLabel = document.getElementById('total-label');
const btnPlus = document.getElementById('plus');
const btnMinus = document.getElementById('minus');

function fmt(val) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
}

function updatePrices() {
    const sub = qty * UNIT_PRICE;
    if (qtyEl) qtyEl.textContent = qty;
    if (subTotalLabel) subTotalLabel.textContent = fmt(sub);
    if (totalLabel) totalLabel.textContent = fmt(sub);
}

if (btnPlus) btnPlus.addEventListener('click', () => { qty++; updatePrices(); });
if (btnMinus) btnMinus.addEventListener('click', () => { if (qty > 1) { qty--; updatePrices(); } });

// Checkout masks
applyMask('co-cpf', maskCPF);
applyMask('co-tel', maskPhone);
applyMask('co-cep', maskCEP);

const purchaseForm = document.getElementById('purchase-form');
if (purchaseForm) {
    purchaseForm.addEventListener('submit', async e => {
        e.preventDefault();
        const btn = document.getElementById('btn-checkout');
        const originalHTML = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation:spin 0.8s linear infinite">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <span>Processando...</span>`;

        const payload = {
            nome: document.getElementById('co-nome').value,
            email: document.getElementById('co-email').value,
            cpf: document.getElementById('co-cpf').value,
            numero_celular: document.getElementById('co-tel').value,
            cep: document.getElementById('co-cep').value,
            endereco: document.getElementById('co-endereco').value,
            cidade: document.getElementById('co-cidade').value,
            estado: document.getElementById('co-estado').value,
            quantidade: qty,
            total: qty * UNIT_PRICE
        };

        try {
            const res = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...payload, senha: Math.random().toString(36).slice(-8) })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('Pedido confirmado! Você receberá um e-mail.', 'success');
                setTimeout(() => { window.location.href = '/'; }, 2500);
            } else {
                showToast(data.message || 'Erro ao processar pedido.', 'error');
                btn.disabled = false;
                btn.innerHTML = originalHTML;
            }
        } catch {
            showToast('Erro de conexão com o servidor.', 'error');
            btn.disabled = false;
            btn.innerHTML = originalHTML;
        }
    });
}

// Spinner keyframe (inline injection)
const style = document.createElement('style');
style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
document.head.appendChild(style);

updatePrices();