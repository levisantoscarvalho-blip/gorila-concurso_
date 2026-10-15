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

// ── TEMAS DO SISTEMA (Configurações ➔ Configuração do sistema) ──
// Claro, Escuro e Cinza escuro são grátis; os outros (variações de branco, cinza e preto — botão "Mais cores no Pro")
// são do Gorila Pro (pedido do Levi). Lista ESCOLHIDA pelo Levi em 2026-10-15 (Papel, Gelo, Sépia, Névoa, Grafite, Preto total, Carvão, Meia-noite, Roxo noite).
// a lista final vai ser decidida com o Levi. base 'claro' ➔ visual claro (body.light); 'escuro' ➔ visual escuro.
// As cores de cada tema ficam em geral/base.css (body.tema-ID). amostra = [fundo, cartão] para o quadradinho de escolha.
const TEMAS = {
  light:   {nome:'Claro',          base:'claro'},
  dark:    {nome:'Escuro',         base:'escuro'},
  cinza:   {nome:'Cinza escuro',   base:'escuro'},
  papel:   {nome:'Papel',          base:'claro',  grupo:'branco', pro:true, amostra:['#f4f4f5','#ffffff']},
  gelo:    {nome:'Gelo',           base:'claro',  grupo:'branco', pro:true, amostra:['#eef2f6','#fbfdff']},
  sepia:   {nome:'Sépia (leitura)',base:'claro',  grupo:'branco', pro:true, amostra:['#f4ecdd','#fbf6ec']},
  preto:   {nome:'Preto total',    base:'escuro', grupo:'preto',  pro:true, amostra:['#000000','#0d0d0d']},
  carvao:  {nome:'Carvão',         base:'escuro', grupo:'preto',  pro:true, amostra:['#1c1917','#26221f']},
  nevoa:   {nome:'Névoa',          base:'claro',  grupo:'cinza',  pro:true, amostra:['#e4e6ea','#f4f5f7']},
  grafite: {nome:'Grafite',        base:'escuro', grupo:'cinza',  pro:true, amostra:['#2b2b2b','#353535']},
  meianoite:{nome:'Meia-noite',    base:'escuro', grupo:'cor',    pro:true, amostra:['#0b1220','#111a2b']},
  roxo:    {nome:'Roxo noite',     base:'escuro', grupo:'cor',    pro:true, amostra:['#130f1f','#1b162b']},
};
let temaPrevia = null;   // quem não é Pro clica num tema Pro ➔ vê uma PRÉVIA (nada é salvo)
// tema que vale agora: um tema Pro sem o Pro ativo volta para o claro/escuro da mesma base
function temaAtual(){
  const t = TEMAS[state.theme]; if(!t) return 'light';
  if(t.pro && !state.pro) return t.base==='claro' ? 'light' : 'dark';
  return state.theme;
}
function applyTheme(){
  const id = temaPrevia || temaAtual(), t = TEMAS[id] || TEMAS.light;
  const isLight = t.base === 'claro';
  document.body.classList.toggle('light', isLight);
  Object.keys(TEMAS).forEach(k => document.body.classList.remove('tema-'+k));
  document.body.classList.toggle('tema-pers', id!=='light' && id!=='dark');   // qualquer tema além do claro/escuro padrão
  if(id!=='light' && id!=='dark') document.body.classList.add('tema-'+id);
  const lua = '<svg class="ico-tema" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
  const sol = '<svg class="ico-tema" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const label = isLight ? lua+' Tema escuro' : sol+' Tema claro';
  ['theme-btn','theme-btn-sidebar'].forEach(id=>{ const el=document.getElementById(id); if(el) el.innerHTML=label; });

  const cor = 'azul';   // seletor de cores removido: o site usa sempre o azul
  Object.keys(CORES_DESTAQUE).forEach(c => document.body.classList.remove('accent-'+c));
  document.body.classList.add('accent-'+cor);
  renderSeletorCores();
}
function toggleTheme(){
  state.theme = temaAtual()==='light' ? 'dark' : 'light';
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
