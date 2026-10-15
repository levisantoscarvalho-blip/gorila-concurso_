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
function renderConcursosMapa(){
  const ns = document.getElementById('news-screen'); if(!ns) return;
  cmZoom = { z:1, x:0, y:0 }; cmSel = null;
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
    </div>${cmFaixaHTML()}`;   // bandeiras EMBAIXO do mapa (pedido do Levi)
  cmDesenharMapaLeve(); cmAplicarZoom();   // controle já começa em 100% (− e mira apagados)
  cmTourPrimeira = false;
  if(!cmTourVisto()) setTimeout(()=>{ cmTourPrimeira = true; cmTour(0); }, 500);   // 1ª visita: tour guiado (do "?") e, ao terminar, o quadro da estrela
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
  ev.preventDefault();   // não rola a página: amplia o mapa
  const r=document.getElementById('cm-palco').getBoundingClientRect();
  cmZoomEm(cmZoom.z * (ev.deltaY<0 ? 1.18 : 1/1.18), ev.clientX - r.left, ev.clientY - r.top);
}
function cmZoomPasso(dir){ const r=document.getElementById('cm-palco').getBoundingClientRect(); cmZoomEm(cmZoom.z*(dir>0?1.4:1/1.4), r.width/2, r.height/2); }
function cmZoomReset(){ cmZoom={z:1,x:0,y:0}; cmAplicarZoom(); }
function cmArrastaInicio(ev){
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
// 2º clique no mesmo estado: AINDA VAMOS DESENVOLVER (decisão do Levi) — por enquanto não abre nada (cmAbrirEstado).
// SEM caixa em volta (pedido do Levi): só o estado grande flutuando, o nome e o aviso. Fecha clicando fora de um estado ou com Esc.
// ════════════════════════════════════════════
let cmSel = null, cmArrastou = false, cmPosT = null;
function cmClicarEstado(uf, ev){
  if(ev) ev.stopPropagation();
  if(cmArrastou) return;                 // soltou depois de arrastar o mapa: não é clique
  if(cmSel===uf){ cmAbrirEstado(uf); return; }
  cmMostrarDestaque(uf);
}
function cmAbrirEstado(uf){ /* 2º clique: concursos e mais do estado — ainda vamos desenvolver */ }
function cmCliquePalco(ev){
  if(cmArrastou || !cmSel) return;
  if(ev.target.closest('.cm-controles,.cm-destaque,.cm-sobre')) return;
  cmFecharDestaque();
}
function cmMostrarDestaque(uf){
  const palco=document.getElementById('cm-palco'); if(!palco) return;
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
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && cmSel && !document.querySelector('.modal-overlay.open')) cmFecharDestaque(); });
// mudou o tamanho da janela ou o tema: desenha de novo (só nessas horas)
let cmRedesenhoT=null;
window.addEventListener('resize',()=>{ if(!document.getElementById('cm-mapa3d')) return; clearTimeout(cmRedesenhoT); cmRedesenhoT=setTimeout(cmDesenharMapaLeve,250); });
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
function cmFaixaHTML(){
  const ufs = Object.keys(CM_UF_NOME).sort((a,b)=>CM_UF_NOME[a].localeCompare(CM_UF_NOME[b],'pt-BR'));
  const itens = ufs.map(u=>`<span class="cm-faixa-item"><img src="noticias/bandeiras/${u}.png" alt="" loading="lazy" decoding="async">${CM_UF_NOME[u]}</span>`).join('');
  return `<div class="cm-faixa" aria-label="Bandeiras dos estados brasileiros"><div class="cm-faixa-trilho">${itens}<span class="cm-faixa-copia" aria-hidden="true">${itens}</span></div></div>`;
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
