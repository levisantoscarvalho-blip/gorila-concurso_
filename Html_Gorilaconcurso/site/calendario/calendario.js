/* ════════════════════════════════════════════
   CALENDÁRIO
   Calendário do mês/ano, edição de um dia, fotos, matérias do calendário.
   ════════════════════════════════════════════ */


// ════════════════════════════════════════════
// CALENDÁRIO
// ════════════════════════════════════════════
let calImgTargetKey = null;
let currentDate = null;   // dia aberto na janela do dia (AAAA-MM-DD)

// Botão "Registrar hoje": abre o dia de hoje já no formulário de edição
function registrarHoje(){
  if(!calAtivo()) return;
  openDayModal(todayKey());
  openDayEditForm();
  if(!editEstudos.length) editEstAdd();
}

function corCursoId(id){ const c=(state.cursos||[]).find(c=>c.id===id); return c?corCurso(c):'#64748b'; }
function cursoNomeEst(e){ const c=(state.cursos||[]).find(c=>c.id===e.cursoId); return c?c.nome:(e.cursoNome||'Estudo'); }
function materiaNome(e){ const m=(state.conteudosCustom||[]).find(x=>x.id===e.materiaId); return m?m.nome:(e.materiaNome||''); }
function dayRefEstudo(info){ const es=(info&&info.estudos)||[]; return es[info.imgEstudo||0]||es[0]||null; }
function horasDe(cursoId,materiaId){ let t=0; Object.values(state.days||{}).forEach(d=>{ ((d&&d.estudos)||[]).forEach(e=>{ if(e.cursoId===cursoId&&(!materiaId||e.materiaId===materiaId)) t+=Number(e.horas)||0; }); }); return Math.round(t*10)/10; }
function comprimirImagem(file,cb){
  const r=new FileReader();
  r.onload=e=>{ const img=new Image();
    img.onload=()=>{ const MAX=1000; const k=Math.min(1,MAX/Math.max(img.width,img.height)); const w=Math.round(img.width*k), h=Math.round(img.height*k);
      const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(img,0,0,w,h);
      cb(c.toDataURL('image/jpeg',0.9)); };
    img.onerror=()=>cb(e.target.result); img.src=e.target.result; };
  r.readAsDataURL(file);
}

function mkKey(y,m,d){ return `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }
function todayKey(){ const d=new Date(); return mkKey(d.getFullYear(),d.getMonth()+1,d.getDate()); }

// ── Regras de cálculo: TODAS as telas do calendário usam estas mesmas funções ──
const HORAS_MAX_DIA = 24;
// Arredonda para 1 casa decimal (evita 0.1 + 0.2 = 0.30000000000000004)
function arred1(n){ return Math.round((Number(n)||0)*10)/10; }
// Soma das horas das partes do dia (áreas + estudos ligados a cursos)
function somaHorasPartes(v){
  let t=0;
  AREAS_ORDEM.forEach(a=>{ if(v[a]&&typeof v[a]==='object') t+=Number(v[a].horas)||0; });
  (v.estudos||[]).forEach(e=>{ t+=Number(e.horas)||0; });
  return arred1(t);
}
function horasDoDia(v){ return v ? arred1(v.horasTotal) : 0; }
// Resumo de um período: prefixo 'AAAA-MM' (mês) ou 'AAAA' (ano)
function resumoPeriodo(prefixo){
  let dias=0, horas=0;
  Object.entries(state.days||{}).forEach(([k,v])=>{
    if(!k.startsWith(prefixo)) return;
    if(isStudyDay(v)) dias++;
    horas+=horasDoDia(v);
  });
  return { dias, horas:arred1(horas) };
}
// Um dia sem nada guardado não deve ocupar espaço
function diaVazio(v){
  return !v || (!String(v.saude||'').trim() && !AREAS_ORDEM.some(a=>v[a]) && !(v.estudos&&v.estudos.length)
    && !v.imgId && !v.imgSrc && !(v.horasTotal>0) && !String(v.eletivaDesc||'').trim());
}

// ── Fotos: cada foto é guardada UMA vez (no IndexedDB, veja armazenamento.js);
//    o dia guarda só o id. FOTOS é a cópia em memória para desenhar a tela. ──
const FOTOS = {};
const fotosSoNaMemoria = new Set();   // fotos do modo visitante (ainda não gravadas)
let fotosCarregadas = false;
function idDaFoto(src){
  let h=2166136261;
  for(let i=0;i<src.length;i++){ h^=src.charCodeAt(i); h=Math.imul(h,16777619); }
  return 'f'+(h>>>0).toString(36)+src.length.toString(36);
}
function guardarFoto(src){
  if(!src) return '';
  const id=idDaFoto(src);
  if(FOTOS[id]!==src){
    FOTOS[id]=src;
    if(window.__guest) fotosSoNaMemoria.add(id);
    else gravarFoto(id,src);
  }
  return id;
}
function gravarFoto(id,src){
  fotosDB.set(id,src).catch(e=>{ console.error('Erro ao salvar foto:',e); mostrarToast('⚠️ Não foi possível salvar a foto no navegador.'); });
}
function fotoDoDia(info){
  if(!info) return '';
  if(info.imgId) return FOTOS[info.imgId]||'';
  return info.imgSrc||'';
}
function temFotoVisivel(info){ return !!fotoDoDia(info) && info.usarImg!==false; }
// Apaga fotos que nenhum dia usa mais. Nunca roda no modo visitante nem antes de as fotos carregarem.
// (chamada a cada salvamento — veja saveState em banco-de-dados/estado.js)
function limparFotosSemUso(){
  if(window.__guest || !fotosCarregadas) return;
  const usadas=new Set(Object.values(state.days||{}).map(d=>d&&d.imgId).filter(Boolean));
  // fotos feitas no modo visitante que passaram para a conta: grava agora
  fotosSoNaMemoria.forEach(id=>{ if(usadas.has(id)&&FOTOS[id]) gravarFoto(id,FOTOS[id]); });
  fotosSoNaMemoria.clear();
  Object.keys(FOTOS).forEach(id=>{ if(!usadas.has(id)){ delete FOTOS[id]; fotosDB.delete(id).catch(()=>{}); } });
}
// Lê as fotos do IndexedDB (chamado ao carregar os dados)
async function carregarFotos(){
  try{ Object.assign(FOTOS, await fotosDB.todas()); }
  catch(e){ console.error('Não foi possível ler as fotos:', e); }
  fotosCarregadas=true;
}

// Arruma dados antigos ou repetidos (roda ao carregar e ao importar backup). Não muda horas.
function normalizarCalendario(){
  const days=state.days||(state.days={});
  // Fotos que vieram dentro dos dados (versão anterior ou backup) vão para o IndexedDB
  if(state.fotos){ Object.values(state.fotos).forEach(src=>guardarFoto(src)); delete state.fotos; }
  Object.entries(days).forEach(([k,v])=>{
    if(!v||typeof v!=='object'){ delete days[k]; return; }
    if('imgSrc' in v){ if(v.imgSrc) v.imgId=guardarFoto(v.imgSrc); delete v.imgSrc; }
    if(!v.imgId){ delete v.usarImg; delete v.imgEstudo; }
    ['saude','eletivaDesc'].forEach(c=>{ if(c in v && !String(v[c]).trim()) delete v[c]; });
    if(v.eletiva===false) delete v.eletiva;
    if(Array.isArray(v.estudos) && !v.estudos.length) delete v.estudos;
    v.horasTotal=somaHorasPartes(v);
    if(diaVazio(v)) delete days[k];
  });
}
function salvarCalendario(){ return saveState(); }

// Aviso no modo visitante (explica por que os números estão zerados)
function atualizarAvisoVisitante(){
  const tab=document.getElementById('tab-calendario'); if(!tab) return;
  let av=document.getElementById('cal-visitante-aviso');
  if(window.__guest){
    if(!av){
      av=document.createElement('div'); av.id='cal-visitante-aviso';
      av.style.cssText='display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;padding:12px 16px;border-radius:var(--radius);background:var(--accent-bg);border:1px solid var(--accent);color:var(--text-primary);font-size:13px';
      av.innerHTML='<span style="flex:1;min-width:220px"><strong>Você está no modo visitante.</strong> Os números começam zerados e nada é salvo. Entre na sua conta para ver o seu progresso.</span><button type="button" onclick="auEscolher(\'login\')" style="padding:8px 16px;border:none;border-radius:8px;background:var(--accent);color:#fff;font-weight:700;cursor:pointer">Entrar</button>';
      const header=tab.querySelector('.page-header');
      header.insertAdjacentElement('afterend', av);
    }
  } else if(av) av.remove();
}

function renderCal(){
  const h=document.getElementById('cal-days-header');
  const g=document.getElementById('cal-grid');
  if(!h||!g) return;
  h.innerHTML=DIAS_SEM.map(d=>`<div class="cal-day-lbl">${d}</div>`).join('');
  const first=new Date(state.year,state.month,1).getDay();
  const total=new Date(state.year,state.month+1,0).getDate();
  document.getElementById('cal-month-label').textContent=MESES[state.month]+' de '+state.year;
  document.getElementById('cal-subtitle').textContent=MESES[state.month]+' '+state.year;
  const today=new Date();
  let cells='';
  for(let i=0;i<first;i++) cells+=`<div class="cal-cell empty"></div>`;
  for(let d=1;d<=total;d++){
    const key=mkKey(state.year,state.month+1,d);
    const info=state.days[key];
    const isToday=d===today.getDate()&&state.month===today.getMonth()&&state.year===today.getFullYear();
    let cls=getCellClass(info);
    if(isToday) cls+=' today';
    const sub=horasDoDia(info)?`<div class="day-hours">${horasDoDia(info)}h</div>`:'';
    const temFoto = temFotoVisivel(info);
    let borderStyle='', bg='';
    const ref = info&&info.estudos&&info.estudos.length ? dayRefEstudo(info) : null;
    const refCor = ref ? corCursoId(ref.cursoId) : (getCellColor(info)||'#555');
    if(temFoto){
      cls+=' has-photo';
      borderStyle=` style="border-color:${refCor}"`;
      const rotulo = ref ? (materiaNome(ref)||cursoNomeEst(ref)) : '';
      bg=`<img class="cal-bg-img" src="${fotoDoDia(info)}" alt="" decoding="async"><div class="cal-bg-overlay" style="background:linear-gradient(180deg, ${refCor}66 0%, ${refCor}22 40%, rgba(0,0,0,.6) 100%)"></div>`+(rotulo?`<div class="cal-ref" style="background:${refCor}">${escapeHtmlCarreira(rotulo)}</div>`:'');
    } else if(ref){ borderStyle=` style="background:${refCor};color:#fff"`; }
    cells+=`<div class="${cls}"${borderStyle} onclick="openDayModal('${key}')">
      ${bg}
      <div class="day-num">${d}</div>${sub}
      <button class="cal-img-add" onclick="event.stopPropagation();triggerCalImg('${key}')"><span class="icon-emoji">🖼️</span></button>
    </div>`;
  }
  g.innerHTML=cells;
  updateStats(); updateSidebarHours(); atualizarAvisoVisitante();
}

function getCellClass(info){
  let cls='cal-cell';
  if(!info) return cls+' no-study';
  if(info.estudos&&info.estudos.length&&![info.ciencia,info.sefaz,info.direito,info.notario,info.eletiva].some(Boolean)) return cls+' estudo';
  const areas=[info.ciencia,info.sefaz,info.direito,info.notario,info.eletiva].filter(Boolean).length;
  if(areas===0) return cls+' no-study';
  if(areas>1) return cls+' multi';
  if(info.ciencia) return cls+' ciencia-only';
  if(info.sefaz) return cls+' sefaz-only';
  if(info.direito) return cls+' direito-only';
  if(info.notario) return cls+' notario-only';
  if(info.eletiva) return cls+' eletiva-only';
  return cls+' no-study';
}

function triggerCalImg(key){ if(!calAtivo()) return; calImgTargetKey=key; document.getElementById('cal-img-input').click(); }

let calView = 'month';
function calAtivo(){ return state.calendarioAtivo !== false; }
function aplicarCalendarioAtivo(){
  const on = calAtivo();
  const tab = document.getElementById('tab-calendario'); if(tab) tab.classList.toggle('cal-off', !on);
  const b = document.getElementById('cal-ativo-btn'); if(b){ b.classList.toggle('on', on); b.setAttribute('aria-checked', on); }
  const l = document.getElementById('cal-ativo-lbl'); if(l) l.textContent = on ? 'Calendário ON' : 'Calendário OFF';
  const s = document.getElementById('cal-ativo-sub'); if(s) s.textContent = on ? 'Ligado: você pode ver e registrar seus dias de estudo.' : 'Desligado: o calendário fica oculto. Seus dados continuam salvos.';
}
function toggleCalendarioAtivo(){
  state.calendarioAtivo = !calAtivo();
  saveState(); renderCalActive();
  mostrarToast(calAtivo() ? 'Calendário ligado' : 'Calendário desligado');
}
function renderCalActive(){ aplicarCalendarioAtivo(); atualizarAvisoVisitante(); if(!calAtivo()) return; if(calView==='year') renderYearCal(); else renderCal(); if(typeof renderMateriasEstudo==='function') renderMateriasEstudo(); }
function setCalView(v){
  calView = v;
  document.getElementById('cal-view-month-btn').classList.toggle('active', v==='month');
  document.getElementById('cal-view-year-btn').classList.toggle('active', v==='year');
  document.getElementById('cal-month-view').style.display = v==='month' ? '' : 'none';
  document.getElementById('cal-year-view').style.display = v==='year' ? '' : 'none';
  document.getElementById('cal-nav-month').style.display = v==='month' ? '' : 'none';
  document.getElementById('cal-nav-year').style.display = v==='year' ? '' : 'none';
  renderCalActive();
}
function changeYear(delta){ state.year += delta; renderCalActive(); }
function getCellColor(info){
  if(!info) return '';
  if(info.estudos&&info.estudos.length){ const r=dayRefEstudo(info); return r?corCursoId(r.cursoId):''; }
  const areas=[info.ciencia,info.sefaz,info.direito,info.notario].filter(Boolean).length;
  if(areas===0 && !info.eletiva) return '';
  if(areas>1) return '#1a3555';
  if(info.ciencia) return '#1e3a6e';
  if(info.sefaz) return '#1e4a32';
  if(info.direito) return '#3a2010';
  if(info.notario) return '#2a1040';
  if(info.eletiva) return '#2a1e40';
  return '';
}
let calYearViewMode = 'cores'; // 'cores' ou 'fotos'

function setCalYearView(mode){
  calYearViewMode = mode;
  document.getElementById('cal-year-view-colors-btn').style.background = mode==='cores' ? 'var(--accent)' : 'var(--surface-2)';
  document.getElementById('cal-year-view-colors-btn').style.color = mode==='cores' ? '#fff' : 'var(--text-primary)';
  document.getElementById('cal-year-view-photos-btn').style.background = mode==='fotos' ? 'var(--accent)' : 'var(--surface-2)';
  document.getElementById('cal-year-view-photos-btn').style.color = mode==='fotos' ? '#fff' : 'var(--text-primary)';
  renderYearCal();
}

function renderYearCal(){
  const grid = document.getElementById('cal-year-grid');
  if(!grid) return;
  document.getElementById('cal-year-label').textContent = state.year;
  document.getElementById('cal-subtitle').textContent = 'Ano ' + state.year;
  const today = new Date();
  let html = '';
  const modoFoto = calYearViewMode === 'fotos';
  
  for(let m=0; m<12; m++){
    const first = new Date(state.year, m, 1).getDay();
    const total = new Date(state.year, m+1, 0).getDate();
    const resumoMes = resumoPeriodo(`${state.year}-${String(m+1).padStart(2,'0')}`);
    let cells = DIAS_SEM.map(d=>`<div class="cym-lbl">${d[0]}</div>`).join('');
    for(let i=0;i<first;i++) cells += '<div class="cym-cell"></div>';
    for(let d=1; d<=total; d++){
      const key = mkKey(state.year, m+1, d);
      const info = state.days[key];
      const color = getCellColor(info);
      const isToday = d===today.getDate() && m===today.getMonth() && state.year===today.getFullYear();
      let cellContent = '';
      let cellStyle = '';
      let cellClass = 'cym-cell' + (color?' has-study':'') + (isToday?' today':'');
      
      if(modoFoto){
        // Modo fotos: mostra a foto se existe, senão mostra a cor como background
        if(temFotoVisivel(info)){
          cellContent = `<img src="${fotoDoDia(info)}" style="width:100%;height:100%;object-fit:cover;border-radius:4px">`;
          cellStyle = `position:relative;overflow:hidden;`+(color?`border-bottom:3px solid ${color};`:'');
        } else {
          cellStyle = color ? `background:${color}` : '';
        }
      } else {
        // Modo cores: só cores
        cellStyle = color ? `background:${color}` : '';
      }
      
      cells += `<div class="${cellClass}" style="${cellStyle}" title="${key}${horasDoDia(info)?(' · '+horasDoDia(info)+'h'):''}" onclick="jumpToMonth(${state.year},${m},'${key}')">${cellContent}${!modoFoto?d:''}</div>`;
    }
    const isCurrent = m===state.month;
    html += `<div class="cal-year-month ${isCurrent?'current':''}" onclick="jumpToMonth(${state.year},${m})">
      <div class="cym-title">${MESES[m]} <small>${resumoMes.dias}d · ${resumoMes.horas}h</small></div>
      <div class="cym-days">${cells}</div>
    </div>`;
  }
  grid.innerHTML = html;
  updateStats();
}
function jumpToMonth(y, m, dayKey){
  if(event) event.stopPropagation();
  state.year = y; state.month = m;
  setCalView('month');
  if(dayKey) openDayModal(dayKey);
}

function addCalImg(input){
  if(!calImgTargetKey||!input.files[0]) return;
  const key=calImgTargetKey, f=input.files[0]; input.value=''; calImgTargetKey=null;
  comprimirImagem(f,src=>{
    if(!state.days[key]) state.days[key]={horasTotal:0};
    const dia=state.days[key];
    delete dia.imgSrc; dia.imgId=guardarFoto(src); dia.usarImg=true;
    salvarCalendario(); renderCalActive();
    if(document.getElementById('day-modal').classList.contains('open') && currentDate===key) openDayModal(key);
  });
}

function openDayModal(key){
  if(!calAtivo()) return;
  currentDate=key;
  const [y,m,d]=key.split('-');
  document.getElementById('day-modal-title').textContent=`${d}/${m}/${y}`;
  const info=state.days[key];
  let html='';
  if(info){
    if(info.saude) html+=`<div class="summary-item"><div class="summary-area">Saúde</div><div class="summary-detail">${info.saude}</div></div>`;
    ['ciencia','sefaz','direito','notario'].forEach(area=>{
      const nomes={ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário'};
      if(info[area]){
        const d=info[area];
        const meta = AREA_META[area];
        const matVal = meta ? d[meta.materialKey] : 0;
        const matTxt = matVal ? ` · ${meta.materialIcon} ${matVal} ${meta.materialLabel.toLowerCase()}` : '';
        html+=`<div class="summary-item">
          <div class="summary-area"><span class="icon-emoji">📚</span> ${nomes[area]}</div>
          <div class="summary-detail">${d.horas||0}h · ${d.assunto||'—'} · ${d.questoes||0} questões${matTxt}</div>
        </div>`;
      }
    });
    if(info.eletiva) html+=`<div class="summary-item"><div class="summary-area"><span class="icon-emoji">📚</span> Eletiva de Base</div><div class="summary-detail">${info.eletiva.horas||0}h · ${info.eletiva.assunto||'—'} · ${info.eletiva.questoes||0} questões${info.eletiva.horasLeitura?' · 📖 '+info.eletiva.horasLeitura+'h de leitura':''}</div></div>`;
    (info.estudos||[]).forEach(e=>{ html+=`<div class="summary-item"><div class="summary-area"><span class="legend-dot" style="display:inline-block;background:${corCursoId(e.cursoId)}"></span> ${escapeHtmlCarreira(cursoNomeEst(e))}</div><div class="summary-detail">${materiaNome(e)?escapeHtmlCarreira(materiaNome(e))+' · ':''}${e.horas||0}h${e.questoes?' · '+e.questoes+' questões':''}</div></div>`; });
    if(horasDoDia(info)) html+=`<div class="summary-item"><div class="summary-area">Total</div><div class="summary-detail"><strong>${horasDoDia(info)}h</strong></div></div>`;
    if(temFotoVisivel(info)) html=`<img src="${fotoDoDia(info)}" style="width:100%;border-radius:8px;margin-bottom:12px">` + html;
  } else {
    html='<div style="font-size:13px;color:var(--text-muted);padding:16px 0">Nenhum registro para este dia.</div>';
  }
  document.getElementById('day-modal-content').innerHTML=html;
  document.getElementById('day-modal-img-btn').onclick=()=>triggerCalImg(key);
  document.getElementById('day-modal').classList.add('open');
}
function closeDayModal(){ document.getElementById('day-modal').classList.remove('open'); }

// ──────────────── EDIÇÃO MANUAL DE UM DIA (sem IA) ────────────────
let editEstudos=[], editUsarImg=false, editImgRef=0, editSaude='';
function openDayEditForm(){
  const key=currentDate; if(!key) return;
  const d=state.days[key]||{};
  editEstudos=JSON.parse(JSON.stringify(d.estudos||[]));
  editImgSelecionada=fotoDoDia(d)||null;
  editUsarImg=!!editImgSelecionada && d.usarImg!==false;
  editImgRef=d.imgEstudo||0; editSaude=d.saude||'';
  document.getElementById('day-edit-form').style.display='block';
  renderDayEditForm();
}
function editEstAdd(){ migrarCursos(); if(!state.cursos.length) return; editSaveSaude(); editEstudos.push({cursoId:state.cursos[0].id,materiaId:'',horas:0,questoes:0}); renderDayEditForm(); }
function editEstRemover(i){ editSaveSaude(); editEstudos.splice(i,1); if(editImgRef>=editEstudos.length) editImgRef=0; renderDayEditForm(); }
function editEstChange(i,campo,v){ editEstudos[i][campo]=v; if(campo==='cursoId') editEstudos[i].materiaId=''; editSaveSaude(); renderDayEditForm(); }
function editEstNum(i,campo,v){
  const n=Math.max(0, parseFloat(String(v).replace(',','.'))||0);   // nunca negativo
  editEstudos[i][campo]= campo==='questoes' ? Math.round(n) : arred1(n);
}
function editSaveSaude(){ const sv=document.getElementById('edit-saude'); if(sv) editSaude=sv.value; }
function editSetImg(v){ editSaveSaude(); editUsarImg=v; renderDayEditForm(); }
function renderDayEditForm(){
  editSaveSaude(); migrarCursos();
  const cursos=state.cursos||[];
  const inp='padding:7px 8px;background:var(--surface-1);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:12px;width:100%;text-align:center';
  const titulo='font-weight:700;color:var(--text-primary);font-size:13px;margin-bottom:8px;text-align:center';
  const caixa='border:1px solid var(--border);border-radius:var(--radius);padding:12px;background:var(--surface-2)';
  let estHtml='';
  if(!cursos.length){
    estHtml='<div style="font-size:12px;color:var(--text-muted);text-align:center;padding:6px 0">Você ainda não tem cursos. Crie em Conteúdos (ou no + do calendário) para ligar aqui.</div>';
  } else {
    estHtml='<div style="display:grid;gap:12px">'+editEstudos.map((e,i)=>{
      const mats=conteudosCustomDe(e.cursoId);
      return `<div style="${caixa};background:var(--surface-1);display:grid;grid-template-columns:1fr 1fr;gap:6px;position:relative;border-left:4px solid ${corCursoId(e.cursoId)}">
        <select onchange="editEstChange(${i},'cursoId',this.value)" style="${inp}">${cursos.map(c=>`<option value="${c.id}"${c.id===e.cursoId?' selected':''}>${escapeHtmlCarreira(c.nome)}</option>`).join('')}</select>
        <select onchange="editEstChange(${i},'materiaId',this.value)" style="${inp}"><option value="">— matéria (opcional) —</option>${mats.map(m=>`<option value="${m.id}"${m.id===e.materiaId?' selected':''}>${escapeHtmlCarreira(m.nome)}</option>`).join('')}</select>
        <input type="number" step="0.5" min="0" placeholder="Horas" value="${e.horas||''}" oninput="editEstNum(${i},'horas',this.value)" style="${inp}">
        <input type="number" min="0" placeholder="Questões" value="${e.questoes||''}" oninput="editEstNum(${i},'questoes',this.value)" style="${inp}">
        <button type="button" onclick="editEstRemover(${i})" title="Remover" style="position:absolute;top:-8px;right:-8px;width:22px;height:22px;border-radius:50%;border:1px solid var(--border);background:var(--surface-1);color:var(--text-muted);cursor:pointer;font-size:10px">✕</button>
      </div>`; }).join('')+'</div><div style="text-align:center;margin-top:10px"><button type="button" class="de-btn" onclick="editEstAdd()"><span class="icon-emoji">➕</span> Adicionar estudo</button></div>';
  }
  let imgHtml=`<div style="display:flex;gap:8px;justify-content:center;margin-bottom:6px">
      <button type="button" class="de-btn${editUsarImg?' sel':''}" onclick="editSetImg(true)">Sim, com imagem</button>
      <button type="button" class="de-btn${!editUsarImg?' sel':''}" onclick="editSetImg(false)">Não, sem imagem</button></div>`;
  if(editUsarImg){
    imgHtml+=`<div id="edit-foto-galeria" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:10px 0"></div>
      <div style="text-align:center"><button type="button" class="de-btn" onclick="document.getElementById('edit-foto-upload').click()"><span class="icon-emoji">📤</span> Enviar nova foto</button>
      <button type="button" class="de-btn" style="margin-left:6px" onclick="selecionarFotoDia(null)">Nenhuma</button></div>
      <input type="file" id="edit-foto-upload" accept="image/*" style="display:none" onchange="uploadFotoDia(this)">`;
    if(editEstudos.length>1){
      imgHtml+=`<div style="margin-top:10px;text-align:center;font-size:12px;color:var(--text-secondary)">A imagem representa:
        <select onchange="editImgRef=+this.value" style="${inp};width:auto;display:inline-block;margin-left:6px">${editEstudos.map((e,i)=>`<option value="${i}"${i===editImgRef?' selected':''}>${escapeHtmlCarreira(materiaNome(e)||cursoNomeEst(e))}</option>`).join('')}</select></div>`;
    } else if(editEstudos.length===1){
      imgHtml+=`<div style="margin-top:8px;text-align:center;font-size:11.5px;color:var(--text-muted)">A imagem vai representar: <strong>${escapeHtmlCarreira(materiaNome(editEstudos[0])||cursoNomeEst(editEstudos[0]))}</strong></div>`;
    } else imgHtml+='<div style="margin-top:8px;text-align:center;font-size:11.5px;color:var(--text-muted)">Adicione um estudo acima para a imagem fazer referência a ele.</div>';
  }
  const wrap=document.getElementById('day-edit-form');
  wrap.innerHTML=`<div style="display:grid;gap:14px;text-align:center">
    <div style="${caixa}"><div style="${titulo}"><span class="icon-emoji">📚</span> O que você estudou neste dia</div>${estHtml}</div>
    <div style="${caixa}"><div style="${titulo}"><span class="icon-emoji">🖼️</span> Colocar imagem neste dia?</div>${imgHtml}</div>
    <div style="${caixa}"><div style="${titulo}">🏃 Saúde</div><input type="text" id="edit-saude" placeholder="Ex.: Acordou 7h · Banho ✓" value="${(editSaude||'').replace(/"/g,'&quot;')}" style="${inp}"></div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button style="padding:10px 22px;background:var(--success);color:#fff;border:none;border-radius:var(--radius);cursor:pointer;font-size:13px;font-weight:600" onclick="saveDayEdit()"><span class="icon-emoji">💾</span> Salvar alterações</button>
      <button style="padding:10px 16px;background:none;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;color:var(--text-secondary);font-size:13px" onclick="closeDayEditForm()">Cancelar</button></div></div>`;
  if(editUsarImg) renderGaleriaFotos();
}

let editImgSelecionada = null;

function fotosDisponiveis(){
  const set = new Set(Object.values(state.fotos||{}));
  Object.values(state.days||{}).forEach(d=>{ if(d && d.imgSrc) set.add(d.imgSrc); });
  (state.mapas||[]).forEach(m=>{ if(m && m.src) set.add(m.src); });
  return Array.from(set);
}

let galeriaFotos = [];
function renderGaleriaFotos(){
  const el = document.getElementById('edit-foto-galeria');
  if(!el) return;
  const fotos = fotosDisponiveis();
  
  // Adiciona a foto temporária (recém-enviada) à lista, se existir
  let allFotos = [];
  if(editImgSelecionada && !fotos.includes(editImgSelecionada)){
    allFotos.push(editImgSelecionada); // foto temporária recém-enviada, aparece primeiro
  }
  allFotos = allFotos.concat(fotos); // depois as fotos já salvas
  
  if(allFotos.length===0){
    el.innerHTML = '<span style="font-size:11.5px;color:var(--text-muted)">Nenhuma foto salva no site ainda — envie uma nova abaixo.</span>';
    return;
  }
  galeriaFotos = allFotos;
  el.innerHTML = allFotos.map((src,i)=>{
    const sel = src===editImgSelecionada;
    return `<img src="${src}" onclick="selecionarFotoDia(galeriaFotos[${i}])" style="width:56px;height:56px;object-fit:cover;border-radius:6px;cursor:pointer;border:3px solid ${sel?'var(--accent)':'var(--border)'}; opacity:${sel?'1':'.65'};transition:all .15s" title="${sel?'Selecionada':'Clique para selecionar'}">`;
  }).join('');
}

function selecionarFotoDia(src){
  editImgSelecionada = src;
  renderGaleriaFotos();
}

function uploadFotoDia(input){
  if(!input.files[0]) return;
  const f=input.files[0]; input.value='';
  comprimirImagem(f,src=>{ editImgSelecionada=src; renderGaleriaFotos(); });
}


function renderEditArea(area, label, g){
  const meta = AREA_META[area] || {};
  const isHoras = meta.materialTipo === 'horas';
  return `
    <div style="border:1px solid var(--border);border-radius:var(--radius);padding:10px;background:var(--surface-2)">
      <div style="font-weight:600;color:var(--text-primary);margin-bottom:6px">${label}</div>
      <div style="display:grid;grid-template-columns:70px 1fr 70px 90px;gap:6px">
        <input type="number" step="0.5" min="0" id="edit-${area}-horas" placeholder="Horas" value="${g(area,'horas','')}" style="padding:6px 8px;background:var(--surface-1);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:12px">
        <input type="text" id="edit-${area}-assunto" placeholder="Assunto" value="${String(g(area,'assunto','')).replace(/"/g,'&quot;')}" style="padding:6px 8px;background:var(--surface-1);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:12px">
        <input type="number" min="0" id="edit-${area}-questoes" placeholder="Questões" value="${g(area,'questoes','')}" style="padding:6px 8px;background:var(--surface-1);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:12px">
        <input type="number" min="0" ${isHoras?'step="0.5"':''} id="edit-${area}-material" placeholder="${meta.materialLabel||'Material'}" value="${g(area,meta.materialKey,'')}" title="${meta.materialLabel||''}" style="padding:6px 8px;background:var(--surface-1);border:1px solid var(--border);border-radius:6px;color:var(--text-primary);font-size:12px">
      </div>
      <div style="font-size:10px;color:var(--text-muted);margin-top:4px">Horas · Assunto · Questões · ${meta.materialIcon||''} ${meta.materialLabel||''}</div>
    </div>
  `;
}

function closeDayEditForm(){
  const wrap = document.getElementById('day-edit-form');
  if(wrap){ wrap.style.display='none'; wrap.innerHTML=''; }
}

async function saveDayEdit(){
  const key=currentDate; if(!key) return;
  editSaveSaude();
  const prev=state.days[key]||{};
  const novo={};
  const saude=(editSaude||'').trim();
  if(saude) novo.saude=saude;
  AREAS_ORDEM.forEach(a=>{ if(prev[a]) novo[a]=prev[a]; });
  if(prev.eletivaDesc) novo.eletivaDesc=prev.eletivaDesc;
  const kept=editEstudos.filter(e=>e.cursoId&&((e.horas||0)>0||(e.questoes||0)>0||e.materiaId));
  const refObj=editEstudos[editImgRef];
  const est=kept.map(e=>({cursoId:e.cursoId,cursoNome:cursoNomeEst(e),materiaId:e.materiaId||'',materiaNome:materiaNome(e),horas:arred1(e.horas),questoes:Math.round(e.questoes||0)}));
  if(est.length) novo.estudos=est;
  novo.horasTotal=somaHorasPartes(novo);
  // Só bloqueia o que a pessoa digitou agora (registros antigos acima de 24h continuam editáveis)
  const horasDigitadas=est.reduce((t,e)=>t+e.horas,0);
  if(horasDigitadas>0 && novo.horasTotal>HORAS_MAX_DIA){
    await customAlert(`O total deste dia ficou em ${novo.horasTotal}h, mas um dia tem no máximo ${HORAS_MAX_DIA}h. Confira as horas antes de salvar.`);
    return;
  }
  if(editImgSelecionada){ novo.imgId=guardarFoto(editImgSelecionada); novo.usarImg=editUsarImg; novo.imgEstudo=Math.max(0,kept.indexOf(refObj)); }
  if(diaVazio(novo)) delete state.days[key];
  else state.days[key]=novo;
  salvarCalendario();
  updateFoguinho(); renderCalActive(); renderMural(); renderConteudos();
  closeDayEditForm();
  openDayModal(key);
}

function changeMonth(d){
  state.month+=d;
  if(state.month>11){state.month=0;state.year++;}
  if(state.month<0){state.month=11;state.year--;}
  saveState(); renderCal();
}

// Números do topo do calendário — do mês aberto (visão Mês) ou do ano inteiro (visão Ano)
function updateStats(){
  const noAno = calView==='year';
  const { dias, horas } = resumoPeriodo(noAno ? String(state.year) : `${state.year}-${String(state.month+1).padStart(2,'0')}`);
  const subs=document.querySelectorAll('#tab-calendario .stats-row .stat-sub');
  if(subs.length>=2){ subs[0].textContent = subs[1].textContent = noAno ? 'neste ano' : 'este mês'; }
  const setEl=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setEl('stat-dias',dias);
  setEl('stat-horas',horas+'h');
  setEl('stat-media',(dias?arred1(horas/dias):0)+'h');
  setEl('stat-seq', calcularSequenciaAtual());
}

// "Horas este mês" da barra lateral — sempre do mês de HOJE
function updateSidebarHours(){
  const hoje=new Date();
  const { horas } = resumoPeriodo(`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`);
  const el=document.getElementById('sidebar-hours');
  if(el) el.textContent=horas+'h';
}

document.getElementById('day-modal').addEventListener('click',function(e){ if(e.target===this) closeDayModal(); });

// ── Matérias que a pessoa está estudando (substitui a legenda fixa) ──
const MATERIA_CORES=['#3b82f6','#22c55e','#f97316','#a855f7','#ec4899','#ef4444','#06b6d4','#eab308'];
let materiaCorSel=MATERIA_CORES[0];
function renderMateriasEstudo(){
  const el=document.getElementById('cal-materias'); if(!el) return;
  migrarCursos();
  const lista=state.cursos||[];
  el.innerHTML=lista.map(m=>`<div class="legend-item" style="background:var(--surface-1);border:1px solid var(--border);border-radius:16px;padding:4px 6px 4px 10px;gap:7px"><div class="legend-dot" style="background:${corCurso(m)}"></div>${escapeHtmlCarreira(m.nome)}<button onclick="removerMateria('${m.id}')" title="Remover (também sai de Conteúdos)" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:11px;padding:0 3px">✕</button></div>`).join('')
   +`<button onclick="abrirAddMateria()" title="Adicionar o que você está estudando (também aparece em Conteúdos)" style="width:30px;height:30px;border-radius:50%;border:1px dashed var(--border-strong);background:var(--surface-1);color:var(--accent-text);font-size:18px;font-weight:700;cursor:pointer;line-height:1">+</button>`
   +(lista.length?'':'<span style="font-size:12px;color:var(--text-muted)">Clique no + para adicionar o que você está estudando</span>');
}
function abrirAddMateria(){
  document.getElementById('nova-materia-nome').value='';
  catalogoChips('nova-materia-nome','catalogo-prev-materia','catalogo-chips-materia');
  materiaCorSel=MATERIA_CORES[0]; desenharCoresMateria();
  document.getElementById('add-materia-modal').classList.add('open');
  setTimeout(()=>document.getElementById('nova-materia-nome').focus(),50);
}
function fecharAddMateria(){ document.getElementById('add-materia-modal').classList.remove('open'); }
function desenharCoresMateria(){
  document.getElementById('nova-materia-cores').innerHTML=MATERIA_CORES.map(c=>`<button type="button" onclick="materiaCorSel='${c}';desenharCoresMateria()" style="width:28px;height:28px;border-radius:50%;background:${c};cursor:pointer;border:3px solid ${c===materiaCorSel?'var(--text-primary)':'transparent'}"></button>`).join('');
}
function criarMateria(){
  const nome=document.getElementById('nova-materia-nome').value.trim();
  if(!nome){ customAlert('Digite o nome do que você está estudando.'); return; }
  migrarCursos();
  if(state.cursos.some(c=>bgNorm(c.nome)===bgNorm(nome))){ customAlert('Isso já está na sua lista (e em Conteúdos).'); return; }
  const r=novoCursoCatalogo(nome,materiaCorSel);
  saveState(); renderMateriasEstudo(); renderConteudos(); fecharAddMateria();
  if(r.n) mostrarToast(`${r.n} matérias adicionadas automaticamente`);
}
async function removerMateria(id){ await excluirCurso(id); }
document.getElementById('add-materia-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddMateria(); });
