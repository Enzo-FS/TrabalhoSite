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

/* ─── MAP CANVAS ─────────────────────────────── */
function initMap() {
  const canvas = document.getElementById('mapCanvas');
  if (!canvas) return;
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  // pontos
  const store    = { x: W * .22, y: H * .72 };
  const client   = { x: W * .76, y: H * .22 };
  let   progress = 0;      // 0 → 1
  let   dir      = 1;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function drawMap() {
    ctx.clearRect(0, 0, W, H);

    // fundo de rua simulado
    ctx.fillStyle = '#DDE4EC';
    ctx.fillRect(0, 0, W, H);

    // blocos de "quadra"
    const blocks = [
      [8, 8, 100, 60], [120, 8, 90, 60], [226, 8, 100, 60],
      [8, 82, 80, 70],  [100, 82, 130, 70], [246, 82, 80, 70],
      [8, 165, 110, 55], [132, 165, 90, 55], [236, 165, 100, 55],
    ];
    ctx.fillStyle = '#C8D0DC';
    blocks.forEach(([x,y,w,h]) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 6);
      ctx.fill();
    });

    // rota tracejada
    ctx.beginPath();
    ctx.moveTo(store.x, store.y);
    ctx.lineTo(client.x, client.y);
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = 'rgba(226,126,12,.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);

    // rota percorrida
    const bx = lerp(store.x, client.x, progress);
    const by = lerp(store.y, client.y, progress);
    ctx.beginPath();
    ctx.moveTo(store.x, store.y);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = '#E27E0C';
    ctx.lineWidth = 3;
    ctx.stroke();

    // ponto loja
    ctx.beginPath();
    ctx.arc(store.x, store.y, 8, 0, Math.PI*2);
    ctx.fillStyle = '#1A1A1A';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 9px DM Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏪', store.x, store.y);

    // ponto cliente
    ctx.beginPath();
    ctx.arc(client.x, client.y, 8, 0, Math.PI*2);
    ctx.fillStyle = '#E27E0C';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.fillText('📍', client.x, client.y);

    // motoboy
    ctx.beginPath();
    ctx.arc(bx, by, 13, 0, Math.PI*2);
    ctx.fillStyle = '#fff';
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(226,126,12,.5)';
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(bx, by, 11, 0, Math.PI*2);
    ctx.fillStyle = '#E27E0C';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🛵', bx, by + 1);
  }

  function animate() {
    progress += 0.001 * dir;
    if (progress >= 1) { progress = 1; dir = -1; }
    if (progress <= 0) { progress = 0; dir =  1; }

    // atualiza distância
    const remaining = (1 - progress);
    const km = (remaining * 1.8).toFixed(1).replace('.', ',');
    const distEl = document.getElementById('distanceText');
    if (distEl) distEl.textContent = `${km} km restantes`;

    drawMap();
    requestAnimationFrame(animate);
  }
  animate();
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
  initMap();
  initAddressEdit();
  initConfirmBtn();
});
