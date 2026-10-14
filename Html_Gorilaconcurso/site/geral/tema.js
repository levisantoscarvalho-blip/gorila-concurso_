/* ════════════════════════════════════════════
   GERAL — tema
   Tema claro/escuro e cor de destaque.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// TEMA
// ════════════════════════════════════════════
const CORES_DESTAQUE = {
  azul: {nome:'Azul', hex:'#4f7ef7'},
  roxo: {nome:'Roxo', hex:'#8b5cf6'},
  verde: {nome:'Verde', hex:'#22c55e'},
  laranja: {nome:'Laranja', hex:'#f97316'},
  rosa: {nome:'Rosa', hex:'#ec4899'},
  vermelho: {nome:'Vermelho', hex:'#ef4444'},
  ciano: {nome:'Ciano', hex:'#06b6d4'}
};

function applyTheme(){
  const isLight = state.theme === 'light';
  document.body.classList.toggle('light', isLight);
  const label = isLight ? '<span class="icon-emoji">🌙</span> Tema escuro' : '<span class="icon-emoji">☀️</span> Tema claro';
  ['theme-btn','theme-btn-sidebar'].forEach(id=>{ const el=document.getElementById(id); if(el) el.innerHTML=label; });

  const cor = 'azul';   // seletor de cores removido: o site usa sempre o azul
  Object.keys(CORES_DESTAQUE).forEach(c => document.body.classList.remove('accent-'+c));
  document.body.classList.add('accent-'+cor);
  renderSeletorCores();
}
function toggleTheme(){
  state.theme = state.theme==='dark' ? 'light' : 'dark';
  state.temaEscolhido = true;
  applyTheme(); saveState();
}
function setAccentColor(cor){
  state.corDestaque = cor;
  applyTheme();
  saveState();
}
function renderSeletorCores(){
  const el = document.getElementById('seletor-cores');
  if(!el) return;
  const corAtual = state.corDestaque || 'azul';
  el.innerHTML = Object.entries(CORES_DESTAQUE).map(([key, info]) => `
    <button onclick="setAccentColor('${key}')" title="${info.nome}" style="width:26px;height:26px;border-radius:50%;background:${info.hex};border:2px solid ${corAtual===key ? 'var(--text-primary)' : 'transparent'};cursor:pointer;box-shadow:0 0 0 1px var(--border);transition:transform .15s" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"></button>
  `).join('');
}
