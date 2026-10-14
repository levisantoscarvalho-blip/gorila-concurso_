/* ════════════════════════════════════════════
   BARRA SUPERIOR — busca
   Procura nos seus cursos, matérias, dias de estudo e mapa mental,
   e oferece pesquisar o concurso em sites de notícias.
   ════════════════════════════════════════════ */

// ── Busca global ──
let bgResultados = [], bgSel = -1;
const BG_AREAS = {ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário',eletiva:'Eletiva'};
const bgTem = (txt, nq) => bgNorm(txt||'').includes(nq);

function bgBuscar(q){
  const box = document.getElementById('busca-resultados');
  const nq = bgNorm(q.trim());
  bgResultados = []; bgSel = -1;
  if(nq.length < 2){ box.classList.remove('aberto'); box.innerHTML=''; return; }
  const grupos = [];
  if(window.__logado){
    // o que a pessoa está estudando (cursos / concursos)
    const cursos = (state.cursos||[]).filter(c=>bgTem(c.nome,nq))
      .map(c=>({icone:ICO.check, titulo:c.nome, sub:'O que você estuda', acao:()=>bgIrConteudos()}));
    if(cursos.length) grupos.push(['Seus cursos', cursos.slice(0,6)]);
    // matérias
    const mats = (state.conteudosCustom||[]).filter(c=>bgTem(c.nome,nq))
      .map(c=>({icone:ICO.check, titulo:c.nome, sub:(typeof nomeCurso==='function'?nomeCurso(c.trilha):'Matéria'), acao:()=>bgIrConteudos()}));
    if(mats.length) grupos.push(['Matérias', mats.slice(0,6)]);
    // dias de estudo (curso, matéria, anotações)
    const dias = [];
    Object.keys(state.days||{}).sort().reverse().forEach(k=>{
      const v = state.days[k]; if(!v || dias.length>=6) return;
      const [y,m,d] = k.split('-'), data = `${d}/${m}/${y}`;
      const est = (v.estudos||[]).find(e=>bgTem(cursoNomeEst(e),nq) || bgTem(materiaNome(e),nq));
      if(est){ dias.push({icone:ICO.calendario, titulo:`${data} · ${cursoNomeEst(est)}`, sub:[materiaNome(est), (Number(est.horas)||0)+'h'].filter(Boolean).join(' · '), acao:()=>bgAbrirDia(k)}); return; }
      for(const a of Object.keys(BG_AREAS)){
        if(v[a] && typeof v[a]==='object' && bgTem(v[a].assunto,nq)){ dias.push({icone:ICO.calendario, titulo:`${data} · ${BG_AREAS[a]}`, sub:`${v[a].assunto} · ${v[a].horas||0}h`, acao:()=>bgAbrirDia(k)}); return; }
      }
      if(bgTem(v.saude,nq)) dias.push({icone:ICO.calendario, titulo:`${data} · Anotação`, sub:v.saude, acao:()=>bgAbrirDia(k)});
      else if(bgTem(v.eletivaDesc,nq)) dias.push({icone:ICO.calendario, titulo:`${data} · Eletiva`, sub:v.eletivaDesc, acao:()=>bgAbrirDia(k)});
    });
    if(dias.length) grupos.push(['Dias de estudo', dias]);
    // mapa mental
    const mapa = [];
    ((state.mindMap&&state.mindMap.topicos)||[]).forEach(t=>{
      if(bgTem(t.nome,nq)) mapa.push({icone:ICO.mapa, titulo:t.nome, sub:'Tópico', acao:()=>bgAbrirMapa(t.id,null)});
      (t.subtopicos||[]).forEach(sb=>{ if(bgTem(sb.nome,nq) || bgTem(sb.texto,nq)) mapa.push({icone:ICO.mapa, titulo:`${t.nome} › ${sb.nome}`, sub:'Mapa mental', acao:()=>bgAbrirMapa(t.id,sb.id)}); });
    });
    if(mapa.length) grupos.push(['Mapa mental', mapa.slice(0,6)]);
  }
  // concurso reconhecido (ex.: "tj sp" → Tribunal de Justiça SP) para pesquisar com o nome certo
  const rec = typeof cursoReconhecido==='function' ? cursoReconhecido(q) : null;
  const termo = rec ? rec.nome : q.trim();
  grupos.push(['Pesquisar na internet', [
    {icone:ICO.lupa, titulo:`Notícias sobre ${termo}`, sub:'Google Notícias', url:linkNoticias(termo)},
    {icone:ICO.lupa, titulo:`Editais de ${termo}`, sub:'PCI Concursos', url:linkPci(termo)}
  ]]);
  let h = '';
  grupos.forEach(([nome, itens])=>{
    h += `<div class="bg-grupo">${nome}</div>`;
    itens.forEach(it=>{
      const i = bgResultados.push(it)-1;
      const corpo = `<span class="bg-ico">${it.icone}</span><span class="bg-tit">${escapeHtmlCarreira(it.titulo)}</span><small>${escapeHtmlCarreira(it.sub||'')}</small>`;
      h += it.url
        ? `<a class="bg-item" data-i="${i}" href="${it.url}" target="_blank" rel="noopener">${corpo}</a>`
        : `<div class="bg-item" data-i="${i}" onclick="bgAbrir(${i})">${corpo}</div>`;
    });
  });
  box.innerHTML = h; box.classList.add('aberto');
}
function bgFechar(){ const b=document.getElementById('busca-resultados'); if(b) b.classList.remove('aberto'); }
function bgAbrir(i){
  const it = bgResultados[i]; if(!it) return;
  bgFechar();
  const inp=document.getElementById('busca-global'); if(inp){ inp.value=''; inp.blur(); }
  if(it.url){ window.open(it.url,'_blank'); return; }
  if(it.acao) it.acao();
}
function bgMarcar(){
  document.querySelectorAll('#busca-resultados .bg-item').forEach(el=>el.classList.toggle('sel', Number(el.dataset.i)===bgSel));
  const s = document.querySelector('#busca-resultados .bg-item.sel'); if(s) s.scrollIntoView({block:'nearest'});
}
function bgTecla(e){
  if(e.key==='ArrowDown'){ e.preventDefault(); bgSel = Math.min(bgSel+1, bgResultados.length-1); bgMarcar(); }
  else if(e.key==='ArrowUp'){ e.preventDefault(); bgSel = Math.max(bgSel-1, 0); bgMarcar(); }
  else if(e.key==='Enter'){ e.preventDefault(); if(bgResultados.length) bgAbrir(bgSel>=0?bgSel:0); }
  else if(e.key==='Escape'){ bgFechar(); e.target.blur(); }
}
function bgGarantirApp(){ if(document.getElementById('app-shell').style.display!=='block') openSection('guia'); trMarcarAtivo('tr-calendario'); }
function bgIrConteudos(){ bgGarantirApp(); navClick('conteudos',''); }
function bgAbrirDia(k){
  bgGarantirApp(); navClick('calendario','');
  const [y,m] = k.split('-').map(Number); state.year=y; state.month=m-1; renderCalActive();
  openDayModal(k);
}
function bgAbrirMapa(topicoId, subId){
  mmGarantirEstado();
  const t = state.mindMap.topicos.find(t=>t.id===topicoId); if(!t) return;
  t.aberto = true;
  if(subId){ const sb=(t.subtopicos||[]).find(x=>x.id===subId); if(sb) sb.aberto = true; }
  abrirMindMap();
}
document.addEventListener('click', e=>{ if(!e.target.closest('.tb-search')) bgFechar(); });
