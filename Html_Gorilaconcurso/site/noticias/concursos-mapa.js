/* ════════════════════════════════════════════
   NOTÍCIAS — CONCURSOS PELO BRASIL (mapa 3D por região)
   Clicar numa região mostra ao lado os concursos JÁ LANÇADOS (edital publicado)
   e os que AINDA VÃO LANÇAR (previstos), com filtro por estado.
   Contorno dos estados: noticias/mapa-brasil.js (malha oficial do IBGE).

   ⚠ DADOS DE EXEMPLO — TROCAR: quando houver o cadastro de concursos (Supabase),
   CONCURSOS_EXEMPLO dá lugar aos dados de verdade. Cada item leva a marca "Exemplo".
   ════════════════════════════════════════════ */

// Regiões: o 1º dígito do código IBGE do estado diz a região
const CM_REGIOES = [
  { id:'N',  nome:'Norte',        dig:'1', cor:'#2f8f5b', lado:'#1d5e3b' },
  { id:'NE', nome:'Nordeste',     dig:'2', cor:'#f0b232', lado:'#a87a17' },
  { id:'CO', nome:'Centro-Oeste', dig:'5', cor:'#c2402f', lado:'#83271b' },
  { id:'SE', nome:'Sudeste',      dig:'3', cor:'#2f7fe0', lado:'#1d559c' },
  { id:'S',  nome:'Sul',          dig:'4', cor:'#8a4f22', lado:'#5a3214' },
];
const CM_UF_NOME = {AC:'Acre',AL:'Alagoas',AP:'Amapá',AM:'Amazonas',BA:'Bahia',CE:'Ceará',DF:'Distrito Federal',ES:'Espírito Santo',GO:'Goiás',MA:'Maranhão',MT:'Mato Grosso',MS:'Mato Grosso do Sul',MG:'Minas Gerais',PA:'Pará',PB:'Paraíba',PR:'Paraná',PE:'Pernambuco',PI:'Piauí',RJ:'Rio de Janeiro',RN:'Rio Grande do Norte',RS:'Rio Grande do Sul',RO:'Rondônia',RR:'Roraima',SC:'Santa Catarina',SP:'São Paulo',SE:'Sergipe',TO:'Tocantins'};
function cmRegiaoDaUF(uf){ const e=MAPA_BR.estados.find(x=>x.uf===uf); return e ? CM_REGIOES.find(r=>r.dig===e.cod[0]) : null; }

// status: 'publicado' = edital já lançado (com prazo de inscrição) · 'previsto' = ainda vai lançar
const CONCURSOS_EXEMPLO = [
  {orgao:'Tribunal de Justiça da Bahia (TJ-BA)', uf:'BA', cargos:'Analista e Técnico Judiciário', vagas:120, salario:13000, banca:'FGV', status:'publicado', inscricoesAte:'2026-11-20'},
  {orgao:'Polícia Civil de Pernambuco', uf:'PE', cargos:'Agente e Escrivão', vagas:300, salario:6200, banca:'Cebraspe', status:'publicado', inscricoesAte:'2026-11-05'},
  {orgao:'Secretaria da Fazenda do Ceará (SEFAZ-CE)', uf:'CE', cargos:'Auditor Fiscal', vagas:60, salario:22000, banca:'FCC', status:'previsto', previsao:'1º semestre de 2027'},
  {orgao:'Prefeitura de São Luís', uf:'MA', cargos:'Professor e Agente Administrativo', vagas:450, salario:4100, banca:'IBFC', status:'publicado', inscricoesAte:'2026-10-30'},
  {orgao:'Polícia Militar do Pará', uf:'PA', cargos:'Soldado', vagas:2000, salario:4800, banca:'Instituto AOCP', status:'previsto', previsao:'Dezembro de 2026'},
  {orgao:'Tribunal Regional do Trabalho do Amazonas (TRT-11)', uf:'AM', cargos:'Técnico Judiciário', vagas:25, salario:8500, banca:'FCC', status:'publicado', inscricoesAte:'2026-11-12'},
  {orgao:'Defensoria Pública de Tocantins', uf:'TO', cargos:'Defensor Público', vagas:15, salario:28000, banca:'Cebraspe', status:'previsto', previsao:'2º semestre de 2027'},
  {orgao:'Polícia Federal', uf:'DF', cargos:'Agente, Escrivão e Delegado', vagas:1000, salario:23600, banca:'Cebraspe', status:'previsto', previsao:'1º semestre de 2027'},
  {orgao:'Tribunal de Justiça de Goiás (TJ-GO)', uf:'GO', cargos:'Analista Judiciário', vagas:80, salario:12500, banca:'FGV', status:'publicado', inscricoesAte:'2026-11-28'},
  {orgao:'SEFAZ Mato Grosso do Sul', uf:'MS', cargos:'Auditor Fiscal', vagas:40, salario:21000, banca:'FGV', status:'previsto', previsao:'Março de 2027'},
  {orgao:'Polícia Civil de Mato Grosso', uf:'MT', cargos:'Investigador', vagas:250, salario:9800, banca:'Cebraspe', status:'publicado', inscricoesAte:'2026-12-03'},
  {orgao:'Tribunal de Justiça de São Paulo (TJ-SP)', uf:'SP', cargos:'Escrevente Técnico Judiciário', vagas:500, salario:6000, banca:'Vunesp', status:'publicado', inscricoesAte:'2026-11-15'},
  {orgao:'SEFAZ São Paulo', uf:'SP', cargos:'Auditor Fiscal Tributário', vagas:150, salario:24000, banca:'FCC', status:'previsto', previsao:'1º semestre de 2027'},
  {orgao:'Polícia Civil do Rio de Janeiro', uf:'RJ', cargos:'Inspetor', vagas:400, salario:7400, banca:'FGV', status:'publicado', inscricoesAte:'2026-11-08'},
  {orgao:'Tribunal de Justiça de Minas Gerais (TJ-MG)', uf:'MG', cargos:'Oficial Judiciário', vagas:320, salario:5800, banca:'Fundep', status:'previsto', previsao:'Janeiro de 2027'},
  {orgao:'Prefeitura de Vitória', uf:'ES', cargos:'Analista e Assistente', vagas:90, salario:5200, banca:'Instituto Consulplan', status:'publicado', inscricoesAte:'2026-10-31'},
  {orgao:'Polícia Militar do Paraná', uf:'PR', cargos:'Soldado', vagas:1500, salario:5600, banca:'UFPR', status:'publicado', inscricoesAte:'2026-11-25'},
  {orgao:'Tribunal de Justiça de Santa Catarina (TJ-SC)', uf:'SC', cargos:'Técnico Judiciário', vagas:60, salario:7900, banca:'FGV', status:'previsto', previsao:'2º semestre de 2027'},
  {orgao:'SEFAZ Rio Grande do Sul', uf:'RS', cargos:'Auditor Fiscal da Receita Estadual', vagas:50, salario:25000, banca:'Cebraspe', status:'publicado', inscricoesAte:'2026-12-10'},
  {orgao:'Tribunal Regional Federal da 5ª Região (TRF-5)', uf:'PE', cargos:'Analista Judiciário', vagas:35, salario:13900, banca:'FCC', status:'previsto', previsao:'Fevereiro de 2027'},
];

let cmRegiao = null;      // null = Brasil inteiro · 'N' | 'NE' | 'CO' | 'SE' | 'S'
let cmStatus = 'todos';   // 'todos' | 'publicado' | 'previsto'
let cmUF = null;

const cmDinheiro = v => 'R$ ' + Number(v).toLocaleString('pt-BR');
const cmData = k => k.split('-').reverse().join('/');

function cmConcursos(){
  return CONCURSOS_EXEMPLO
    .filter(c => !cmRegiao || (cmRegiaoDaUF(c.uf)||{}).id === cmRegiao)
    .filter(c => !cmUF || c.uf === cmUF)
    .filter(c => cmStatus==='todos' || c.status===cmStatus)
    .sort((a,b) => a.status!==b.status ? (a.status==='publicado'?-1:1) : (a.inscricoesAte||'').localeCompare(b.inscricoesAte||''));
}

// ── Mapa 3D com a BANDEIRA de cada estado (bandeiras em noticias/bandeiras/UF.png — domínio público) ──
// Cada estado é um bloco: camada escura deslocada para baixo (espessura) + a bandeira recortada no formato do estado.
function cmMapaSVG(){
  const est = MAPA_BR.estados;
  const regDe = e => CM_REGIOES.find(r=>r.dig===e.cod[0]).id;
  const estado = e => { const r=regDe(e); return cmRegiao===r ? ' sel' : cmRegiao ? ' apagada' : ''; };
  const clips = est.map(e=>`<clipPath id="cm-clip-${e.uf}"><path d="${e.d}"/></clipPath>`).join('');
  const lados = est.map(e=>`<path class="cm-lado${estado(e)}" data-uf="${e.uf}" d="${e.d}"/>`).join('');
  const topos = est.map(e=>`<g class="cm-bloco${estado(e)}" data-uf="${e.uf}" data-r="${regDe(e)}"
      onmouseenter="cmRealce('${e.uf}',true)" onmouseleave="cmRealce('${e.uf}',false)">
      <title>${CM_UF_NOME[e.uf]} · ${CM_REGIOES.find(r=>r.id===regDe(e)).nome}</title>
      <g clip-path="url(#cm-clip-${e.uf})"><path class="cm-fundo" d="${e.d}"/><image class="cm-bandeira" href="noticias/bandeiras/${e.uf}.png" preserveAspectRatio="xMidYMid slice" transform="scale(1,-1)"/></g>
      <path class="cm-borda" d="${e.d}"/></g>`).join('');
  return `<svg class="cm-svg" viewBox="${MAPA_BR.viewBox}" role="img" aria-label="Mapa do Brasil com a bandeira de cada estado">
    <defs>${clips}</defs>
    <g transform="${MAPA_BR.escala}"><g class="cm-lados">${lados}</g><g class="cm-topos">${topos}</g></g></svg>`;
}
// coloca cada bandeira cobrindo o seu estado (precisa do tamanho real do desenho, por isso roda depois de mostrar)
function cmColocarBandeiras(){
  document.querySelectorAll('.cm-bloco').forEach(g=>{
    const b = g.querySelector('.cm-fundo').getBBox(), img = g.querySelector('.cm-bandeira');
    // o mapa do IBGE tem o eixo vertical invertido: a imagem é "desvirada" com scale(1,-1)
    img.setAttribute('x', b.x); img.setAttribute('y', -(b.y+b.height));
    img.setAttribute('width', b.width); img.setAttribute('height', b.height);
  });
}
function cmRealce(uf, on){
  const bloco=document.querySelector(`.cm-bloco[data-uf="${uf}"]`), lado=document.querySelector(`.cm-lado[data-uf="${uf}"]`);
  [bloco,lado].forEach(el=>el && el.classList.toggle('sobe', on));
}
function cmEscolherRegiao(id){ cmRegiao = (cmRegiao===id ? null : id); cmUF = null; cmAtualizar(true); }
function cmEscolherStatus(s){ cmStatus = s; cmAtualizar(); }
function cmEscolherUF(uf){ cmUF = (cmUF===uf ? null : uf); cmAtualizar(); }

function cmItem(c){
  const pub = c.status==='publicado';
  return `<article class="cm-item">
    <div class="cm-item-topo">
      <span class="cm-uf" title="${CM_UF_NOME[c.uf]}">${c.uf}</span>
      <b class="cm-orgao">${escapeHtmlCarreira(c.orgao)}</b>
      <span class="cm-status ${c.status}">${pub?'Edital publicado':'Previsto'}</span>
      <span class="cm-exemplo" title="Concurso de demonstração">Exemplo</span>
    </div>
    <div class="cm-cargos">${escapeHtmlCarreira(c.cargos)}</div>
    <div class="cm-info">
      <span><b>${c.vagas.toLocaleString('pt-BR')}</b> vagas</span>
      <span>até <b>${cmDinheiro(c.salario)}</b></span>
      <span>Banca: <b>${escapeHtmlCarreira(c.banca)}</b></span>
      <span class="cm-prazo">${pub ? `Inscrições até <b>${cmData(c.inscricoesAte)}</b>` : `Previsão: <b>${escapeHtmlCarreira(c.previsao)}</b>`}</span>
    </div>
  </article>`;
}

// partes que mudam a cada clique (legenda + lista) — o mapa NÃO é redesenhado (ficava pesado)
function cmLegendaHTML(){
  return CM_REGIOES.map(r=>{ const n=CONCURSOS_EXEMPLO.filter(c=>(cmRegiaoDaUF(c.uf)||{}).id===r.id).length;
    return `<button type="button" class="cm-leg${cmRegiao===r.id?' sel':''}" onclick="cmEscolherRegiao('${r.id}')" style="--cor:${r.cor}"><i></i>${r.nome}<small>${n}</small></button>`; }).join('');
}
function cmListaHTML(){
  const reg = CM_REGIOES.find(r=>r.id===cmRegiao);
  const base = CONCURSOS_EXEMPLO.filter(c => !cmRegiao || (cmRegiaoDaUF(c.uf)||{}).id===cmRegiao);
  const lista = cmConcursos();
  const nPub = base.filter(c=>c.status==='publicado').length, nPrev = base.filter(c=>c.status==='previsto').length;
  const ufs = reg ? MAPA_BR.estados.filter(e=>e.cod[0]===reg.dig).map(e=>e.uf).sort() : [];
  const filtros = [['todos','Todos',base.length],['publicado','Edital publicado',nPub],['previsto','Previstos',nPrev]]
    .map(([id,txt,n])=>`<button type="button" class="${cmStatus===id?'ativo':''}" onclick="cmEscolherStatus('${id}')">${txt} <small>${n}</small></button>`).join('');
  const chipsUF = ufs.length ? `<div class="cm-ufs">${ufs.map(u=>`<button type="button" class="${cmUF===u?'sel':''}" onclick="cmEscolherUF('${u}')" title="${CM_UF_NOME[u]}">${u}</button>`).join('')}</div>` : '';
  const corpo = lista.length ? lista.map(cmItem).join('')
    : telaVazia({desenho:'mural', compacto:true, titulo:'Nenhum concurso com esse filtro', texto:'Tente outro estado ou veja todos os concursos da região.', botao:'Ver todos', icone:false, acao:"cmUF=null;cmStatus='todos';cmAtualizar()"});
  return `<div class="cm-lista-cab">
      <div><h2>${reg ? reg.nome : 'Brasil inteiro'}</h2><p>${base.length} ${base.length===1?'concurso':'concursos'}${reg?' na região':''}</p></div>
      ${reg ? `<button type="button" class="cm-limpar" onclick="cmEscolherRegiao('${reg.id}')">Ver o Brasil inteiro</button>` : ''}
    </div>
    <div class="cm-filtros" role="group" aria-label="Situação">${filtros}</div>
    ${chipsUF}
    <div class="cm-lista">${corpo}</div>`;
}
// clique: só troca os destaques do mapa e refaz legenda + lista
function cmAtualizar(animar){
  if(!document.querySelector('#news-screen .cm-svg')){ renderConcursosMapa(animar); return; }
  document.querySelectorAll('.cm-bloco').forEach(g=>{
    const r=g.dataset.r, sel=cmRegiao===r, ap=!!cmRegiao && !sel;
    g.classList.toggle('sel', sel); g.classList.toggle('apagada', ap);
    const l=document.querySelector(`.cm-lado[data-uf="${g.dataset.uf}"]`); if(l){ l.classList.toggle('sel', sel); l.classList.toggle('apagada', ap); }
  });
  document.querySelector('.cm-legenda').innerHTML = cmLegendaHTML();
  const lc = document.querySelector('.cm-lista-cartao');
  lc.innerHTML = cmListaHTML();
  if(animar){ lc.classList.remove('entra'); void lc.offsetWidth; lc.classList.add('entra'); }
}
// ════════════════════════════════════════════
// PARTE 1 (agora): SÓ O MAPA — o estado sobe com o mouse e a rodinha do mouse amplia.
// A lista de concursos (cmListaHTML / cmLegendaHTML / cmAtualizar) fica pronta para a próxima parte.
// ════════════════════════════════════════════
let cmZoom = { z:1, x:0, y:0 };
// ── DICA "Clique em um estado": mouse clicando no espaço livre acima do mapa (à esquerda do zoom) + balão
//    (pedido do Levi). Some quando a pessoa clica num estado; volta na próxima vez que abrir a tela. ──
let cmDica = true;
function cmDicaHTML(){
  return `<div class="cm-dica" id="cm-dica" aria-hidden="true">
      <div class="cm-dica-balao">Clique em um estado</div>
      <span class="cm-dica-cursor"><i class="cm-dica-onda"></i><svg viewBox="0 0 24 24"><path d="M5 2.5v16.2l4.3-4 2.9 6.4 2.7-1.2-2.9-6.3 5.9-.3z"/></svg></span>
    </div>`;
}
// posição: a ponta do mouse fica 140px à esquerda do grupo de zoom; o balão termina alinhado à direita do zoom, logo acima do mouse
function cmPosicionarDica(){
  const d=document.getElementById('cm-dica'), so=d?.parentElement, ctrl=document.querySelector('.cm-ctrl-grupo'); if(!d||!so||!ctrl) return;
  const r=so.getBoundingClientRect(), c=ctrl.getBoundingClientRect(), bal=d.querySelector('.cm-dica-balao');
  const x=c.left-140-r.left, y=c.top+8-r.top;
  d.style.left=x+'px'; d.style.top=y+'px';
  bal.style.left=Math.max(-16, c.right+14-r.left-x-bal.offsetWidth)+'px';
}
function renderConcursosMapa(){
  const ns = document.getElementById('news-screen'); if(!ns) return;
  ns.classList.remove('cm-modo-estado');
  cmZoom = { z:1, x:0, y:0 }; cmSel = null; cmVendoEstado = null; cmDica = true;
  ns.innerHTML = `${cmAvisoHTML()}<div class="cm-so-mapa">
      <div class="cm-palco" id="cm-palco" onwheel="cmRoda(event)" onpointerdown="cmArrastaInicio(event)" ondblclick="cmZoomReset()" onclick="cmCliquePalco(event)">
        <div class="cm-zoom" id="cm-zoom"><div class="cm-mapa3d" id="cm-mapa3d"></div><div class="cm-chao"></div></div>
        ${cmSobreHTML()}
        <div class="cm-controles" onpointerdown="event.stopPropagation()" ondblclick="event.stopPropagation()">
          <div class="cm-ctrl-grupo" role="group" aria-label="Zoom do mapa">
            <button type="button" id="cm-mais" onclick="cmZoomPasso(1)" aria-label="Aproximar" title="Aproximar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
            <span class="cm-ctrl-nivel" id="cm-nivel" aria-live="polite">100%</span>
            <button type="button" id="cm-menos" onclick="cmZoomPasso(-1)" aria-label="Afastar" title="Afastar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></button>
          </div>
          <button type="button" class="cm-ctrl-solo" id="cm-inteiro" onclick="cmZoomReset()" aria-label="Ver o Brasil inteiro" title="Ver o Brasil inteiro"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"/></svg></button>
          <button type="button" class="cm-ctrl-solo cm-ajuda" onclick="cmTour(0)" aria-label="Como usar o mapa" title="Como usar o mapa">?</button>
        </div>
      </div>
      ${cmDica?cmDicaHTML():''}
    </div><div class="cm-faixa-rotulo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>Concursos procurados em cada estado</div>${cmFaixaHTML()}`;   // bandeiras EMBAIXO do mapa (pedido do Levi)
  cmDesenharMapaLeve(); cmVistaInicial(); cmPosicionarDica(); cmFaixaVelocidade();   // começa AMPLIADO ao lado do quadro da estrela (pedido do Levi); a mira mostra o Brasil inteiro
  cmTourPrimeira = false;
  if(!cmTourVisto()) setTimeout(()=>{ cmTourPrimeira = true; cmTour(0); }, 500);   // 1ª visita: tour guiado (do "?") e, ao terminar, o quadro da estrela
  else cmSobreAlternar(true);   // demais visitas: o quadro da estrela já aparece aberto (pedido do Levi); some ao mexer no mapa
}
// ── ampliar com a rodinha do mouse (aproxima no ponto onde o mouse está) e arrastar para mover ──
let cmNitidezT=null;
function cmNitidez(){ clearTimeout(cmNitidezT); cmNitidezT=setTimeout(()=>{ const quer=Math.min(6,(window.devicePixelRatio||1)*2.5*Math.max(1,cmZoom.z*0.8)); if(quer>cmResolucao+0.4) cmDesenharMapaLeve(); }, 260); }
function cmAplicarZoom(){
  const el=document.getElementById('cm-zoom'); if(!el) return;
  if(cmZoom.z<=1){ cmZoom={z:1,x:0,y:0}; }
  // limite: o mapa ampliado pode ser arrastado, mas sempre continua cobrindo a área (nunca some)
  const pal=document.getElementById('cm-palco'), W=pal.clientWidth, H=pal.clientHeight;
  cmZoom.x=Math.min(0, Math.max(W-W*cmZoom.z, cmZoom.x)); cmZoom.y=Math.min(0, Math.max(H-H*cmZoom.z, cmZoom.y));
  const nv=document.getElementById('cm-nivel'); if(nv) nv.textContent=Math.round(cmZoom.z*100)+'%';
  const mn=document.getElementById('cm-menos'), it=document.getElementById('cm-inteiro'), ms=document.getElementById('cm-mais');
  if(mn) mn.disabled=cmZoom.z<=1; if(it) it.disabled=cmZoom.z<=1; if(ms) ms.disabled=cmZoom.z>=6;
  el.style.transform=`translate(${cmZoom.x}px,${cmZoom.y}px) scale(${cmZoom.z})`;
  document.getElementById('cm-palco').classList.toggle('ampliado', cmZoom.z>1);
  cmNitidez();
  cmPosicionarDestaque(); clearTimeout(cmPosT); cmPosT=setTimeout(cmPosicionarDestaque,160);   // depois da animação do zoom
}
function cmZoomEm(novo, cx, cy){
  novo=Math.min(6, Math.max(1, novo));
  const k=novo/cmZoom.z;
  cmZoom.x = cx - (cx - cmZoom.x)*k; cmZoom.y = cy - (cy - cmZoom.y)*k; cmZoom.z = novo;
  cmAplicarZoom();
}
function cmRoda(ev){
  cmSobreAlternar(false);   // mexeu no mapa: o quadro da estrela some
  ev.preventDefault();   // não rola a página: amplia o mapa
  const r=document.getElementById('cm-palco').getBoundingClientRect();
  cmZoomEm(cmZoom.z * (ev.deltaY<0 ? 1.18 : 1/1.18), ev.clientX - r.left, ev.clientY - r.top);
}
function cmZoomPasso(dir){ const r=document.getElementById('cm-palco').getBoundingClientRect(); cmZoomEm(cmZoom.z*(dir>0?1.4:1/1.4), r.width/2, r.height/2); }
function cmZoomReset(){ cmZoom={z:1,x:0,y:0}; cmAplicarZoom(); }
// vista inicial (pedido do Levi, igual ao print dele): o Brasil ampliado ocupando ~73% do espaço entre o quadro da estrela e os botões
// (no notebook dele, 1366x600, dá 164%), com o topo encostado no topo da área e começando logo
// à direita do quadro. Em telas estreitas (celular/tablet) começa com o Brasil inteiro.
const CM_OCUPA_INICIAL = 0.727;   // fração do espaço livre que o Brasil ocupa na vista inicial
function cmVistaInicial(){
  const pal=document.getElementById('cm-palco'), mapa=document.getElementById('cm-mapa3d'), sobre=pal?.querySelector('.cm-sobre');
  if(!pal || !mapa || pal.clientWidth<1000){ cmZoomReset(); return; }
  cmZoom={z:1,x:0,y:0}; document.getElementById('cm-zoom').style.transform='none';
  const P=pal.getBoundingClientRect(), m=mapa.getBoundingClientRect(), ctrl=pal.querySelector('.cm-controles')?.getBoundingClientRect();
  const L0=m.left-P.left, T0=m.top-P.top, W0=m.width;
  const fimQuadro=(sobre ? sobre.getBoundingClientRect().left-P.left : 28) + 340;    // borda direita do quadro da estrela
  const espaco=(ctrl ? ctrl.left-P.left : P.width) - fimQuadro;
  const z=Math.min(3, Math.max(1, Math.round(CM_OCUPA_INICIAL*espaco/W0*100)/100));
  const alvoEsq=fimQuadro + W0*z*0.33;                                                // onde a ponta oeste do Brasil começa
  cmZoom={ z, x:alvoEsq-L0*z, y:-T0*z };
  const el=document.getElementById('cm-zoom'); el.style.transition='none'; cmAplicarZoom(); void el.offsetWidth; el.style.transition='';
}
function cmArrastaInicio(ev){
  cmSobreAlternar(false);   // clicou ou arrastou o mapa: o quadro da estrela some
  cmArrastou = false;
  if(cmZoom.z<=1) return;
  ev.preventDefault(); document.body.classList.add('cm-sem-selecao');   // arrastar move o mapa, não seleciona texto
  const ini={x:ev.clientX, y:ev.clientY, ox:cmZoom.x, oy:cmZoom.y};
  const mover=e=>{ if(Math.abs(e.clientX-ini.x)+Math.abs(e.clientY-ini.y)>4) cmArrastou=true; cmZoom.x=ini.ox+(e.clientX-ini.x); cmZoom.y=ini.oy+(e.clientY-ini.y); cmAplicarZoom(); };
  const soltar=()=>{ window.removeEventListener('pointermove',mover); window.removeEventListener('pointerup',soltar); document.getElementById('cm-palco')?.classList.remove('arrastando'); document.body.classList.remove('cm-sem-selecao'); };
  window.addEventListener('pointermove',mover); window.addEventListener('pointerup',soltar);
  document.getElementById('cm-palco').classList.add('arrastando');
}
// ════════════════════════════════════════════
// MAPA LEVE: cada estado é desenhado UMA VEZ numa imagem (canvas) já com espessura, bandeira e borda.
// Subir com o mouse e ampliar só MOVEM essas imagens (trabalho da placa de vídeo) — nada é redesenhado.
// (A versão anterior em SVG redesenhava as 27 bandeiras a cada quadro de animação e travava notebooks.)
// Para saber em qual estado está o mouse, há uma camada invisível com os contornos por cima.
// ════════════════════════════════════════════
let cmBandeirasImg = null;   // as 27 bandeiras carregadas uma vez só
function cmCarregarBandeiras(){
  if(cmBandeirasImg) return cmBandeirasImg;
  cmBandeirasImg = Promise.all(MAPA_BR.estados.map(e=>new Promise(ok=>{
    const im=new Image(); im.onload=()=>ok([e.uf,im]); im.onerror=()=>ok([e.uf,null]); im.src=`noticias/bandeiras/${e.uf}.png`;
  }))).then(l=>Object.fromEntries(l));
  return cmBandeirasImg;
}
// tamanho de cada estado (em unidades do IBGE), medido uma vez
let cmCaixas = null;
function cmMedirEstados(){
  if(cmCaixas) return cmCaixas;
  const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg');
  svg.setAttribute('style','position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden');
  document.body.appendChild(svg);
  cmCaixas={};
  MAPA_BR.estados.forEach(e=>{ const p=document.createElementNS(ns,'path'); p.setAttribute('d',e.d); svg.appendChild(p); cmCaixas[e.uf]=p.getBBox(); });
  svg.remove();
  return cmCaixas;
}
let cmResolucao=0;   // resolução com que o mapa foi desenhado (sobe quando a pessoa amplia, para ficar nítido)
async function cmDesenharMapaLeve(){
  const alvo=document.getElementById('cm-mapa3d'), palco=document.getElementById('cm-palco'); if(!alvo||!palco) return;
  const [vx,vy,vw,vh]=MAPA_BR.viewBox.split(' ').map(Number);          // em graus (eixo y já "desvirado")
  const S=Math.min(palco.clientWidth*0.86/vw, palco.clientHeight*0.92/vh); // px por grau
  const W=vw*S, H=vh*S, D=Math.max(4, S*0.45), pad=3;                     // D = espessura do bloco
  // resolução: 2,5x a tela; quando a pessoa amplia, o mapa é redesenhado com mais detalhe (até 6x)
  const R=Math.min(6, (window.devicePixelRatio||1)*2.5*Math.max(1, (cmZoom.z||1)*0.8)); cmResolucao=R;
  const escuro=!document.body.classList.contains('light');
  const ladoCor=escuro?'#0b0b0b':'#5d6472', bordaCor=escuro?'#1a1a1a':'#ffffff';
  alvo.style.width=W+'px'; alvo.style.height=(H+D)+'px';
  const caixas=cmMedirEstados(), bandeiras=await cmCarregarBandeiras();
  if(!document.body.contains(alvo)) return;
  let html='';
  MAPA_BR.estados.forEach(e=>{
    const b=caixas[e.uf];
    const x0=b.x*1e-4, x1=(b.x+b.width)*1e-4, y0=-(b.y+b.height)*1e-4, y1=-b.y*1e-4;   // caixa em graus (y para baixo)
    const left=(x0-vx)*S-pad, top=(y0-vy)*S-pad, w=(x1-x0)*S+2*pad, h=(y1-y0)*S+D+2*pad;
    html+=`<canvas class="cm-est" data-uf="${e.uf}" width="${Math.ceil(w*R)}" height="${Math.ceil(h*R)}" style="left:${left}px;top:${top}px;width:${w}px;height:${h}px"></canvas>`;
  });
  // camada invisível só para o mouse (mesmos contornos, sem desenho)
  html+=`<svg class="cm-alvo" viewBox="${MAPA_BR.viewBox}" style="width:${W}px;height:${H}px"><g transform="${MAPA_BR.escala}">${
    MAPA_BR.estados.map(e=>`<path d="${e.d}" data-uf="${e.uf}" onmouseenter="cmSobe('${e.uf}',true)" onmouseleave="cmSobe('${e.uf}',false)" onclick="cmClicarEstado('${e.uf}',event)"><title>${CM_UF_NOME[e.uf]}</title></path>`).join('')}</g></svg>`;
  alvo.innerHTML=html;
  // desenha cada estado na sua imagem (uma vez)
  MAPA_BR.estados.forEach(e=>{
    const cv=alvo.querySelector(`canvas[data-uf="${e.uf}"]`), ctx=cv.getContext('2d'), b=caixas[e.uf], p=new Path2D(e.d);
    ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';   // bandeira em alta qualidade
    const x0=b.x*1e-4, y0=-(b.y+b.height)*1e-4;
    const raw=(dy)=>ctx.setTransform(R*S*1e-4,0,0,-R*S*1e-4, R*(pad-x0*S), R*(pad-y0*S+dy));   // IBGE ➔ pixels
    // espessura: o contorno repetido para baixo, do fundo para cima
    ctx.fillStyle=ladoCor;
    for(let i=D;i>=1;i-=1){ raw(i); ctx.fill(p); }
    // topo: bandeira recortada no formato do estado
    raw(0); ctx.save(); ctx.clip(p);
    const img=bandeiras[e.uf];
    ctx.setTransform(R,0,0,R,0,0);
    const bw=b.width*1e-4*S, bh=b.height*1e-4*S;
    if(img){ const k=Math.max(bw/img.width, bh/img.height), iw=img.width*k, ih=img.height*k;
      ctx.drawImage(img, pad+(bw-iw)/2, pad+(bh-ih)/2, iw, ih); }
    else { ctx.fillStyle='#e5e7eb'; ctx.fillRect(0,0,cv.width,cv.height); }
    ctx.restore();
    // borda (vão entre os estados)
    raw(0); ctx.lineJoin='round'; ctx.strokeStyle=bordaCor; ctx.lineWidth=1.1/(S*1e-4); ctx.stroke(p);
  });
  if(cmSel){ cmSobe(cmSel,true); cmPosicionarDestaque(); }   // redesenhou: o estado escolhido continua em destaque
}
function cmSobe(uf,on){ if(!on && uf===cmSel) return; const c=document.querySelector(`.cm-est[data-uf="${uf}"]`); if(c) c.classList.toggle('sobe',on); }
// ════════════════════════════════════════════
// CLIQUE NUM ESTADO (pedido do Levi): o estado fica levantado no mapa e aparece GRANDE num quadro ao lado,
// no espaço vazio (estado do lado esquerdo ➔ quadro à esquerda; do lado direito ➔ à direita), ligado por uma linha.
// Um cursor de mouse "clica" no estado flutuando 3 vezes (depois fica parado; some com o mouse em cima) e o aviso diz:
// "Clique no estado para conferir os concursos e mais!" — clicar no estado flutuando ou de novo no mapa = próximas etapas.
// 2º clique no mesmo estado (ou no estado flutuando): abre o estado dividido em mesorregiões (cmAbrirEstado, mais abaixo).
// SEM caixa em volta (pedido do Levi): só o estado grande flutuando, o nome e o aviso. Fecha clicando fora de um estado ou com Esc.
// ════════════════════════════════════════════
let cmSel = null, cmArrastou = false, cmPosT = null;
function cmClicarEstado(uf, ev){
  if(ev) ev.stopPropagation();
  if(cmArrastou) return;                 // soltou depois de arrastar o mapa: não é clique
  if(cmSel===uf){ cmAbrirEstado(uf); return; }
  cmMostrarDestaque(uf);
}
function cmCliquePalco(ev){
  if(cmArrastou || !cmSel) return;
  if(ev.target.closest('.cm-controles,.cm-destaque,.cm-sobre')) return;
  cmFecharDestaque();
}
function cmMostrarDestaque(uf){
  const palco=document.getElementById('cm-palco'); if(!palco) return;
  cmDica=false; document.getElementById('cm-dica')?.remove();   // já clicou num estado: o mouse de dica some (volta na próxima visita)
  const ant=cmSel; cmSel=uf;
  if(ant && ant!==uf) cmSobe(ant,false);
  cmSobe(uf,true);
  let box=document.getElementById('cm-destaque');
  if(!box){
    box=document.createElement('div'); box.id='cm-destaque'; box.className='cm-destaque'; box.setAttribute('role','dialog');
    box.onpointerdown=e=>e.stopPropagation(); box.ondblclick=e=>e.stopPropagation(); box.onwheel=e=>e.stopPropagation();
    palco.appendChild(box);
    palco.insertAdjacentHTML('beforeend','<svg class="cm-ligacao" id="cm-ligacao" aria-hidden="true"><path class="cm-ligacao-linha"/><circle class="cm-ligacao-ponto" r="5"/></svg>');
  }
  const reg=cmRegiaoDaUF(uf);
  box.setAttribute('aria-label', CM_UF_NOME[uf]);
  box.innerHTML=`
    <div class="cm-destaque-voo" role="button" tabindex="0" aria-label="Ver os concursos de ${CM_UF_NOME[uf]}" onclick="cmAbrirEstado(cmSel)" onkeydown="if(event.key==='Enter')cmAbrirEstado(cmSel)"><canvas class="cm-destaque-img" aria-hidden="true"></canvas>
      <span class="cm-cursor" aria-hidden="true"><i class="cm-cursor-onda"></i><svg viewBox="0 0 24 24"><path d="M5 2.5v16.2l4.3-4 2.9 6.4 2.7-1.2-2.9-6.3 5.9-.3z"/></svg></span></div>
    <div class="cm-destaque-sombra" aria-hidden="true"></div>
    <div class="cm-destaque-nome">${CM_UF_NOME[uf]}</div>
    ${reg?`<div class="cm-destaque-reg">Região ${reg.nome}</div>`:''}
    <div class="cm-destaque-aviso"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 9l10.5 4.2-4.6 1.7-1.7 4.6z"/><path d="M5.5 2.5v3M2.5 5.5h3M3.6 3.6l1.6 1.6M9.5 3.4l-1 1.5M3.4 9.5l1.5-1"/></svg>
      <span>Clique no estado para conferir os concursos e mais!</span></div>`;
  box.classList.remove('entra'); void box.offsetWidth; box.classList.add('entra');
  // o maior possível no espaço livre ao lado do mapa (até 340px), sem cobrir o "Conheça a história" em telas baixas
  const cv=box.querySelector('canvas');
  if(palco.clientWidth>=640){
    const t=cmTamanhoDestaque(uf), b=cmMedirEstados()[uf];
    const h=Math.min(t.h, Math.round((t.w-12)*b.height/b.width + Math.max(10,t.h*0.05) + 14));   // estado "deitado" (ex.: PE): sem espaço vazio embaixo
    box.style.width=t.w+'px'; cv.style.width=t.w+'px'; cv.style.height=h+'px';
  }
  else { box.style.width=''; cv.style.width=''; cv.style.height=''; }
  cmDesenharEstadoGrande(cv, uf);
  cmPosicionarDestaque();
}
function cmFecharDestaque(){
  if(cmVendoEstado) cmFecharEstado();
  const ant=cmSel; cmSel=null; if(ant) cmSobe(ant,false);
  document.getElementById('cm-destaque')?.remove(); document.getElementById('cm-ligacao')?.remove();
}
// tamanho do estado grande: largura do espaço livre do lado em que ele vai aparecer; altura do que sobra na vertical
function cmTamanhoDestaque(uf){
  const palco=document.getElementById('cm-palco'), path=document.querySelector(`.cm-alvo path[data-uf="${uf}"]`), mapa=document.getElementById('cm-mapa3d');
  if(!palco||!path||!mapa) return {w:300,h:260};
  const P=palco.getBoundingClientRect(), e=path.getBoundingClientRect(), m=mapa.getBoundingClientRect(), folga=14;
  const ctrl=palco.querySelector('.cm-controles')?.getBoundingClientRect(), cham=palco.querySelector('.cm-sobre-botao')?.getBoundingClientRect();
  const mapL=m.left-P.left, mapR=m.right-P.left, ex=e.left+e.width/2-P.left;
  const livreEsq=mapL-folga*3, livreDir=(ctrl?ctrl.left-P.left:P.width)-folga-mapR-folga*2;
  const esq = ex<(mapL+mapR)/2 ? livreEsq>=220 || livreDir<220 : livreDir<220 && livreEsq>=220;
  const w=Math.round(Math.max(220, Math.min(340, esq?livreEsq:livreDir)));
  const xEsq=Math.max(folga, mapL-folga*2-w), chamBaixo=cham?cham.bottom-P.top+folga:folga;
  const alturaLivre = esq && cham && xEsq<cham.right-P.left ? P.height-chamBaixo-folga : P.height-folga*2;
  const h=Math.round(Math.max(150, Math.min(w*0.95, alturaLivre-118)));             // 118 = nome + região + aviso + sombra
  return {w, h};
}
// coloca o quadro no espaço livre ao lado do mapa e desenha a linha do estado até ele
function cmPosicionarDestaque(){
  const box=document.getElementById('cm-destaque'), palco=document.getElementById('cm-palco'), lig=document.getElementById('cm-ligacao');
  if(!box||!palco||!lig||!cmSel) return;
  if(cmVendoEstado){ cmLayoutEstado(); return; }   // vendo as mesorregiões: o quadro fica à esquerda
  const path=document.querySelector(`.cm-alvo path[data-uf="${cmSel}"]`), mapa=document.getElementById('cm-mapa3d'); if(!path||!mapa) return;
  const P=palco.getBoundingClientRect(), e=path.getBoundingClientRect(), m=mapa.getBoundingClientRect();
  const ctrl=palco.querySelector('.cm-controles')?.getBoundingClientRect(), cham=palco.querySelector('.cm-sobre-botao')?.getBoundingClientRect();
  const W=P.width, H=P.height, bw=box.offsetWidth, bh=box.offsetHeight, folga=14;
  const ex=e.left+e.width/2-P.left, ey=e.top+e.height/2-P.top;                     // centro do estado dentro do palco
  const dirMax=(ctrl?ctrl.left-P.left:W)-folga;                                      // não cobre os botões do mapa
  const topoEsq=cham?cham.bottom-P.top+folga:folga;                                  // não cobre o "Conheça a história"
  const mapL=m.left-P.left, mapR=m.right-P.left;
  let x, y, lado;
  if(W<640){                                                                         // tela estreita: quadro embaixo, no meio
    lado='baixo'; x=(W-bw)/2; y=H-bh-folga;
  } else {
    const cabeEsq=mapL-folga*2>=bw, cabeDir=dirMax-mapR-folga>=bw;
    lado = ex<(mapL+mapR)/2 ? (cabeEsq||!cabeDir?'esq':'dir') : (cabeDir||!cabeEsq?'dir':'esq');
    if(lado==='esq') x = cabeEsq ? Math.max(folga, mapL-folga*2-bw) : (ex>W/2 ? folga : dirMax-bw);   // ampliado: lado oposto ao estado
    else x = cabeDir ? Math.min(dirMax-bw, mapR+folga*2) : (ex<W/2 ? dirMax-bw : folga);
    const topo = x<(cham?cham.right-P.left:0) ? topoEsq : folga;
    y = Math.min(H-bh-folga, Math.max(topo, ey-bh/2));
  }
  box.style.left=Math.round(x)+'px'; box.style.top=Math.round(y)+'px';
  // ponto de chegada: a borda do quadro mais perto do estado
  let tx, ty;
  if(lado==='baixo'){ tx=Math.min(x+bw-20, Math.max(x+20, ex)); ty=y; }
  else { tx = ex<x ? x : x+bw; ty=Math.min(y+bh-24, Math.max(y+24, ey)); }
  const meioX=(ex+tx)/2;
  lig.setAttribute('width',W); lig.setAttribute('height',H);
  lig.querySelector('path').setAttribute('d', lado==='baixo' ? `M${ex},${ey} Q${ex},${(ey+ty)/2} ${tx},${ty}` : `M${ex},${ey} C${meioX},${ey} ${meioX},${ty} ${tx},${ty}`);
  const c=lig.querySelector('circle'); c.setAttribute('cx',ex); c.setAttribute('cy',ey);
  const dentro = ex>=0 && ex<=W && ey>=0 && ey<=H;                                   // estado saiu da tela (arrastou): esconde a linha
  lig.style.opacity = dentro ? '' : '0';
}
// o estado grande do quadro: desenhado na hora, no tamanho do quadro (nítido), com espessura, bandeira e borda
async function cmDesenharEstadoGrande(cv, uf){
  const est=MAPA_BR.estados.find(x=>x.uf===uf); if(!cv||!est) return;
  const Wc=cv.clientWidth||220, Hc=cv.clientHeight||170, R=Math.min(4,(window.devicePixelRatio||1)*2);
  cv.width=Math.round(Wc*R); cv.height=Math.round(Hc*R);
  const b=cmMedirEstados()[uf], bandeiras=await cmCarregarBandeiras();
  if(!cv.isConnected || cmSel!==uf) return;
  const D=Math.max(10, Math.round(Math.min(Wc,Hc)*0.05)), pad=6, ctx=cv.getContext('2d'), p=new Path2D(est.d);   // espessura acompanha o tamanho
  const S=Math.min((Wc-2*pad)/(b.width*1e-4), (Hc-D-2*pad)/(b.height*1e-4));       // px por grau
  const bw=b.width*1e-4*S, bh=b.height*1e-4*S, ox=(Wc-bw)/2, oy=(Hc-D-bh)/2;
  const x0=b.x*1e-4, y0=-(b.y+b.height)*1e-4;
  const raw=dy=>ctx.setTransform(R*S*1e-4,0,0,-R*S*1e-4, R*(ox-x0*S), R*(oy-y0*S+dy));
  const escuro=!document.body.classList.contains('light');
  ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high';
  ctx.fillStyle=escuro?'#0b0b0b':'#5d6472';
  for(let i=D;i>=1;i-=0.5){ raw(i); ctx.fill(p); }
  raw(0); ctx.save(); ctx.clip(p);
  const img=bandeiras[uf];
  ctx.setTransform(R,0,0,R,0,0);
  if(img){ const k=Math.max(bw/img.width, bh/img.height), iw=img.width*k, ih=img.height*k; ctx.drawImage(img, ox+(bw-iw)/2, oy+(bh-ih)/2, iw, ih); }
  else { ctx.fillStyle='#e5e7eb'; ctx.fillRect(0,0,Wc,Hc); }
  ctx.restore();
  raw(0); ctx.lineJoin='round'; ctx.strokeStyle=escuro?'#1a1a1a':'#ffffff'; ctx.lineWidth=2/(S*1e-4); ctx.stroke(p);
  // cursor do mouse: num ponto DENTRO do estado, perto do meio (procura em volta do centro até achar)
  const cur=cv.parentElement.querySelector('.cm-cursor');
  if(cur){ const cx=ox+bw*0.55, cy=oy+bh*0.5; let px=cx, py=cy;
    achar: for(let r=0;r<Math.max(bw,bh)/2;r+=4) for(let a=0;a<360;a+=30){ const x=cx+r*Math.cos(a*Math.PI/180), y=cy+r*Math.sin(a*Math.PI/180);
      if(ctx.isPointInPath(p, x*R, y*R)){ px=x; py=y; break achar; } }
    cur.style.left=(px/Wc*100)+'%'; cur.style.top=(py/Hc*100)+'%'; }
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && cmSel && !document.querySelector('.modal-overlay.open')){ if(cmRegiaoAberta>=0) cmMesoFechar(); else if(cmVendoEstado) cmFecharEstado(); else cmFecharDestaque(); } });
// ════════════════════════════════════════════
// 2º CLIQUE NO ESTADO (pedido do Levi): o mapa do Brasil dá lugar ao ESTADO ABERTO
//  • em cima: "Voltar ao Brasil" + "Estado · N regiões" (o título da página some)
//  • esquerda: a bandeira do estado tremulando, grande
//  • direita: o estado dividido nas mesorregiões do IBGE ("regiões" na tela), cada uma com uma cor SÓ DELA e o nome
//    escrito — dentro, quando cabe; senão do lado de fora, com uma linha apontando.
// Contornos (+ lista de cidades de cada região, guardada para depois): noticias/mesorregioes/UF.js (IBGE; um arquivo por estado, carregado na hora).
// ════════════════════════════════════════════
const MESO_BR = {};
let cmVendoEstado = null;
// 15 cores bem diferentes entre si (São Paulo, o estado com mais regiões, tem 15): nenhuma região repete cor
const CM_MESO_CORES = ['#e06c6f','#7cc47f','#8e9be0','#eda15f','#5fb8c4','#c792b5','#d8c055','#6cc9a6','#b99b78','#b07fd0','#b2cf5e','#ef93b0','#7fb2ea','#a8a35a','#c4775a'];
function cmCarregarMeso(uf){
  if(MESO_BR[uf]) return Promise.resolve(MESO_BR[uf]);
  return new Promise(ok=>{ const s=document.createElement('script'); s.src=`noticias/mesorregioes/${uf}.js`;
    s.onload=()=>ok(MESO_BR[uf]||null); s.onerror=()=>ok(null); document.head.appendChild(s); });
}
async function cmAbrirEstado(uf){
  if(!uf || cmVendoEstado===uf) return;
  const dados=await cmCarregarMeso(uf), palco=document.getElementById('cm-palco');
  if(!dados || !palco || cmSel!==uf) return;
  cmVendoEstado=uf;
  document.getElementById('news-screen')?.classList.add('cm-modo-estado');   // some o título da página (pedido do Levi)
  cmFaixaTrocar(uf);                                                         // letreiro de baixo: só os concursos deste estado
  cmCarregarCidades(uf).then(()=>{ if(cmVendoEstado===uf) cmFaixaTrocar(uf); });   // e de novo com os concursos de cada cidade (PCI)
  palco.classList.add('cm-vendo-estado');
  let v=document.getElementById('cm-estado-vista');
  if(!v){
    v=document.createElement('div'); v.id='cm-estado-vista'; v.className='cm-estado-vista';
    v.onpointerdown=e=>e.stopPropagation(); v.onwheel=e=>e.stopPropagation(); v.ondblclick=e=>e.stopPropagation(); v.onclick=e=>e.stopPropagation();
    palco.parentElement.appendChild(v);   // fora do palco: pode usar a altura toda até as bandeiras de baixo
  }
  const n=dados.regioes.length;
  v.innerHTML=`<div class="cm-ev-topo">
      <button type="button" class="cm-ev-voltar" onclick="cmFecharEstado()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Voltar ao Brasil</button>
      <span class="cm-ev-titulo">${CM_UF_NOME[uf]} · ${n} ${n===1?'região':'regiões'}</span></div>
    <canvas class="cm-ev-bandeira" id="cm-ev-bandeira" role="img" aria-label="Bandeira ${cmDoEstado(uf)}"></canvas>
    <div class="cm-ev-mapa" id="cm-ev-mapa"></div>`;
  cmLayoutEstado();
  v.classList.remove('entra'); void v.offsetWidth; v.classList.add('entra');
  setTimeout(()=>{ if(cmVendoEstado===uf) cmEvMouse(); }, 700);   // depois que o estado entra na tela
  cmEvLema(uf);
}
// LEMA DO ESTADO (pedido do Levi): a frase do brasão aparece embaixo, entre a bandeira e o mapa, por 5 s e some.
// SÓ LEMAS CONFERIDOS (16/10/2026): SP, BA, RJ e DF no Wikidata; PA e ES em fontes oficiais/jornais; os demais são lemas
// históricos muito conhecidos. Estado sem lema oficial confirmado fica sem frase — nunca inventar.
const CM_LEMAS={
  SP:['Pro Brasilia fiant eximia','Pelo Brasil, façam-se grandes coisas'], MG:['Libertas quae sera tamen','Liberdade, ainda que tardia'],
  RJ:['Recte rem publicam gerere','Governar com retidão a coisa pública'], BA:['Per ardua surgo','Pelas dificuldades, me elevo'],
  ES:['Trabalha e confia',''], PA:['Sub lege progrediamur','Sob a lei, progridamos'], PB:['Nego','A recusa da Paraíba, 1930'],
  RS:['Liberdade, Igualdade, Humanidade',''], MT:['Virtute plusquam auro','Pela virtude, mais que pelo ouro'],
  DF:['Venturis ventis','Aos ventos que hão de vir'], TO:['Co yvy ore retama','Esta terra é nossa (tupi)'],
  PI:['Impavidum ferient ruinae','As ruínas o atingirão sem medo']};
function cmEvLema(uf){
  document.getElementById('cm-ev-lema')?.remove();
  const v=document.getElementById('cm-estado-vista'), l=CM_LEMAS[uf]; if(!v || !l) return;
  const el=document.createElement('div'); el.id='cm-ev-lema'; el.className='cm-ev-lema';
  el.innerHTML=`<b>“${l[0]}”</b>${l[1]?`<span>${l[1]}</span>`:''}`;
  v.appendChild(el);
  el.addEventListener('animationend', ()=>el.remove());
}
// MOUSE DE DEMONSTRAÇÃO (pedido do Levi): TODA VEZ que o mapa do estado abre, um mouse branco passeia por cima das
// regiões durante 4,5 s (entra, faz uma curva, para no meio e "clica") e some — mostra que dá para passar o mouse e clicar.
function cmEvMouse(){
  document.getElementById('cm-ev-mouse')?.remove();
  const v=document.getElementById('cm-estado-vista'), alvo=document.getElementById('cm-ev-mapa');
  if(!v || !alvo || cmRegiaoAberta>=0 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const V=v.getBoundingClientRect(), A=alvo.getBoundingClientRect(); if(A.width<60 || A.height<60) return;
  const m=document.createElement('div'); m.id='cm-ev-mouse'; m.className='cm-ev-mouse'; m.setAttribute('aria-hidden','true');
  m.style.cssText=`left:${A.left-V.left}px;top:${A.top-V.top}px;--w:${A.width}px;--h:${A.height}px`;
  m.innerHTML='<span><svg viewBox="0 0 24 24"><path d="M5 2.5v16.2l4.3-4 2.9 6.4 2.7-1.2-2.9-6.3 5.9-.3z"/></svg></span>';
  v.appendChild(m);
  m.addEventListener('animationend', e=>{ if(e.animationName==='cmEvMouseAnda') m.remove(); });
}
// ── BANDEIRA TREMULANDO (pedido do Levi): a imagem da bandeira desenhada em faixas verticais finas, cada uma subindo e
// descendo numa onda (presa do lado esquerdo, como num mastro), com luz e sombra nas dobras. Para quando o estado fecha.
let cmOndaRaf=0;
function cmBandeiraOndular(uf){
  cancelAnimationFrame(cmOndaRaf);
  const cv=document.getElementById('cm-ev-bandeira'); if(!cv || !uf) return;
  const img=new Image(); img.src=`noticias/bandeiras/${uf}.png`;
  const comecar=()=>{
    if(!cv.isConnected || cmVendoEstado!==uf) return;
    const R=Math.min(2, window.devicePixelRatio||1), Wc=cv.clientWidth, Hc=cv.clientHeight; if(!Wc||!Hc) return;
    cv.width=Math.round(Wc*R); cv.height=Math.round(Hc*R);
    const ctx=cv.getContext('2d'); ctx.setTransform(R,0,0,R,0,0); ctx.imageSmoothingQuality='high';
    const A=Math.max(6, Math.min(14, Wc*0.025));                                       // altura da onda (px)
    const fw=Math.min(Wc-2*A, (Hc-4*A)*img.width/img.height), fh=fw*img.height/img.width;   // bandeira inteira cabe com folga
    const x0=Math.max(A, (Wc-fw)/2*0.35), y0=(Hc-fh)/2, faixa=2, parado=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0=performance.now();
    const quadro=agora=>{
      if(!cv.isConnected || cmVendoEstado!==uf) return;
      const t=parado ? 0.6 : (agora-t0)/1000;
      ctx.clearRect(0,0,Wc,Hc);
      // 1º a imagem (cada faixa 1px mais larga, para não abrir fresta); depois a luz/sombra, em faixas SEM sobrepor (senão vira listra)
      const X0=Math.round(x0);
      for(let x=0; x<fw; x+=faixa){
        const p=x/fw, fase=p*Math.PI*2.2 - t*2.4, preso=Math.min(1, p*3);       // perto do mastro quase não mexe
        ctx.drawImage(img, p*img.width, 0, (faixa+1)/fw*img.width, img.height, X0+x, y0+Math.sin(fase)*A*preso, faixa+1, fh);
      }
      for(let x=0; x<fw; x+=faixa){
        const p=x/fw, fase=p*Math.PI*2.2 - t*2.4, preso=Math.min(1, p*3), luz=Math.cos(fase)*preso;   // inclinação da dobra
        ctx.fillStyle = luz>0 ? `rgba(255,255,255,${(luz*0.16).toFixed(3)})` : `rgba(0,0,0,${(-luz*0.22).toFixed(3)})`;
        ctx.fillRect(X0+x, y0+Math.sin(fase)*A*preso, Math.min(faixa, fw-x), fh);
      }
      if(!parado) cmOndaRaf=requestAnimationFrame(quadro);
    };
    cmOndaRaf=requestAnimationFrame(quadro);
  };
  if(img.complete && img.naturalWidth) comecar(); else img.onload=comecar;
}
function cmFecharEstado(){
  cmMesoFechar(true);
  cancelAnimationFrame(cmOndaRaf);
  cmVendoEstado=null;
  document.getElementById('cm-estado-vista')?.remove();
  document.getElementById('cm-palco')?.classList.remove('cm-vendo-estado','cm-estreito');
  document.getElementById('news-screen')?.classList.remove('cm-modo-estado');
  cmFaixaTrocar(null);
  cmPosicionarDestaque();
}
// a vista do estado ocupa a tela toda, do topo da página até o letreiro de baixo (computador: 2 colunas; celular: 1)
function cmLayoutEstado(){
  const palco=document.getElementById('cm-palco'), v=document.getElementById('cm-estado-vista');
  if(!palco||!v) return;
  const estreito=palco.clientWidth<760;
  palco.classList.toggle('cm-estreito', estreito);
  v.classList.toggle('cm-ev-direita', !estreito);
  const P=palco.getBoundingClientRect(), A=palco.parentElement.getBoundingClientRect();
  const N=document.getElementById('news-screen').getBoundingClientRect(), topo=N.top+12;
  const fim=document.querySelector('.cm-faixa-rotulo')?.getBoundingClientRect().top || innerHeight;
  v.style.left=(P.left-A.left)+'px'; v.style.width=Math.round(P.width)+'px';
  v.style.top=(topo-A.top)+'px'; v.style.height=Math.max(300, fim-topo-8)+'px';
  cmEvZoom={z:1,x:0,y:0}; cmDesenharMeso(cmVendoEstado);   // abriu o estado ou mudou o tamanho da tela: volta ao tamanho normal
  cmBandeiraOndular(cmVendoEstado);
}
// ── ENQUADRAMENTO: o tamanho e o centro do mapa contam só o "continente" do estado. Ilhas pequenas e LONGE dele
// (ex.: Fernando de Noronha, em Pernambuco) ficam de fora — senão o estado aparece pequeno e fora do meio. ──
function cmMesoEnquadrar(dados){
  if(dados._vb) return dados._vb;
  const u=cmContinente(dados.regioes.map(r=>r.d)), pad=Math.max(u.width,u.height)*0.02;
  return dados._vb=`${u.x*1e-4-pad*1e-4} ${-(u.y+u.height)*1e-4-pad*1e-4} ${(u.width+2*pad)*1e-4} ${(u.height+2*pad)*1e-4}`;
}
// CONTINENTE: recebe contornos (d) e devolve a caixa só do continente + as ilhas pequenas coladas no litoral.
// perto(caixa) = aquele pedaço fica no continente; longe = os pedaços que ficaram de fora (ex.: Fernando de Noronha).
function cmContinente(ds){
  const ns="http://www.w3.org/2000/svg", med=document.createElementNS(ns,"svg");
  med.setAttribute("style","position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden"); document.body.appendChild(med);
  const partes=[];
  ds.forEach(d=>d.split(/(?=M)/).forEach(s=>{ const p=document.createElementNS(ns,"path"); p.setAttribute("d",s); med.appendChild(p); partes.push({s, b:p.getBBox()}); }));
  med.remove();
  const uniao=l=>{ const x=Math.min(...l.map(b=>b.x)), y=Math.min(...l.map(b=>b.y)); return {x, y, w:Math.max(...l.map(b=>b.x+b.width))-x, h:Math.max(...l.map(b=>b.y+b.height))-y}; };
  const maior=Math.max(...partes.map(q=>q.b.width*q.b.height));
  const c=uniao(partes.filter(q=>q.b.width*q.b.height>=maior*0.01).map(q=>q.b));      // só os pedaços grandes
  const perto=b=>b.x+b.width>=c.x-c.w*0.1 && b.x<=c.x+c.w*1.1 && b.y+b.height>=c.y-c.h*0.1 && b.y<=c.y+c.h*1.1;
  const u=uniao(partes.filter(q=>perto(q.b)).map(q=>q.b));                           // + ilhas pequenas coladas no litoral
  return {x:u.x, y:u.y, width:u.w, height:u.h, perto, d:partes.filter(q=>perto(q.b)).map(q=>q.s).join(''), longe:partes.filter(q=>!perto(q.b))};
}
// ── MAPA DO ESTADO DIVIDIDO EM REGIÕES ──
function cmDesenharMeso(uf){
  const dados=MESO_BR[uf], alvo=document.getElementById('cm-ev-mapa'); if(!dados||!alvo) return;
  const vbTexto=cmMesoEnquadrar(dados), [vx,vy,vw,vh]=vbTexto.split(" ").map(Number);   // enquadra o continente (sem ilhas distantes)
  const escuro=!document.body.classList.contains('light');
  // tamanho de cada mesorregião (mesma técnica do mapa do Brasil)
  const ns='http://www.w3.org/2000/svg', med=document.createElementNS(ns,'svg');
  med.setAttribute('style','position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden'); document.body.appendChild(med);
  const regs=dados.regioes.map(r=>{ const p=document.createElementNS(ns,'path'); p.setAttribute('d',r.d); med.appendChild(p); return {...r, b:p.getBBox(), p2:new Path2D(r.d)}; });
  med.remove();
  // cores: cada região ganha uma cor SÓ DELA; entre as livres, a mais diferente das vizinhas que já têm cor
  const toca=(a,b)=>a.x<=b.x+b.width && b.x<=a.x+a.width && a.y<=b.y+b.height && b.y<=a.y+a.height;
  const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)), dif=(a,b)=>{ const x=rgb(a), y=rgb(b); return Math.hypot(x[0]-y[0],x[1]-y[1],x[2]-y[2]); };
  const usadas=new Set();
  regs.forEach((r,i)=>{
    const viz=regs.slice(0,i).filter(o=>toca(o.b,r.b)).map(o=>CM_MESO_CORES[o.ci]);
    const livres=[...CM_MESO_CORES.keys()].filter(c=>!usadas.has(c));
    r.ci = (livres.length ? livres : [...CM_MESO_CORES.keys()]).reduce((m,c)=>{ const d=viz.length?Math.min(...viz.map(v=>dif(v,CM_MESO_CORES[c]))):999; return d>m.d?{c,d}:m; }, {c:i%CM_MESO_CORES.length,d:-1}).c;
    usadas.add(r.ci);
    r.cor=escuro ? cmMesoMistura(CM_MESO_CORES[r.ci], '#1f1f1f', .2) : CM_MESO_CORES[r.ci]; });
  // onde escrever o nome: o ponto mais "fundo" dentro da mesorregião (o mais longe de todas as bordas).
  // Grade de quadradinhos + distância de cada um até a borda (andando também na diagonal, para medir de verdade).
  const ctx=document.createElement('canvas').getContext('2d'), N=40, D2=Math.SQRT2;
  const fonteMapa=getComputedStyle(document.body).fontFamily||'sans-serif';
  regs.forEach(r=>{
    const {x,y,width:w,height:h}=r.b, lado=Math.max(w,h)/N, nx=Math.max(1,Math.ceil(w/lado)), ny=Math.max(1,Math.ceil(h/lado));
    const dentro=new Array(nx*ny), dist=new Float64Array(nx*ny);
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const q=j*nx+i, ok=ctx.isPointInPath(r.p2, x+(i+.5)*lado, y+(j+.5)*lado);
      dentro[q]=ok; dist[q]=ok ? ((i===0||j===0||i===nx-1||j===ny-1) ? 1 : Infinity) : 0; }
    const v=(i,j)=> (i<0||j<0||i>=nx||j>=ny) ? 0 : dist[j*nx+i];
    for(let j=0;j<ny;j++) for(let i=0;i<nx;i++){ const q=j*nx+i; if(!dentro[q]) continue;          // ida
      dist[q]=Math.min(dist[q], v(i-1,j)+1, v(i,j-1)+1, v(i-1,j-1)+D2, v(i+1,j-1)+D2); }
    for(let j=ny-1;j>=0;j--) for(let i=nx-1;i>=0;i--){ const q=j*nx+i; if(!dentro[q]) continue;    // volta
      dist[q]=Math.min(dist[q], v(i+1,j)+1, v(i,j+1)+1, v(i+1,j+1)+D2, v(i-1,j+1)+D2); }
    // jeitos de escrever o nome: 1, 2 ou 3 linhas (a quebra mais equilibrada); o que der a MAIOR letra dentro da região ganha
    ctx.font=`700 100px ${fonteMapa}`;
    const mede=l=>ctx.measureText(l.toUpperCase()).width/100 + l.length*0.02;
    const pal=r.nome.split(' '), opc=[[r.nome]];
    for(let a=1;a<pal.length;a++) opc.push([pal.slice(0,a).join(' '), pal.slice(a).join(' ')]);
    for(let a=1;a<pal.length;a++) for(let b=a+1;b<pal.length;b++) opc.push([pal.slice(0,a).join(' '), pal.slice(a,b).join(' '), pal.slice(b).join(' ')]);
    const melhorPorN={}; opc.forEach(ls=>{ const w=Math.max(...ls.map(mede)); if(!melhorPorN[ls.length] || w<melhorPorN[ls.length].larg1) melhorPorN[ls.length]={linhas:ls, larg1:w, alt1:ls.length*1.12}; });
    r.opcoes=Object.values(melhorPorN);
    r.linhas=r.opcoes[0].linhas;
    r.larg1linha=mede(r.nome);   // nome numa linha só (rótulo de fora)
    r.cand=[...dist.keys()].filter(q=>dentro[q]).sort((a,b)=>dist[b]-dist[a]).slice(0,60);
    r.cx=q=>x+(q%nx+.5)*lado; r.cy=q=>y+((q-q%nx)/nx+.5)*lado;
  });
  // para cada tamanho do mapa (k = px por grau): o nome cabe INTEIRO dentro da região? com que letra (9,5 a 15px)?
  const MIN_DENTRO=8.5;   // menor letra aceita dentro da região (abaixo disso, fica ilegível)
  const medir=k=>regs.forEach(r=>{
    const px2raw=1/(k*1e-4);
    const cabe=(q,f,o)=>{ const hw=(o.larg1*f/2+1.5)*px2raw, hh=(o.alt1*f/2+1)*px2raw, X=r.cx(q), Y=r.cy(q);
      for(let s=0;s<=4;s++){ const a=-1+s/2;
        if(!ctx.isPointInPath(r.p2, X+a*hw, Y-hh) || !ctx.isPointInPath(r.p2, X+a*hw, Y+hh) ||
           !ctx.isPointInPath(r.p2, X-hw, Y+a*hh) || !ctx.isPointInPath(r.p2, X+hw, Y+a*hh)) return false; }
      return true; };
    let melhor={q:r.cand[0]??0, f:0, o:r.opcoes[0]};
    r.opcoes.forEach(o=>r.cand.forEach(q=>{ if(!cabe(q,MIN_DENTRO,o)) return; let lo=MIN_DENTRO, hi=15;
      if(cabe(q,hi,o)) lo=hi; else for(let t=0;t<6;t++){ const mid=(lo+hi)/2; if(cabe(q,mid,o)) lo=mid; else hi=mid; }
      if(lo>melhor.f+0.3) melhor={q,f:lo,o}; }));   // empate: fica a opção com menos linhas
    r.linhas=melhor.o.linhas;
    r.lx=(r.cx(melhor.q)*1e-4-vx)*k; r.ly=(-r.cy(melhor.q)*1e-4-vy)*k; r.fonte=melhor.f;
    const q0=r.cand[0]??0; r.ax=(r.cx(q0)*1e-4-vx)*k; r.ay=(-r.cy(q0)*1e-4-vy)*k;   // ponto da linha (nome do lado de fora)
  });
  // NOMES (pedido do Levi: toda região com nome e fácil de ler até num notebook de 14"):
  //  • dentro da região só se couber com letra de pelo menos 9,5px;
  //  • os outros vão para COLUNAS ao lado do estado (esquerda/direita, do lado mais perto da região), em ordem de
  //    cima para baixo — assim as linhas não se cruzam. O mapa diminui só o necessário para as colunas caberem.
  const Wa=alvo.clientWidth, Ha=alvo.clientHeight, FONTE_FORA=11.5, GAP=22;
  const CAP=Wa<560?120:165, larguraRot=r=>Math.min(CAP, r.larg1linha*FONTE_FORA+24);
  const linhasRot=r=>Math.ceil((r.larg1linha*FONTE_FORA+24)/CAP);   // nomes compridos quebram em 2 linhas
  // ampliado com a rodinha (cmEvZoom.z>1): redesenha no tamanho maior, nítido; nomes que agora cabem vão para dentro,
  // e os que ainda não cabem aparecem só no balão do mouse (sem colunas de fora)
  const ampliado = cmEvZoom.z>1 && alvo._kBase;
  // O ESTADO FICA SEMPRE NO MAIOR TAMANHO POSSÍVEL (pedido do Levi). Nomes que não cabem dentro vão para o lado
  // só se houver espaço livre ali; senão aparecem ao passar o mouse (balão) ou ao ampliar com a rodinha.
  const k=ampliado ? alvo._kBase*cmEvZoom.z : Math.min(Wa*0.98/vw, Ha*0.96/vh);
  medir(k);
  const W=vw*k, H=vh*k, livreLado=(Wa-W)/2;
  const fora=ampliado ? [] : regs.filter(r=>r.fonte<MIN_DENTRO && larguraRot(r)+GAP<=livreLado);
  fora.forEach(r=>{ r.lado = r.ax<W/2 ? 'esq' : 'dir'; r.w=larguraRot(r); });
  ['esq','dir'].forEach(lado=>{
    const grupo=fora.filter(r=>r.lado===lado).sort((a,b)=>a.ay-b.ay); if(!grupo.length) return;
    const alt=r=>linhasRot(r)*14+8, total=grupo.reduce((t,r)=>t+alt(r),0), folgaV=Math.max(10,(Ha-H)/2-6), aperta=Math.min(1,(H+2*folgaV)/total); let fim=-1e9, altAnt=0;
    grupo.forEach(r=>{ r.fy=Math.max(r.ay, fim+(altAnt+alt(r))/2*aperta); fim=r.fy; altAnt=alt(r); r.fx = lado==='esq' ? -GAP+6 : W+GAP-6; r.max=r.w; });
    const sobra=fim+alt(grupo[grupo.length-1])/2-(H+folgaV); if(sobra>0) grupo.forEach(r=>r.fy-=sobra);
    const falta=-folgaV+alt(grupo[0])/2-grupo[0].fy; if(falta>0) grupo.forEach(r=>r.fy+=falta);
  });
  const desloca=0;
  if(!ampliado){ alvo._kBase=k; alvo._W1=W; alvo._H1=H; }
  const ponta=r=>({cima:[r.fx, r.fy+4], baixo:[r.fx, r.fy-4], esq:[r.fx+4, r.fy], dir:[r.fx-4, r.fy]})[r.lado];
  const mover={cima:'translate(-50%,-100%)', baixo:'translate(-50%,0)', esq:'translate(-100%,-50%)', dir:'translate(0,-50%)'};
  alvo.innerHTML=`<div class="cm-ev-quadro" style="width:${W}px;height:${H}px;margin-left:${desloca*2}px" onpointermove="cmMesoDicaMove(event)" onpointerleave="cmMesoSobre(-1)">
    <svg class="cm-ev-svg" viewBox="${vbTexto}" width="${W}" height="${H}" role="img" aria-label="Regiões ${cmDoEstado(uf)}"><g transform="scale(0.0001,-0.0001)">${
      regs.map((r,i)=>`<path d="${r.d}" fill="${r.cor}" data-i="${i}" onpointerenter="cmMesoSobre(${i})" onclick="cmMesoAbrir(${i})"></path>`).join('')}</g></svg>
    <svg class="cm-ev-linhas" width="${W}" height="${H}" aria-hidden="true">${fora.map(r=>{ const [px,py]=ponta(r);
      return `<line data-i="${regs.indexOf(r)}" x1="${r.ax}" y1="${r.ay}" x2="${px}" y2="${py}"/><circle data-i="${regs.indexOf(r)}" cx="${r.ax}" cy="${r.ay}" r="2.5"/>`; }).join('')}</svg>
    ${regs.map((r,i)=>!fora.includes(r) && r.fonte<MIN_DENTRO ? '' : r.fonte<MIN_DENTRO
      ? (ampliado ? '' : `<div class="cm-ev-fora" data-i="${i}" style="left:${r.fx}px;top:${r.fy}px;transform:${mover[r.lado]}${r.max?`;width:max-content;max-width:${r.max}px;white-space:normal`:''}"><b style="background:${r.cor}"></b>${r.nome}</div>`)
      : `<div class="cm-ev-rot" data-i="${i}" style="left:${r.lx}px;top:${r.ly}px;font-size:${r.fonte.toFixed(1)}px">${r.linhas.join('<br>')}</div>`).join('')}
    <div class="cm-ev-dica" id="cm-ev-dica" hidden></div>
  </div>`;
  alvo._regs=regs; alvo._sobre=-1;
  alvo.onwheel=cmEvRoda; alvo.onpointerdown=cmEvArrastaInicio; alvo.ondblclick=()=>{ cmEvZoom={z:1,x:0,y:0}; cmDesenharMeso(cmVendoEstado); };
  alvo.classList.toggle('ampliado', cmEvZoom.z>1);
  cmEvDesenhado={...cmEvZoom}; cmEvMostrar();
}
// mouse em cima de uma mesorregião: ela clareia e o NOME dela aparece num balão junto do mouse (em todas, grandes ou pequenas)
function cmMesoSobre(i){
  const alvo=document.getElementById('cm-ev-mapa'); if(!alvo?._regs) return;
  const ant=alvo._sobre; if(ant===i) return;
  if(ant>=0){ const ra=alvo._regs[ant], pa=alvo.querySelector(`path[data-i="${ant}"]`); if(pa){ pa.setAttribute('fill', ra.cor); pa.classList.remove('sobre'); }
    alvo.querySelectorAll(`.cm-ev-rot[data-i="${ant}"],.cm-ev-fora[data-i="${ant}"]`).forEach(e=>e.classList.remove('ativo')); }
  alvo._sobre=i;
  const dica=document.getElementById('cm-ev-dica'), r=alvo._regs[i];
  if(!r){ if(dica) dica.hidden=true; return; }
  // região sob o mouse: vem para a frente dos vizinhos, clareia um pouco e ganha contorno forte + sombra (fica "levantada")
  const p=alvo.querySelector(`path[data-i="${i}"]`);
  if(p){ p.parentNode.appendChild(p); p.setAttribute('fill', cmMesoMistura(r.cor, '#ffffff', .14)); p.classList.add('sobre'); }
  alvo.querySelectorAll(`.cm-ev-rot[data-i="${i}"],.cm-ev-fora[data-i="${i}"]`).forEach(e=>e.classList.add('ativo'));
  if(dica){ dica.textContent=r.nome; dica.hidden=false; }
}
function cmMesoDicaMove(ev){
  const dica=document.getElementById('cm-ev-dica'); if(!dica || dica.hidden) return;
  const q=dica.parentElement.getBoundingClientRect(), z=(cmEvZoom.z/cmEvDesenhado.z)||1;   // o quadro pode estar esticado (rodinha girando)
  dica.style.left=((ev.clientX-q.left)/z)+'px'; dica.style.top=((ev.clientY-q.top)/z)+'px';
  dica.style.transform=`translate(14px,-130%) scale(${1/z})`; dica.style.transformOrigin='0 100%';   // o balão não cresce com o zoom
}
// ── CLICAR NUMA REGIÃO (pedido do Levi): a bandeira e o mapa somem e só a região clicada DESLIZA, com animação,
// do lugar dela no mapa até o lado ESQUERDO (onde fica a bandeira). O lado direito fica vazio por enquanto.
// Em cima, "Voltar a <estado>" (ou Esc) desfaz e volta ao estado dividido. ──
let cmRegiaoAberta=-1, cmTopoAntes='';
const CM_PAINEL_LIGADO = false;   // painel de concursos à direita da região (siglas + números) — desligado por enquanto
function cmMesoAbrir(i){
  if(cmEvArrastou || cmRegiaoAberta>=0) return;           // soltou depois de arrastar (não é clique) ou já tem região aberta
  const v=document.getElementById('cm-estado-vista'), alvo=document.getElementById('cm-ev-mapa'); if(!v||!alvo?._regs) return;
  const r=alvo._regs[i], p=alvo.querySelector(`path[data-i="${i}"]`); if(!r||!p) return;
  cmMesoSobre(-1); document.getElementById('cm-ev-mouse')?.remove(); document.getElementById('cm-ev-lema')?.remove();
  cmRegiaoAberta=i;
  // a região é enquadrada SÓ pelo continente: ilha longe (ex.: Fernando de Noronha, na Metropolitana de Recife) vai
  // num quadradinho ao lado do mapa (cmDemografia) — antes ela deixava a região minúscula, num canto
  const cont=r.cont||(r.cont=cmContinente([r.d])), ilhas=cont.longe.length>0, LADO_ILHA=ilhas?CM_ILHA.reserva:0;
  const V=v.getBoundingClientRect();
  let de=p.getBoundingClientRect();
  if(ilhas){ const M=p.getScreenCTM(), a=new DOMPoint(cont.x,cont.y).matrixTransform(M), z=new DOMPoint(cont.x+cont.width,cont.y+cont.height).matrixTransform(M);
    de={left:Math.min(a.x,z.x), top:Math.min(a.y,z.y), width:Math.abs(z.x-a.x)}; }   // a animação sai do continente, não da caixa com a ilha
  // destino: a área da bandeira (no celular, sem bandeira, a área do mapa)
  const band=v.querySelector('.cm-ev-bandeira'), base=(band && band.offsetWidth ? band : alvo).getBoundingClientRect();
  const b=cont, wd=b.width*1e-4, hd=b.height*1e-4, ALT_NOME=70;    // embaixo: nome + legenda dos pontos
  const s=Math.min((base.width-2*LADO_ILHA)*0.92/wd, (base.height-ALT_NOME)*0.92/hd), W=wd*s, H=hd*s;
  const x=base.left-V.left+(base.width-W)/2, y=base.top-V.top+(base.height-ALT_NOME-H)/2;
  const caixa=document.createElement('div'); caixa.className='cm-ev-regiao'; caixa.id='cm-ev-regiao';
  caixa.style.cssText=`left:${base.left-V.left}px;top:${y}px;width:${base.width}px`;   // o mapa fica centrado (x); o texto embaixo usa a largura toda
  caixa.innerHTML=`<div class="cm-ev-regiao-mapa" style="width:${W}px;height:${H}px"><svg viewBox="${b.x*1e-4} ${-(b.y+b.height)*1e-4} ${wd} ${hd}" width="${W}" height="${H}" aria-hidden="true"><g transform="scale(0.0001,-0.0001)"><path d="${cont.d}" fill="${r.cor}"/></g></svg></div>
    <div class="cm-ev-regiao-nome">${r.nome}</div><div class="cm-dm-info" id="cm-dm-info"></div>`;
  v.appendChild(caixa);
  // À DIREITA (onde ficava o estado): o PAINEL DE CONCURSOS da região (pedido do Levi: só dado de concurso, nada de
  // população). No celular, sem bandeira, o painel vai embaixo do mapa.
  // ⚠ DESLIGADO a pedido do Levi (2026-10-15: "vamos tratar isso aos poucos") — o painel não aparece; o código fica
  // guardado para voltar. Para religar: CM_PAINEL_LIGADO=true.
  const painel=document.createElement('div'); painel.className='cm-ev-painel'; painel.id='cm-ev-painel';
  if(!CM_PAINEL_LIGADO){ /* sem painel */ }
  else if(band && band.offsetWidth){ const A=alvo.getBoundingClientRect();
    painel.style.cssText=`left:${A.left-V.left}px;top:${A.top-V.top}px;width:${A.width}px;max-height:${A.height}px`; v.appendChild(painel); }
  else { painel.classList.add('embaixo'); caixa.appendChild(painel); }
  painel._uf=cmVendoEstado; painel._nome=r.nome; painel._munis=[];
  cmPainelConcursos();
  cmBuscaDescer();
  if(typeof cmCentralAbrir==='function') cmCentralAbrir(v, alvo, band, caixa, cmVendoEstado, r);   // CENTRAL DE CONCURSOS à direita (noticias/concursos-central.js)
  // começa EXATAMENTE em cima da região no mapa e desliza até o lugar final
  const k0=de.width/W, svg=caixa.querySelector('svg'), nome=caixa.querySelector('.cm-ev-regiao-nome');
  svg.style.transform=`translate(${de.left-V.left-x}px,${de.top-V.top-y}px) scale(${k0})`;
  nome.style.opacity='0';
  v.classList.add('cm-ev-foco');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ svg.classList.add('vai'); svg.style.transform='none'; nome.style.opacity=''; }));
  // quando a região chega à esquerda, vira o mapa DEMOGRÁFICO (municípios, microrregiões e população — IBGE, Censo 2022)
  const ufAgora=cmVendoEstado; setTimeout(()=>{ if(cmRegiaoAberta===i && cmVendoEstado===ufAgora) cmDemografia(caixa, r, s, ufAgora); }, 760);
  // em cima: voltar ao estado + nome da região
  const topo=v.querySelector('.cm-ev-topo'); cmTopoAntes=topo.innerHTML;
  topo.innerHTML=`<button type="button" class="cm-ev-voltar" onclick="cmMesoFechar()"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>Voltar ${cmNoEstadoVoltar(cmVendoEstado)}</button>
    <span class="cm-ev-titulo">${r.nome}</span>`;
}
// ── MAPA DEMOGRÁFICO DA REGIÃO (pedido do Levi; referência: Hervé Théry, "Cartografias das densidades demográficas
// no Brasil", Confins 66, 2025). Só DADOS REAIS do IBGE: contorno dos municípios, microrregiões (cada uma num tom da
// cor da região) e um QUADRADO em cada município, com a ÁREA proporcional à população (Censo 2022, Sidra tabela 4714).
// As cidades mais populosas ganham o nome escrito. Mouse em cima: nome, população, densidade e microrregião.
// Dados: noticias/municipios/UF.js (carregado só quando abre).
const MUNI_BR = {};
function cmCarregarMuni(uf){
  if(MUNI_BR[uf]) return Promise.resolve(MUNI_BR[uf]);
  return new Promise(ok=>{ const sc=document.createElement('script'); sc.src=`noticias/municipios/${uf}.js`;
    sc.onload=()=>ok(MUNI_BR[uf]||null); sc.onerror=()=>ok(null); document.head.appendChild(sc); });
}
const cmNum=n=>Math.round(n).toLocaleString('pt-BR');
const CM_ILHA={lado:56, dist:24, leg:22, reserva:120};   // quadradinho da ilha longe: tamanho, distância do mapa, nome embaixo, espaço guardado de cada lado
async function cmDemografia(caixa, r, s, uf){
  const lista=await cmCarregarMuni(uf); if(!lista || !caixa.isConnected) return;
  await cmCarregarCidades(uf); if(!caixa.isConnected) return;   // concursos de cada cidade (PCI), se o arquivo do estado existir
  const munis=lista.filter(m=>m.me===r.cod && m.d && m.p>0); if(!munis.length) return;
  const cont=r.cont||(r.cont=cmContinente([r.d])), b=cont, vbx=b.x*1e-4, vby=-(b.y+b.height)*1e-4, W=b.width*1e-4*s, H=b.height*1e-4*s;
  const px=(gx,gy)=>[(gx*1e-4-vbx)*s, (-gy*1e-4-vby)*s];   // coordenada do IBGE ➔ pixel no quadro
  // microrregiões: cada uma num tom da cor da região (do mais escuro ao mais claro)
  const micros=[...new Set(munis.map(m=>m.mi))].sort((a,c)=>a.localeCompare(c,'pt-BR'));
  const escuro=!document.body.classList.contains('light');
  // fundo NEUTRO (cinza-areia), não a cor da região: assim as cores dos pontinhos (verde, vermelho, azul, laranja) se destacam sempre
  const BASE=escuro?'#6e6e6e':'#bdb6a6';
  const tom=j=>{ const t=micros.length<2?0:j/(micros.length-1); return escuro ? cmMesoMistura(BASE,'#000000',.15+t*.4) : cmMesoMistura(BASE,'#ffffff',.15+t*.55); };
  const corMicro=Object.fromEntries(micros.map((m,j)=>[m,tom(j)]));
  // centro de cada município (para o quadrado): o meio da caixa dele, ou o ponto de dentro mais perto do meio
  const ns='http://www.w3.org/2000/svg', med=document.createElementNS(ns,'svg'), ctx=document.createElement('canvas').getContext('2d');
  med.setAttribute('style','position:absolute;left:-9999px;top:0;width:10px;height:10px;visibility:hidden'); document.body.appendChild(med);
  munis.forEach(m=>{
    // pedaços longe do continente saem do desenho; município TODO longe (ex.: Fernando de Noronha) vira "ilha" ➔ quadradinho
    const ficam=m.d.split(/(?=M)/).filter(s=>{ const q=document.createElementNS(ns,'path'); q.setAttribute('d',s); med.appendChild(q); return cont.perto(q.getBBox()); });
    m.ilha=!ficam.length; m.dv=m.ilha ? m.d : ficam.join('');
    const p=document.createElementNS(ns,'path'); p.setAttribute('d',m.dv); med.appendChild(p); const bb=p.getBBox(), p2=new Path2D(m.dv);
    let cx=bb.x+bb.width/2, cy=bb.y+bb.height/2;
    if(!ctx.isPointInPath(p2,cx,cy)){ let melhor=null, dm=1e18;
      for(let j=1;j<10;j++) for(let k=1;k<10;k++){ const tx=bb.x+bb.width*j/10, ty=bb.y+bb.height*k/10; if(ctx.isPointInPath(p2,tx,ty)){ const dd=(tx-cx)**2+(ty-cy)**2; if(dd<dm){ dm=dd; melhor=[tx,ty]; } } }
      if(melhor){ cx=melhor[0]; cy=melhor[1]; } }
    [m.x,m.y]=px(cx,cy); m.bb=bb; m.gx=cx; m.gy=cy; });
  med.remove();
  // ILHAS LONGE: cada uma num QUADRADINHO ao lado do mapa (como nos mapas oficiais), do lado em que ela fica de verdade,
  // na altura dela (sem sair do quadro). Os pontinhos dos concursos dela ficam ali dentro.
  munis.filter(m=>m.ilha).forEach((m,n)=>{ const bb=m.bb, k=CM_ILHA.lado/Math.max(bb.width,bb.height), w=bb.width*k, h=bb.height*k;
    const direita=bb.x+bb.width/2 > cont.x+cont.width/2, L=direita ? W+CM_ILHA.dist : -CM_ILHA.dist-w;
    const T=Math.max(0, Math.min(H-h-CM_ILHA.leg, px(0,bb.y+bb.height/2)[1]-h/2)) + n*(CM_ILHA.lado+CM_ILHA.leg+10);
    m.x=L+(m.gx-bb.x)*k; m.y=T+(bb.y+bb.height-m.gy)*k;
    m.quadro={L, T, w, h, mat:`matrix(${k/s},0,0,${-k/s},${vbx+(L-bb.x*k)/s},${vby+(T+(bb.y+bb.height)*k)/s})`}; });
  // PONTINHOS = CONCURSOS (pedido do Levi): UM PONTO POR CONCURSO, na cidade onde ele acontece, na COR da situação dele
  // (verde inscrições abertas · VERMELHO inscrições encerradas (não disponível) · azul previsto · laranja sem previsão). Vários concursos
  // na mesma cidade = pontos agrupados em volta dela. Concursos do ESTADO (PM, SEFAZ, TJ...) ficam na CAPITAL, a sede.
  const slugsCid=cmSlugsCidades(uf);   // concurso estadual que o PCI já pôs numa cidade aparece lá, não repete na capital
  const capCod=lista.find(m=>m.n===CM_CAPITAL[uf])?.c, est=cmConcursosEstaduais(uf).filter(c=>!slugsCid.has(c.fonte.url)).map(c=>({...c, estadual:true}));
  const conc=m=>[...cmConcursosCidade(m.c), ...(m.c===capCod ? est : [])];
  const R_PONTO=3.8, PASSO=5, raio=n=>n ? PASSO*Math.sqrt(n-1)+R_PONTO : 0;
  const ladoM=m=>2*Math.min(raio(conc(m).length), 14+R_PONTO);
  // espiral de girassol em volta da cidade; cidade com MUITOS concursos fica num cacho compacto (raio máx. ~14px) que
  // se abre com o zoom. Ordem de desenho: vermelhos embaixo, depois laranja, azul e VERDE POR CIMA (o que está aberto aparece).
  const CAMADA_COR={andamento:0, previsto:1, edital:2, aberto:3};
  // CIDADE COM MUITOS CONCURSOS (6+) = UM CÍRCULO com o TOTAL no meio e um ANEL colorido na proporção de cada situação
  // (pedido do Levi: os pontos grudados não davam para ver). Mouse em cima = resumo; clique = abre o leque com todos.
  const CACHO_MIN=6, ORDEM_ANEL=['previsto','edital','aberto','andamento'];   // ordem do ciclo do concurso
  const pontos=munis.flatMap((m,j)=>{ const l=conc(m); if(l.length>=CACHO_MIN) return [];
      const passo=Math.min(PASSO, 14/Math.sqrt(Math.max(1,l.length)));
      return l.map((c,k)=>{ const r=passo*Math.sqrt(k), a=k*2.39996, cor=cmCorPonto(c);
        return {cor, svg:`<circle cx="${(m.x+r*Math.cos(a)).toFixed(1)}" cy="${(m.y+r*Math.sin(a)).toFixed(1)}" r="${R_PONTO}" class="sit-${cor}" data-j="${j}" data-k="${k}"/>`}; }); })
    .sort((a,b)=>CAMADA_COR[a.cor]-CAMADA_COR[b.cor]).map(p=>p.svg).join('');
  const cachos=munis.map((m,j)=>{ const l=conc(m), n=l.length; if(n<CACHO_MIN) return '';
      const R=Math.min(13, 7+Math.sqrt(n)*0.75), C=2*Math.PI*R; let off=0;
      const segs=ORDEM_ANEL.map(s=>{ const q=l.filter(c=>cmCorPonto(c)===s).length; if(!q) return ''; const len=C*q/n;
        const seg=`<circle class="seg sit-${s}" r="${R.toFixed(2)}" stroke-dasharray="${len.toFixed(2)} ${(C-len).toFixed(2)}" stroke-dashoffset="${(-off).toFixed(2)}" transform="rotate(-90)" data-j="${j}"/>`; off+=len; return seg; }).join('');
      return `<g class="cm-dm-cacho" data-j="${j}" data-x="${m.x.toFixed(1)}" data-y="${m.y.toFixed(1)}" transform="translate(${m.x.toFixed(1)},${m.y.toFixed(1)})">`+
        `<circle class="miolo" r="${(R-2.6).toFixed(2)}" data-j="${j}"/>${segs}<text dy="0.35em" data-j="${j}">${n}</text></g>`; }).join('');
  // nomes escritos: as cidades mais populosas (até 5), pulando as que encostariam num nome já escrito
  const ordem=[...munis].sort((a,c)=>c.p-a.p), destaques=[], caixas=[];
  for(const m of ordem){ if(destaques.length>=Math.min(5, Math.max(1, Math.round(munis.length/10)+1))) break;
    if(m.ilha) continue;   // a ilha já tem o nome embaixo do quadradinho
    const l=ladoM(m), x0=m.x+l/2+4, w=m.n.length*6.6+4, cx={x0, x1:x0+w, y0:m.y-9, y1:m.y+9};
    if(caixas.some(o=>cx.x0<o.x1 && o.x0<cx.x1 && cx.y0<o.y1 && o.y0<cx.y1)) continue;
    caixas.push(cx); destaques.push(m); }
  const mapa=caixa.querySelector('.cm-ev-regiao-mapa');
  const camada=document.createElement('div'); camada.className='cm-dm'; camada.style.cssText=`width:${W}px;height:${H}px`;
  camada.innerHTML=`<svg class="cm-dm-munis" viewBox="${vbx} ${vby} ${b.width*1e-4} ${b.height*1e-4}" width="${W}" height="${H}"><g transform="scale(0.0001,-0.0001)">${
      munis.map((m,j)=>m.ilha ? '' : `<path d="${m.dv}" fill="${corMicro[m.mi]}" data-j="${j}"/>`).join('')}</g>${
      munis.map((m,j)=>!m.ilha ? '' : `<rect class="cm-dm-ilha" x="${vbx+(m.quadro.L-8)/s}" y="${vby+(m.quadro.T-8)/s}" width="${(m.quadro.w+16)/s}" height="${(m.quadro.h+16)/s}" rx="${8/s}"/>`+
        `<path d="${m.d}" transform="${m.quadro.mat}" fill="${corMicro[m.mi]}" data-j="${j}"/>`).join('')}</svg>
    ${munis.filter(m=>m.ilha).map(m=>`<span class="cm-dm-ilha-nome" style="left:${(m.quadro.L+m.quadro.w/2).toFixed(1)}px;top:${(m.quadro.T+m.quadro.h+14).toFixed(1)}px">${m.n}</span>`).join('')}
    <svg class="cm-dm-quadros cm-dm-pontos" width="${W}" height="${H}">${pontos}</svg>
    <svg class="cm-dm-cachos" width="${W}" height="${H}">${cachos}</svg>
    ${destaques.map(m=>`<span class="cm-dm-cidade" style="left:${(m.x+ladoM(m)/2+4).toFixed(1)}px;top:${m.y.toFixed(1)}px">${m.n}</span>`).join('')}
    <div class="cm-dm-dica" hidden></div>`;
  // ZOOM E ARRASTAR (pedido do Levi, igual ao mapa do Brasil): o contorno da região e a camada dos pontos vão para um
  // "palco" que amplia com a rodinha (no ponto do mouse), arrasta com o mouse quando ampliado, volta com duplo clique ou
  // com os botões + / − / ⟲. Os pontinhos e os nomes NÃO incham junto (ficam quase do mesmo tamanho; os pontos se afastam).
  const zw=document.createElement('div'); zw.className='cm-rz';
  const svgReg=mapa.querySelector(':scope > svg'); if(svgReg) zw.appendChild(svgReg);
  // contorno da REGIÃO (o que deslizou até aqui): a malha dela e a dos municípios não batem 100% (no DF a região é recortada e o
  // município é quase um retângulo) e ele aparecia em lasquinhas na borda. Fica na cor neutra e SOME quando os municípios aparecem.
  svgReg?.querySelector('path')?.setAttribute('fill', BASE); setTimeout(()=>{ if(svgReg) svgReg.style.visibility='hidden'; }, 500);
  zw.appendChild(camada); mapa.appendChild(zw); mapa.classList.add('cm-rz-vista');
  // o balão fica FORA do zoom e POR CIMA de tudo (antes ficava atrás do "Voltar" e cortado no alto — bug relatado pelo Levi)
  document.getElementById('cm-dm-dica-fora')?.remove();
  const dicaFora=camada.querySelector('.cm-dm-dica'); dicaFora.id='cm-dm-dica-fora'; (document.getElementById('cm-estado-vista')||caixa).appendChild(dicaFora);   // o balão fica fora do zoom (não aumenta)
  mapa.insertAdjacentHTML('beforeend', `<div class="cm-rz-ctrl"><button type="button" data-z="1" title="Aproximar">+</button><button type="button" data-z="-1" title="Afastar">−</button><button type="button" data-z="0" title="Ver a região inteira">⟲</button></div>`);
  const Z={z:1,x:0,y:0};
  // sem borda (pedido do Levi): o mapa pode ser arrastado para onde a pessoa quiser — só não some (metade fica à vista)
  let lequeRedesenha=null;   // leque aberto (cacho espalhado) é redesenhado quando o zoom muda, para manter o tamanho na tela
  const aplicar=()=>{ Z.z=Math.max(1,Math.min(10,Z.z)); Z.x=Math.min(W*0.5,Math.max(W*0.5-W*Z.z,Z.x)); Z.y=Math.min(H*0.5,Math.max(H*0.5-H*Z.z,Z.y));
    zw.style.transform=`translate(${Z.x}px,${Z.y}px) scale(${Z.z})`;
    const r=(R_PONTO*(1+(Z.z-1)*0.25)/Z.z).toFixed(2); camada.querySelectorAll('.cm-dm-pontos circle').forEach(c=>c.setAttribute('r',r));
    camada.querySelectorAll('.cm-dm-cidade').forEach(s=>s.style.transform=`translateY(-50%) scale(${1/Z.z})`);
    camada.querySelectorAll('.cm-dm-ilha-nome').forEach(s=>s.style.transform=`translateX(-50%) scale(${1/Z.z})`);
    camada.querySelectorAll('.cm-dm-cacho').forEach(g=>g.setAttribute('transform',`translate(${g.dataset.x},${g.dataset.y}) scale(${(1+(Z.z-1)*0.2)/Z.z})`));   // círculo não incha com o zoom
    mapa.classList.toggle('ampliado', Z.z>1.001); lequeRedesenha?.(); };
  const zoomEm=(fator,mx,my)=>{ const z0=Z.z, z1=Math.max(1,Math.min(10,z0*fator)); Z.x=mx-(mx-Z.x)*(z1/z0); Z.y=my-(my-Z.y)*(z1/z0); Z.z=z1; aplicar(); };
  mapa.querySelector('.cm-rz-ctrl').onclick=ev=>{ const d=ev.target.dataset?.z; if(d===undefined) return; ev.stopPropagation();
    if(d==='0'){ Z.z=1; Z.x=0; Z.y=0; aplicar(); } else zoomEm(d==='1'?1.5:1/1.5, W/2, H/2); };
  // IGUAL AO MAPA DO BRASIL (pedido do Levi): a rodinha e o arrastar funcionam em TODO o lado esquerdo, não só em cima
  // do desenho — um "fundo" invisível cobre o espaço vazio em volta (de baixo do "Voltar" até embaixo, até a central)
  document.getElementById('cm-rz-fundo')?.remove();
  const vista=document.getElementById('cm-estado-vista'), centralEl=document.getElementById('cm-central'), topoEl=vista?.querySelector('.cm-ev-topo');
  if(vista && centralEl && !centralEl.classList.contains('embaixo')){
    const V=vista.getBoundingClientRect(), C=centralEl.getBoundingClientRect(), t0=topoEl ? topoEl.getBoundingClientRect().bottom-V.top+6 : 0;
    const fundo=document.createElement('div'); fundo.id='cm-rz-fundo'; fundo.className='cm-rz-fundo';
    fundo.style.cssText=`left:0;top:${t0}px;width:${Math.max(0,C.left-V.left-12)}px;height:${Math.max(0,V.height-t0)}px`;
    vista.insertBefore(fundo, caixa);   // embaixo da região: o desenho e os pontinhos continuam por cima
  }
  const superficies=[mapa, document.getElementById('cm-rz-fundo')].filter(Boolean);
  let arrasto=null, arrastou=false;
  superficies.forEach(sup=>{
    sup.onwheel=ev=>{ ev.preventDefault(); ev.stopPropagation(); const q=mapa.getBoundingClientRect(); zoomEm(ev.deltaY<0?1.25:0.8, ev.clientX-q.left, ev.clientY-q.top); };
    sup.ondblclick=ev=>{ ev.stopPropagation(); Z.z=1; Z.x=0; Z.y=0; aplicar(); };
    // ⚠ a "captura" do mouse só começa quando ele REALMENTE arrasta (>4px). Antes ela começava em todo clique, e o clique
    // ia para o mapa em vez do pontinho — clicar num cacho não fazia nada (bug relatado pelo Levi).
    sup.onpointerdown=ev=>{ if(ev.button!==0 || ev.target.closest('.cm-rz-ctrl')) return; arrasto={x:ev.clientX,y:ev.clientY,x0:Z.x,y0:Z.y,id:ev.pointerId}; arrastou=false; };
    sup.addEventListener('pointermove', ev=>{ if(!arrasto) return; const dx=ev.clientX-arrasto.x, dy=ev.clientY-arrasto.y;
      if(!arrastou && Math.abs(dx)+Math.abs(dy)>4){ arrastou=true; try{ sup.setPointerCapture(arrasto.id); }catch(e){} }
      if(arrastou){ Z.x=arrasto.x0+dx; Z.y=arrasto.y0+dy; aplicar(); superficies.forEach(s=>s.classList.add('arrastando')); dicaFora.hidden=true; } });
    sup.onpointerup=sup.onpointercancel=()=>{ arrasto=null; superficies.forEach(s=>s.classList.remove('arrastando')); };
  });
  requestAnimationFrame(()=>camada.classList.add('aparece'));
  // mouse em cima de um ponto = aquele concurso; em cima da cidade = quantos de cada cor. CLIQUE = cartão com detalhes à direita
  const dica=dicaFora;
  const vg=c=>c.vagas?` · ${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}`:'';
  camada.onpointermove=ev=>{ const j=ev.target.dataset?.j, k=ev.target.dataset?.k; if(arrasto && arrastou) return;
    if(j===undefined){ dica.hidden=true; camada.querySelectorAll('.sel').forEach(e=>e.classList.remove('sel')); return; }
    const m=munis[+j], q=caixa.getBoundingClientRect();
    camada.querySelectorAll('.sel').forEach(e=>e.classList.remove('sel')); (k!==undefined?[ev.target]:camada.querySelectorAll(`[data-j="${j}"]`)).forEach(e=>e.classList.add('sel'));
    const cs=conc(m);
    if(k!==undefined){   // em cima de UM ponto: o concurso dele
      const c=cs[+k];
      dica.innerHTML=`<b>${c.orgao}</b><span>${c.cargo}${vg(c)}${c.banca?` · ${c.banca}`:''}</span><span class="st st-${cmCorPonto(c)}">${c.status==='andamento' ? c.quando : `${CM_SIT_NOME[c.status]||''}: ${c.quando}`}</span>`+
        `<span class="sem">${c.estadual?`Órgão estadual ou federal · sede em ${m.n} · vale para todo o estado`:m.n} · clique para ver detalhes</span>`;
    } else {             // em cima da cidade: quantos concursos de cada situação
      const n=s=>cs.filter(c=>cmCorPonto(c)===s).length;
      const linhas=CM_CICLO.map(([s,,t])=>[s,t])
        .filter(([s])=>n(s)).map(([s,t])=>`<span class="st st-${s}">● ${n(s)} ${t}</span>`).join('');
      dica.innerHTML=`<b>${m.n} · ${cs.length} ${cs.length===1?'concurso':'concursos'}</b>${linhas?linhas+`<span class="sem">${cs.length>=CACHO_MIN?'Clique para abrir todos os pontos':'Clique para ver a lista'}</span>`:'<span class="sem">Nenhum concurso no levantamento</span>'}`;
    }
    // posição: em cima e à direita do mouse; sem espaço em cima (perto do topo) abre EMBAIXO; perto da direita abre à ESQUERDA
    dica.hidden=false; const pai=dica.parentElement.getBoundingClientRect(), dw=dica.offsetWidth, dh=dica.offsetHeight;
    dica.classList.toggle('embaixo', ev.clientY-dh-16 < 70); dica.classList.toggle('esquerda', ev.clientX+dw+30 > innerWidth-90);
    dica.style.left=(ev.clientX-pai.left)+'px'; dica.style.top=(ev.clientY-pai.top)+'px'; };
  camada.onpointerleave=()=>{ dica.hidden=true; camada.querySelectorAll('.sel').forEach(e=>e.classList.remove('sel')); };
  // CLIQUE: num ponto = cartão com os detalhes daquele concurso + botão para o PCI Concursos; na cidade = lista dela
  // LEQUE (pedido do Levi: cacho com muitos pontos ficava ilegível, ex.: Brasília com 79). Clicar num cacho com mais de
  // 5 concursos ESPALHA os pontos dele em volta da cidade, MAIORES e agrupados por cor (verdes no meio, depois azuis,
  // laranjas e vermelhos). O leque FICA ABERTO enquanto a pessoa escolhe; só fecha ao clicar fora ou abrir outra cidade.
  const LEQUE_MIN=CACHO_MIN, R_LEQUE=7.5, ORDEM_LEQUE={aberto:0, edital:1, previsto:2, andamento:3};
  let lequeJ=null;
  const lequeFechar=()=>{ mapa.classList.remove('leque-aberto'); camada.querySelector('.cm-dm-leque')?.remove(); camada.querySelectorAll('.escondido').forEach(c=>c.classList.remove('escondido')); lequeJ=null; lequeRedesenha=null; };
  const lequeAbrir=j=>{
    lequeFechar(); lequeJ=j; mapa.classList.add('leque-aberto'); const m=munis[j], cs=conc(m);
    const ordem=cs.map((c,k)=>({k, cor:cmCorPonto(c)})).sort((a,b)=>ORDEM_LEQUE[a.cor]-ORDEM_LEQUE[b.cor] || a.k-b.k);
    camada.querySelectorAll(`.cm-dm-pontos circle[data-j="${j}"], .cm-dm-cacho[data-j="${j}"]`).forEach(c=>c.classList.add('escondido'));
    const ns='http://www.w3.org/2000/svg', svg=document.createElementNS(ns,'svg'); svg.setAttribute('class','cm-dm-leque'); svg.setAttribute('width',W); svg.setAttribute('height',H);
    camada.appendChild(svg);
    lequeRedesenha=()=>{   // tamanhos em pixels de TELA: divide pelo zoom atual
      const z=Z.z, r=R_LEQUE/z, passo=(2*R_LEQUE+3)/z*0.98, raioMax=passo*Math.sqrt(ordem.length-1)+r;
      svg.innerHTML=`<circle class="fundo" cx="${m.x}" cy="${m.y}" r="${(raioMax+8/z).toFixed(2)}"/>`+
        ordem.map((o,i)=>{ const d=passo*Math.sqrt(i), a=i*2.39996;
          return `<circle cx="${(m.x+d*Math.cos(a)).toFixed(2)}" cy="${(m.y+d*Math.sin(a)).toFixed(2)}" r="${r.toFixed(2)}" class="sit-${o.cor}" data-j="${j}" data-k="${o.k}"/>`; }).join('');
    };
    lequeRedesenha();
  };
  // usado pela BUSCA de baixo: leva até a cidade (aproxima o mapa nela) e abre o leque/cartão; url = um concurso específico
  caixa._selecionar=(cod, url)=>{
    const j=munis.findIndex(m=>m.c===cod); if(j<0) return false;
    const m=munis[j], cs=conc(m);
    Z.z=Math.max(Z.z, 2.4); Z.x=W/2-m.x*Z.z; Z.y=H/2-m.y*Z.z; aplicar();
    camada.querySelectorAll('.fixo').forEach(e=>e.classList.remove('fixo')); dica.hidden=true;
    if(!cs.length){ lequeFechar(); cmCartaoFechar(); return true; }
    if(cs.length>=LEQUE_MIN){ if(lequeJ!==j) lequeAbrir(j); } else if(lequeJ!==null) lequeFechar();
    const k=url ? cs.findIndex(c=>c.fonte.url===url) : -1;
    cmCartao(uf, m, cs, k>=0 ? k : null);
    if(k>=0) camada.querySelector(`.cm-dm-leque circle[data-k="${k}"], .cm-dm-pontos circle[data-j="${j}"][data-k="${k}"]`)?.classList.add('fixo');
    return true;
  };
  camada.onclick=ev=>{ if(arrastou){ arrastou=false; return; }
    const j=ev.target.dataset?.j, k=ev.target.dataset?.k, noLeque=!!ev.target.closest('.cm-dm-leque');
    camada.querySelectorAll('.fixo').forEach(e=>e.classList.remove('fixo'));
    if(ev.target.classList.contains('fundo')) return;   // clique no fundo do leque: não fecha
    if(j===undefined){ lequeFechar(); cmCartaoFechar(); return; }
    const m=munis[+j], cs=conc(m); if(!cs.length){ lequeFechar(); cmCartaoFechar(); return; }
    if(noLeque){ ev.target.classList.add('fixo'); cmCartao(uf, m, cs, +k); dica.hidden=true; return; }   // escolheu um ponto do leque
    if(cs.length>=LEQUE_MIN && lequeJ!==+j){ lequeAbrir(+j); cmCartao(uf, m, cs, null); dica.hidden=true; return; }   // cacho cheio: abre o leque
    if(lequeJ!==null && lequeJ!==+j) lequeFechar();
    if(k!==undefined){ ev.target.classList.add('fixo'); cmCartao(uf, m, cs, +k); }
    else { camada.querySelectorAll(`circle[data-j="${j}"]`).forEach(e=>e.classList.add('fixo')); cmCartao(uf, m, cs, null); }
    dica.hidden=true; };
  // embaixo do mapa: a legenda com QUANTOS pontos de cada cor há na região (pedido do Levi)
  const todosC=munis.flatMap(conc), nCor=s=>todosC.filter(c=>cmCorPonto(c)===s).length;
  const info=caixa.querySelector('#cm-dm-info');
  info.innerHTML=`<div class="cm-dm-leg1 cm-dm-legp">${CM_CICLO.map(([s,t])=>[s,t])
      .map(([s,t])=>`<span data-s="${s}" title="Ver a lista e destacar estes pontos" class="${nCor(s)?'':'zero'}"><i class="sit-${s}"></i>${t} <b>${nCor(s)}</b></span>`).join('')}</div>
    <div class="cm-dm-leg1-dica">1 ponto = 1 concurso · rodinha do mouse aproxima · clique num ponto ou numa cor da legenda para ver os concursos</div>`;
  requestAnimationFrame(()=>info.classList.add('aparece'));
  // LEGENDA CLICÁVEL (pedido do Levi): clicar numa cor mostra na central a LISTA dos concursos daquela cor que estão NO
  // MAPA e deixa acesos só os pontos dela; clicar de novo na mesma cor desliga (e a central volta ao início)
  let filtro=null;
  const filtrar=s=>{ filtro=(filtro===s ? null : s);
    info.querySelectorAll('[data-s]').forEach(sp=>sp.classList.toggle('ativo', sp.dataset.s===filtro));
    camada.querySelectorAll('.cm-dm-pontos circle').forEach(c=>c.classList.toggle('apagado', !!filtro && !c.classList.contains('sit-'+filtro)));
    camada.querySelectorAll('.cm-dm-cacho').forEach(g=>g.classList.toggle('apagado', !!filtro && !g.querySelector('.seg.sit-'+filtro)));
    if(typeof cmcIr!=='function') return;
    if(filtro) cmcIr('leg', {s:filtro, lista:munis.flatMap(m=>conc(m).filter(c=>cmCorPonto(c)===filtro).map(c=>({c:cmConcursoHoje(c), m})))}, true);
    else cmcIr('inicio', {}, true); };
  info.querySelectorAll('[data-s]').forEach(sp=>sp.onclick=ev=>{ ev.stopPropagation(); filtrar(sp.dataset.s); });
  const p=document.getElementById('cm-ev-painel'); if(p){ p._munis=munis; cmPainelConcursos(); }
}
// ── CARTÃO DE DETALHES (clique num pontinho; pedido do Levi): fica à direita, no espaço livre ao lado da região.
// Um concurso: situação, órgão, cargo, vagas, banca, datas, onde, fonte e o botão para o PCI Concursos — direto no
// edital quando o dado veio do PCI; senão, na lista de concursos daquele estado no PCI (página da região, já no estado).
// Uma cidade (clique fora dos pontos): a lista dos concursos dela; clicar num item abre os detalhes.
function cmCartaoFechar(){ document.getElementById('cm-rz-card')?.remove(); document.querySelectorAll('.cm-dm .fixo').forEach(e=>e.classList.remove('fixo')); }
function cmCartao(uf, m, cs, k){
  const v=document.getElementById('cm-estado-vista'), alvo=document.getElementById('cm-ev-mapa'), band=v?.querySelector('.cm-ev-bandeira'); if(!v) return;
  let el=document.getElementById('cm-rz-card');
  if(!el){ el=document.createElement('div'); el.id='cm-rz-card'; el.className='cm-rz-card';
    if(band && band.offsetWidth && alvo){ const V=v.getBoundingClientRect(), A=alvo.getBoundingClientRect();
      el.style.cssText=`left:${A.left-V.left+Math.max(0,(A.width-460)/2)}px;top:${A.top-V.top+20}px;width:${Math.min(460,A.width)}px;max-height:${A.height-40}px`; v.appendChild(el); }
    else { el.classList.add('embaixo'); document.getElementById('cm-ev-regiao')?.appendChild(el); }
    el.onpointerdown=e=>e.stopPropagation(); el.onwheel=e=>e.stopPropagation(); }
  const todosPci=cmFontes()[1][uf]?.todos, ehPci=c=>/pciconcursos\.com\.br/.test(c.fonte.url);
  const vagas=c=>c.vagas?`${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}`:'Vagas a definir';
  const fechar=`<button type="button" class="cm-rz-x" onclick="cmCartaoFechar()" aria-label="Fechar">×</button>`;
  if(k===null){   // lista da cidade
    el.innerHTML=`${fechar}<div class="cm-rz-cid">${m.n}</div><div class="cm-rz-sub">${cs.length} ${cs.length===1?'concurso':'concursos'} · clique para ver os detalhes</div>
      <ul class="cm-rz-lista">${cs.map((c,i)=>`<li data-i="${i}"><i class="sit-${cmCorPonto(c)}"></i><span><b>${c.orgao}</b><small>${c.cargo} · ${vagas(c)}</small></span><em class="st-${cmCorPonto(c)}">${CM_SIT_NOME[cmConcursoHoje(c).status]||''}</em></li>`).join('')}</ul>`;
    el.querySelectorAll('.cm-rz-lista li').forEach(li=>li.onclick=()=>cmCartao(uf, m, cs, +li.dataset.i));
    return;
  }
  const c=cmConcursoHoje(cs[k]), cor=cmCorPonto(c);
  const pci=ehPci(c) ? {url:c.fonte.url, txt:'Ver edital no PCI Concursos'} : todosPci ? {url:`${todosPci}#${uf}`, txt:`Ver concursos ${cmDoEstado(uf)} no PCI Concursos`} : null;
  el.innerHTML=`${fechar}${cs.length>1?`<button type="button" class="cm-rz-volta" onclick="this.closest('.cm-rz-card')._volta()">‹ ${m.n}: todos os ${cs.length}</button>`:''}
    <span class="cm-rz-st st-${cor}"><i class="sit-${cor}"></i>${CM_SIT_NOME[c.status]||''}</span>
    <div class="cm-rz-org">${c.orgao}</div>
    <div class="cm-rz-cargo">${c.cargo}</div>
    <dl class="cm-rz-dados">
      <div><dt>Vagas</dt><dd>${vagas(c)}</dd></div>
      ${c.banca?`<div><dt>Banca</dt><dd>${c.banca}</dd></div>`:''}
      <div><dt>${c.status==='previsto'||c.status==='semprevisao'?'Situação':'Inscrições'}</dt><dd>${c.quando}</dd></div>
      <div><dt>Onde</dt><dd>${c.estadual?`Órgão estadual ou federal com sede em ${m.n} — vale para todo o estado`:m.n}</dd></div>
    </dl>
    <div class="cm-rz-botoes">
      ${pci?`<a class="cm-rz-pci" href="${pci.url}" target="_blank" rel="noopener">${pci.txt} ›</a>`:''}
      ${!ehPci(c)?`<a class="cm-rz-fonte" href="${c.fonte.url}" target="_blank" rel="noopener">Ler a notícia (${c.fonte.nome})</a>`:''}
    </div>
    <div class="cm-rz-rod">Fonte: ${c.fonte.nome} · levantamento de ${(ehPci(c) && CONC_CIDADES[uf]?.atualizado) || cmFontes()[1][uf]?.atualizado || '15/10/2026'}. Confira sempre o edital oficial.</div>`;
  el._volta=()=>cmCartao(uf, m, cs, null);
}
// ── PAINEL DE CONCURSOS DA REGIÃO (direita): números grandes + lista por situação, cada concurso com a fonte.
// Mostra a região toda ou, depois de clicar numa cidade, só o que vale para quem mora nela (prefeitura + estado).
function cmPainelConcursos(){
  const p=document.getElementById('cm-ev-painel'); if(!p) return;
  const uf=p._uf, sel=p._sel, munis=sel ? [sel] : p._munis;
  const mun=munis.flatMap(m=>cmConcursosCidade(m.c).map(c=>({...c, cidade:m.n})));
  const est=cmConcursosEstaduais(uf), todos=cmOrdenar([...mun, ...est]);
  const abertos=todos.filter(c=>c.status==='aberto'), vagas=abertos.reduce((t,c)=>t+(c.vagas||0),0);
  const temCR=abertos.some(c=>!c.vagas), previstos=todos.filter(c=>c.status==='previsto');
  // SIGLAS (pedido do Levi, no estilo da grade de estados da Estratégia): uma etiqueta por órgão com concurso na área
  // (PM-MA, SEFAZ-MA, TCE-MA, Pref. São Luís...). Cor = situação; mouse em cima = detalhes; clique = abre a notícia (fonte).
  const etiquetas=cmEtiquetas(todos, uf);
  const chip=e=>`<a class="cm-pc-chip sit-${e.sit}" href="${e.lista[0].fonte.url}" target="_blank" rel="noopener" title="${cmAttr(e.lista.map(c=>`${c.orgao}${c.cidade?` (${c.cidade})`:''} — ${c.cargo}${c.vagas?` · ${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}`:''}\n${CM_SIT_NOME[c.status]}: ${c.quando}`).join('\n\n'))}">${e.sigla}${e.lista.length>1?`<small>${e.lista.length}</small>`:''}</a>`;
  const porCargo=p._porCargo;
  const grade=porCargo
    ? CM_AREAS.map(([nome])=>{ const l=etiquetas.filter(e=>e.area===nome); return l.length?`<div class="cm-pc-area">${nome} <span>${l.length}</span></div><div class="cm-pc-chips">${l.map(chip).join('')}</div>`:''; }).join('')
    : `<div class="cm-pc-chips">${etiquetas.map(chip).join('')}</div>`;
  const lev=cmFontes().map(f=>f[uf]).find(e=>e?.atualizado), todosLink=cmFontes()[1][uf]?.todos;
  p.innerHTML=`<div class="cm-pc-topo">
      <div class="cm-pc-tit">${sel?`Concursos para quem mora em <b>${sel.n}</b>`:`Concursos na região <b>${p._nome}</b>`} <span>${etiquetas.length} ${etiquetas.length===1?'órgão':'órgãos'}</span></div>
      ${sel?`<button type="button" class="cm-pc-regiao" onclick="cmPainelRegiao()">Ver a região toda</button>`:''}
    </div>
    <div class="cm-pc-grade">${etiquetas.length?grade:`<p class="cm-pc-vazio">Nenhum concurso encontrado no levantamento.</p>`}</div>
    <div class="cm-pc-nums">
      <div class="verde"><b>${abertos.length}</b><span>com inscrições abertas</span></div>
      <div class="verde"><b>${cmNum(vagas)}</b><span>vagas abertas${temCR?' + cadastro de reserva':''}</span></div>
      <div class="azul"><b>${previstos.length}</b><span>previstos</span></div>
    </div>
    <button type="button" class="cm-pc-porcargo" onclick="cmPainelPorCargo()">${porCargo?'Ver todos os concursos por órgão':'Ver todos os concursos por cargo'} ›</button>
    <div class="cm-pc-rodape">${lev?`Levantamento de ${lev.atualizado} · datas mudam, confira sempre a fonte.`:''}${todosLink?` <a href="${todosLink}" target="_blank" rel="noopener">Ver todos os editais</a>`:''}
      <span>Mapa: <a href="https://sidra.ibge.gov.br/tabela/4714" target="_blank" rel="noopener">IBGE</a></span></div>`;
  requestAnimationFrame(()=>p.classList.add('aparece'));
}
function cmPainelPorCargo(){ const p=document.getElementById('cm-ev-painel'); if(!p) return; p._porCargo=!p._porCargo; cmPainelConcursos(); }
const cmAttr=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
// TIPO DE CARGO de cada concurso (para "ver por cargo"): a primeira regra que bate, olhando órgão + cargo
const CM_AREAS = [
  ['Policial e segurança', /pol[íi]cia|bombeiro|penal|seap|sejus|ssp-|guarda|socioeducativo|marinha|militar/i],
  ['Trânsito', /detran|tr[âa]nsito/i],
  ['Tribunais e jurídico', /\btj|tribunal|trt|\bmp-|minist[ée]rio p|defensoria|\bpge|procurad|advogad|juiz|jur[íi]dic/i],
  ['Controle e legislativo', /\btce|\bcge|controle|assembleia|c[âa]mara|legislativ/i],
  // só a área TRIBUTÁRIA/financeira ("Fiscal de obras", "Fiscal ambiental", "Fiscal sanitário" NÃO entram — revisão de 15/10/2026)
  ['Fiscal e fazenda', /sefaz|sefin|fazend|tribut|receita|auditor[ -]?fiscal|fiscal (de )?(tributos|rendas|da receita|fazend)|finan[çc]/i],
  ['Saúde', /sa[úu]de|\bses|sesa|sesau|hospital|m[ée]dic|enferm|endemias|farmac|odont|psic[óo]log|nutricion|fisioterap|fonoaud/i],
  ['Educação', /professor|educa|seduc|\bseed|\bsed-|\bsee|docente|pedagog|escolar|univers|\bue[a-z]+\b|\buf[a-z]*\b|\bif[a-z]*\b|unesp|unicamp|\busp|cefet|unila|unifal|unifei|unimontes|unilab/i],
  ['Prefeituras e outros cargos', /./],
];
// SIGLA de cada órgão (Polícia Militar do MA ➔ PM-MA; Prefeitura de Bauru ➔ Pref. Bauru; SEFAZ-MA continua SEFAZ-MA)
const CM_SIGLAS = [[/^Pol[íi]cia Militar/i,'PM'],[/^Pol[íi]cia Civil/i,'PC'],[/^Pol[íi]cia Penal/i,'Polícia Penal'],[/^Pol[íi]cia Cient[íi]fica/i,'Polícia Científica'],
  [/^Corpo de Bombeiros/i,'CBM'],[/^Defensoria P[úu]blica/i,'DPE'],[/^Assembleia Legislativa/i,'AL'],[/^Secretaria da Fazenda/i,'SEFAZ'],[/^Secretaria de Sa[úu]de/i,'SES']];
function cmSiglas(c, uf){
  const o=c.orgao.replace(/\s*\([^)]*\)/g,'').trim();
  if(/^Pol[íi]cia Militar, Pol[íi]cia Civil e Bombeiros/i.test(o)) return [`PM-${uf}`,`PC-${uf}`,`CBM-${uf}`];
  for(const [re,s] of CM_SIGLAS) if(re.test(o)) return [s.includes(' ') ? `${s} ${uf}` : `${s}-${uf}`];
  if(/^(Prefeitura|Munic[íi]pio|Procuradoria do Munic|Hospital S[ãa]o Lucas|Hospital Municipal)/i.test(o) && c.cidade) return [`Pref. ${c.cidade}`];
  if(/^C[âa]mara/i.test(o) && !/Legislativa/i.test(o)) return [`Câmara ${c.cidade||o.replace(/^C[âa]mara( de Vereadores)?( d[eoa]s?)?\s*/i,'')}`];
  if(c.cidade){ const w=o.split(' ')[0]; return [/^[A-Z]{3,}$/.test(w) ? `${w} ${c.cidade}` : o]; }   // SAAE de Pirapora ➔ SAAE Pirapora
  if(/^Marinha/i.test(o)) return ['Marinha'];
  return [o];
}
// junta os concursos por sigla: cada etiqueta guarda a lista, a situação "mais forte" e o tipo de cargo
function cmEtiquetas(todos, uf){
  const m=new Map();
  todos.forEach(c=>cmSiglas(c,uf).forEach(s=>{ if(!m.has(s)) m.set(s,{sigla:s, lista:[]}); m.get(s).lista.push(c); }));
  const ordem={aberto:0, edital:1, andamento:2, previsto:3, semprevisao:4}, cor={aberto:'aberto', edital:'aberto', andamento:'andamento', previsto:'previsto', semprevisao:'semprevisao'};
  return [...m.values()].map(e=>{ const melhor=e.lista.reduce((a,b)=>ordem[b.status]<ordem[a.status]?b:a);
      return {...e, st:ordem[melhor.status], sit:cor[melhor.status], area:CM_AREAS.find(([,re])=>e.lista.some(c=>re.test(`${c.orgao} ${c.cargo}`)))[0]}; })
    .sort((a,b)=>a.st-b.st || a.sigla.localeCompare(b.sigla,'pt-BR'));
}
function cmPainelRegiao(){ const p=document.getElementById('cm-ev-painel'); if(!p) return; p._sel=null;
  document.querySelectorAll('.cm-dm .fixo').forEach(e=>e.classList.remove('fixo')); cmPainelConcursos(); }
// ── CONCURSOS POR CIDADE — situação de cada um e de onde vêm os dados ──
// CONCURSOS_CIDADE: { 'código IBGE do município': [ {orgao, status:'aberto'|'previsto'|'semprevisao', vagas} ] }
// ⚠ VAZIO de propósito (decisão do Levi): só entra dado REAL, com fonte, quando houver o cadastro de concursos (Supabase).
const CONCURSOS_CIDADE = {};
const CM_SITUACOES = {
  aberto:     {nome:'Acontecendo'},
  previsto:   {nome:'Previsto'},
  semprevisao:{nome:'Sem previsão'},
  semdados:   {nome:'Ainda sem dados'},
};
// nome de cada situação no texto ("edital publicado" e "em andamento" usam a mesma cor verde de "acontecendo")
const CM_SIT_NOME = {aberto:'Inscrições abertas', edital:'Edital publicado', andamento:'Inscrições encerradas', previsto:'Previsto', semprevisao:'Sem previsão'};
// cor do PONTO de cada concurso no mapa da região (a situação de hoje)
// CICLO DO CONCURSO = COR DO PONTO (decisão do Levi, 16/10/2026), na ordem em que acontece:
// AZUL previsto ➔ GRAFITE edital publicado (inscrições ainda não abriram; cor do botão "Ver todos os concursos disponíveis")
// ➔ VERDE inscrições abertas ➔ VERMELHO encerrado. O antigo "sem previsão" vira azul. (Roxo "período de provas" e laranja
// "prova realizada" foram TIRADOS a pedido do Levi — a data da prova falta em ~60% dos concursos.) [chave, legenda, balão]
const CM_CICLO=[['previsto','Previstos','previstos'],['edital','Edital publicado','com edital publicado'],['aberto','Inscrições abertas','com inscrições abertas'],
  ['andamento','Encerrados','encerrados']];
function cmCorPonto(c){ const s=cmConcursoHoje(c).status; return s==='semprevisao' ? 'previsto' : s; }
// (a capital de cada estado — onde ficam os pontos dos concursos do estado — vem de CM_CAPITAL, mais abaixo)
// as duas fontes de dados reais: concursos-dados.js (SP, manual) e concursos-levantamento.js (todos os estados)
const cmFontes = ()=>[typeof CONCURSOS_REAIS!=='undefined'?CONCURSOS_REAIS:{}, typeof CONCURSOS_LEVANTAMENTO!=='undefined'?CONCURSOS_LEVANTAMENTO:{}];
// SEGURANÇA (revisão de 15/10/2026): os textos dos concursos vêm de sites de fora (PCI Concursos...) e entram na tela
// como HTML (mapa, balão, busca, letreiro, central). Aqui eles perdem < > e aspas (que poderiam virar código rodando no
// site), datas fora do formato AAAA-MM-DD são descartadas e só passam links https. TODO concurso passa por aqui
// (cmConcursoHoje é chamada por cmOrdenar, pelo letreiro e pela central).
const cmTxtSeguro=s=>typeof s==='string' ? s.replace(/[<>]/g,'').replace(/"/g,'”') : s;
const cmUrlSegura=u=>/^https:\/\/[^\s"'<>`\\]+$/.test(u||'') ? u : 'https://www.pciconcursos.com.br/';
const cmDataOk=d=>/^\d{4}-\d{2}-\d{2}$/.test(d||'');
function cmSeguro(c){
  if(!c || c._seguro) return c;
  const s={...c, _seguro:true};
  ['orgao','cargo','quando','banca','cidade'].forEach(k=>{ if(k in s) s[k]=cmTxtSeguro(s[k]); });
  s.status=CM_SIT_NOME[s.status] ? s.status : 'semprevisao';
  s.vagas=Math.max(0, Math.floor(Number(s.vagas)||0));
  if(!cmDataOk(s.ate)) delete s.ate; if(!cmDataOk(s.de)) delete s.de;
  s.fonte={nome:cmTxtSeguro(c.fonte?.nome||'Fonte'), url:cmUrlSegura(c.fonte?.url)};
  return s;
}
// a situação de HOJE: quem tem data de inscrição muda sozinho — antes do início = edital publicado, depois do fim = encerradas
function cmConcursoHoje(c){
  c=cmSeguro(c);
  if(c.status!=='aberto' || !c.ate) return c;
  const hoje=new Date().toLocaleDateString('sv-SE'), br=d=>d.split('-').reverse().join('/');
  if(hoje>c.ate) return {...c, status:'andamento', quando:`Inscrições encerradas em ${br(c.ate)}`};
  if(c.de && hoje<c.de) return {...c, status:'edital', quando:`inscrições ${c.quando}`};
  return c;
}
const CM_ORDEM_SIT = {aberto:0, edital:1, andamento:2, previsto:3, semprevisao:4};
const cmOrdenar = l=>l.map(cmConcursoHoje).sort((a,b)=>(CM_ORDEM_SIT[a.status]-CM_ORDEM_SIT[b.status]) || (a.ate||'').localeCompare(b.ate||''));
// ── CONCURSOS DE CADA CIDADE, página por página do PCI Concursos (pedido do Levi: "literalmente todos" de cada
// microrregião, abertos e já encerrados, últimos 12 meses). Um arquivo por estado em noticias/concursos-cidades/UF.js,
// carregado só quando o estado é aberto; gerado por levantamento-concursos/baixar-pci-cidades.ps1 + gerar-cidades.ps1.
const CONC_CIDADES = {};
const CM_UF_IBGE = {11:'RO',12:'AC',13:'AM',14:'RR',15:'PA',16:'AP',17:'TO',21:'MA',22:'PI',23:'CE',24:'RN',25:'PB',26:'PE',27:'AL',28:'SE',29:'BA',
  31:'MG',32:'ES',33:'RJ',35:'SP',41:'PR',42:'SC',43:'RS',50:'MS',51:'MT',52:'GO',53:'DF'};
function cmCarregarCidades(uf){
  if(CONC_CIDADES[uf] || CONC_CIDADES[uf]===null) return Promise.resolve(CONC_CIDADES[uf]);
  return new Promise(ok=>{ const sc=document.createElement('script'); sc.src=`noticias/concursos-cidades/${uf}.js`;
    sc.onload=()=>ok(CONC_CIDADES[uf]||null); sc.onerror=()=>{ CONC_CIDADES[uf]=null; ok(null); }; document.head.appendChild(sc); });
}
const CM_PCI = 'https://www.pciconcursos.com.br/noticias/';
// item compacto do arquivo da cidade ➔ concurso (a situação de hoje vem da data, em cmConcursoHoje)
function cmDaCidade(a){
  const [orgao,cargo,nivel,vagas,cr,de,ate,slug]=a, br=d=>d.split('-').reverse().join('/');
  return {orgao, cargo:cargo+(nivel?` (${nivel})`:''), vagas, status:'aberto', ate, ...(de?{de}:{}),
    quando:(de?`de ${br(de)} a ${br(ate)}`:`até ${br(ate)}`)+(cr?' · cadastro de reserva':''), fonte:{nome:'PCI Concursos', url:CM_PCI+slug}};
}
// todos os links do PCI que já estão em alguma cidade do estado (para não repetir o mesmo concurso em outro lugar)
function cmSlugsCidades(uf){ const d=CONC_CIDADES[uf]; if(!d) return new Set(); if(!d._slugs) d._slugs=new Set(Object.values(d.c).flatMap(l=>l.map(a=>CM_PCI+a[7]))); return d._slugs; }
// concursos da cidade: página da cidade no PCI (se o arquivo do estado já carregou) + previstos municipais + levantamento manual
function cmConcursosCidade(cod){
  const uf=CM_UF_IBGE[String(cod).slice(0,2)], pc=CONC_CIDADES[uf];
  let base=[...(CONCURSOS_CIDADE[cod]||[]), ...cmFontes().flatMap(f=>Object.values(f).flatMap(e=>e.municipais?.[cod]||[]))];
  if(pc){ const s=cmSlugsCidades(uf); base=base.filter(c=>!s.has(c.fonte.url) && !/pciconcursos\.com\.br/.test(c.fonte.url)); }
  return cmOrdenar([...base, ...(pc?.c[cod]||[]).map(cmDaCidade)]);
}
// concursos do ESTADO e órgãos federais no estado (PM, Polícia Civil, Fazenda, universidades...): valem para todas as cidades
function cmConcursosEstaduais(uf){ return cmOrdenar(cmFontes().flatMap(f=>f[uf]?.estaduais||[])); }
// a cor do ponto é a situação "mais forte" da cidade: acontecendo (inscrições abertas, edital publicado ou provas em andamento) > previsto > sem previsão
function cmSituacaoCidade(lista){
  if(!lista.length) return 'semdados';
  if(lista.some(c=>['aberto','edital','andamento'].includes(cmConcursoHoje(c).status))) return 'aberto';
  return ['previsto','semprevisao'].find(s=>lista.some(c=>c.status===s)) || 'semdados';
}
// uma linha de concurso com a fonte (pedido do Levi: só dado real, sempre com de onde veio)
function cmLinhaConcurso(c){
  return `<li><i class="sit-${cmSituacaoCidade([c])}"></i><span><b>${c.orgao}</b> — ${c.cargo}${c.vagas?` · ${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}`:''}${c.banca?` · ${c.banca}`:''}
    <em>${c.status==='andamento' ? c.quando : `${CM_SIT_NOME[c.status]||''}: ${c.quando}`}</em></span>
    <a href="${c.fonte.url}" target="_blank" rel="noopener">${c.fonte.nome}</a></li>`;
}
// lista embaixo do mapa da região: concursos das prefeituras daqui + os do estado, cada um com a fonte
function cmBlocoConcursos(municipais, uf, comDados){
  const est=cmConcursosEstaduais(uf), lev=cmFontes().map(f=>f[uf]).find(e=>e?.atualizado), todos=cmFontes()[1][uf]?.todos;
  if(!est.length && !municipais.length) return `<div class="cm-dm-aviso1">Os concursos de cada cidade ainda estão sendo cadastrados.</div>`;
  return `<div class="cm-dm-conc">
    ${municipais.length ? `<div class="cm-dm-conc-tit">Prefeituras e câmaras desta região</div><ul>${cmOrdenar(municipais).map(cmLinhaConcurso).join('')}</ul>` : ''}
    ${est.length ? `<div class="cm-dm-conc-tit">Estado e órgãos federais <span>(valem para todas as cidades)</span></div><ul>${est.map(cmLinhaConcurso).join('')}</ul>` : ''}
    ${lev ? `<div class="cm-dm-aviso1">Levantamento de ${lev.atualizado}. Datas mudam: confira sempre a fonte.${comDados?'':' Nenhuma prefeitura desta região com edital aberto no levantamento.'}${todos?` <a href="${todos}" target="_blank" rel="noopener">Ver todos os editais da região</a>`:''}</div>` : ''}
  </div>`;
}
function cmNoEstadoVoltar(uf){ return cmDoEstado(uf).replace(/^do /,'ao ').replace(/^da /,'à ').replace(/^de /,'a '); }   // "ao Tocantins", "à Bahia", "a São Paulo"
// ── BUSCA QUE DESCE (pedido do Levi): com a região aberta, a barra de pesquisa do topo desce até o lugar do letreiro
// (que some) e fica lá; ao voltar ao estado, sobe de novo. O topo e o letreiro só ficam invisíveis (nada muda de lugar).
// O que essa busca vai procurar ainda será definido com o Levi — por enquanto o campo diz "(Definir com o Claude)".
// lugar da busca = a faixa de baixo da tela (onde ficam o rótulo + letreiro, ~76px). Medido pela tela e não pelo
// letreiro, porque o letreiro é TROCADO quando o estado abre (cmFaixaTrocar) e a medida antiga ficava errada.
function cmBuscaAlvo(){
  const ns=document.getElementById('news-screen'); if(!ns) return null;
  const a=ns.getBoundingClientRect(), ALT=76, w=Math.min(640, a.width-120), h=44;
  return {left:a.left+(a.width-w)/2, top:a.bottom-ALT+(ALT-h)/2, width:w, height:h, ns};
}
function cmBuscaDescer(){
  const tb=document.querySelector('#topbar .tb-search'), alvo=cmBuscaAlvo(); if(!tb||!alvo||document.getElementById('cm-busca-baixo')) return;
  const A=tb.getBoundingClientRect();
  const el=document.createElement('div'); el.id='cm-busca-baixo'; el.className='cm-busca-baixo';
  el.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/></svg><input type="search" autocomplete="off" placeholder="Busque um concurso, cargo ou cidade" aria-label="Busque um concurso, cargo ou cidade" oninput="cmBuscaDigitar(this.value)" onkeydown="cmBuscaTecla(event)" onfocus="cmBuscaDigitar(this.value)"><div class="cm-bb-res" id="cm-bb-res" hidden role="listbox"></div>`;
  el.onpointerdown=e=>e.stopPropagation();
  el.style.cssText=`left:${A.left}px;top:${A.top}px;width:${A.width}px;height:${A.height}px`;
  (document.getElementById('news-screen')||document.body).appendChild(el);   // dentro da tela de Notícias: as Configurações (camada por cima) cobrem a busca também
  tb.style.visibility='hidden'; alvo.ns.classList.add('cm-busca-desceu');   // esconde rótulo + letreiro (mesmo se forem trocados)
  requestAnimationFrame(()=>requestAnimationFrame(()=>{ el.classList.add('anda');
    el.style.cssText=`left:${alvo.left}px;top:${alvo.top}px;width:${alvo.width}px;height:${alvo.height}px`; }));
  window.addEventListener('resize', cmBuscaReposicionar);
}
// ── A BUSCA FUNCIONANDO (pedido do Levi): procura no ESTADO aberto — cidades (pelo nome) e concursos (órgão, cargo ou
// cidade; todas as palavras precisam aparecer). Abertos primeiro, depois previstos e encerrados. Escolher um resultado
// leva até a cidade no mapa (abre a região dela, se for outra) e mostra o leque/cartão do concurso.
const cmNormBusca=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();
let cmBuscaIdx=null, cmBuscaSel=-1, cmBuscaItens=[];
function cmBuscaIndice(uf){
  if(cmBuscaIdx?.uf===uf && cmBuscaIdx.temCid===!!CONC_CIDADES[uf]) return cmBuscaIdx;
  const munis=MUNI_BR[uf]||[], porCod=new Map(munis.map(m=>[m.c,m])), capital=munis.find(m=>m.n===CM_CAPITAL[uf]);
  const cods=new Set([...Object.keys(CONC_CIDADES[uf]?.c||{}), ...cmFontes().flatMap(f=>Object.keys(f[uf]?.municipais||{}))]);
  const conc=[]; cods.forEach(cod=>{ const m=porCod.get(cod); if(m) cmConcursosCidade(cod).forEach(c=>conc.push({c, m})); });
  const s=cmSlugsCidades(uf); if(capital) cmConcursosEstaduais(uf).filter(c=>!s.has(c.fonte.url)).forEach(c=>conc.push({c:{...c, estadual:true}, m:capital}));
  conc.forEach(x=>x.txt=cmNormBusca(`${x.c.orgao} ${x.c.cargo} ${x.m.n}`));
  const nPor=new Map(); conc.forEach(x=>nPor.set(x.m.c,(nPor.get(x.m.c)||0)+1));
  cmBuscaIdx={uf, temCid:!!CONC_CIDADES[uf], conc, cidades:munis.map(m=>({m, txt:cmNormBusca(m.n), n:nPor.get(m.c)||0}))};
  return cmBuscaIdx;
}
function cmBuscaDigitar(q){
  const box=document.getElementById('cm-bb-res'), uf=cmVendoEstado; if(!box) return;
  const t=cmNormBusca(q); if(t.length<2 || !uf || !MUNI_BR[uf]){ box.hidden=true; cmBuscaItens=[]; return; }
  const idx=cmBuscaIndice(uf), pal=t.split(' ');
  const cid=idx.cidades.filter(x=>x.txt.includes(t)).sort((a,b)=>(b.txt.startsWith(t)-a.txt.startsWith(t)) || b.n-a.n).slice(0,4);
  const ord={aberto:0, edital:1, previsto:2, semprevisao:3, andamento:4};
  const achados=idx.conc.filter(x=>pal.every(p=>x.txt.includes(p))).map(x=>({...x, h:cmConcursoHoje(x.c)}))
    .sort((a,b)=>ord[a.h.status]-ord[b.h.status] || (b.c.vagas||0)-(a.c.vagas||0));
  cmBuscaItens=[...cid.map(x=>({tipo:'cid', m:x.m, n:x.n})), ...achados.slice(0,8).map(x=>({tipo:'conc', m:x.m, c:x.h}))]; cmBuscaSel=-1;
  const vg=c=>c.vagas?` · ${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}`:'';
  box.innerHTML=cmBuscaItens.length ? cmBuscaItens.map((it,i)=>it.tipo==='cid'
      ? `<div class="cm-bb-item" role="option" data-i="${i}"><i class="pin"></i><span><b>${it.m.n}</b><small>Cidade · ${it.n} ${it.n===1?'concurso':'concursos'} no levantamento</small></span></div>`
      : `<div class="cm-bb-item" role="option" data-i="${i}"><i class="sit-${cmCorPonto(it.c)}"></i><span><b>${it.c.orgao}</b><small>${it.c.cargo}${vg(it.c)} · ${it.m.n}</small></span><em class="st-${cmCorPonto(it.c)}">${CM_SIT_NOME[it.c.status]||''}</em></div>`).join('')
      + (achados.length>8 ? `<div class="cm-bb-mais">${achados.length} concursos encontrados no estado — refine a busca para ver outros</div>` : '')
    : `<div class="cm-bb-mais">Nada encontrado ${cmDoEstado(uf).replace(/^d/,'n')} para “${String(q).replace(/[<>&"]/g,'')}”</div>`;
  box.hidden=false;
  box.querySelectorAll('.cm-bb-item').forEach(d=>d.onclick=()=>cmBuscaEscolher(+d.dataset.i));
}
function cmBuscaTecla(ev){
  const box=document.getElementById('cm-bb-res');
  if(ev.key==='Escape'){ ev.stopPropagation(); if(box) box.hidden=true; return; }
  if(!box || box.hidden || !cmBuscaItens.length) return;
  if(ev.key==='ArrowDown' || ev.key==='ArrowUp'){ ev.preventDefault(); cmBuscaSel=(cmBuscaSel+(ev.key==='ArrowDown'?1:-1)+cmBuscaItens.length)%cmBuscaItens.length;
    box.querySelectorAll('.cm-bb-item').forEach((d,i)=>d.classList.toggle('ativo', i===cmBuscaSel)); box.querySelector('.ativo')?.scrollIntoView({block:'nearest'}); }
  else if(ev.key==='Enter'){ ev.preventDefault(); cmBuscaEscolher(cmBuscaSel>=0?cmBuscaSel:0); }
}
function cmBuscaEscolher(i){
  const it=cmBuscaItens[i], box=document.getElementById('cm-bb-res'); if(!it) return;
  if(box) box.hidden=true;
  cmIrParaCidade(cmVendoEstado, it.m, it.tipo==='conc' ? it.c.fonte.url : null);
}
// leva até a cidade: se ela é de OUTRA região do estado, fecha a atual e abre a dela (a busca continua embaixo)
function cmIrParaCidade(uf, m, url){
  const alvo=document.getElementById('cm-ev-mapa'); if(!alvo?._regs) return;
  const i=alvo._regs.findIndex(r=>r.cod===m.me); if(i<0) return;
  const tentar=(n)=>{ const cx=document.getElementById('cm-ev-regiao');
    if(cx?._selecionar && cmRegiaoAberta===i){ cx._selecionar(m.c, url); return; }
    if(n>0) setTimeout(()=>tentar(n-1), 150); };
  if(cmRegiaoAberta!==i){ if(cmRegiaoAberta>=0) cmMesoFechar(true, true); cmEvArrastou=false; cmMesoAbrir(i); }
  tentar(40);
}
function cmBuscaReposicionar(){ const el=document.getElementById('cm-busca-baixo'), a=cmBuscaAlvo(); if(!el||!a) return;
  el.classList.remove('anda'); el.style.cssText=`left:${a.left}px;top:${a.top}px;width:${a.width}px;height:${a.height}px`; }
// semAnimar: some na hora (trocou de tela); senão sobe de volta ao topo e só então o topo e o letreiro reaparecem
function cmBuscaSubir(semAnimar){
  const el=document.getElementById('cm-busca-baixo'), tb=document.querySelector('#topbar .tb-search');
  window.removeEventListener('resize', cmBuscaReposicionar);
  const volta=()=>{ el?.remove(); if(document.getElementById('cm-busca-baixo')) return; if(tb) tb.style.visibility='';
    document.getElementById('news-screen')?.classList.remove('cm-busca-desceu'); };
  if(!el || semAnimar || !tb){ volta(); return; }
  const A=tb.getBoundingClientRect(); el.id='';   // deixa abrir outra região enquanto esta ainda sobe
  el.classList.add('anda'); el.style.cssText=`left:${A.left}px;top:${A.top}px;width:${A.width}px;height:${A.height}px`;
  setTimeout(volta, 560);
}
function cmMesoFechar(semAnimar, manterBusca){   // manterBusca: a busca de baixo trocou de região — ela fica onde está
  if(cmRegiaoAberta<0) return;
  cmRegiaoAberta=-1;
  const v=document.getElementById('cm-estado-vista'); if(!v) return;
  document.getElementById('cm-ev-regiao')?.remove(); document.getElementById('cm-rz-fundo')?.remove(); document.getElementById('cm-dm-dica-fora')?.remove();
  document.getElementById('cm-ev-painel')?.remove();
  document.getElementById('cm-rz-card')?.remove();
  document.getElementById('cm-central')?.remove(); document.getElementById('news-screen')?.classList.remove('cmc-cheio','cmc-subindo');
  if(!manterBusca) cmBuscaSubir(semAnimar);
  v.classList.remove('cm-ev-foco');
  const topo=v.querySelector('.cm-ev-topo'); if(topo && cmTopoAntes) topo.innerHTML=cmTopoAntes;
}
// ── ZOOM DO ESTADO ABERTO (pedido do Levi, igual ao mapa do Brasil): rodinha do mouse amplia no ponto do mouse,
// arrastar move (quando ampliado), duplo clique volta ao tamanho normal.
// Enquanto a rodinha gira, a imagem só é esticada (rápido); quando para, o mapa é REDESENHADO no tamanho novo
// (bordas finas e nítidas, e os nomes que agora cabem aparecem dentro das regiões).
let cmEvZoom={z:1,x:0,y:0}, cmEvDesenhado={z:1,x:0,y:0}, cmEvRedesenhoT=null, cmEvArrastou=false;
// posiciona o quadro desenhado para mostrar o estado cmEvZoom (x,y = deslocamento a partir do centro da área)
function cmEvMostrar(){
  const a=document.getElementById('cm-ev-mapa'), q=a?.querySelector('.cm-ev-quadro'); if(!q||!a._W1) return;
  const d=cmEvDesenhado, z=cmEvZoom, s=z.z/d.z;
  const Wd=a._W1*d.z, Hd=a._H1*d.z, Wn=a._W1*z.z, Hn=a._H1*z.z;
  q.style.transform=`translate(${z.x+(Wd-Wn)/2}px,${z.y+(Hd-Hn)/2}px) scale(${s})`;
}
function cmEvLimitar(){
  const a=document.getElementById('cm-ev-mapa'); if(!a?._W1) return;
  if(cmEvZoom.z<=1){ cmEvZoom={z:1,x:0,y:0}; return; }
  const Wn=a._W1*cmEvZoom.z, Hn=a._H1*cmEvZoom.z;   // o estado nunca some da tela ao arrastar
  cmEvZoom.x=Math.max(-Wn/2, Math.min(Wn/2, cmEvZoom.x)); cmEvZoom.y=Math.max(-Hn/2, Math.min(Hn/2, cmEvZoom.y));
}
function cmEvRoda(ev){
  const a=document.getElementById('cm-ev-mapa'), q=a?.querySelector('.cm-ev-quadro'); if(!q||!a._W1) return;
  ev.preventDefault();
  const z0=cmEvZoom.z, z=Math.min(6, Math.max(1, z0*(ev.deltaY<0 ? 1.18 : 1/1.18))); if(z===z0) return;
  const r=q.getBoundingClientRect(), u=ev.clientX-r.left, v=ev.clientY-r.top;   // ponto do mouse dentro do estado (na escala atual)
  const W0=a._W1*z0, H0=a._H1*z0, Wn=a._W1*z, Hn=a._H1*z;
  cmEvZoom={ z, x:cmEvZoom.x+u*(1-z/z0)+(Wn-W0)/2, y:cmEvZoom.y+v*(1-z/z0)+(Hn-H0)/2 };
  cmEvLimitar(); cmEvMostrar(); a.classList.toggle('ampliado', cmEvZoom.z>1);
  clearTimeout(cmEvRedesenhoT); cmEvRedesenhoT=setTimeout(()=>cmDesenharMeso(cmVendoEstado), 220);
}
function cmEvArrastaInicio(ev){
  cmEvArrastou=false;
  if(cmEvZoom.z<=1) return;
  ev.preventDefault();
  const ini={x:ev.clientX, y:ev.clientY, ox:cmEvZoom.x, oy:cmEvZoom.y}, alvo=document.getElementById('cm-ev-mapa');
  alvo?.classList.add('arrastando');
  const mover=e=>{ if(Math.abs(e.clientX-ini.x)+Math.abs(e.clientY-ini.y)>4) cmEvArrastou=true; cmEvZoom.x=ini.ox+(e.clientX-ini.x); cmEvZoom.y=ini.oy+(e.clientY-ini.y); cmEvLimitar(); cmEvMostrar(); };
  const soltar=()=>{ window.removeEventListener('pointermove',mover); window.removeEventListener('pointerup',soltar); alvo?.classList.remove('arrastando'); };
  window.addEventListener('pointermove',mover); window.addEventListener('pointerup',soltar);
}
// mistura duas cores "#rrggbb" ou "rgb(r,g,b)" (t=0 ➔ a, t=1 ➔ b)
function cmMesoMistura(a, b, t){
  const c=h=>h[0]==='#' ? [1,3,5].map(i=>parseInt(h.slice(i,i+2),16)) : h.match(/\d+/g).map(Number), x=c(a), y=c(b);
  return `rgb(${x.map((v,i)=>Math.round(v+(y[i]-v)*t)).join(',')})`;
}
// mudou o tamanho da janela ou o tema: desenha de novo (só nessas horas)
let cmRedesenhoT=null;
window.addEventListener('resize',()=>{ if(!document.getElementById('cm-mapa3d')) return; clearTimeout(cmRedesenhoT); cmRedesenhoT=setTimeout(()=>{ cmDesenharMapaLeve(); cmPosicionarDica(); if(cmVendoEstado) cmLayoutEstado(); },250); });
// ════════════════════════════════════════════
// ÁREA 3 — NÚMEROS DO BRASIL (dados de EXEMPLO) — RETIRADO da tela a pedido do Levi; fica guardado para usar depois
// ════════════════════════════════════════════
function cmNumerosHTML(){
  const abertos=CONCURSOS_EXEMPLO.filter(c=>c.status==='publicado').length, previstos=CONCURSOS_EXEMPLO.filter(c=>c.status==='previsto').length;
  const vagas=CONCURSOS_EXEMPLO.reduce((t,c)=>t+c.vagas,0), maior=Math.max(...CONCURSOS_EXEMPLO.map(c=>c.salario));
  const item=(rot,val,sub,ico)=>`<div class="cm-num"><span class="cm-num-ico">${ico}</span><div><span>${rot}</span><b>${val}</b>${sub?`<small>${sub}</small>`:''}</div></div>`;
  const I=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  return `<aside class="cm-numeros" id="cm-numeros" aria-label="Números do Brasil">
    <div class="cm-numeros-cab"><b>Números do Brasil</b><span class="cm-exemplo" title="Números de demonstração">Exemplo</span></div>
    ${item('Abertos agora', abertos, 'com inscrições abertas', I('<path d="M4 12.5l5 5L20 6.5"/>'))}
    ${item('Previstos', previstos, 'editais que vão sair', I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'))}
    ${item('Vagas', vagas.toLocaleString('pt-BR'), 'somando todos', I('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5M16 5.5a3 3 0 0 1 0 6M18 14c1.6.6 2.7 2.4 3 5"/>'))}
    ${item('Maior salário', cmDinheiro(maior), 'entre os concursos', I('<path d="M12 3v18M16.5 7.5c0-1.7-2-3-4.5-3s-4.5 1.3-4.5 3 2 2.6 4.5 3 4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3"/>'))}
  </aside>`;
}

// ════════════════════════════════════════════
// ÁREA 1 — TOUR GUIADO (na 1ª visita; o botão "?" do mapa mostra de novo)
// ════════════════════════════════════════════
const CM_TOUR = [
  { alvo:null, titulo:'Concursos pelo Brasil', texto:'Aqui você acompanha os concursos de cada estado do país, de um jeito visual. Vamos ver como funciona?' },
  { alvo:'#cm-palco', titulo:'O mapa', texto:'Cada estado aparece com a sua bandeira. Passe o mouse em cima de um estado para destacá-lo e clique para vê-lo de perto.' },
  { alvo:'#cm-palco', titulo:'Ampliar e mover', texto:'Role a rodinha do mouse sobre o mapa para ampliar. Com o mapa ampliado, clique e arraste para mover.' },
  { alvo:'.cm-controles', titulo:'Controles do mapa', texto:'Use + e − para aproximar ou afastar (o número no meio mostra o zoom), a mira para voltar ao Brasil inteiro e o ? para rever este tour.' },
];
const CM_TOUR_CHAVE='gorila_tour_noticias_v1';
function cmTourVisto(){ try{ return localStorage.getItem(CM_TOUR_CHAVE)==='1'; }catch(e){ return true; } }
// 1ª visita (pedido do Levi): depois das mensagens do "?" (concluir ou pular), abre sozinho o quadro da estrela
let cmTourPrimeira = false;
function cmTourFim(){ try{ localStorage.setItem(CM_TOUR_CHAVE,'1'); }catch(e){} document.querySelectorAll('.cm-tour,.cm-tour-luz').forEach(e=>e.remove()); window.removeEventListener('resize',cmTourReposicionar);
  if(cmTourPrimeira){ cmTourPrimeira = false; setTimeout(()=>cmSobreAlternar(true), 250); } }
let cmTourPasso=0;
function cmTour(i){
  if(!document.getElementById('cm-palco')) return;
  cmTourPasso=i; const p=CM_TOUR[i];
  document.querySelectorAll('.cm-tour,.cm-tour-luz').forEach(e=>e.remove());
  const luz=document.createElement('div'); luz.className='cm-tour-luz'+(p.alvo?'':' cheia'); document.body.appendChild(luz);
  const b=document.createElement('div'); b.className='cm-tour'; b.setAttribute('role','dialog'); b.setAttribute('aria-label',p.titulo);
  b.innerHTML=`<div class="cm-tour-passo">${i+1} de ${CM_TOUR.length}</div><h3>${p.titulo}</h3><p>${p.texto}</p>
    <div class="cm-tour-botoes"><button type="button" class="cm-tour-pular" onclick="cmTourFim()">${i===CM_TOUR.length-1?'Fechar':'Pular'}</button>
    <span>${i>0?`<button type="button" class="cm-tour-voltar" onclick="cmTour(${i-1})">Voltar</button>`:''}
    <button type="button" class="cm-tour-prox" onclick="${i===CM_TOUR.length-1?'cmTourFim()':`cmTour(${i+1})`}">${i===CM_TOUR.length-1?'Concluir':'Próximo'}</button></span></div>`;
  document.body.appendChild(b);
  cmTourReposicionar();
  window.removeEventListener('resize',cmTourReposicionar); window.addEventListener('resize',cmTourReposicionar);
  b.querySelector('.cm-tour-prox').focus();
}
// destaca o alvo (o resto da tela escurece) e põe o balão ao lado dele
function cmTourReposicionar(){
  const p=CM_TOUR[cmTourPasso], luz=document.querySelector('.cm-tour-luz'), b=document.querySelector('.cm-tour'); if(!luz||!b) return;
  const el=p.alvo && document.querySelector(p.alvo);
  if(!el){ b.style.left=Math.max(12,(innerWidth-b.offsetWidth)/2)+'px'; b.style.top=Math.max(80,(innerHeight-b.offsetHeight)/2)+'px'; b.classList.remove('seta-e','seta-d'); return; }
  const r=el.getBoundingClientRect(), m=8;
  Object.assign(luz.style,{left:(r.left-m)+'px',top:(r.top-m)+'px',width:(r.width+2*m)+'px',height:(r.height+2*m)+'px'});
  const w=b.offsetWidth, h=b.offsetHeight;
  let left = r.right+18, lado='seta-e';
  if(left+w>innerWidth-12){ left=r.left-w-18; lado='seta-d'; }
  if(left<12){ left=Math.max(12, Math.min(innerWidth-w-12, r.left+r.width/2-w/2)); lado=''; }
  const top=Math.max(76, Math.min(innerHeight-h-12, r.top+Math.min(r.height,h*2)/2-h/2));
  b.style.left=left+'px'; b.style.top=(lado?top:Math.min(innerHeight-h-12, r.bottom+14))+'px';
  b.classList.toggle('seta-e', lado==='seta-e'); b.classList.toggle('seta-d', lado==='seta-d');
}
// ════════════════════════════════════════════
// FAIXA DAS BANDEIRAS — as 27 bandeiras dos estados passando devagar para a esquerda
// (o conteúdo aparece 2x seguidas para a volta ser contínua; o mouse em cima pausa)
// ════════════════════════════════════════════
// CABEÇALHO da página (pedido do Levi: "mais profissional"): nome da seção + título grande + uma linha, integrado ao fundo (sem faixa); as bandeiras ficam embaixo do mapa.
// A chamada "Conheça sobre a história do Brasil" foi TIRADA do mapa (decisão do Levi); a leitura (historia-brasil.js, abrirHistoria) fica guardada para uma área de estudo.
function cmAvisoHTML(){
  return `<header class="cm-pagina">
    <div class="cm-pagina-secao">Concursos e notícias</div>
    <h1>Concursos pelo Brasil</h1>
    <p>Escolha um estado no mapa para ver os concursos abertos, previstos e encerrados.</p>
  </header>`;
}
// LETREIRO de baixo: um concurso muito procurado de cada estado, com a bandeira do estado (pedido do Levi).
// Só o NOME do concurso — sem datas, vagas ou "edital aberto", porque ainda não temos dados reais (lista escolhida à mão;
// quando houver contas no servidor, dá para trocar pelos concursos que as pessoas mais marcam como interesse).
const CM_FAIXA_CONCURSOS = {
  AC:'Polícia Militar do Acre', AL:'Polícia Civil de Alagoas', AP:'Polícia Militar do Amapá', AM:'Polícia Civil do Amazonas',
  BA:'Tribunal de Justiça da Bahia', CE:'SEFAZ Ceará', DF:'Polícia Civil do Distrito Federal', ES:'Polícia Militar do Espírito Santo',
  GO:'Tribunal de Justiça de Goiás', MA:'Polícia Militar do Maranhão', MT:'Polícia Civil de Mato Grosso', MS:'SEFAZ Mato Grosso do Sul',
  MG:'Polícia Militar de Minas Gerais', PA:'Polícia Militar do Pará', PB:'Polícia Civil da Paraíba', PR:'Polícia Militar do Paraná',
  PE:'Polícia Civil de Pernambuco', PI:'Polícia Militar do Piauí', RJ:'Polícia Civil do Rio de Janeiro', RN:'Polícia Militar do Rio Grande do Norte',
  RS:'Brigada Militar do Rio Grande do Sul', RO:'Polícia Civil de Rondônia', RR:'Polícia Militar de Roraima', SC:'Tribunal de Justiça de Santa Catarina',
  SP:'Tribunal de Justiça de São Paulo', SE:'Polícia Militar de Sergipe', TO:'Polícia Civil do Tocantins'
};
function cmFaixaHTML(){
  const ufs = Object.keys(CM_UF_NOME).sort((a,b)=>CM_UF_NOME[a].localeCompare(CM_UF_NOME[b],'pt-BR'));
  const itens = ufs.map(u=>`<span class="cm-faixa-item" title="${CM_UF_NOME[u]}"><img src="noticias/bandeiras/${u}.png" alt="Bandeira de ${CM_UF_NOME[u]}" loading="lazy" decoding="async">${CM_FAIXA_CONCURSOS[u]||CM_UF_NOME[u]}</span>`).join('');
  return `<div class="cm-faixa" aria-label="Concursos procurados em cada estado"><div class="cm-faixa-trilho">${itens}<span class="cm-faixa-copia" aria-hidden="true">${itens}</span></div></div>`;
}
// ── LETREIRO DO ESTADO ABERTO (pedido do Levi): os concursos com INSCRIÇÕES ABERTAS (bolinha verde) e os PREVISTOS (bolinha azul) daquele estado ──
// (dados REAIS desde a revisão de 15/10/2026 — ver cmConcursosDoEstado)
const CM_PREP = { BA:'da', PB:'da', AL:'de', GO:'de', MG:'de', MT:'de', MS:'de', PE:'de', RO:'de', RR:'de', SC:'de', SE:'de', SP:'de' };   // os outros: "do"
const CM_CAPITAL = { AC:'Rio Branco', AL:'Maceió', AP:'Macapá', AM:'Manaus', BA:'Salvador', CE:'Fortaleza', DF:'Brasília', ES:'Vitória', GO:'Goiânia',
  MA:'São Luís', MT:'Cuiabá', MS:'Campo Grande', MG:'Belo Horizonte', PA:'Belém', PB:'João Pessoa', PR:'Curitiba', PE:'Recife', PI:'Teresina',
  RJ:'Rio de Janeiro', RN:'Natal', RS:'Porto Alegre', RO:'Porto Velho', RR:'Boa Vista', SC:'Florianópolis', SP:'São Paulo', SE:'Aracaju', TO:'Palmas' };
function cmDoEstado(uf){ return `${CM_PREP[uf]||'do'} ${CM_UF_NOME[uf]}`; }   // "do Maranhão", "da Bahia", "de São Paulo"
// ⚠ CORRIGIDO na revisão de 15/10/2026: antes este letreiro INVENTAVA nomes ("Tribunal de Justiça do X", "Prefeitura
// da capital"...) e os marcava como "em alta"/"previsto" sem dado nenhum, misturados com CONCURSOS_EXEMPLO (fictícios).
// Agora usa SÓ DADOS REAIS do estado: verde = inscrições abertas hoje (mais vagas primeiro), azul = previstos.
function cmConcursosDoEstado(uf){
  const pc=CONC_CIDADES[uf];
  const mun=[...cmFontes().flatMap(f=>Object.values(f[uf]?.municipais||{}).flat()), ...(pc?Object.values(pc.c).flat().map(cmDaCidade):[])];
  const todos=[...cmConcursosEstaduais(uf), ...mun].map(cmConcursoHoje);
  const nome=c=>c.orgao.replace(/\s+-\s+.*$/,'').replace(/\s*\([^)]*\)/g,'').trim();   // "UNESP - Universidade..." ➔ "UNESP"
  const pegar=(st,max)=>{ const visto=new Set(), l=[];
    todos.filter(c=>st.includes(c.status)).sort((a,b)=>(b.vagas||0)-(a.vagas||0)).forEach(c=>{ const n=nome(c), ch=n.toLowerCase(); if(!visto.has(ch) && l.length<max){ visto.add(ch); l.push({nome:n, status:st[0]==='aberto'?'alta':'previsto'}); } });
    return l; };
  const a=pegar(['aberto','edital'],14), p=pegar(['previsto'],10), mix=[];
  for(let i=0;i<Math.max(a.length,p.length);i++){ if(a[i]) mix.push(a[i]); if(p[i]) mix.push(p[i]); }   // intercala verde/azul
  return mix;
}
// troca o letreiro: uf = estado aberto (concursos dele, sem bandeiras); null = volta ao letreiro do Brasil
const CM_ICONE_ALTA='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>';
function cmFaixaTrocar(uf){
  const rot=document.querySelector('.cm-faixa-rotulo'), faixa=document.querySelector('.cm-faixa'); if(!rot||!faixa) return;
  if(!uf){
    rot.innerHTML=`${CM_ICONE_ALTA}Concursos procurados em cada estado`;
    faixa.outerHTML=cmFaixaHTML(); cmFaixaVelocidade(); return;
  }
  const no=cmDoEstado(uf).replace(/^do /,'no ').replace(/^da /,'na ').replace(/^de /,'em ');   // "no Maranhão", "na Bahia", "em São Paulo"
  rot.innerHTML=`${CM_ICONE_ALTA}Concursos ${no}<span class="cm-fx-legenda"><i class="cm-fx-alta"></i>Inscrições abertas<i class="cm-fx-prev"></i>Previstos</span>`;
  // só texto (pedido do Levi): bolinha da cor da situação + nome; a situação também vai escrita para leitor de tela
  const lista=cmConcursosDoEstado(uf);
  if(!lista.length){ faixa.outerHTML=`<div class="cm-faixa" aria-label="Concursos ${no}"><div class="cm-faixa-trilho cm-faixa-parado"><span class="cm-faixa-item">Nenhum concurso aberto ou previsto no levantamento</span></div></div>`; return; }
  const um=lista.map(c=>{ const alta=c.status==='alta';
    return `<span class="cm-faixa-item cm-fx-${alta?'alta':'prev'}" title="${alta?'Inscrições abertas':'Previsto'}"><i aria-hidden="true"></i>${c.nome}<span class="cm-fx-sr"> (${alta?'inscrições abertas':'previsto'})</span></span>`; }).join('');
  const itens=um+um+um;   // poucos nomes: repete para o letreiro encher a tela
  faixa.outerHTML=`<div class="cm-faixa" aria-label="Concursos ${no}"><div class="cm-faixa-trilho">${itens}<span class="cm-faixa-copia" aria-hidden="true">${itens}</span></div></div>`;
  cmFaixaVelocidade();
}
// mesma velocidade de leitura de antes (~43 px por segundo), qualquer que seja o tamanho dos nomes
function cmFaixaVelocidade(){
  const t=document.querySelector('.cm-faixa-trilho'); if(t && t.scrollWidth) t.style.animationDuration=Math.round(t.scrollWidth/2/43)+'s';
}
// ════════════════════════════════════════════
// ESTRELA (canto de cima à esquerda do mapa) ➔ quadrado explicando o que a seção "Concursos e notícias" faz.
// Texto confirmado pelo Levi. Fecha com X, "Entendi", clicando na estrela de novo ou com Esc.
// ════════════════════════════════════════════
function cmSobreHTML(){
  return `<div class="cm-sobre" onpointerdown="event.stopPropagation()" ondblclick="event.stopPropagation()" onwheel="event.stopPropagation()">
    <button type="button" class="cm-sobre-botao" onclick="cmSobreAlternar()" aria-expanded="false" aria-controls="cm-sobre-painel" aria-label="O que você pode fazer aqui" title="O que você pode fazer aqui">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.5 6 .9-4.35 4.25 1.03 6-5.38-2.83-5.38 2.83 1.03-6L3.3 9.6l6-.9z"/></svg></button>
    <div class="cm-sobre-painel" id="cm-sobre-painel" role="dialog" aria-labelledby="cm-sobre-titulo" hidden>
      <div class="cm-sobre-cab"><div><div class="cm-sobre-tit" id="cm-sobre-titulo">Concursos e notícias</div><div class="cm-sobre-sub">O que você pode fazer aqui</div></div>
        <button type="button" class="cm-sobre-x" onclick="cmSobreAlternar(false)" aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>
      <ol class="cm-sobre-lista">
        <li><i>1</i><div><b>Escolher o seu concurso</b><span>Clique em um estado no mapa e escolha o concurso que você quer fazer.</span></div></li>
        <li><i>2</i><div><b>Acompanhar os concursos</b><span>Veja os que estão acontecendo, os previstos e os que já passaram.</span></div></li>
      </ol>
      <div class="cm-sobre-rodape"><button type="button" class="cm-sobre-ok" onclick="cmSobreAlternar(false)">Entendi</button></div>
    </div></div>`;
}
function cmSobreAlternar(abrir){
  const p=document.getElementById('cm-sobre-painel'), b=document.querySelector('.cm-sobre-botao'); if(!p||!b) return;
  if(abrir===undefined) abrir=p.hidden;
  p.hidden=!abrir; b.setAttribute('aria-expanded', abrir); b.classList.toggle('ativo', abrir);
  if(!abrir && document.activeElement && p.contains(document.activeElement)) b.focus({preventScroll:true});
}
document.addEventListener('keydown', e=>{ const p=document.getElementById('cm-sobre-painel'); if(e.key==='Escape' && p && !p.hidden){ e.stopImmediatePropagation(); cmSobreAlternar(false); } }, true);
