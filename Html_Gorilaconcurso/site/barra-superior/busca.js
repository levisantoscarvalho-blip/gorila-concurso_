/* ════════════════════════════════════════════
   BARRA SUPERIOR — busca
   Busca por dias, conteúdos, mapa mental e concursos.
   ════════════════════════════════════════════ */

// ── Busca global ──
let bgResultados = [], bgSel = -1;
const BG_AREAS = {ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário',eletiva:'Eletiva'};

function bgBuscar(q){
  const box = document.getElementById('busca-resultados');
  const nq = bgNorm(q.trim());
  bgResultados = []; bgSel = -1;
  if(nq.length < 2){ box.classList.remove('aberto'); box.innerHTML=''; return; }
  const grupos = [];
  if(window.__logado){
    // dias de estudo (por assunto / saúde)
    const dias = [];
    Object.keys(state.days||{}).sort().reverse().forEach(k=>{
      const v = state.days[k]; if(!v || dias.length>=6) return;
      const [y,m,d] = k.split('-');
      for(const a of Object.keys(BG_AREAS)){
        if(v[a] && typeof v[a]==='object' && bgNorm(v[a].assunto).includes(nq)){
          dias.push({icone:'📅', titulo:`${d}/${m}/${y} · ${BG_AREAS[a]}`, sub:`${v[a].assunto} · ${v[a].horas||0}h`, acao:()=>openDayModal(k)}); return;
        }
      }
      if(v.saude && bgNorm(v.saude).includes(nq)) dias.push({icone:'📅', titulo:`${d}/${m}/${y} · Saúde`, sub:v.saude, acao:()=>openDayModal(k)});
    });
    if(dias.length) grupos.push(['Dias de estudo', dias]);
    // conteúdos
    const cont = [];
    Object.keys(CONTEUDO_FIXO).forEach(t=>(CONTEUDO_FIXO[t]||[]).forEach(n=>{ if(bgNorm(n).includes(nq)) cont.push({icone:'✅', titulo:n, sub:CONTEUDO_TRILHAS[t]||t, acao:()=>bgIrConteudos()}); }));
    (state.conteudosCustom||[]).forEach(c=>{ if(bgNorm(c.nome).includes(nq)) cont.push({icone:'✅', titulo:c.nome, sub:nomeCurso(c.trilha), acao:()=>bgIrConteudos()}); });
    (state.trilhasCustom||[]).forEach(c=>(c.disciplinas||[]).forEach(d=>{ if(bgNorm(d.nome).includes(nq)) cont.push({icone:'✅', titulo:d.nome, sub:c.nome, acao:()=>openSection(c.id)}); }));
    if(cont.length) grupos.push(['Conteúdos', cont.slice(0,6)]);
    // mapa mental
    const mapa = [];
    ((state.mindMap&&state.mindMap.topicos)||[]).forEach(t=>{
      if(bgNorm(t.nome).includes(nq)) mapa.push({icone:'🧠', titulo:t.nome, sub:'Tópico', acao:()=>bgAbrirMapa(t.id,null)});
      (t.subtopicos||[]).forEach(sb=>{ if(bgNorm(sb.nome).includes(nq) || bgNorm(sb.texto).includes(nq)) mapa.push({icone:'🧠', titulo:`${t.nome} › ${sb.nome}`, sub:'Mapa mental', acao:()=>bgAbrirMapa(t.id,sb.id)}); });
    });
    if(mapa.length) grupos.push(['Mapa mental', mapa.slice(0,6)]);
  }
  grupos.push(['Concursos', [
    {icone:'📰', titulo:`Notícias de “${q.trim()}”`, sub:'Google Notícias', url:linkNoticias(q.trim())},
    {icone:'🔎', titulo:`“${q.trim()}” no PCI Concursos`, sub:'abre em outra aba', url:linkPci(q.trim())}
  ]]);
  let h = '';
  grupos.forEach(([nome, itens])=>{
    h += `<div class="bg-grupo">${nome}</div>`;
    itens.forEach(it=>{
      const i = bgResultados.push(it)-1;
      h += it.url
        ? `<a class="bg-item" data-i="${i}" href="${it.url}" target="_blank" rel="noopener"><span>${it.icone}</span><span>${escapeHtmlCarreira(it.titulo)}</span><small>${escapeHtmlCarreira(it.sub||'')}</small></a>`
        : `<div class="bg-item" data-i="${i}" onclick="bgAbrir(${i})"><span>${it.icone}</span><span>${escapeHtmlCarreira(it.titulo)}</span><small>${escapeHtmlCarreira(it.sub||'')}</small></div>`;
    });
  });
  box.innerHTML = h; box.classList.add('aberto');
}
function bgFechar(){ const b=document.getElementById('busca-resultados'); if(b) b.classList.remove('aberto'); }
function bgAbrir(i){
  const it = bgResultados[i]; if(!it) return;
  bgFechar();
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
function bgIrConteudos(){
  if(document.getElementById('app-shell').style.display!=='block') openSection('guia');
  navClick('conteudos','');
}
function bgAbrirMapa(topicoId, subId){
  mmGarantirEstado();
  const t = state.mindMap.topicos.find(t=>t.id===topicoId); if(!t) return;
  t.aberto = true;
  if(subId){ const sb=(t.subtopicos||[]).find(x=>x.id===subId); if(sb) sb.aberto = true; }
  abrirMindMap();
}
document.addEventListener('click', e=>{ if(!e.target.closest('.tb-search')) bgFechar(); });
