/* ════════════════════════════════════════════
   GERAL — navegação
   Troca de telas e abas, setas voltar/avançar, barra de ícones da direita.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// NAVEGAÇÃO HOME → SEÇÕES
// ════════════════════════════════════════════
const SECTION_NAVS = {
  guia:{
    title:'Guia Geral', sub:'Calendário · Mural · Conteúdos',
    nav:[
      {label:'Calendário',icon:'ti-calendar',tab:'calendario'},
      {label:'Mural do mês',icon:'ti-layout-board',tab:'mural'},
      {label:'Conteúdos',icon:'ti-list-check',tab:'conteudos'},
      {label:'Mapa Mental',icon:'ti-topology-star-3',tab:'mindmap'},
    ]
  },
  ciencia:{
    title:'Ciência de Dados', sub:'Estácio — Infográfico',
    nav:[
      {label:'Infográfico',icon:'ti-chart-bar',tab:'infografico',area:'ciencia'},
      {label:'Conteúdos',icon:'ti-list-check',tab:'conteudos'},
      {label:'Mapa Mental',icon:'ti-topology-star-3',tab:'mindmap'},
    ]
  },
  sefaz:{
    title:'SEFAZ SP', sub:'Concurso — Infográfico',
    nav:[{label:'Infográfico',icon:'ti-chart-bar',tab:'infografico',area:'sefaz'}]
  },
  direito:{
    title:'Direito', sub:'Estudo jurídico — Infográfico',
    nav:[{label:'Infográfico',icon:'ti-chart-bar',tab:'infografico',area:'direito'}]
  },
  notario:{
    title:'Notário e Registrador', sub:'Concurso de cartório — Infográfico',
    nav:[{label:'Infográfico',icon:'ti-chart-bar',tab:'infografico',area:'notario'}]
  },
  painel:{
    title:'Painel Geral', sub:'Panorama completo',
    nav:[{label:'Painel Infográfico',icon:'ti-report-analytics',tab:'infografico',area:'geral'}]
  }
};

// Ícones do menu lateral: desenhos de traço simples (mesmo estilo da barra azul da direita)
const ICON_MAP = {
  'calendar':        '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  'layout-board':    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M10 9v12"/>',
  'list-check':      '<path d="M4 6.5l1.5 1.5L8.5 5M4 12.5l1.5 1.5 3-3M4 18.5l1.5 1.5 3-3M12 7h8M12 13h8M12 19h8"/>',
  'topology-star-3': '<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12M12 12l-5.2 5.2M12 12l5.2 5.2"/>',
  'chart-bar':       '<path d="M3 21h18"/><rect x="5" y="11" width="3.5" height="7"/><rect x="10.25" y="6" width="3.5" height="12"/><rect x="15.5" y="13" width="3.5" height="5"/>',
  'report-analytics':'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 17v-3M12 17v-6M16 17v-4"/>',
};
function navIcon(name){
  const d = ICON_MAP[(name||'').replace('ti-','')] || ICON_MAP['list-check'];
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
}
/* ─── HISTÓRICO ← → (ida e volta) ─── */
let navStack=[], navIdx=-1, navRestaurando=false;
function navReset(){ navStack=[]; navIdx=-1; navAtualizarSetas(); }
function navRegistrar(v){
  if(navRestaurando) return;
  const at=navStack[navIdx];
  if(at && at.section===v.section && at.tab===v.tab && at.area===v.area) return;
  navStack=navStack.slice(0,navIdx+1); navStack.push(v); navIdx=navStack.length-1;
  navAtualizarSetas();
}
function navAtualizarSetas(){
  const b=document.getElementById('tr-voltar'), a=document.getElementById('tr-avancar');
  if(b) b.disabled = navIdx<=0;
  if(a) a.disabled = navIdx>=navStack.length-1;
}
function navIr(delta){
  const novo=navIdx+delta;
  if(novo<0 || novo>=navStack.length) return;
  const v=navStack[novo]; navIdx=novo; navRestaurando=true;
  try{
    fecharTudo();
    if(v.section==='noticias'){ mostrarNoticias(); }
    else {
      if(currentSection!==v.section || document.getElementById('app-shell').style.display!=='block') openSection(v.section);
      navClick(v.tab, v.area);
    }
  } finally { navRestaurando=false; }
  trMarcarAtivo(v.section==='noticias' ? 'tr-noticias' : 'tr-calendario'); navAtualizarSetas();
}
async function trIrInicio(){
  try{ fecharTudo(); }catch(e){}
  const ns=document.getElementById('news-screen'); if(ns) ns.style.display='none';
  if(window.__guest){
    // visitante: volta à tela inicial sem perder o que já fez nesta visita
    window.__logado=false; renderNewsPanel();
    document.getElementById('home-screen').style.display='none';
    document.getElementById('app-shell').style.display='none';
    mostrarAuth();
  } else if(window.__logado){
    try{ await sairDaSecao(); }catch(e){ console.log('erro ao voltar à tela inicial:', e && e.message); }
  } else {
    try{ auFecharLogin(); }catch(e){}
  }
  navReset(); trMarcarAtivo(''); atualizarSwitchCal();
  window.scrollTo(0,0);
}
// captura o clique na barra do topo antes de qualquer outro elemento poder bloqueá-lo
document.addEventListener('click',function(e){
  const tb=e.target.closest && e.target.closest('#topbar');
  if(!tb) return;
  if(e.target.closest('button,input,a,.tb-search')) return;
  trIrInicio();
},true);
function trMarcarAtivo(id){
  document.querySelectorAll('#theme-rail .tr-item').forEach(b=>b.classList.toggle('ativo', b.id===id));
}
function trAbrirCalendario(){
  if(!window.__logado){ entrarComoVisitante(); trMarcarAtivo('tr-calendario'); return; } // sem conta: conhece o site (nada é salvo)
  openSection('guia'); trMarcarAtivo('tr-calendario');
}
// Sala de estudos ainda não está pronta: abre a mesma tela em branco de Notícias (sem mensagem de "em breve")
function trAbrirSala(){
  if(!window.__logado){ entrarComoVisitante(); }
  mostrarNoticias(true); trMarcarAtivo('tr-sala');
}
// Questões (lugar onde a pessoa vai resolver questões) — ainda não pronta: tela em branco, sem mensagem
function trAbrirQuestoes(){
  if(!window.__logado){ entrarComoVisitante(); }
  mostrarNoticias(true); trMarcarAtivo('tr-questoes');
}

// Configurações (engrenagem) — ainda vamos desenvolver (decisão do Levi): por enquanto tela em branco, sem janela e sem mensagem
function trAbrirConfig(){
  if(!window.__logado){ entrarComoVisitante(); }
  mostrarNoticias(true); trMarcarAtivo('tr-config');
}

// ── janela de CONFIGURAÇÕES — guardada para quando formos desenvolver (a engrenagem NÃO abre isto hoje) ──
function abrirConfig(){ renderConfig(); document.getElementById('config-modal').classList.add('open'); }
function fecharConfig(){ document.getElementById('config-modal').classList.remove('open'); }
function configMudarTema(tema){ if(state.theme!==tema){ toggleTheme(); if(document.getElementById('cm-mapa3d')) cmDesenharMapaLeve(); } renderConfig(); }
function renderConfig(){
  const el=document.getElementById('config-lista'); if(!el) return;
  const escuro = state.theme==='dark', temConta = window.__logado && !window.__guest;
  const linha = (titulo, texto, acao) => `<div class="cfg-linha"><div><b>${titulo}</b><span>${texto}</span></div>${acao}</div>`;
  el.innerHTML = `
    <section class="dia-secao"><h4>Aparência</h4>
      ${linha('Tema', 'Claro ou escuro, como preferir.', `<div class="cfg-seg" role="group" aria-label="Tema">
        <button type="button" class="${!escuro?'ativo':''}" onclick="configMudarTema('light')">Claro</button>
        <button type="button" class="${escuro?'ativo':''}" onclick="configMudarTema('dark')">Escuro</button></div>`)}
    </section>
    <section class="dia-secao"><h4>Calendário</h4>
      ${linha('Cores do calendário', 'Estilo dos dias, paletas e a cor de cada curso.', `<button type="button" class="cfg-botao" onclick="fecharConfig();if(!window.__logado)entrarComoVisitante();abrirCores()">Abrir</button>`)}
    </section>
    <section class="dia-secao"><h4>Ajuda</h4>
      ${linha('Tour do mapa de Notícias', 'Veja de novo como usar o mapa dos concursos.', `<button type="button" class="cfg-botao" onclick="fecharConfig();trAbrirNoticias();setTimeout(()=>cmTour(0),400)">Ver tour</button>`)}
      ${linha('Central de ajuda', 'O que cada parte do site faz.', `<a class="cfg-botao" href="institucional/ajuda.html" target="_blank" rel="noopener">Abrir</a>`)}
    </section>
    <section class="dia-secao"><h4>Conta</h4>
      ${temConta
        ? linha('Sair da conta', 'Seus dados continuam salvos.', `<button type="button" class="cfg-botao perigo" onclick="fecharConfig();sairDaSecao()">Sair</button>`)
        : linha('Sua conta', 'Crie sua conta grátis para guardar o seu progresso.', `<button type="button" class="cfg-botao principal" onclick="fecharConfig();tbRegistrar()">Registrar-se grátis</button>`)}
    </section>`;
}
function trAbrirNoticias(){
  if(!window.__logado){ entrarComoVisitante(); }
  mostrarNoticias();
}
function fecharTudo(){
  document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.cm-tour,.cm-tour-luz').forEach(e=>e.remove());   // balões do tour de Notícias
  const lb=document.getElementById('mm-lightbox-img'); if(lb) lb.src='';
}
// emBranco=true: tela em branco (Sala de estudos, ainda não pronta) · senão: Concursos pelo Brasil (mapa 3D)
function mostrarNoticias(emBranco){
  fecharTudo();
  document.getElementById('home-screen').style.display='none';
  document.getElementById('app-shell').style.display='none';
  const ns=document.getElementById('news-screen');
  ns.innerHTML='';
  ns.style.display='block';
  if(emBranco!==true && typeof renderConcursosMapa==='function') renderConcursosMapa(true);
  currentSection='noticias';
  navRegistrar({section:'noticias', tab:'', area:''});
  trMarcarAtivo('tr-noticias');
  atualizarSwitchCal();
}
function openSection(section){
  fecharTudo();
  const _ns=document.getElementById('news-screen'); if(_ns) _ns.style.display='none';
  currentSection=section;
  let cfg=SECTION_NAVS[section];
  if(!cfg){
    const c = (state.trilhasCustom||[]).find(c=>c.id===section);
    if(!c) return;
    cfg = { title:c.nome, sub:'Carreira personalizada', nav:[{label:'Disciplinas',icon:'list-check',tab:'carreira'}] };
  }
  document.getElementById('home-screen').style.display='none';
  document.getElementById('app-shell').style.display='block';
  document.getElementById('sidebar-section-title').textContent=cfg.title;
  document.getElementById('sidebar-section-sub').textContent=cfg.sub;

  const nav=document.getElementById('sidebar-nav');
  nav.innerHTML=cfg.nav.map(n=>`<div class="nav-item" onclick="navClick('${n.tab}','${n.area||''}')" data-tab="${n.tab}"><span class="nav-icon">${navIcon(n.icon)}</span>${n.label}</div>`).join('');

  const first=cfg.nav[0];
  navClick(first.tab, first.area||'');
  updateSidebarHours();
}

function navClick(tab, area){
  navRegistrar({section:currentSection, tab:tab, area:area||''});
  document.querySelectorAll('.sidebar .nav-item').forEach(n=>n.classList.toggle('active', n.dataset.tab===tab));
  if(tab==='infografico') renderInfografico(area);
  else if(tab==='calendario') renderCalActive();
  else if(tab==='mural'){ muralReiniciar(); renderMural(); }   // o Mural sempre começa no passo 1 (mês)
  else if(tab==='conteudos') renderConteudos();
  else if(tab==='carreira') renderCarreiraCustom(currentSection);
  else if(tab==='mindmap'){ abrirMindMap(); return; }
  showTab(tab);
}

function showTab(id){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  const el=document.getElementById('tab-'+id);
  if(el) el.classList.add('active');
  atualizarSwitchCal();
}
// "Calendário ON/OFF" na barra de cima só aparece na tela do Calendário.
// Fora dela fica invisível mas guarda o espaço (o botão Entrar não sai do lugar).
function atualizarSwitchCal(){
  const sw=document.getElementById('tb-cal-switch'); if(!sw) return;
  const ns=document.getElementById('news-screen'), shell=document.getElementById('app-shell'), cal=document.getElementById('tab-calendario');
  const noCalendario = shell && shell.style.display!=='none' && !(ns && ns.style.display==='block') && cal && cal.classList.contains('active');
  sw.classList.toggle('fora-do-cal', !noCalendario);
}

function goHome(){
  // não há mais tela inicial: o "início" é o Guia de Estudos (calendário)
  openSection('guia');
}
