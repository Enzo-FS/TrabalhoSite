/* ─── CONFIGURAÇÃO ────────────────────────────── */
const ORDER = {
  step: 2,            // 0=confirmado, 1=preparando, 2=pronto, 3=motoboy, 4=entregue
  etaMinutes: 19,
  etaSeconds: 30,
};

/* ─── ETA COUNTDOWN ──────────────────────────── */
function initETA() {
  let total = ORDER.etaMinutes * 60 + ORDER.etaSeconds;
  const el = document.getElementById('etaDisplay');
  if (!el) return;
  const tick = () => {
    if (total <= 0) { el.textContent = 'Chegando!'; return; }
    const m = Math.floor(total / 60);
    const s = total % 60;
    el.textContent = `${m}:${String(s).padStart(2,'0')} min`;
    total--;
    setTimeout(tick, 1000);
  };
  tick();
}



/* ─── EDITAR ENDEREÇO ────────────────────────── */
function initAddressEdit() {
  const btn     = document.getElementById('editAddressBtn');
  const form    = document.getElementById('addressForm');
  const content = document.getElementById('addressContent');
  const cancel  = document.getElementById('cancelEdit');
  const save    = document.getElementById('saveAddress');
  if (!btn) return;

  btn.addEventListener('click', () => {
    form.classList.remove('hidden');
    content.style.display = 'none';
    btn.style.display = 'none';
  });

  cancel.addEventListener('click', () => {
    form.classList.add('hidden');
    content.style.display = '';
    btn.style.display = '';
  });

  save.addEventListener('click', () => {
    const street = document.getElementById('inputStreet').value.trim();
    const hood   = document.getElementById('inputNeighborhood').value.trim();
    const city   = document.getElementById('inputCity').value.trim();
    const cep    = document.getElementById('inputCep').value.trim();

    content.querySelector('.address-street').textContent  = street;
    content.querySelector('.address-details').textContent = `${hood} · ${city}`;
    content.querySelector('.address-cep').textContent     = `CEP ${cep}`;

    form.classList.add('hidden');
    content.style.display = '';
    btn.style.display = '';
    showToast('Endereço atualizado');
  });
}

/* ─── CONFIRMAR ENTREGA ──────────────────────── */
function initConfirmBtn() {
  const btn = document.getElementById('confirmBtn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (btn.classList.contains('confirmed')) return;
    btn.classList.add('confirmed');
    btn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 10l4.5 4.5L16 5.5" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>
      Entrega confirmada!
    `;
    showToast('Obrigado! Bom apetite 🍽️');
  });
}

/* ─── TOAST ──────────────────────────────────── */
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ─── INIT ───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initETA();
  //initMap();
  initAddressEdit();
  initConfirmBtn();
});
