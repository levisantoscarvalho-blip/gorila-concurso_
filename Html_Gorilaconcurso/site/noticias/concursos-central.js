/* ════════════════════════════════════════════
   CENTRAL DE CONCURSOS DA REGIÃO (pedido do Levi, 15/10/2026) — o lado direito da região aberta:
     1. "Ver todos os concursos da região por categoria"  ➔ área (Fiscal, Policial...) › órgão (SEFAZ-MA...) › concurso › detalhe
     2. "Ver todos os concursos disponíveis"               ➔ inscrições abertas ou edital publicado (neutro)
     3. "Ver os que estão previstos"                       ➔ VERDE (escolha do Levi)
     4. "Ver os que já aconteceram no ano / mês"           ➔ VERMELHO; organizado por mês ou por ano, com resumo
     5. a área de baixo mostra a lista escolhida; rolando para baixo ela SOBE e ocupa a tela toda (rolando para cima, desce).
   DETALHE de cada concurso: introdução ESCRITA POR NÓS a partir dos fatos do edital (não copia o texto do PCI) +
   dados (cargos, vagas, salário, inscrições, taxa, prova, validade, banca) + links: página oficial do concurso na banca
   (onde fica o edital em PDF), site do órgão e notícia completa no PCI (o PDF do PCI tem verificação "não sou robô").
   Fatos de cada notícia: noticias/concursos-detalhes/UF.js (CONC_DETALHES), gerado por levantamento-concursos/
   baixar-pci-noticias.ps1 + gerar-detalhes.ps1. Usa as funções do mapa (concursos-mapa.js).
   ════════════════════════════════════════════ */
const CONC_DETALHES = {};
function cmCarregarDetalhes(uf){
  if(CONC_DETALHES[uf] || CONC_DETALHES[uf]===null) return Promise.resolve(CONC_DETALHES[uf]);
  return new Promise(ok=>{ const sc=document.createElement('script'); sc.src=`noticias/concursos-detalhes/${uf}.js`;
    sc.onload=()=>ok(CONC_DETALHES[uf]||null); sc.onerror=()=>{ CONC_DETALHES[uf]=null; ok(null); }; document.head.appendChild(sc); });
}
// banca pelo endereço do site (o PCI dá o link onde as inscrições são feitas)
const CMC_BANCAS = [[/cebraspe/,'Cebraspe'],[/fgv\.br/,'FGV'],[/vunesp/,'Vunesp'],[/concursosfcc|\bfcc\b/,'FCC'],[/cesgranrio/,'Cesgranrio'],[/ibfc/,'IBFC'],
  [/aocp/,'Instituto AOCP'],[/idecan/,'Idecan'],[/ibam-concursos|\bibam\b/,'IBAM'],[/selecon/,'Selecon'],[/consulplan/,'Consulplan'],[/quadrix/,'Quadrix'],
  [/fundatec/,'Fundatec'],[/legalle/,'Instituto Legalle'],[/objetivas/,'Objetiva Concursos'],[/institutoaccess|\baccess\b/,'Instituto Access'],[/avancasp/,'Avança SP'],
  [/indepac/,'Indepac'],[/fafipa/,'Fafipa'],[/furb/,'FURB'],[/ibade/,'Ibade'],[/igeduc/,'Igeduc'],[/rboconcursos/,'RBO'],[/lasalle/,'Fundação La Salle'],
  [/ufpr\.br|nc\.ufpr/,'UFPR'],[/cetrede/,'Cetrede'],[/institutomais/,'Instituto Mais'],[/omniconcursos/,'Omni'],[/shdias/,'SHDias'],[/metrocapital/,'Metrocapital'],
  [/ibgp/,'IBGP'],[/fundep/,'Fundep'],[/consulpam/,'Consulpam'],[/itame/,'Itame'],[/inqc/,'INQC'],[/fepese/,'Fepese'],[/nossorumo/,'Nosso Rumo'],
  [/gualimp/,'Gualimp'],[/fundacaocefetminas|cefetminas/,'Fundação Cefetminas'],[/institutoibdo|ibdo/,'IBDO'],[/ieses/,'Ieses'],[/conscamweb/,'Conscam'],
  [/institutoexcelencia/,'Instituto Excelência'],[/idib/,'Idib'],[/fsadu/,'FSADU'],[/funcern/,'Funcern'],[/fundacaosoleil|soleil/,'Soleil'],[/acaprev|acep/,'ACEP']];
function cmcHost(u){ try{ return new URL(u).hostname.replace(/^www\./,''); }catch(e){ return ''; } }
function cmcBanca(d){
  if(!d?.b) return '';
  const h=cmcHost(d.b), achou=CMC_BANCAS.find(([re])=>re.test(h));
  if(achou) return achou[1];
  // seleção feita pelo PRÓPRIO órgão (site do governo, universidade, instituto federal, tribunal...) — não é uma banca
  if((d.o && cmcHost(d.o)===h) || /\.(gov|edu|leg|jus|mp|def|ufpr)\.br$|\.br$/.test(h) && /gov\.br$|edu\.br$|leg\.br$|jus\.br$|mp\.br$|\bu(f|e)[a-z]{1,6}\.br$|\bif[a-z]{1,8}\.br$|uem\.br|uepg\.br|unesp\.br|usp\.br|unicamp\.br|udesc\.br/.test(h)) return '';
  return h;
}
const cmcSlug=c=>/pciconcursos\.com\.br\/noticias\//.test(c.fonte?.url||'') ? c.fonte.url.split('/noticias/')[1] : '';
const cmcDet=(uf,c)=>{ const s=cmcSlug(c); return s ? CONC_DETALHES[uf]?.[s] || null : null; };
const cmcBR=d=>cmDataOk(d) ? d.split('-').reverse().join('/') : '';
const cmcMeses=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
const cmcExt=d=>{ if(!cmDataOk(d)) return ''; const [a,m,dd]=d.split('-'); return `${+dd} de ${cmcMeses[+m-1]} de ${a}`; };
const cmcR$=v=>'R$ '+Number(v).toLocaleString('pt-BR',{minimumFractionDigits:2, maximumFractionDigits:2});
const cmcHoje=()=>new Date().toLocaleDateString('sv-SE');
const cmcDias=d=>Math.round((new Date(d+'T12:00')-new Date(cmcHoje()+'T12:00'))/864e5);
const cmcEsc=s=>String(s??'').replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));
// links de órgão e banca (vindos das notícias): só http/https — nunca javascript: ou outro esquema que rode código
const cmcUrl=u=>/^https?:\/\/[^\s"'<>`\\]+$/i.test(u||'') ? u : '';
const cmcVagas=c=>c.vagas?`${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}`:(/reserva/.test(c.quando||'')?'Cadastro de reserva':'Vagas a definir');
// CATEGORIA de cada concurso (revisada em 15/10/2026 conferindo os 11.747 do Brasil):
//  1º pelo ÓRGÃO (Câmara ➔ legislativo, Universidade ➔ educação, Polícia/Bombeiros/Guarda ➔ segurança...);
//  2º se o órgão é genérico (prefeitura, consórcio...), pelos CARGOS — e só se TODOS forem da mesma área;
//     cargos de áreas diferentes ("Professor, Fiscal de tributos, Motorista") ➔ "Prefeituras e outros cargos".
// (antes um único cargo da lista decidia, e "Juiz de Fora" no nome da UFJF jogava a universidade em Tribunais)
// ⚠ SIGLAS só em MAIÚSCULAS e cercadas por algo que não é letra (?<!\p{L}) — "Olímpia" virava "MP" (Ministério Público)
// porque a letra acentuada quebrava o \b.
const cmcSig=(re)=>new RegExp(`(?<![\\p{L}\\d])(?:${re})(?![\\p{L}])`,'u');
const CMC_ORG=[
  ['Policial e segurança', [/pol[íi]cia|bombeiro|penitenci|socioeducativ|guarda (civil|municipal)|marinha|ex[ée]rcito|aeron[áa]utica|seguran[çc]a p[úu]blica/i, cmcSig('SEAP|SEJUS|SSP|PM|CBM[A-Z]{0,2}|PMERJ|PMDF|PMMG|PMPE')]],
  ['Trânsito', [/detran|tr[âa]nsito|mobilidade urbana/i, cmcSig('STTU|DETRAN')]],
  ['Controle e legislativo', [/c[âa]mara|assembleia|tribunal de contas|controladoria/i, cmcSig('TCE|TCM|TCU|CGE|CGU|TCDF')]],
  ['Tribunais e jurídico', [/tribunal|minist[ée]rio p[úu]blico|defensoria|procuradoria/i, cmcSig('TJ-?[A-Z]{0,2}|TRT|TRE-?[A-Z]{0,2}|TRF|MP-?[A-Z]{0,2}|PGE|PGM|DPE')]],
  ['Fiscal e fazenda', [/sefaz|sefin|semef|secretaria (de estado )?d[ae] fazenda|receita|finan[çc]as|tribut/i, cmcSig('ISS')]],
  ['Saúde', [/hospital|sa[úu]de|hemo[a-z]*|famesp|funsau|fahece/i, cmcSig('SESA|SESAU|SES|SMS|FHEMIG')]],
  ['Educação', [/univers|instituto federal|educa[çc][ãa]o|escola|col[ée]gio|faculdade|cefet|unesp|unicamp|unila|unifal|unifei|unimontes|unilab|udesc|unemat|unifap/i, cmcSig('USP|UF[A-Z]{1,5}|UE[A-Z]{1,5}|IF[A-Z][A-Za-z]*|SEDUC|SEED|SED|SEMED|SME|SEMEC|ETEC|FATEC|UERR')]],
];
const cmcOrgArea=org=>CMC_ORG.find(([,res])=>res.some(re=>re.test(org)));
const CMC_OUTROS='Prefeituras e outros cargos';
function cmcArea(c){
  const org=cmcOrgArea(c.orgao); if(org) return org[0];
  const pedacos=String(c.cargo).replace(/\s*\([^)]*\)/g,'').split(/,|;|\s+e\s+|\s\/\s/).map(s=>s.trim()).filter(Boolean);
  if(!pedacos.length || pedacos.some(p=>/v[áa]rios cargos|diversos/i.test(p))) return CMC_OUTROS;
  const areas=new Set(pedacos.map(p=>(CM_AREAS.find(([,re])=>re.test(p))||[CMC_OUTROS])[0]));
  return areas.size===1 ? [...areas][0] : CMC_OUTROS;
}

// ── TODOS OS CONCURSOS DA REGIÃO (cidades da região + os do estado, que valem para todas as cidades)
function cmcItens(uf, regCod){
  const todas=MUNI_BR[uf]||[], munis=todas.filter(m=>m.me===regCod), cap=todas.find(m=>m.n===CM_CAPITAL[uf]);
  const itens=[]; munis.forEach(m=>cmConcursosCidade(m.c).forEach(c=>itens.push({c:cmConcursoHoje(c), m})));
  const s=cmSlugsCidades(uf);
  cmConcursosEstaduais(uf).filter(c=>!s.has(c.fonte.url)).forEach(c=>itens.push({c:{...cmConcursoHoje(c), estadual:true}, m:cap||munis[0]}));
  return itens;
}
const cmcGrupo=c=>c.status==='aberto'||c.status==='edital' ? 'disp' : c.status==='previsto'||c.status==='semprevisao' ? 'prev' : c.status==='andamento' ? 'hist' : 'sem';   // "sem previsão" conta como previsto (no mapa ele é azul)

// ── CRIA A CENTRAL (chamado por cmMesoAbrir)
function cmCentralAbrir(v, alvo, band, caixa, uf, r){
  document.getElementById('cm-central')?.remove(); document.getElementById('news-screen')?.classList.remove('cmc-cheio','cmc-subindo');
  const el=document.createElement('div'); el.id='cm-central'; el.className='cm-central';
  let A0=null;
  if(band && band.offsetWidth && alvo){ const V=v.getBoundingClientRect(), A=alvo.getBoundingClientRect();
    A0={left:A.left-V.left, top:A.top-V.top, width:A.width, height:A.height};
    el.style.cssText=`left:${A0.left}px;top:${A0.top}px;width:${A0.width}px;height:${A0.height}px`; v.appendChild(el); }
  else { el.classList.add('embaixo'); caixa.appendChild(el); }
  el._uf=uf; el._reg=r; el._pilha=[];
  el.onpointerdown=e=>e.stopPropagation(); el.ondblclick=e=>e.stopPropagation();
  el.innerHTML=`<div class="cmc-topo">
      <button type="button" class="cmc-b1" data-v="cat"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>
        <span>Ver todos os concursos da região por categoria<small>${cmcEsc(r.nome)} · Fiscal, Policial, Saúde, Educação, Tribunais e mais</small></span><b class="n" data-n="todos"></b></button>
      <div class="cmc-linha">
        <button type="button" class="cmc-b2" data-v="disp"><span>Ver todos os concursos disponíveis</span><b class="n" data-n="disp"></b></button>
        <button type="button" class="cmc-b3" data-v="prev"><span>Ver os que estão previstos</span><b class="n" data-n="prev"></b></button>
        <button type="button" class="cmc-b4" data-v="hist"><span>Ver os que já aconteceram no ano / mês</span><b class="n" data-n="hist"></b></button>
      </div>
    </div>
    <div class="cmc-area">
      <div class="cmc-barra" hidden><button type="button" class="cmc-voltar">‹ Voltar</button><span class="cmc-trilha"></span><button type="button" class="cmc-recolher" title="Recolher">Recolher ⌄</button></div>
      <div class="cmc-conteudo" id="cmc-conteudo"></div>
    </div>`;
  el.querySelectorAll('.cmc-topo [data-v]').forEach(b=>b.onclick=()=>cmcIr(el.querySelector(`[data-v="${b.dataset.v}"]`).dataset.v, {}, true));
  el.querySelector('.cmc-voltar').onclick=()=>cmcVoltar();
  el.querySelector('.cmc-recolher').onclick=()=>cmcCheio(false);
  // 5: SOBE AOS POUCOS (pedido do Levi): cada giro da rodinha PARA BAIXO sobe um pedaço da área, até ocupar a tela toda,
  // e o resto (mapa, nome, botões, busca) vai sumindo junto. Só depois de cheia a lista rola. No topo da lista, rolando
  // PARA CIMA, ela desce aos poucos e o resto reaparece.
  const cont=el.querySelector('#cmc-conteudo');
  if(!el.classList.contains('embaixo')) el._base={left:A0.left, top:A0.top, width:A0.width, height:A0.height};
  el._p=0; el._alvo=0;
  el.addEventListener('wheel', ev=>{ ev.stopPropagation(); if(!el._base) return;
    const d=ev.deltaY*(ev.deltaMode===1 ? 16 : ev.deltaMode===2 ? 400 : 1);
    if(d>0 && el._alvo<1){ ev.preventDefault(); cmcSubirPara(el, el._alvo+d/CMC_CURSO); }
    else if(d<0 && el._alvo>0 && cont.scrollTop<=0){ ev.preventDefault(); cmcSubirPara(el, el._alvo+d/CMC_CURSO); } }, {passive:false});
  // rolou SEM a rodinha (arrastando a barrinha, setas do teclado): sobe inteira
  cont.addEventListener('scroll', ()=>{ if(cont.scrollTop>0 && el._base && el._alvo<1) cmcSubirPara(el, 1); });
  // números nos botões e a tela inicial (antes e depois dos detalhes chegarem)
  // ⚠ espera as CIDADES do estado (MUNI_BR) chegarem — sem elas a central só via os concursos do estado (bug achado no teste)
  const pronto=()=>{ if(!el.isConnected) return; el._itens=cmcItens(uf, r.cod); cmcContar(el); if(!el._pilha.length) cmcIr('inicio', {}, true); else cmcDesenhar(el); };
  pronto();
  Promise.all([cmCarregarMuni(uf), cmCarregarCidades(uf), cmCarregarDetalhes(uf)]).then(pronto);
}
function cmcContar(el){
  const n={todos:el._itens.length, disp:0, prev:0, hist:0}; el._itens.forEach(x=>{ const g=cmcGrupo(x.c); if(n[g]!==undefined) n[g]++; });
  el.querySelectorAll('.cmc-topo .n').forEach(b=>b.textContent=cmNum(n[b.dataset.n]||0));
}
const CMC_CURSO=500;   // quanto a rodinha precisa girar (em px) para a área subir inteira (~5 "cliques" de mouse)
function cmcCheio(sim){
  const el=document.getElementById('cm-central'); if(!el?._base) return;
  if(!sim) el.querySelector('#cmc-conteudo').scrollTop=0;
  cmcSubirPara(el, sim?1:0);
}
// a área anda SUAVE até o ponto pedido pela rodinha (cada "clique" do mouse vira um deslize, não um pulo)
function cmcSubirPara(el, alvo){ el._alvo=Math.max(0, Math.min(1, alvo)); if(!el._raf) el._raf=requestAnimationFrame(()=>cmcPasso(el)); }
function cmcPasso(el){
  el._raf=0; if(!el.isConnected) return;
  const d=el._alvo-el._p; el._p=Math.abs(d)<0.002 ? el._alvo : el._p+d*0.22;
  cmcAplicar(el);
  if(el._p!==el._alvo) el._raf=requestAnimationFrame(()=>cmcPasso(el));
}
// p = 0 (no lugar, ao lado do mapa) ... 1 (tela cheia: de 16px da esquerda até a barra de ícones, embaixo da barra de cima)
function cmcAplicar(el){
  const p=el._p, b=el._base, v=el.parentElement, tela=document.getElementById('news-screen'), topo=el.querySelector('.cmc-topo');
  if(!b || !v) return;
  if(p>0 && !el._topoH) el._topoH=topo.offsetHeight;
  const V=v.getBoundingClientRect(), t={left:16-V.left, top:72-V.top, width:innerWidth-112, height:innerHeight-84};
  ['left','top','width','height'].forEach(k=>el.style[k]=(b[k]+(t[k]-b[k])*p)+'px');
  el.style.zIndex=p>0 ? '80' : '';
  // os 4 botões de cima encolhem e somem enquanto a área sobe
  topo.style.maxHeight=p>0 ? el._topoH*(1-p)+'px' : ''; topo.style.overflow=p>0 ? 'hidden' : '';
  topo.style.opacity=p>0 ? Math.max(0, 1-p*1.6) : ''; topo.style.marginBottom=p>0 ? (-12*p)+'px' : '';
  // o resto da tela (mapa, nome, legenda, busca) some aos poucos — CSS: #news-screen.cmc-subindo
  tela?.style.setProperty('--cmc-p', p); tela?.classList.toggle('cmc-subindo', p>0);
  const cheio=p>=1;
  if(cheio!==el.classList.contains('cheio')){
    el.classList.toggle('cheio', cheio); tela?.classList.toggle('cmc-cheio', cheio);
    el.querySelector('.cmc-recolher').hidden=!cheio; el.querySelector('.cmc-barra').hidden=!cheio && el._pilha.length<2; }
}
window.addEventListener('resize', ()=>{ const el=document.getElementById('cm-central'); if(el?._p>0) cmcAplicar(el); });
// Esc com a área cheia: só recolhe (não fecha a região)
document.addEventListener('keydown', e=>{ if(e.key==='Escape' && document.getElementById('cm-central')?.classList.contains('cheio')){ e.stopImmediatePropagation(); cmcCheio(false); } }, true);

// ── NAVEGAÇÃO (pilha de telas, botão Voltar e trilha "Categorias › Fiscal e fazenda › SEFAZ-MA")
function cmcIr(vista, arg, raiz){
  const el=document.getElementById('cm-central'); if(!el) return;
  if(raiz) el._pilha=[]; el._pilha.push({vista, arg});
  el.querySelectorAll('.cmc-topo [data-v]').forEach(b=>b.classList.toggle('sel', b.dataset.v===el._pilha[0].vista));
  cmcDesenhar(el);
}
function cmcVoltar(){ const el=document.getElementById('cm-central'); if(!el || el._pilha.length<2) return; el._pilha.pop(); cmcDesenhar(el); }
function cmcDesenhar(el){
  const {vista, arg}=el._pilha[el._pilha.length-1], cont=el.querySelector('#cmc-conteudo'), uf=el._uf;
  const barra=el.querySelector('.cmc-barra'); barra.hidden=el._pilha.length<2 && !el.classList.contains('cheio');
  el.querySelector('.cmc-voltar').hidden=el._pilha.length<2; el.querySelector('.cmc-recolher').hidden=!el.classList.contains('cheio');
  el.querySelector('.cmc-trilha').textContent=el._pilha.map(p=>p.arg?.titulo||CMC_TITULO[p.vista]||'').filter(Boolean).join(' › ');
  const V={inicio:cmcInicio, disp:cmcDisp, prev:cmcPrev, hist:cmcHist, cat:cmcCat, area:cmcAreaV, org:cmcOrg, det:cmcDetalhe, cid:cmcCidade, leg:cmcLeg}[vista];
  cont.innerHTML=V ? V(el, arg, uf) : ''; cont.scrollTop=0;
  cont.querySelectorAll('[data-abre]').forEach(d=>d.onclick=()=>{ const i=+d.dataset.abre, x=el._lista[i]; if(x) cmcIr('det', {x, titulo:vista==='org'?'Detalhes':x.c.orgao.replace(/\s+-\s+.*$/,'')}); });
  cont.querySelectorAll('[data-area]').forEach(d=>d.onclick=()=>cmcIr('area', {area:d.dataset.area, titulo:d.dataset.area}));
  cont.querySelectorAll('[data-org]').forEach(d=>d.onclick=()=>cmcIr('org', {area:arg.area, org:d.dataset.org, titulo:d.dataset.org}));
  cont.querySelectorAll('[data-ord]').forEach(d=>d.onclick=()=>{ arg.ord=d.dataset.ord; cmcDesenhar(el); });
  cont.querySelectorAll('[data-modo]').forEach(d=>d.onclick=()=>{ arg.modo=d.dataset.modo; cmcDesenhar(el); });
  cont.querySelectorAll('[data-ir]').forEach(d=>d.onclick=()=>cmcIr(d.dataset.ir, {}, true));
  cont.querySelectorAll('[data-mapa]').forEach(d=>d.onclick=()=>{ const x=el._lista[+d.dataset.mapa]; if(x && typeof cmIrParaCidade==='function') cmIrParaCidade(uf, x.m, x.c.fonte.url); });
}
const CMC_TITULO={inicio:'', disp:'Disponíveis', prev:'Previstos', hist:'Já aconteceram', cat:'Categorias', cid:''};

// linha de concurso (clique ➔ detalhe)
function cmcLinha(el, x, extra){
  el._lista.push(x); const i=el._lista.length-1, c=x.c, cor=cmCorPonto(c), d=cmcDet(el._uf, c);
  const sal=d?.smax ? ` · até ${cmcR$(d.smax)}` : '';
  return `<button type="button" class="cmc-item" data-abre="${i}"><i class="sit-${cor}"></i><span class="cmc-item-txt"><b>${cmcEsc(c.orgao)}</b>
      <small>${cmcEsc(c.cargo)}</small><small class="meta">${x.c.estadual?'Todo o estado':cmcEsc(x.m?.n||'')} · ${cmcVagas(c)}${sal}${extra?` · ${extra}`:''}</small></span>
    <em class="st-${cor}">${cmcEsc(CM_SIT_NOME[c.status]||'')}</em></button>`;
}
function cmcPrazo(c){
  if(c.status==='edital' && c.de) return `inscrições abrem em ${cmcBR(c.de)}`;
  if(c.status==='aberto' && c.ate){ const n=cmcDias(c.ate); return n<=0 ? 'último dia de inscrição: hoje' : n===1 ? 'inscrições até amanhã' : `faltam ${n} dias (até ${cmcBR(c.ate)})`; }
  return '';
}
// ── TELA INICIAL (5 nunca fica vazia): resumo da região + os 5 abertos com mais vagas
function cmcInicio(el){
  el._lista=[]; const it=el._itens, n=g=>it.filter(x=>cmcGrupo(x.c)===g).length;
  const top=it.filter(x=>cmcGrupo(x.c)==='disp').sort((a,b)=>(b.c.vagas||0)-(a.c.vagas||0)).slice(0,5);
  // concursos do ESTADO entram em toda região, mas no mapa ficam só na capital — explica a diferença (os números da
  // legenda do mapa e os daqui não batiam numa região sem a capital, ex.: Norte Amazonense; revisão de 15/10/2026)
  const ne=it.filter(x=>x.c.estadual).length, temCap=it.some(x=>!x.c.estadual && x.m?.n===CM_CAPITAL[el._uf]);
  return `<div class="cmc-resumo"><b>${cmcEsc(el._reg.nome)}</b><span>${cmNum(it.length)} concursos no levantamento: <i class="sit-aberto"></i>${n('disp')} disponíveis · <i class="sit-previsto"></i>${n('prev')} previstos · <i class="sit-andamento"></i>${n('hist')} já aconteceram</span>${ne?`<span class="cmc-resumo-nota">Inclui ${ne} ${ne===1?'concurso':'concursos'} do estado (polícias, secretarias, tribunais...), que valem para todas as cidades${temCap?'':` — no mapa eles aparecem na capital, ${cmcEsc(CM_CAPITAL[el._uf])}`}.</span>`:''}</div>
    ${top.length?`<div class="cmc-sub">Disponíveis com mais vagas</div>${top.map(x=>cmcLinha(el,x,cmcPrazo(x.c))).join('')}<button type="button" class="cmc-link" data-ir="disp">Ver todos os disponíveis ›</button>`
      : `<p class="cmc-vazio">Nenhum concurso com inscrições abertas nesta região agora. Veja os <a data-ir="prev">previstos</a> ou os que <a data-ir="hist">já aconteceram</a>.</p>`}
    <p class="cmc-dica">Role para baixo para ver em tela cheia · clique num ponto do mapa para ver o concurso</p>`;
}
// ── 2. DISPONÍVEIS (inscrições abertas + edital publicado), com ordem por prazo, vagas ou salário
function cmcDisp(el, arg){
  el._lista=[]; const ord=arg.ord||'prazo', uf=el._uf;
  const l=el._itens.filter(x=>cmcGrupo(x.c)==='disp').sort((a,b)=> ord==='vagas' ? (b.c.vagas||0)-(a.c.vagas||0)
      : ord==='salario' ? ((cmcDet(uf,b.c)?.smax||0)-(cmcDet(uf,a.c)?.smax||0)) : (a.c.status==='edital')-(b.c.status==='edital') || (a.c.ate||'').localeCompare(b.c.ate||''));
  const vagas=l.reduce((t,x)=>t+(x.c.vagas||0),0);
  return `<div class="cmc-cab cor-disp"><b>Concursos disponíveis em ${cmcEsc(el._reg.nome)}</b><span>${l.length} ${l.length===1?'concurso':'concursos'} · ${cmNum(vagas)} vagas · inclui os do estado, que valem para todas as cidades</span></div>
    ${cmcOrdem(ord,[['prazo','Prazo mais curto'],['vagas','Mais vagas'],['salario','Maior salário']])}
    ${l.length ? l.map(x=>cmcLinha(el,x,cmcPrazo(x.c))).join('') : `<p class="cmc-vazio">Nenhum concurso com inscrições abertas nesta região agora.</p>`}`;
}
const cmcOrdem=(atual,ops)=>`<div class="cmc-ordem">Ordenar: ${ops.map(([k,t])=>`<button type="button" data-ord="${k}" class="${k===atual?'sel':''}">${t}</button>`).join('')}</div>`;
// ── 3. PREVISTOS
function cmcPrev(el, arg){
  el._lista=[]; const l=el._itens.filter(x=>cmcGrupo(x.c)==='prev').sort((a,b)=>(b.c.vagas||0)-(a.c.vagas||0));
  return `<div class="cmc-cab cor-prev"><b>Concursos previstos em ${cmcEsc(el._reg.nome)}</b><span>${l.length} ${l.length===1?'previsto':'previstos'} · autorizados, com banca definida, comissão formada ou anunciados — ainda sem edital</span></div>
    ${l.length ? l.map(x=>cmcLinha(el,x,'')).join('') : `<p class="cmc-vazio">Nenhum concurso previsto nesta região no levantamento.</p>`}
    <p class="cmc-dica">Previstos vêm de notícias (Estratégia Concursos e outras). Até o edital sair, vagas e datas podem mudar.</p>`;
}
// ── 4. JÁ ACONTECERAM — por MÊS (padrão) ou por ANO, com resumo de vagas, salários, bancas e áreas
function cmcHist(el, arg){
  el._lista=[]; const modo=arg.modo||'mes', uf=el._uf;
  const l=el._itens.filter(x=>cmcGrupo(x.c)==='hist' && x.c.ate).sort((a,b)=>b.c.ate.localeCompare(a.c.ate));
  if(!l.length) return `<div class="cmc-cab cor-hist"><b>Concursos que já aconteceram</b></div><p class="cmc-vazio">Nenhum concurso encerrado nesta região nos últimos 12 meses.</p>`;
  const resumo=g=>{ const vagas=g.reduce((t,x)=>t+(x.c.vagas||0),0), sal=Math.max(0,...g.map(x=>cmcDet(uf,x.c)?.smax||0));
    const conta=f=>{ const m=new Map(); g.forEach(x=>{ const k=f(x); if(k) m.set(k,(m.get(k)||0)+1); }); return [...m].sort((a,b)=>b[1]-a[1]); };
    const bancas=conta(x=>cmcBanca(cmcDet(uf,x.c))).slice(0,3).map(([k,n])=>`${cmcEsc(k)} (${n})`).join(', ');
    const areas=conta(x=>cmcArea(x.c)).slice(0,3).map(([k,n])=>`${cmcEsc(k)} (${n})`).join(', ');
    return `<span>${g.length} ${g.length===1?'concurso':'concursos'} · ${cmNum(vagas)} vagas${sal?` · maior salário ${cmcR$(sal)}`:''}</span>${areas?`<span>Áreas: ${areas}</span>`:''}${bancas?`<span>Bancas: ${bancas}</span>`:''}`; };
  const grupos=new Map(); l.forEach(x=>{ const k=modo==='ano'?x.c.ate.slice(0,4):x.c.ate.slice(0,7); if(!grupos.has(k)) grupos.set(k,[]); grupos.get(k).push(x); });
  const nomeG=k=>modo==='ano'?k:`${cmcMeses[+k.slice(5)-1][0].toUpperCase()+cmcMeses[+k.slice(5)-1].slice(1)} de ${k.slice(0,4)}`;
  const extra=x=>{ const d=cmcDet(uf,x.c), h=cmcHoje(), pv=d?.pr ? (d.pr<h?`prova foi em ${cmcBR(d.pr)}`:`prova em ${cmcBR(d.pr)}`) : ''; return [`encerrou ${cmcBR(x.c.ate)}`, pv].filter(Boolean).join(' · '); };
  return `<div class="cmc-cab cor-hist"><b>Concursos que já aconteceram em ${cmcEsc(el._reg.nome)}</b><div class="cmc-cab-res">${resumo(l)}</div><span class="nota">Inscrições encerradas nos últimos 12 meses (PCI Concursos). Muitos ainda têm prova ou resultado pela frente.</span></div>
    <div class="cmc-ordem">Organizar por: <button type="button" data-modo="mes" class="${modo==='mes'?'sel':''}">Mês</button><button type="button" data-modo="ano" class="${modo==='ano'?'sel':''}">Ano</button></div>
    ${[...grupos].map(([k,g])=>`<div class="cmc-grupo"><div class="cmc-grupo-cab"><b>${nomeG(k)}</b>${resumo(g)}</div>${g.map(x=>cmcLinha(el,x,extra(x))).join('')}</div>`).join('')}`;
}
// ── 1. POR CATEGORIA: áreas ➔ órgãos ➔ concursos
function cmcConta(l){ const n={disp:0,prev:0,hist:0}; l.forEach(x=>{ const g=cmcGrupo(x.c); if(n[g]!==undefined) n[g]++; });
  return `<span class="cmc-contas">${n.disp?`<i class="sit-aberto"></i>${n.disp}`:''}${n.prev?`<i class="sit-previsto"></i>${n.prev}`:''}${n.hist?`<i class="sit-andamento"></i>${n.hist}`:''}</span>`; }
function cmcCat(el){
  el._lista=[]; const por=new Map(); el._itens.forEach(x=>{ const a=cmcArea(x.c); if(!por.has(a)) por.set(a,[]); por.get(a).push(x); });
  const ordem=CM_AREAS.map(([a])=>a).filter(a=>por.has(a));
  return `<div class="cmc-cab"><b>Concursos de ${cmcEsc(el._reg.nome)} por categoria</b><span>Escolha uma área para ver os órgãos e os concursos de cada um</span></div>
    <div class="cmc-cats">${ordem.map(a=>`<button type="button" class="cmc-cat" data-area="${cmcEsc(a)}"><b>${cmcEsc(a)}</b><small>${por.get(a).length} ${por.get(a).length===1?'concurso':'concursos'}</small>${cmcConta(por.get(a))}</button>`).join('')}</div>`;
}
const cmcSiglaDe=(x,uf)=>(typeof cmSiglas==='function' ? cmSiglas({...x.c, cidade:x.c.estadual?'':x.m?.n}, uf)[0] : x.c.orgao);
function cmcAreaV(el, arg){
  el._lista=[]; const uf=el._uf, l=el._itens.filter(x=>cmcArea(x.c)===arg.area), por=new Map();
  l.forEach(x=>{ const s=cmcSiglaDe(x,uf); if(!por.has(s)) por.set(s,[]); por.get(s).push(x); });
  const orgs=[...por].sort((a,b)=>b[1].filter(x=>cmcGrupo(x.c)==='disp').length-a[1].filter(x=>cmcGrupo(x.c)==='disp').length || b[1].length-a[1].length);
  return `<div class="cmc-cab"><b>${cmcEsc(arg.area)}</b><span>${l.length} concursos em ${orgs.length} ${orgs.length===1?'órgão':'órgãos'} · ${cmcEsc(el._reg.nome)}</span></div>
    <div class="cmc-orgs">${orgs.map(([s,g])=>`<button type="button" class="cmc-org" data-org="${cmcEsc(s)}"><b>${cmcEsc(s)}</b><small>${g.length} ${g.length===1?'concurso':'concursos'}</small>${cmcConta(g)}</button>`).join('')}</div>`;
}
function cmcOrg(el, arg){
  el._lista=[]; const uf=el._uf, ord={disp:0,prev:1,hist:2,sem:3};
  const l=el._itens.filter(x=>cmcArea(x.c)===arg.area && cmcSiglaDe(x,uf)===arg.org).sort((a,b)=>ord[cmcGrupo(a.c)]-ord[cmcGrupo(b.c)] || (b.c.ate||'').localeCompare(a.c.ate||''));
  return `<div class="cmc-cab"><b>${cmcEsc(arg.org)}</b><span>${cmcEsc(arg.area)} · ${l.length} ${l.length===1?'concurso':'concursos'} — clique para ver a introdução, o edital e os detalhes</span></div>
    ${l.map(x=>cmcLinha(el,x,cmcPrazo(x.c)||(x.c.ate&&x.c.status==='andamento'?`encerrou ${cmcBR(x.c.ate)}`:''))).join('')}`;
}
// ── LISTA DE UMA CIDADE (clique na cidade/círculo do mapa)
// clicou numa cor da LEGENDA do mapa: os concursos daquela cor que estão no mapa da região (mais vagas primeiro)
function cmcLeg(el, arg){
  el._lista=[]; const nome=(CM_CICLO.find(x=>x[0]===arg.s)||[])[1]||'', l=[...arg.lista].sort((a,b)=>(b.c.vagas||0)-(a.c.vagas||0));
  return `<div class="cmc-cab"><b>${cmcEsc(nome)} em ${cmcEsc(el._reg.nome)}</b><span>${l.length} ${l.length===1?'concurso':'concursos'} · os pontos desta cor no mapa · clique para ver os detalhes</span></div>${
    l.length ? l.map(x=>cmcLinha(el,x,cmcPrazo(x.c)||'')).join('') : `<p class="cmc-vazio">Nenhum concurso desta cor no mapa desta região.</p>`}`;
}
function cmcCidade(el, arg){
  el._lista=[]; const ord={disp:0,prev:1,hist:2,sem:3}, l=arg.cs.map(c=>({c:cmConcursoHoje(c), m:arg.m})).sort((a,b)=>ord[cmcGrupo(a.c)]-ord[cmcGrupo(b.c)]);
  return `<div class="cmc-cab"><b>${cmcEsc(arg.m.n)}</b><span>${l.length} ${l.length===1?'concurso':'concursos'} · clique para ver os detalhes</span></div>${l.map(x=>cmcLinha(el,x,cmcPrazo(x.c))).join('')}`;
}
// ── DETALHE: introdução escrita a partir dos fatos + dados + links oficiais
function cmcIntro(c, d, m){
  const tipo=d?.t==='seletivo' ? 'processo seletivo' : (/seletiv|sele[çc][ãa]o/i.test(c.cargo+' '+(d?.ti||'')) ? 'processo seletivo' : 'concurso público');
  const cargos=(d?.cg||[]).map(s=>s.replace(/\s*\((?:[\d\.]+|cadastro)[^)]*\)\s*$/i,'').trim()).filter(Boolean);
  const cg=cargos.length ? (cargos.length<=3 ? cargos.join(', ').replace(/, ([^,]*)$/,' e $1') : `${cargos.slice(0,3).join(', ')} e mais ${cargos.length-3} ${cargos.length-3===1?'cargo':'cargos'}`) : c.cargo.replace(/\s*\(.*\)$/,'');
  const vg=c.vagas ? `${cmNum(c.vagas)} ${c.vagas===1?'vaga':'vagas'}` : 'formação de cadastro de reserva';
  const banca=cmcBanca(d), frases=[];
  if(c.status==='previsto' || c.status==='semprevisao') return null;
  if(c.status==='aberto') frases.push(`${c.orgao} está com inscrições abertas em um ${tipo} com ${vg}${cg?` para ${cg}`:''}.`);
  else if(c.status==='edital') frases.push(`${c.orgao} publicou o edital de um ${tipo} com ${vg}${cg?` para ${cg}`:''}. As inscrições ainda vão abrir.`);
  else frases.push(`${c.orgao} abriu${d?.p?` em ${cmcExt(d.p).replace(/^\d+ de /,'')}`:''} um ${tipo} com ${vg}${cg?` para ${cg}`:''}. As inscrições já terminaram.`);
  if(d?.smax) frases.push(d.smin && d.smin<d.smax ? `Os salários vão de ${cmcR$(d.smin)} a ${cmcR$(d.smax)}.` : `A remuneração é de ${cmcR$(d.smax)}.`);
  const onde=banca ? ` pelo site da ${banca}` : d?.b ? ' pelo site oficial da seleção' : '';
  if(c.status==='aberto' || c.status==='edital') frases.push(`As inscrições ${c.de?`vão de ${cmcExt(c.de)} a ${cmcExt(c.ate)}`:`vão até ${cmcExt(c.ate)}`}${onde}${d?.tmin?`, com taxa de ${d.tmin===d.tmax?cmcR$(d.tmin):`${cmcR$(d.tmin)} a ${cmcR$(d.tmax)}`}`:''}.`);
  else if(c.ate) frases.push(`As inscrições terminaram em ${cmcExt(c.ate)}${banca?` (banca: ${banca})`:d?.b?' (seleção feita pelo próprio órgão)':''}.`);
  if(d?.pr) frases.push(d.pr<cmcHoje() ? `A prova objetiva estava marcada para ${cmcExt(d.pr)}.` : `A prova objetiva está prevista para ${cmcExt(d.pr)}.`);
  if(d?.v) frases.push(`O resultado vale por ${d.v===1?'1 ano':`${d.v} anos`}, podendo ser prorrogado.`);
  return frases.join(' ');
}
function cmcDetalhe(el, arg, uf){
  const x=arg.x, c=cmConcursoHoje(x.c), d=cmcDet(uf,c), cor=cmCorPonto(c), banca=cmcBanca(d), intro=cmcIntro(c,d,x.m);
  el._lista=[x];
  const linha=(k,v)=>v?`<div><dt>${k}</dt><dd>${v}</dd></div>`:'';
  const cargos=(d?.cg||[]);
  const falta=c.status==='aberto'&&c.ate ? cmcDias(c.ate) : null;
  const insc = c.status==='aberto'||c.status==='edital' ? (c.de?`De ${cmcBR(c.de)} a ${cmcBR(c.ate)}`:`Até ${cmcBR(c.ate)}`)
      +(falta===null ? (c.status==='edital'?' — ainda vão abrir':'') : falta<=0 ? ' — último dia hoje' : falta===1 ? ' — termina amanhã' : ` — faltam ${falta} dias`)
    : c.status==='andamento' && c.ate ? `Encerradas em ${cmcBR(c.ate)}` : cmcEsc(c.quando||'');
  const ehPci=/pciconcursos/.test(c.fonte.url);
  return `<div class="cmc-det">
    <div class="cmc-det-topo"><span class="cmc-st st-${cor}"><i class="sit-${cor}"></i>${cmcEsc(CM_SIT_NOME[c.status]||'')}</span>${d?.t?`<span class="cmc-tipo">${d.t==='seletivo'?'Processo seletivo':'Concurso público'}</span>`:''}</div>
    <h3>${cmcEsc(c.orgao)}</h3>
    <div class="cmc-det-local">${c.estadual?`Órgão estadual ou federal — vale para todo o estado (${cmcEsc(CM_UF_NOME[uf])})`:`${cmcEsc(x.m?.n||'')} — ${cmcEsc(uf)}`}</div>
    ${intro?`<div class="cmc-intro"><b>Introdução</b><p>${cmcEsc(intro)}</p></div>`
      : `<div class="cmc-intro"><b>Situação</b><p>${cmcEsc(c.quando||'')}. ${c.status==='previsto'?'Ainda não há edital: vagas, cargos e datas podem mudar até a publicação.':''}</p></div>`}
    <dl class="cmc-dados">
      ${linha('Vagas', cmcEsc(cmcVagas(c)))}
      ${linha('Escolaridade', cmcEsc((c.cargo.match(/\(([^)]*(?:Fundamental|Médio|Técnico|Superior)[^)]*)\)/)||[])[1]||''))}
      ${linha('Remuneração', d?.smax ? (d.smin && d.smin<d.smax ? `${cmcR$(d.smin)} a ${cmcR$(d.smax)}` : cmcR$(d.smax)) : '')}
      ${linha('Inscrições', insc)}
      ${linha('Taxa', d?.tmin ? (d.tmin===d.tmax?cmcR$(d.tmin):`${cmcR$(d.tmin)} a ${cmcR$(d.tmax)}`) : '')}
      ${linha('Prova objetiva', d?.pr ? cmcBR(d.pr) : '')}
      ${linha('Banca', cmcEsc(banca || c.banca || (d?.b ? 'O próprio órgão' : '')))}
      ${linha('Validade', d?.v ? `${d.v===1?'1 ano':`${d.v} anos`}, prorrogável` : '')}
      ${linha('Publicado em', d?.p ? cmcBR(d.p) : '')}
    </dl>
    ${cargos.length?`<div class="cmc-cargos"><b>Cargos e vagas</b><ul>${cargos.map(s=>`<li>${cmcEsc(s)}</li>`).join('')}</ul>${cargos.length>=25?'<small>A lista pode ter mais cargos — veja o edital.</small>':''}</div>`:''}
    <div class="cmc-links">
      ${cmcUrl(d?.b)?`<a class="cmc-btn principal" href="${cmcEsc(d.b)}" target="_blank" rel="noopener">Página oficial do concurso e edital em PDF ›<small>${cmcEsc(banca||cmcHost(d.b))}</small></a>`:''}
      ${cmcUrl(d?.o) && d.o!==d.b?`<a class="cmc-btn" href="${cmcEsc(d.o)}" target="_blank" rel="noopener">Site oficial do órgão ›<small>${cmcEsc(cmcHost(d.o))}</small></a>`:''}
      <a class="cmc-btn" href="${cmcEsc(c.fonte.url)}" target="_blank" rel="noopener">${ehPci?'Notícia completa e editais no PCI Concursos':`Notícia na fonte (${cmcEsc(c.fonte.nome)})`} ›${d?.e?.length?`<small>${d.e.length} ${d.e.length===1?'arquivo':'arquivos'}: ${cmcEsc(d.e.slice(0,2).join(' · '))}${d.e.length>2?' …':''}</small>`:''}</a>
      ${x.m && !c.estadual?`<button type="button" class="cmc-btn" data-mapa="0">Mostrar no mapa ›</button>`:''}
    </div>
    <p class="cmc-rod">Fonte: ${cmcEsc(c.fonte.nome)}${d?.p?` · notícia de ${cmcBR(d.p)}`:''}. Os dados são resumidos automaticamente da notícia; o que vale é sempre o edital oficial.</p>
  </div>`;
}
// clique num ponto/cidade do MAPA ➔ abre na central (substitui o cartão flutuante antigo)
const _cmCartaoAntigo = typeof cmCartao==='function' ? cmCartao : null;
cmCartao = function(uf, m, cs, k){
  const el=document.getElementById('cm-central'); if(!el) return _cmCartaoAntigo?.(uf, m, cs, k);
  if(k===null || k===undefined) return cmcIr('cid', {m, cs, titulo:m.n}, true);
  const c=cmConcursoHoje(cs[k]);
  el._pilha=[{vista:'cid', arg:{m, cs, titulo:m.n}}]; cmcIr('det', {x:{c:{...c, estadual:cs[k].estadual}, m}, titulo:c.orgao.replace(/\s+-\s+.*$/,'')});
};
const _cmCartaoFecharAntigo = typeof cmCartaoFechar==='function' ? cmCartaoFechar : null;
cmCartaoFechar = function(){ _cmCartaoFecharAntigo?.(); };
