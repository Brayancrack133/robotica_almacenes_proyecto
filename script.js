/* Kaiser Logistics — script.js */

// ============================================================
// NAVIGATION
// ============================================================
const PAGE_LABELS = {
  dashboard: 'Dashboard',
  monitoring: 'Monitoreo',
  products: 'Productos',
  history: 'Historial',
  control: 'Centro de Control',
  reports: 'Reportes',
  settings: 'Configuración',
};

function navigateTo(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');

  const navItem = document.querySelector(`[data-page="${page}"]`);
  if (navItem) navItem.classList.add('active');

  const label = document.getElementById('breadcrumb-label');
  if (label) label.textContent = PAGE_LABELS[page] || page;

  if (page === 'history') renderHistory();
  if (page === 'monitoring') initVehicle();
  if (page === 'dashboard') animateKPIs();

  // Close sidebar on mobile
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('open');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ============================================================
// CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  const timeEl = document.getElementById('live-time');
  const dateEl = document.getElementById('live-date');
  const todayEl = document.getElementById('today-full-date');

  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  if (timeEl) timeEl.textContent = `${h}:${m}:${s}`;
  if (dateEl) dateEl.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  if (todayEl) todayEl.textContent = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} de ${now.getFullYear()}`;
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// ANIMATED KPI COUNTERS
// ============================================================
const kpiTargets = {
  'kpi-transportes': 1247,
  'kpi-productos': 89,
  'kpi-rutas': 34,
  'kpi-vehiculos': 3,
};
let kpiAnimated = false;

function animateKPIs() {
  if (kpiAnimated) return;
  kpiAnimated = true;
  Object.entries(kpiTargets).forEach(([id, target]) => {
    const el = document.getElementById(id);
    if (!el) return;
    const duration = 1200;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);
      el.textContent = current.toLocaleString('es-MX');
      if (step >= steps) clearInterval(timer);
    }, duration / steps);
  });
}

// ============================================================
// HISTORY TABLE
// ============================================================
const products = ['Botellas', 'Tazas', 'Celulares'];
const origins = ['Zona A', 'Zona B', 'Zona C'];
const destinations = ['Zona A', 'Zona B', 'Zona C'];
const statuses = ['Completado', 'Completado', 'Completado', 'En proceso', 'Cancelado'];
const statusBadge = {
  'Completado': 'green',
  'En proceso': 'blue',
  'Cancelado': 'red',
};

function generateHistory() {
  const data = [];
  const baseDate = new Date('2026-06-05');
  for (let i = 0; i < 40; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - Math.floor(i / 5));
    const h = String(7 + Math.floor(Math.random() * 10)).padStart(2, '0');
    const m = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const orig = origins[Math.floor(Math.random() * origins.length)];
    let dest;
    do { dest = destinations[Math.floor(Math.random() * destinations.length)]; } while (dest === orig);
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = `${Math.floor(Math.random() * 8) + 1}:${String(Math.floor(Math.random() * 60)).padStart(2,'0')} min`;
    data.push({
      id: i + 1,
      date: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`,
      time: `${h}:${m}`,
      product: products[Math.floor(Math.random() * products.length)],
      origin: orig,
      dest: dest,
      duration: duration,
      status: status,
    });
  }
  return data;
}

let allHistory = generateHistory();
let currentFilter = 'todos';
let currentSearch = '';

function renderHistory() {
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  let data = allHistory.filter(row => {
    const matchesFilter = currentFilter === 'todos' || row.status.toLowerCase() === currentFilter.toLowerCase();
    const matchesSearch = !currentSearch ||
      row.product.toLowerCase().includes(currentSearch.toLowerCase()) ||
      row.dest.toLowerCase().includes(currentSearch.toLowerCase()) ||
      row.origin.toLowerCase().includes(currentSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const countEl = document.getElementById('table-count');
  if (countEl) countEl.textContent = `Mostrando ${data.length} registros`;

  tbody.innerHTML = data.slice(0, 20).map(row => `
    <tr>
      <td style="color:var(--text-muted);font-weight:600">#${String(row.id).padStart(3,'0')}</td>
      <td>${row.date}</td>
      <td style="font-variant-numeric:tabular-nums">${row.time}</td>
      <td><strong>${row.product}</strong></td>
      <td>${row.origin}</td>
      <td>${row.dest}</td>
      <td style="color:var(--text-muted)">${row.duration}</td>
      <td><span class="badge-pill ${statusBadge[row.status] || 'blue'}">${row.status}</span></td>
    </tr>
  `).join('');
}

function filterHistory(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderHistory();
}

function searchHistory() {
  const input = document.getElementById('history-search');
  currentSearch = input ? input.value : '';
  renderHistory();
}

// ============================================================
// WAREHOUSE VEHICLE ANIMATION
// ============================================================
const vehicleRoute = [
  { left: '72px', top: '60px', zone: 'A → B' },    // Zone A center
  { left: 'calc(100% - 211px)', top: '60px', zone: 'B → C' },  // Zone B center
  { left: 'calc(50% - 95px)', top: '165px', zone: 'C → A' },  // Zone C center
];
let vehicleStep = 0;
let vehicleInterval = null;
const missionProducts = ['Botellas', 'Tazas', 'Celulares'];
const missionLocs = ['Zona A', 'Zona B', 'Zona C'];

function moveVehicle() {
  const v = document.getElementById('vehicle-dot');
  if (!v) return;
  vehicleStep = (vehicleStep + 1) % vehicleRoute.length;
  const pos = vehicleRoute[vehicleStep];
  v.style.left = pos.left;
  v.style.top = pos.top;

  const zoneEl = document.getElementById('active-zone');
  if (zoneEl) zoneEl.textContent = pos.zone;

  const missionLoc = document.getElementById('mission-location');
  const missionDest = document.getElementById('mission-dest');
  const missionProd = document.getElementById('mission-product');
  const routeFill = document.getElementById('route-fill');
  const routePct = document.getElementById('route-pct');

  const fromZone = missionLocs[vehicleStep];
  const toZone = missionLocs[(vehicleStep + 1) % missionLocs.length];
  if (missionLoc) missionLoc.textContent = fromZone;
  if (missionDest) missionDest.textContent = toZone;
  if (missionProd) missionProd.textContent = missionProducts[vehicleStep % missionProducts.length];

  const pct = Math.floor(Math.random() * 40) + 40;
  if (routeFill) routeFill.style.width = pct + '%';
  if (routePct) routePct.textContent = pct + '%';
}

function initVehicle() {
  const v = document.getElementById('vehicle-dot');
  if (!v) return;
  v.style.left = vehicleRoute[0].left;
  v.style.top = vehicleRoute[0].top;
  if (!vehicleInterval) {
    vehicleInterval = setInterval(moveVehicle, 3500);
  }
}

// ============================================================
// CONTROL CENTER
// ============================================================
let opState = 'idle'; // idle | running | paused | done

function setOpButtons(start, pause, resume, stop) {
  document.getElementById('btn-start').disabled = !start;
  document.getElementById('btn-pause').disabled = !pause;
  document.getElementById('btn-resume').disabled = !resume;
  document.getElementById('btn-stop').disabled = !stop;
}

function setIndicator(active) {
  // active: 'disponible' | 'proceso' | 'completado' | null
  const ids = ['disponible', 'proceso', 'completado'];
  ids.forEach(id => {
    const led = document.getElementById('led-' + id);
    const chk = document.getElementById('chk-' + id);
    const indEl = document.getElementById('ind-' + id);
    if (led) { led.className = 'ind-led gray'; }
    if (chk) chk.classList.remove('show');
    if (indEl) indEl.style.background = '';
  });

  if (active === 'disponible') {
    const led = document.getElementById('ind-disponible')?.querySelector('.ind-led');
    if (led) led.className = 'ind-led green';
    const chk = document.getElementById('chk-disponible');
    if (chk) chk.classList.add('show');
  } else if (active === 'proceso') {
    const led = document.getElementById('led-proceso');
    if (led) led.className = 'ind-led amber';
    const chk = document.getElementById('chk-proceso');
    if (chk) chk.classList.add('show');
    const indEl = document.getElementById('ind-proceso');
    if (indEl) indEl.style.background = 'var(--amber-light)';
  } else if (active === 'completado') {
    const led = document.getElementById('led-completado');
    if (led) led.className = 'ind-led green';
    const chk = document.getElementById('chk-completado');
    if (chk) chk.classList.add('show');
    const indEl = document.getElementById('ind-completado');
    if (indEl) indEl.style.background = 'var(--green-light)';
  }
}

function addLog(type, message) {
  const log = document.getElementById('op-log');
  if (!log) return;
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  entry.innerHTML = `<span class="log-time">${time}</span><span class="log-msg">${message}</span>`;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function setOpDisplay(icon, status, desc) {
  const iconWrap = document.getElementById('op-icon-wrap');
  const labelEl = document.getElementById('op-status-label');
  const descEl = document.getElementById('op-status-desc');
  if (iconWrap) iconWrap.className = `op-display-icon ${icon}`;
  if (labelEl) labelEl.textContent = status;
  if (descEl) descEl.textContent = desc;
}

function opStart() {
  opState = 'running';
  setOpButtons(false, true, false, true);
  setIndicator('proceso');
  setOpDisplay('running', 'En proceso', 'Operación activa — Zona A → Zona B');
  addLog('info', 'Operación iniciada por el operador');
  addLog('success', 'Vehículo KL-01 asignado — iniciando ruta');
}

function opPause() {
  opState = 'paused';
  setOpButtons(false, false, true, true);
  setIndicator(null);
  setOpDisplay('paused', 'Pausado', 'La operación ha sido pausada temporalmente');
  addLog('warning', 'Operación pausada por el operador');
}

function opResume() {
  opState = 'running';
  setOpButtons(false, true, false, true);
  setIndicator('proceso');
  setOpDisplay('running', 'En proceso', 'Operación reanudada — continuando ruta');
  addLog('info', 'Operación reanudada correctamente');
}

function opStop() {
  opState = 'done';
  setOpButtons(true, false, false, false);
  setIndicator('completado');
  setOpDisplay('done', 'Completado', 'La operación ha finalizado exitosamente');
  addLog('success', 'Operación finalizada correctamente');
  addLog('success', 'Ruta completada — vehículo KL-01 retornando a base');
  setTimeout(() => {
    opState = 'idle';
    setOpButtons(true, false, false, false);
    setIndicator('disponible');
    setOpDisplay('idle', 'Disponible', 'Sistema listo para iniciar nuevas operaciones');
    addLog('info', 'Sistema disponible para nueva operación');
  }, 4000);
}

// Initialize control
setIndicator('disponible');
setOpButtons(true, false, false, false);

// ============================================================
// SETTINGS SAVE FEEDBACK
// ============================================================
document.addEventListener('click', e => {
  if (e.target.classList.contains('sp-save')) {
    const btn = e.target;
    const orig = btn.textContent;
    btn.textContent = 'Guardado';
    btn.style.background = 'var(--green)';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
    }, 2000);
  }
});

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  animateKPIs();
  renderHistory();
  initVehicle();
});
// ============================================================
// EXPOSICIÓN GLOBAL (Para Vite y type="module")
// ============================================================
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.filterHistory = filterHistory;
window.searchHistory = searchHistory;
window.opStart = opStart;
window.opPause = opPause;
window.opResume = opResume;
window.opStop = opStop;