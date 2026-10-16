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

// Configurações (engrenagem) — layout pedido pelo Levi: MENU à esquerda (como a barra lateral do calendário) e, à direita,
// aparece o que foi clicado. Por enquanto o menu tem só "Configuração do sistema", com o "Modo noturno" (claro / escuro /
// cinza escuro — o tema saiu da barra lateral) e as "Cores do sistema" (Pro).
// As Configurações abrem POR CIMA da tela em que a pessoa estava (#cfg-screen), sem apagá-la: o botão "Voltar"
// (embaixo, à direita, sob a barra de ícones) só fecha esta camada e a pessoa volta exatamente para o que fazia.
let cfgVoltar=null;
function trAbrirConfig(){
  let tela=document.getElementById('cfg-screen');
  if(!tela){ tela=document.createElement('div'); tela.id='cfg-screen'; document.body.appendChild(tela); }
  if(tela.style.display!=='block'){
    cfgVoltar={ ativo: document.querySelector('#theme-rail .tr-item.ativo')?.id || null, tema: temaAtual() };
    // (sem "entrarComoVisitante" aqui: ele abria o calendário por baixo — era o erro do "Voltar" que caía no calendário)
    tela.style.display='block';
  }
  trMarcarAtivo('tr-config');
  renderTelaConfig();
}
// fecha a camada das Configurações (sem mexer na tela de baixo)
function cfgEsconder(){
  const tela=document.getElementById('cfg-screen'); if(!tela || tela.style.display!=='block') return false;
  tela.style.display='none'; tela.innerHTML=''; cfgMaisAberto=false; cfgDicaPro=false;
  if(temaPrevia){ temaPrevia=null; applyTheme(); }   // a prévia de tema Pro acaba
  return true;
}
function renderTelaConfig(){
  const ns=document.getElementById('cfg-screen'); if(!ns || ns.style.display!=='block') return;
  const tema=temaPrevia ? null : temaAtual();
  const opcao=(valor, nome)=>`<button type="button" class="${tema===valor?'ativo':''}" aria-pressed="${tema===valor}" onclick="cfgMudarTema('${valor}')">${nome}</button>`;
  // MAIS CORES NO PRO: o botão azul abre o painel com quadradinhos de cada variação; sem o Pro, cadeado + prévia ao clicar
  const cadeado='<svg class="cfg-tema-cadeado" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
  const quadro=id=>{ const t=TEMAS[id], ativo=(temaPrevia||temaAtual())===id;
    return `<button type="button" class="cfg-tema${ativo?' ativo':''}" aria-pressed="${ativo}" onclick="cfgEscolherTema('${id}')" title="${t.nome}">
      <span class="cfg-tema-amostra" style="background:${t.amostra[0]}"><i style="background:${t.amostra[1]}"></i><b></b>${state.pro?'':cadeado}</span>
      <span class="cfg-tema-nome">${t.nome}</span></button>`; };
  const grupo=(g, titulo)=>`<h5>${titulo}</h5><div class="cfg-temas-grade">${Object.keys(TEMAS).filter(id=>TEMAS[id].grupo===g).map(quadro).join('')}</div>`;
  ns.innerHTML=`<div class="cfg-layout">
    <nav class="cfg-menu" aria-label="Configurações">
      <div class="cfg-menu-titulo">Configurações</div>
      <button type="button" class="nav-item active" aria-current="page">Configuração do sistema</button>
    </nav>
    <div class="cfg-conteudo">
      <h1>Configuração do sistema</h1>
      <section class="cfg-cartao">
        <div class="cfg-linha"><div><b>Modo noturno</b><span>Claro, escuro ou cinza escuro, como preferir.</span></div>
          <div class="cfg-linha-acoes">
            <div class="cfg-seg" role="group" aria-label="Modo noturno">${opcao('light','Claro')}${opcao('dark','Escuro')}${opcao('cinza','Cinza escuro')}</div>
            <span class="cfg-pro-wrap"><button type="button" class="cfg-mais-cores${cfgMaisAberto?' aberto':''}" aria-describedby="cfg-pro-dica" onclick="cfgBotaoPro()">PRO</button>
              <span class="cfg-pro-dica${cfgDicaPro?' fixa':''}" id="cfg-pro-dica" role="tooltip">Novas cores só no plano Pro</span></span>
          </div></div>
      </section>
      ${cfgMaisAberto ? `<section class="cfg-mais-painel" aria-label="Mais cores no Pro">
        <div class="cfg-mais-cab"><div><b>Mais cores no Pro <span class="pro-selo">PRO</span></b>
          <span>${state.pro ? 'Variações de branco, cinza e preto para o site inteiro. Clique para usar.'
            : 'Variações de branco, cinza e preto para o site inteiro. Clique numa cor para ver como o site fica — usar de verdade é um recurso do Gorila Pro.'}</span></div>
          <button type="button" class="cfg-mais-x" onclick="cfgMaisCores(false)" aria-label="Fechar">✕</button></div>
        ${grupo('branco','Tons de branco')}${grupo('cinza','Tons de cinza')}${grupo('preto','Tons de preto')}${grupo('cor','Escuros com cor')}
        ${temaPrevia ? `<div class="cfg-previa"><div><b>Prévia: ${TEMAS[temaPrevia].nome}</b><span>Você está vendo como o site fica com essa cor. Ela não foi salva — é um recurso do Gorila Pro.</span></div>
          <div class="cfg-previa-botoes"><button type="button" class="cfg-botao" onclick="cfgFecharPrevia()">Voltar ao meu tema</button>
            <a class="cfg-botao principal" href="institucional/planos.html" target="_blank" rel="noopener">Ver planos</a></div></div>` : ''}
      </section>` : ''}
    </div>
  </div>
  <button type="button" class="cfg-voltar-fixo" onclick="cfgVoltarAnterior()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Voltar</button>`;
}
// troca o tema: claro, escuro (preto estilo YouTube) ou cinza escuro (cinza-grafite mais claro)
function cfgMudarTema(tema){
  temaPrevia=null;
  if(state.theme!==tema){ state.theme=tema; state.temaEscolhido=true; saveState(); }
  applyTheme(); renderTelaConfig();
}
// cores do sistema: com o Pro, escolhe e salva; sem o Pro, mostra a PRÉVIA (o site muda de cor) + a explicação do recurso pago
function cfgEscolherTema(id){
  if(state.pro){ cfgMudarTema(id); return; }
  temaPrevia=id; applyTheme(); renderTelaConfig();
}
function cfgFecharPrevia(){ temaPrevia=null; applyTheme(); renderTelaConfig(); }
// botão "Mais cores no Pro": abre/fecha o painel das variações (fechar também desfaz a prévia)
let cfgMaisAberto=false, cfgDicaPro=false;
// botão "PRO" ao lado do Modo noturno: com o Pro, abre as cores; sem o Pro, mostra a mensagem "Novas cores só no plano Pro"
// (ela também aparece ao passar o mouse). Clicar de novo, ou fora, esconde.
function cfgBotaoPro(){
  if(state.pro){ cfgMaisCores(); return; }
  cfgDicaPro=!cfgDicaPro; renderTelaConfig();
}
document.addEventListener("click", e=>{ if(cfgDicaPro && !e.target.closest(".cfg-pro-wrap")){ cfgDicaPro=false; renderTelaConfig(); } });
function cfgMaisCores(abrir){
  cfgMaisAberto = abrir===undefined ? !cfgMaisAberto : abrir;
  if(!cfgMaisAberto && temaPrevia){ temaPrevia=null; applyTheme(); }
  renderTelaConfig();
}
// "Voltar": fecha as Configurações e a pessoa continua EXATAMENTE onde estava (a tela de baixo nunca foi apagada)
function cfgVoltarAnterior(){
  const o=cfgVoltar||{}; cfgVoltar=null;
  cfgEsconder();
  trMarcarAtivo(o.ativo || '');
  // mudou o tema enquanto estava aqui: o mapa (desenhado em imagem) é redesenhado com as cores novas
  if(o.tema!==temaAtual()) window.dispatchEvent(new Event('resize'));
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
  if(typeof cfgEsconder==='function') cfgEsconder();   // abriu outra tela: as Configurações (e a prévia de tema Pro) fecham
  document.querySelectorAll('.modal-overlay.open').forEach(m=>m.classList.remove('open'));
  document.querySelectorAll('.cm-tour,.cm-tour-luz').forEach(e=>e.remove());   // balões do tour de Notícias
  // mapa de concursos: trocou de tela ➔ fecha estado/região aberta (senão, ao voltar, a região não abria mais)
  // e a busca que desceu volta ao topo
  if(typeof cmVendoEstado!=='undefined' && cmVendoEstado && typeof cmFecharEstado==='function') cmFecharEstado();
  if(typeof cmBuscaSubir==='function') cmBuscaSubir(true);
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
  // Mural do mês, Conteúdos e Mapa Mental = recursos do Gorila Pro (pedido do Levi, 15/10/2026): sem o Pro aparecem com
  // cadeado + selo PRO e, ao clicar, abrem a tela de bloqueio (navProTrava) em vez do recurso.
  nav.innerHTML=cfg.nav.map(n=>{ const trava=NAV_PRO[n.tab] && !state.pro;
    return `<div class="nav-item${trava?' nav-pro-trava':''}" onclick="navClick('${n.tab}','${n.area||''}')" data-tab="${n.tab}"${trava?' title="Recurso do Gorila Pro"':''}><span class="nav-icon">${navIcon(n.icon)}</span>${n.label}${trava?`<span class="nav-pro-selo"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>PRO</span>`:''}</div>`; }).join('');

  const first=cfg.nav[0];
  navClick(first.tab, first.area||'');
  updateSidebarHours();
}

// recursos do Gorila Pro na barra lateral: o que cada um faz (mesmo texto da página de Ajuda)
const NAV_PRO = {
  mural:    {nome:'Mural do mês', faz:'Você escolhe um mês e um dia e vê tudo o que fez naquele dia: horas, questões, matérias, anotação e foto.', serve:'Relembrar o que estudou e revisar o seu histórico com calma.'},
  conteudos:{nome:'Conteúdos', faz:'Guarda os seus cursos e concursos, com as matérias de cada um, para você marcar o que já estudou.', serve:'Saber quanto do edital ou da grade você já cobriu e o que ainda falta.'},
  mindmap:  {nome:'Mapa Mental', faz:'Você cria tópicos e subtópicos com resumos e imagens.', serve:'Organizar o que aprendeu e revisar rápido antes da prova.'},
};
// tela de bloqueio no lugar do recurso (sem o Pro)
function navProTrava(tab){
  const p=NAV_PRO[tab], base=document.getElementById('tab-mural')?.parentElement; if(!p || !base) return;
  let el=document.getElementById('tab-pro-trava');
  if(!el){ el=document.createElement('div'); el.className='tab-content'; el.id='tab-pro-trava'; base.appendChild(el); }
  el.innerHTML=`<div class="pro-trava">
      <div class="pro-trava-icone"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></div>
      <span class="pro-trava-selo">Gorila Pro</span>
      <h2>${p.nome} é um recurso do Gorila Pro</h2>
      <p><b>O que faz:</b> ${p.faz}</p>
      <p><b>Para que serve:</b> ${p.serve}</p>
      <a class="tv-botao" href="institucional/planos.html" target="_blank" rel="noopener">Ver planos</a>
      <small>Calendário, foguinho e Concursos pelo Brasil continuam liberados.</small>
    </div>`;
  showTab('pro-trava');
}
function navClick(tab, area){
  navRegistrar({section:currentSection, tab:tab, area:area||''});
  document.querySelectorAll('.sidebar .nav-item').forEach(n=>n.classList.toggle('active', n.dataset.tab===tab));
  if(NAV_PRO[tab] && !state.pro){ navProTrava(tab); return; }   // sem o Pro: cadeado
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
