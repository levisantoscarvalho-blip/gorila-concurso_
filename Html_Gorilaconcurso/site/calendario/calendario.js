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
// Foto do dia: guarda a ORIGINAL (qualidade total, como na versão antiga).
// Só reduz se for enorme (acima de 10 MB), e mesmo assim em altíssima qualidade (3200 px, 96%).
function comprimirImagem(file,cb){
  const r=new FileReader();
  r.onload=e=>{
    if(file.size <= 10*1024*1024) return cb(e.target.result);
    const img=new Image();
    img.onload=()=>{ const MAX=3200; const k=Math.min(1,MAX/Math.max(img.width,img.height)); const w=Math.round(img.width*k), h=Math.round(img.height*k);
      const c=document.createElement('canvas'); c.width=w; c.height=h; const x=c.getContext('2d'); x.imageSmoothingEnabled=true; x.imageSmoothingQuality='high'; x.drawImage(img,0,0,w,h);
      cb(c.toDataURL('image/jpeg',0.96)); };
    img.onerror=()=>cb(e.target.result); img.src=e.target.result; };
  r.readAsDataURL(file);
}
// Escurece uma cor (#rrggbb) — o filtro da foto usa a cor do dia escurecida, como na versão antiga
function escurecerCor(hex,f){
  const m=/^#?([0-9a-f]{6})$/i.exec(hex||''); if(!m) return '#1e3a6e';
  const n=parseInt(m[1],16), c=v=>Math.round(v*f).toString(16).padStart(2,'0');
  return `#${c(n>>16&255)}${c(n>>8&255)}${c(n&255)}`;
}
// Clareia uma cor (mistura com branco)
function clarearCor(hex,f){
  const m=/^#?([0-9a-f]{6})$/i.exec(hex||''); if(!m) return hex;
  const n=parseInt(m[1],16), c=v=>Math.round(v+(255-v)*f).toString(16).padStart(2,'0');
  return `#${c(n>>16&255)}${c(n>>8&255)}${c(n&255)}`;
}
// Cor clara (amarelo, pastel...) pede texto escuro para dar para ler
function corEhClara(hex){
  const m=/^#?([0-9a-f]{6})$/i.exec(hex||''); if(!m) return false;
  const n=parseInt(m[1],16), r=n>>16&255, g=n>>8&255, b=n&255;
  return (r*299+g*587+b*114)/1000 > 165;
}

// ── Estilo dos dias coloridos (a pessoa escolhe na engrenagem → state.estiloCal) ──
const ESTILOS_CAL=[
  {id:'solido',   nome:'Sólido'},
  {id:'degrade',  nome:'Degradê'},
  {id:'suave',    nome:'Suave'},
  {id:'contorno', nome:'Contorno'},
  {id:'faixa',    nome:'Faixa'},
  {id:'brilho',   nome:'Brilho'},
];
function estiloCalAtual(){ return ESTILOS_CAL.some(e=>e.id===state.estiloCal) ? state.estiloCal : 'solido'; }
// Devolve {style, cls} para pintar um dia com a cor. mini=true no calendário do ano.
function estiloDia(cor, estilo, mini){
  estilo = estilo || estiloCalAtual();
  const hex=/^#[0-9a-f]{6}$/i.test(cor||'');
  if(!hex && estilo!=='solido') estilo='solido';
  const clara=corEhClara(cor), txt=clara?'#1a1a1a':'#fff';
  switch(estilo){
    case 'degrade':  return {style:`background:linear-gradient(135deg, ${clarearCor(cor,.3)} 0%, ${cor} 55%, ${escurecerCor(cor,.65)} 100%);color:${txt}`, cls:clara?' sem-sombra':''};
    case 'suave':    return {style:`background:${cor}38;border-color:${cor}99;color:var(--text-primary)`, cls:' sem-sombra'};
    case 'contorno': return {style:`background:var(--surface-1);border:${mini?1.5:2}px solid ${cor};color:var(--text-primary)`, cls:' sem-sombra'};
    case 'faixa':    return {style:`background:var(--surface-1);border-color:var(--border);box-shadow:inset 0 -${mini?3:6}px 0 ${cor};color:var(--text-primary)`, cls:' sem-sombra'};
    case 'brilho':   return {style:`background:${cor}26;border:1px solid ${cor};box-shadow:0 0 ${mini?4:10}px ${cor}aa, inset 0 0 ${mini?3:8}px ${cor}55;color:var(--text-primary)`, cls:' sem-sombra'};
    default:         return {style:`background:${cor};color:${txt}`, cls:clara?' sem-sombra':''};
  }
}
// Sombra por cima da FOTO do dia: usa a cor e o estilo escolhidos na engrenagem.
// Sempre escurece embaixo para o número do dia continuar legível.
function sombraFoto(cor, estilo){
  estilo = estilo || estiloCalAtual();
  if(!/^#[0-9a-f]{6}$/i.test(cor||'')) cor='#1e3a6e';
  const baixo='rgba(0,0,0,.55)';
  switch(estilo){
    case 'degrade':  return {overlay:`linear-gradient(135deg, ${clarearCor(cor,.25)}aa 0%, ${cor}55 50%, ${escurecerCor(cor,.35)}e6 100%)`, borda:cor};
    case 'suave':    return {overlay:`linear-gradient(180deg, ${cor}59 0%, ${cor}26 45%, ${baixo} 100%)`, borda:cor+'99'};
    case 'contorno': return {overlay:`linear-gradient(180deg, rgba(0,0,0,0) 35%, ${baixo} 100%)`, borda:cor, larg:3};
    case 'faixa':    return {overlay:`linear-gradient(0deg, ${cor} 0 6px, transparent 6px), linear-gradient(180deg, rgba(0,0,0,0) 35%, ${baixo} 100%)`, borda:'transparent'};
    case 'brilho':   return {overlay:`radial-gradient(circle at 50% 45%, ${cor}14 0%, ${cor}99 100%), linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.45) 100%)`, borda:cor, brilho:`0 0 10px ${cor}aa`};
    default:         return {overlay:`linear-gradient(180deg, ${cor}b3 0%, ${cor}59 45%, ${baixo} 100%)`, borda:cor};
  }
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
  fotosDB.set(id,src).catch(e=>{ console.error('Erro ao salvar foto:',e); mostrarToast('Não foi possível salvar a foto no navegador.'); });
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
      av=document.createElement('div'); av.id='cal-visitante-aviso'; av.className='aviso-visitante';   // visual em geral/acabamento.css
      av.innerHTML='<span class="av-icone"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg></span>'
        +'<span class="av-texto"><strong>Você está no modo visitante.</strong> Pode testar à vontade: ao criar a sua conta grátis, você escolhe se quer guardar o que fez aqui.</span>'
        +'<button type="button" class="av-botao" onclick="tbRegistrar()">Criar conta grátis</button>';
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
      // A sombra da foto usa a cor do dia e o estilo escolhidos na engrenagem.
      // Dia com foto mas sem curso usa azul-marinho (em vez de cinza).
      const sf = sombraFoto((ref || getCellColor(info)) ? refCor : '#1e3a6e');
      borderStyle=` style="border-color:${sf.borda}${sf.larg?`;border-width:${sf.larg}px`:''}${sf.brilho?`;box-shadow:${sf.brilho}`:''}"`;
      bg=`<img class="cal-bg-img" src="${fotoDoDia(info)}" alt="" decoding="async"><div class="cal-bg-overlay" style="background:${sf.overlay}"></div>`;
    } else if(ref || getCellColor(info)){ const e=estiloDia(refCor); borderStyle=` style="${e.style}"`; cls+=e.cls; }   // cor e estilo escolhidos na engrenagem
    cells+=`<div class="${cls}"${borderStyle} onclick="openDayModal('${key}')">
      ${bg}
      <div class="day-num">${d}</div>${sub}
      <button class="cal-img-add" onclick="event.stopPropagation();triggerCalImg('${key}')" title="Adicionar foto a este dia" aria-label="Adicionar foto a este dia"><svg class="ico-foto" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg></button>
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
  const l = document.getElementById('cal-ativo-lbl'); if(l) l.textContent = on ? 'Calendário ligado' : 'Calendário desligado';
  // calendário desligado: desenho + frase + botão (no lugar do antigo emoji de pausa)
  const msg = document.getElementById('cal-off-msg');
  if(msg) msg.innerHTML = on ? '' : telaVazia({desenho:'desligado', compacto:true, titulo:'Calendário desligado', texto:'Seus registros continuam salvos. Ligue de novo quando quiser voltar a usar o calendário.', botao:'Ligar o calendário', icone:false, acao:'toggleCalendarioAtivo()'});
  const s = document.getElementById('cal-ativo-sub'); if(s) s.textContent = on ? 'Ligado: você pode ver e registrar seus dias de estudo.' : 'Desligado: o calendário fica oculto. Seus dados continuam salvos.';
}
function toggleCalendarioAtivo(){
  state.calendarioAtivo = !calAtivo();
  saveState(); renderCalActive();
}
function renderCalActive(){ aplicarCalendarioAtivo(); atualizarAvisoVisitante(); if(!calAtivo()) return; if(calView==='year') renderYearCal(); else renderCal(); if(calView==='stats' && typeof renderEstatisticas==='function') renderEstatisticas(); if(typeof renderMateriasEstudo==='function') renderMateriasEstudo(); }
// 'month' · 'year' · 'stats' (Estatísticas — Pro, em calendario/estatisticas.js)
function setCalView(v){
  calView = v;
  document.getElementById('cal-view-month-btn').classList.toggle('active', v==='month');
  document.getElementById('cal-view-year-btn').classList.toggle('active', v==='year');
  const sb=document.getElementById('cal-view-stats-btn'); if(sb) sb.classList.toggle('active', v==='stats');
  document.getElementById('cal-month-view').style.display = v==='month' ? '' : 'none';
  document.getElementById('cal-year-view').style.display = v==='year' ? '' : 'none';
  const sv=document.getElementById('cal-stats-view'); if(sv) sv.style.display = v==='stats' ? '' : 'none';
  document.getElementById('cal-nav-month').style.display = v==='month' ? '' : 'none';
  document.getElementById('cal-nav-year').style.display = v==='year' ? '' : 'none';
  const cm=document.getElementById('cal-materias'); if(cm) cm.style.display = v==='stats' ? 'none' : '';
  renderCalActive();
}
function changeYear(delta){ state.year += delta; renderCalActive(); }
function getCellColor(info){
  if(!info) return '';
  if(info.estudos&&info.estudos.length){ const r=dayRefEstudo(info); return r?corCursoId(r.cursoId):''; }
  const areas=[info.ciencia,info.sefaz,info.direito,info.notario].filter(Boolean).length;
  if(areas===0 && !info.eletiva) return '';
  if(areas>1) return corArea('multi');
  for(const a of ['ciencia','sefaz','direito','notario','eletiva']) if(info[a]) return corArea(a);
  return '';
}
// Cor dos registros antigos (áreas fixas); a pessoa pode trocar na engrenagem (state.coresAreas)
const CORES_AREAS_PADRAO={ciencia:'#3567c8',sefaz:'#2f8a5c',direito:'#b5682b',notario:'#7a4bc2',eletiva:'#8a5cc8',multi:'#2f78b8'};
const NOMES_AREAS={ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário e Registrador',eletiva:'Eletiva',multi:'Mais de uma área no mesmo dia'};
function corArea(a){ return (state.coresAreas||{})[a] || CORES_AREAS_PADRAO[a]; }

// ── Cores do calendário (engrenagem ao lado de "Horas este mês") ──
const PALETAS=[
  {id:'vivas',    nome:'Vivas',    cores:['#2563eb','#0ea5e9','#06b6d4','#14b8a6','#16a34a','#65a30d','#ca8a04','#f97316','#dc2626','#e11d48','#db2777','#9333ea','#6d28d9','#475569','#1e3a6e','#111827']},
  {id:'pastel',   nome:'Pastel',   cores:['#93c5fd','#bae6fd','#a5f3fc','#99f6e4','#a7f3d0','#bbf7d0','#d9f99d','#fef08a','#fde68a','#fed7aa','#fecaca','#fbcfe8','#f5d0fe','#ddd6fe','#c7d2fe','#e2e8f0']},
  {id:'escuras',  nome:'Escuras',  cores:['#1e3a8a','#0c4a6e','#164e63','#134e4a','#14532d','#365314','#713f12','#7c2d12','#7f1d1d','#881337','#831843','#581c87','#3b0764','#1e293b','#292524','#0f172a']},
  {id:'neon',     nome:'Neon',     cores:['#00e5ff','#00b0ff','#2979ff','#651fff','#d500f9','#f500ff','#ff007f','#ff1744','#ff3d00','#ff9100','#ffea00','#c6ff00','#76ff03','#39ff14','#00ff9d','#1de9b6']},
  {id:'terrosas', nome:'Terrosas', cores:['#3d405b','#5e503f','#7f5539','#8b5e3c','#9c6644','#a0522d','#b5682b','#bc6c25','#c2843f','#b08968','#d4a373','#ddb892','#283618','#606c38','#6b705c','#81b29a']},
  {id:'oceano',   nome:'Oceano',   cores:['#03045e','#023e8a','#0077b6','#0096c7','#00b4d8','#48cae4','#90e0ef','#0a9396','#005f73','#94d2bd','#2a9d8f','#264653','#3a86ff','#4361ee','#4cc9f0','#7209b7']},
  {id:'por-do-sol',nome:'Pôr do sol',cores:['#ffbe0b','#fb8500','#ffb703','#f77f00','#fb5607','#e85d04','#d62828','#9d0208','#ff006e','#f72585','#b5179e','#8338ec','#560bad','#3a0ca3','#ef476f','#ffd166']},
  {id:'cinza',    nome:'Cinzas',   cores:['#f8fafc','#e2e8f0','#cbd5e1','#94a3b8','#64748b','#475569','#334155','#1e293b','#0f172a','#000000','#a8a29e','#78716c','#57534e','#44403c','#d4d4d8','#71717a']},
  {id:'profissional',nome:'Profissional',cores:['#1e3a8a','#1d4ed8','#0369a1','#0f766e','#15803d','#4d7c0f','#a16207','#b45309','#b91c1c','#9f1239','#86198f','#6b21a8','#4338ca','#334155','#0f172a','#525252']},
  {id:'floresta', nome:'Floresta', cores:['#052e16','#14532d','#166534','#15803d','#16a34a','#22c55e','#4ade80','#86efac','#365314','#4d7c0f','#65a30d','#84cc16','#3f6212','#1a2e05','#a3e635','#bef264']},
  {id:'lavanda',  nome:'Lavanda',  cores:['#2e1065','#4c1d95','#5b21b6','#6d28d9','#7c3aed','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe','#581c87','#7e22ce','#9333ea','#a855f7','#c084fc','#d8b4fe','#e9d5ff']},
  {id:'vinho',    nome:'Vinho',    cores:['#450a0a','#7f1d1d','#991b1b','#b91c1c','#881337','#9f1239','#be123c','#e11d48','#4a044e','#701a75','#86198f','#a21caf','#831843','#9d174d','#be185d','#db2777']},
  {id:'cafe',     nome:'Café',     cores:['#1c1917','#292524','#3b2a20','#4a3426','#5c4033','#6f4e37','#7f5539','#8d6748','#9c7a5b','#a98467','#b99470','#c8a27c','#d6b38f','#e3c6a6','#efdcc6','#f7ede2']},
  {id:'doces',    nome:'Doces',    cores:['#ff8fab','#ffb3c6','#ffc8dd','#fb6f92','#cdb4db','#bde0fe','#a2d2ff','#caffbf','#9bf6ff','#fdffb6','#ffd6a5','#ffadad','#e0aaff','#c77dff','#72efdd','#80ffdb']},
  {id:'retro',    nome:'Retrô',    cores:['#264653','#2a9d8f','#e9c46a','#f4a261','#e76f51','#606c38','#dda15e','#bc6c25','#8d99ae','#2b2d42','#ef233c','#d90429','#588157','#a3b18a','#3a5a40','#344e41']},
  {id:'nordico',  nome:'Nórdico',  cores:['#2e3440','#3b4252','#434c5e','#4c566a','#5e81ac','#81a1c1','#88c0d0','#8fbcbb','#a3be8c','#ebcb8b','#d08770','#bf616a','#b48ead','#d8dee9','#e5e9f0','#eceff4']},
  {id:'primavera',nome:'Primavera',cores:['#ffbe0b','#ff006e','#8338ec','#3a86ff','#06d6a0','#ef476f','#ffd166','#118ab2','#73d2de','#ff9f1c','#2ec4b6','#cbf3f0','#ffbf69','#e5989b','#b5838d','#6d6875']},
  {id:'outono',   nome:'Outono',   cores:['#7c2d12','#9a3412','#c2410c','#ea580c','#f97316','#fb923c','#b45309','#d97706','#f59e0b','#fbbf24','#78350f','#92400e','#a16207','#ca8a04','#713f12','#854d0e']},
  {id:'metalicas',nome:'Metálicas',cores:['#b08d57','#d4af37','#c0c0c0','#a8a9ad','#cd7f32','#b87333','#8c7853','#e5e4e2','#71706e','#aaa9ad','#d6c6a5','#9c7c38','#7a7a7a','#bdbdbd','#5c5c5c','#e0c097']},
  {id:'arcoiris', nome:'Arco-íris',cores:['#e81416','#ff6d00','#ffa500','#faeb36','#c6e03b','#79c314','#00b16a','#00c2c7','#00a3e0','#487de7','#4b369d','#70369d','#a03ea8','#d63aaf','#ff4f9a','#ff7b89']},
];
function paletaAtual(){ return PALETAS.find(p=>p.id===state.paletaCores) || PALETAS[0]; }
// Enquanto a janela está aberta tudo é só PRÉVIA; "Confirmar" salva, fechar sem confirmar desfaz.
let coresAntes=null;
function fotoCores(){ return JSON.stringify({estiloCal:state.estiloCal, paletaCores:state.paletaCores, coresAreas:state.coresAreas||null, cursos:(state.cursos||[]).map(c=>[c.id,c.cor])}); }
function abrirCores(){ coresAntes=fotoCores(); renderCores(); document.getElementById('cores-modal').classList.add('open'); }
function coresMudaram(){ return coresAntes!==null && fotoCores()!==coresAntes; }
function fecharCores(){
  if(coresMudaram()){
    const a=JSON.parse(coresAntes);
    if(a.estiloCal===undefined) delete state.estiloCal; else state.estiloCal=a.estiloCal;
    if(a.paletaCores===undefined) delete state.paletaCores; else state.paletaCores=a.paletaCores;
    if(a.coresAreas) state.coresAreas=a.coresAreas; else delete state.coresAreas;
    a.cursos.forEach(([id,cor])=>{ const c=(state.cursos||[]).find(x=>x.id===id); if(c) c.cor=cor; });
    redesenharCores();
  }
  coresAntes=null;
  document.getElementById('cores-modal').classList.remove('open');
}
function confirmarCores(){
  const mudou=coresMudaram();
  if(mudou) saveState();
  coresAntes=null;
  document.getElementById('cores-modal').classList.remove('open');
  const est=ESTILOS_CAL.find(e=>e.id===estiloCalAtual()).nome, pal=paletaAtual().nome;
  if(mudou) mostrarToast(`Cores salvas: ${est} · paleta ${pal}`);   // só confirma quando algo mudou
}
function redesenharCores(){ renderCalActive(); renderConteudos(); renderMural(); if(document.getElementById('cores-modal').classList.contains('open')) renderCores(); }
// Resumo embaixo da janela: o que está escolhido agora
function resumoCores(){
  const el=document.getElementById('cores-resumo'); if(!el) return;
  const est=ESTILOS_CAL.find(e=>e.id===estiloCalAtual()).nome, pal=paletaAtual().nome;
  el.innerHTML=`Estilo: <b>${est}</b> · Paleta: <b>${pal}</b>${coresMudaram()?' <span class="cores-pendente">· não salvo</span>':''}`;
}
function renderCores(){
  migrarCursos();
  const pal=paletaAtual();
  const linha=(tipo,id,nome,cor)=>`<div class="cor-linha">
      <label class="cor-amostra" style="background:${cor}" title="Escolher qualquer cor"><input type="color" value="${cor}" oninput="mudarCor('${tipo}','${id}',this.value,false)" onchange="mudarCor('${tipo}','${id}',this.value,true)" aria-label="Cor de ${escapeHtmlCarreira(nome)}"></label>
      <div class="cor-info"><b>${escapeHtmlCarreira(nome)}</b>
        <div class="cor-rapidas">${pal.cores.map(c=>`<button type="button" style="background:${c}" class="${c.toLowerCase()===String(cor).toLowerCase()?'sel':''}" onclick="mudarCor('${tipo}','${id}','${c}',true)" aria-label="Usar esta cor"></button>`).join('')}</div></div>
    </div>`;
  const cursos=(state.cursos||[]).map(c=>linha('curso',c.id,c.nome,corCurso(c))).join('');
  const usadas=new Set(); Object.values(state.days||{}).forEach(d=>{ if(!d) return; const n=AREAS_ORDEM.filter(a=>d[a]&&a!=='eletiva').length; AREAS_ORDEM.forEach(a=>{ if(d[a]) usadas.add(a); }); if(n>1) usadas.add('multi'); });
  const antigas=Object.keys(CORES_AREAS_PADRAO).filter(a=>usadas.has(a)).map(a=>linha('area',a,NOMES_AREAS[a],corArea(a))).join('');
  // Prévia dos estilos com as cores da própria pessoa (ou da paleta, se ainda não tem nada)
  const amostra=[...(state.cursos||[]).map(corCurso), ...pal.cores.filter((_,i)=>i%5===0)].slice(0,3);
  const atual=estiloCalAtual();
  const estilos=ESTILOS_CAL.map(es=>`<button type="button" class="estilo-op${es.id===atual?' sel':''}" onclick="mudarEstiloCal('${es.id}')" aria-pressed="${es.id===atual}">
      <div class="estilo-previa">${amostra.map((c,i)=>{ const e=estiloDia(c,es.id); return `<span class="prev-dia${e.cls}" style="${e.style}">${12+i}</span>`; }).join('')}</div>
      <span class="estilo-nome">${es.nome}</span></button>`).join('');
  const abas=PALETAS.map(p=>`<button type="button" class="paleta-aba${p.id===pal.id?' sel':''}" onclick="mudarPaleta('${p.id}')"><span class="paleta-mini">${p.cores.slice(0,4).map(c=>`<i style="background:${c}"></i>`).join('')}</span>${p.nome}</button>`).join('');
  document.getElementById('cores-lista').innerHTML =
    `<section class="dia-secao"><h4>Como os dias aparecem no calendário</h4><div class="estilos-grade">${estilos}</div></section>`
    +`<section class="dia-secao"><h4>Paletas de cores</h4><div class="paleta-abas">${abas}</div>`
    +((state.cursos||[]).length?`<button type="button" class="paleta-aplicar" onclick="aplicarPaleta()">Usar a paleta ${pal.nome} em tudo</button>`:'')+`</section>`
    +(cursos?`<section class="dia-secao"><h4>O que você está estudando</h4>${cursos}</section>`:telaVazia({desenho:'cursos', compacto:true, titulo:'Escolha as cores dos seus cursos', texto:'Adicione o que você está estudando e depois escolha uma cor para cada um.', botao:'Adicionar curso ou concurso', acao:'fecharCores();abrirAddMateria()'}))
    +(antigas?`<section class="dia-secao"><h4>Registros antigos</h4>${antigas}</section>`:'');
  resumoCores();
}
function mudarEstiloCal(id){ state.estiloCal=id; renderCalActive(); renderCores(); }
function mudarPaleta(id){ state.paletaCores=id; renderCores(); }
// Dá uma cor diferente da paleta escolhida para cada curso, em ordem
function aplicarPaleta(){
  const p=paletaAtual();   // pula de 5 em 5 (16 cores) para cores vizinhas não ficarem parecidas
  (state.cursos||[]).forEach((c,i)=>{ c.cor=p.cores[(i*5)%p.cores.length]; });
  redesenharCores();
}
// fim=false: enquanto arrasta na paleta completa; fim=true: escolheu (redesenha a janela).
// Nada é gravado aqui — só no botão Confirmar.
function mudarCor(tipo,id,cor,fim){
  if(tipo==='curso'){ const c=(state.cursos||[]).find(x=>x.id===id); if(c) c.cor=cor; }
  else { state.coresAreas=state.coresAreas||{}; state.coresAreas[id]=cor; }
  renderCalActive(); renderMateriasEstudo();
  if(fim) redesenharCores(); else resumoCores();
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
        } else if(color){
          const e=estiloDia(color,null,true); cellStyle=e.style; cellClass+=e.cls;
        }
      } else if(color){
        // Modo cores: só cores, no estilo escolhido na engrenagem
        const e=estiloDia(color,null,true); cellStyle=e.style; cellClass+=e.cls;
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

// ──────────────── JANELA DO DIA (abre já pronta para editar) ────────────────
// Estudos do dia · Foto do dia · Salvar. Dados antigos que a janela não mostra (Saúde, áreas antigas)
// são guardados como estavam ao salvar — nada se perde.
const DIA_SEMANA=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const DIA_AREAS_NOME={ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário e Registrador',eletiva:'Eletiva'};
const DIA_ICO={
  x:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  mais:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
  foto:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>',
};
let editEstudos=[], editImgSelecionada=null, editFotoMudou=false;

function openDayModal(key){
  if(!calAtivo()) return;
  currentDate=key;
  const [y,m,d]=key.split('-').map(Number);
  document.getElementById('day-modal-title').textContent=`${DIA_SEMANA[new Date(y,m-1,d).getDay()]}, ${d} de ${MESES[m-1].toLowerCase()} de ${y}`;
  diaCarregar(key);
  renderDayEditForm();
  document.getElementById('day-modal').classList.add('open');
}
// Copia o dia salvo para a edição (o que a pessoa muda só vai para o dia ao clicar em Salvar)
function diaCarregar(key){
  const info=state.days[key]||{};
  editEstudos=JSON.parse(JSON.stringify(info.estudos||[]));
  editImgSelecionada=fotoDoDia(info)||null; editFotoMudou=false;
}
function closeDayModal(){ document.getElementById('day-modal').classList.remove('open'); }
// nomes antigos, mantidos para quem ainda chama (Registrar hoje, testes): sempre recarrega o dia certo
function openDayEditForm(){ if(!currentDate) return; diaCarregar(currentDate); renderDayEditForm(); }
function closeDayEditForm(){ closeDayModal(); }

function editEstAdd(){ migrarCursos(); if(!state.cursos.length) return; editEstudos.push({cursoId:state.cursos[0].id,materiaId:'',horas:0,questoes:0}); renderDayEditForm(); }
function editEstRemover(i){ editEstudos.splice(i,1); renderDayEditForm(); }
function editEstChange(i,campo,v){ editEstudos[i][campo]=v; if(campo==='cursoId') editEstudos[i].materiaId=''; renderDayEditForm(); }
function editEstNum(i,campo,v){
  const n=Math.max(0, parseFloat(String(v).replace(',','.'))||0);   // nunca negativo
  editEstudos[i][campo]= campo==='questoes' ? Math.round(n) : arred1(n);
  diaAtualizarTotal();
}
// Registros antigos (áreas fixas) só aparecem para leitura e entram no total
function diaAreasAntigas(info){
  return AREAS_ORDEM.filter(a=>info[a]).map(a=>{
    const o=typeof info[a]==='object'?info[a]:{};
    let assunto=String(o.assunto||(a==='eletiva'?info.eletivaDesc:'')||'').trim();
    if(/^[-—–\s.]*$/.test(assunto)) assunto='';
    return {nome:DIA_AREAS_NOME[a], horas:Number(o.horas)||0, questoes:Number(o.questoes)||0, assunto};
  });
}
function diaAtualizarTotal(){
  const el=document.getElementById('dia-total'); if(!el) return;
  const antigas=diaAreasAntigas(state.days[currentDate]||{});
  const h=arred1(antigas.reduce((t,a)=>t+a.horas,0)+editEstudos.reduce((t,e)=>t+(Number(e.horas)||0),0));
  const q=antigas.reduce((t,a)=>t+a.questoes,0)+editEstudos.reduce((t,e)=>t+(Number(e.questoes)||0),0);
  el.innerHTML=`Total do dia: <b>${String(h).replace('.',',')}h</b> · <b>${q}</b> ${q===1?'questão':'questões'}`;
}
function renderDayEditForm(){
  migrarCursos();
  const cursos=state.cursos||[], info=state.days[currentDate]||{};
  const antigas=diaAreasAntigas(info);
  let linhas=antigas.map(a=>`<div class="dia-linha dia-antiga"><div class="dia-antiga-nome"><b>${escapeHtmlCarreira(a.nome)}</b>${a.assunto?`<span>${escapeHtmlCarreira(a.assunto)}</span>`:''}</div>
      <div class="dia-antiga-num">${String(a.horas).replace('.',',')}h${a.questoes?` · ${a.questoes}q`:''}</div></div>`).join('');
  linhas+=editEstudos.map((e,i)=>{
    const existe=cursos.some(c=>c.id===e.cursoId);
    const opCursos=(existe?'':`<option value="${escapeHtmlCarreira(e.cursoId)}" selected>${escapeHtmlCarreira(cursoNomeEst(e))} (curso removido)</option>`)
      +cursos.map(c=>`<option value="${c.id}"${c.id===e.cursoId?' selected':''}>${escapeHtmlCarreira(c.nome)}</option>`).join('');
    const mats=conteudosCustomDe(e.cursoId);
    const matExiste=!e.materiaId||mats.some(m=>m.id===e.materiaId);
    const opMats='<option value="">Matéria (opcional)</option>'
      +(matExiste?'':`<option value="${escapeHtmlCarreira(e.materiaId)}" selected>${escapeHtmlCarreira(materiaNome(e))}</option>`)
      +mats.map(m=>`<option value="${m.id}"${m.id===e.materiaId?' selected':''}>${escapeHtmlCarreira(m.nome)}</option>`).join('');
    return `<div class="dia-linha" style="--cor:${corCursoId(e.cursoId)}">
      <select aria-label="Curso" onchange="editEstChange(${i},'cursoId',this.value)">${opCursos}</select>
      <select aria-label="Matéria" onchange="editEstChange(${i},'materiaId',this.value)">${opMats}</select>
      <label class="dia-num"><input type="number" step="0.5" min="0" inputmode="decimal" value="${e.horas||''}" placeholder="0" oninput="editEstNum(${i},'horas',this.value)" aria-label="Horas"><span>h</span></label>
      <label class="dia-num"><input type="number" min="0" inputmode="numeric" value="${e.questoes||''}" placeholder="0" oninput="editEstNum(${i},'questoes',this.value)" aria-label="Questões"><span>q</span></label>
      <button type="button" class="dia-rem" onclick="editEstRemover(${i})" title="Remover este estudo" aria-label="Remover este estudo">${DIA_ICO.x}</button>
    </div>`;
  }).join('');
  const estudosHtml = cursos.length
    ? `${linhas||'<div class="dia-vazio">Nenhum estudo registrado neste dia.</div>'}
       <button type="button" class="dia-link" onclick="editEstAdd()">${DIA_ICO.mais} Adicionar estudo</button>`
    : `${linhas}<div class="dia-vazio">Para registrar, primeiro adicione o que você está estudando.</div>
       <button type="button" class="dia-link" onclick="closeDayModal();abrirAddMateria()">${DIA_ICO.mais} Adicionar curso ou concurso</button>`;
  const fotoHtml = editImgSelecionada
    ? `<div class="dia-foto"><img src="${editImgSelecionada}" alt="Foto do dia" title="Clique para ver em tamanho grande" style="cursor:zoom-in" onclick="mmVerImagem(this.src)"><div class="dia-foto-acoes">
         <button type="button" class="dia-link" onclick="document.getElementById('dia-foto-input').click()">Trocar</button>
         <button type="button" class="dia-link perigo" onclick="diaRemoverFoto()">Remover</button></div></div>`
    : `<button type="button" class="dia-link" onclick="document.getElementById('dia-foto-input').click()">${DIA_ICO.foto} Adicionar foto</button>`;
  const existe=!!state.days[currentDate];
  document.getElementById('day-edit-form').innerHTML=`
    <section class="dia-secao"><h4>Estudos do dia</h4>${estudosHtml}<div class="dia-total" id="dia-total"></div></section>
    <section class="dia-secao"><h4>Foto do dia</h4>${fotoHtml}</section>
    <div class="dia-rodape">
      ${existe?`<button type="button" class="dia-link perigo" onclick="diaRemoverDia()">Remover dia</button>`:'<span></span>'}
      <div class="dia-botoes"><button type="button" class="dia-btn" onclick="closeDayModal()">Cancelar</button>
        <button type="button" class="dia-btn principal" id="dia-salvar" onclick="saveDayEdit()">Salvar</button></div>
    </div>`;
  diaAtualizarTotal();
}
function diaFotoEscolhida(input){
  if(!input.files[0]) return;
  const f=input.files[0]; input.value='';
  comprimirImagem(f,src=>{ editImgSelecionada=src; editFotoMudou=true; renderDayEditForm(); });
}
function diaRemoverFoto(){ editImgSelecionada=null; editFotoMudou=true; renderDayEditForm(); }
async function diaRemoverDia(){ const k=currentDate; closeDayModal(); await deleteDay(k); }

async function saveDayEdit(){
  const key=currentDate; if(!key) return;
  const prev=state.days[key]||{};
  const novo={};
  if(prev.saude) novo.saude=prev.saude;                        // campo antigo: guardado como estava
  AREAS_ORDEM.forEach(a=>{ if(prev[a]) novo[a]=prev[a]; });
  if(prev.eletivaDesc) novo.eletivaDesc=prev.eletivaDesc;
  const kept=editEstudos.filter(e=>e.cursoId&&((e.horas||0)>0||(e.questoes||0)>0||e.materiaId));
  const est=kept.map(e=>({cursoId:e.cursoId,cursoNome:cursoNomeEst(e),materiaId:e.materiaId||'',materiaNome:materiaNome(e),horas:arred1(e.horas),questoes:Math.round(e.questoes||0)}));
  if(est.length) novo.estudos=est;
  novo.horasTotal=somaHorasPartes(novo);
  // Só bloqueia o que a pessoa digitou agora (registros antigos acima de 24h continuam editáveis)
  const horasDigitadas=est.reduce((t,e)=>t+e.horas,0);
  if(horasDigitadas>0 && novo.horasTotal>HORAS_MAX_DIA){
    await customAlert(`O total deste dia ficou em ${novo.horasTotal}h, mas um dia tem no máximo ${HORAS_MAX_DIA}h. Confira as horas antes de salvar.`);
    return;
  }
  if(editImgSelecionada){
    if(editFotoMudou){ novo.imgId=guardarFoto(editImgSelecionada); novo.usarImg=true; novo.imgEstudo=0; }
    else { // foto que já estava: guarda exatamente como era
      if(prev.imgId) novo.imgId=prev.imgId; else if(prev.imgSrc) novo.imgSrc=prev.imgSrc;
      if('usarImg' in prev) novo.usarImg=prev.usarImg;
      if('imgEstudo' in prev) novo.imgEstudo = prev.imgEstudo < Math.max(1,est.length) ? prev.imgEstudo : 0;
    }
  }
  if(diaVazio(novo)) delete state.days[key];
  else state.days[key]=novo;
  salvarCalendario();
  updateFoguinho(); renderCalActive(); renderMural(); renderConteudos();
  closeDayModal();
}

function changeMonth(d){
  state.month+=d;
  if(state.month>11){state.month=0;state.year++;}
  if(state.month<0){state.month=11;state.year--;}
  saveState(); renderCal();
}

// Números do topo do calendário — do mês aberto (visão Mês) ou do ano inteiro (visão Ano)
// Os 4 cartões do topo do calendário (decisão do Levi):
// 1) Dias estudados no total — todos os dias com estudo, nunca zera (= foguinho)
// 2) Dias estudados este mês — SEMPRE o mês de hoje (não muda ao navegar no calendário)
// 3) Horas estudadas no total — soma de TODAS as horas registradas, nunca zera
// 4) Média de horas por dia — horas do mês de hoje ÷ TODOS os dias do mês (30/31)
function updateStats(){
  const hoje = new Date();
  const { dias, horas } = resumoPeriodo(`${hoje.getFullYear()}-${String(hoje.getMonth()+1).padStart(2,'0')}`);
  const diasDoMes = new Date(hoje.getFullYear(), hoje.getMonth()+1, 0).getDate();
  const horasTotal = Object.values(state.days||{}).reduce((t,v)=>t+horasDoDia(v),0);
  const setEl=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setEl('stat-total', Object.values(state.days||{}).filter(isStudyDay).length); // mesmo número do foguinho
  setEl('stat-dias',dias);              setEl('stat-dias-sub', 'em '+MESES[hoje.getMonth()].toLowerCase());
  setEl('stat-horas-total', formatarHoras(horasTotal));
  setEl('stat-media', formatarHoras(horas/diasDoMes)); setEl('stat-media-sub', 'em '+MESES[hoje.getMonth()].toLowerCase());
}
// 3h → "3h" · 0,5h → "30min" · 1,25h → "1h 15min"
function formatarHoras(h){
  const min = Math.round((Number(h)||0)*60);
  if(min===0) return '0h';
  const hh = Math.floor(min/60), mm = min%60;
  return hh && mm ? `${hh}h ${mm}min` : hh ? `${hh}h` : `${mm}min`;
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
// Cor automática para um curso novo: a primeira da paleta que ninguém usa; depois, cores novas bem espaçadas
function proximaCor(){
  const usadas=new Set((state.cursos||[]).map(c=>(c.cor||'').toLowerCase()));
  const livre=MATERIA_CORES.find(c=>!usadas.has(c)); if(livre) return livre;
  const h=Math.round(((state.cursos||[]).length*137.508)%360), s=.62, l=.5;   // ângulo de ouro: cores sempre diferentes
  const f=n=>{ const k=(n+h/30)%12, a=s*Math.min(l,1-l); return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function renderMateriasEstudo(){
  const el=document.getElementById('cal-materias'); if(!el) return;
  migrarCursos();
  const lista=state.cursos||[];
  // cursos como "etiquetas" + botão claro para adicionar (antes era um "+" solto)
  el.innerHTML=lista.map(m=>`<div class="curso-chip"><span class="curso-chip-cor" style="background:${corCurso(m)}"></span>${escapeHtmlCarreira(m.nome)}<button type="button" class="curso-chip-x" onclick="removerMateria('${m.id}')" title="Remover (também sai de Conteúdos)" aria-label="Remover ${escapeHtmlCarreira(m.nome)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17"/></svg></button></div>`).join('')
   +`<button type="button" class="cal-add-curso" onclick="abrirAddMateria()" title="Adicionar o que você está estudando (também aparece em Conteúdos)">${ICO.mais} ${lista.length?'Adicionar':'Adicionar o que você está estudando'}</button>`;
}
function abrirAddMateria(){
  document.getElementById('nova-materia-nome').value='';
  cursoDica('nova-materia-nome','dica-materia');
  document.getElementById('add-materia-modal').classList.add('open');
  setTimeout(()=>document.getElementById('nova-materia-nome').focus(),50);
}
function fecharAddMateria(){ document.getElementById('add-materia-modal').classList.remove('open'); }
// O que a pessoa digitou → nome reconhecido (curso de faculdade / concurso) ou como escreveu
function criarMateria(){
  const digitado=document.getElementById('nova-materia-nome').value.trim().replace(/\s+/g,' ');
  if(!digitado){ customAlert('Digite o nome do que você está estudando.'); return; }
  const r=cursoReconhecido(digitado), nome=r?r.nome:digitado;
  migrarCursos();
  if(state.cursos.some(c=>bgNorm(c.nome)===bgNorm(nome))){ customAlert(`"${nome}" já está na sua lista (e em Conteúdos).`); return; }
  novoCursoCatalogo(nome);
  saveState(); renderMateriasEstudo(); renderConteudos(); renderCalActive(); fecharAddMateria();
}
async function removerMateria(id){ await excluirCurso(id); }
document.getElementById('add-materia-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddMateria(); });
