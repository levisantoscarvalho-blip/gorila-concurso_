/* ════════════════════════════════════════════
   SALA DE ESTUDO — CONTEÚDOS E CURSOS
   Cursos, matérias e listas de conteúdos com progresso.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// CONTEÚDOS
// ════════════════════════════════════════════
const CONTEUDO_LISTAS = ['ciencia','sefaz','direito','notario'];

function conteudosCustomDe(trilha){
  return (state.conteudosCustom||[]).filter(c=>c.trilha===trilha);
}
function buildTrilhaList(trilha){
  const el=document.getElementById(trilha+'-list'); if(!el)return;
  const fixos = CONTEUDO_FIXO[trilha] || [];
  const fixedHtml = fixos.map((item,i)=>{
    const checked = (state.checks[trilha]||{})[i] || false;
    return `<label class="check-item${checked?' done':''}">
      <input type="checkbox" ${checked?'checked':''} onchange="toggleCheckFixo('${trilha}',${i},this)">
      <span>${item}</span></label>`;
  }).join('');
  const customs = conteudosCustomDe(trilha);
  const customHtml = customs.map(c=>`
    <label class="check-item${c.feito?' done':''}" style="display:flex;align-items:center;gap:8px">
      <input type="checkbox" ${c.feito?'checked':''} onchange="toggleConteudoCustom('${c.id}')">
      <span style="flex:1">${escapeHtmlCarreira(c.nome)}</span>
      <button type="button" onclick="event.preventDefault();excluirConteudoCustom('${c.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:13px;padding:2px 5px" title="Remover">✕</button>
    </label>`).join('');
  el.innerHTML = fixedHtml + customHtml;
}
function toggleCheckFixo(trilha, idx, inp){
  if(!state.checks[trilha]) state.checks[trilha] = {};
  state.checks[trilha][idx] = inp.checked;
  saveState();
  renderConteudos();
}
function toggleConteudoCustom(id){
  const c = (state.conteudosCustom||[]).find(c=>c.id===id);
  if(c){ c.feito = !c.feito; saveState(); renderConteudos(); }
}
function excluirConteudoCustom(id){
  state.conteudosCustom = (state.conteudosCustom||[]).filter(c=>c.id!==id);
  saveState();
  renderConteudos();
}
function updateProg(trilha, barId,lblId,pctId,unit){
  const fixos = CONTEUDO_FIXO[trilha] || [];
  const fixedDone = fixos.filter((_,i)=>(state.checks[trilha]||{})[i]).length;
  const customs = conteudosCustomDe(trilha);
  const customDone = customs.filter(c=>c.feito).length;
  const total = fixos.length + customs.length;
  const done = fixedDone + customDone;
  const pct = total>0 ? Math.round(done/total*100) : 0;
  const bar=document.getElementById(barId); if(bar) bar.style.width=pct+'%';
  const lbl=document.getElementById(lblId); if(lbl) lbl.textContent=`${done} / ${total} ${unit}`;
  const pctEl=document.getElementById(pctId); if(pctEl) pctEl.textContent=pct+'%';
}

// ── Modal: Adicionar conteúdo (pergunta pra qual trilha vai) ──
function fecharAddConteudo(){ document.getElementById('add-conteudo-modal').classList.remove('open'); }
function criarConteudo(){
  const nome = document.getElementById('novo-conteudo-nome').value.trim();
  const trilha = document.getElementById('novo-conteudo-trilha').value;
  if(!nome){ customAlert('Digite um nome para o conteúdo.'); return; }
  state.conteudosCustom = state.conteudosCustom || [];
  state.conteudosCustom.push({ id:'ct_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), nome, trilha, feito:false });
  saveState();
  renderConteudos();
  fecharAddConteudo();
}

document.getElementById('add-conteudo-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddConteudo(); });
// ── Cursos e matérias (Conteúdos) — tudo definido pela própria pessoa ──

function catalogoAcha(nome){ const n=bgNorm(nome||'').trim(); if(!n) return null; return CATALOGO.find(c=>bgNorm(c.nome)===n||(c.alias||[]).some(a=>bgNorm(a)===n))||null; }
function aplicarCatalogo(curso){
  const cat=catalogoAcha(curso.nome); if(!cat) return 0;
  state.conteudosCustom=state.conteudosCustom||[];
  let n=0;
  cat.m.forEach(mn=>{
    if(!state.conteudosCustom.some(x=>x.trilha===curso.id&&bgNorm(x.nome)===bgNorm(mn))){
      state.conteudosCustom.push({id:'ct_'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)+n,nome:mn,trilha:curso.id,feito:false,auto:true}); n++;
    }
  });
  curso.catalogo=cat.nome;
  return n;
}
function novoCursoCatalogo(nome,cor){
  migrarCursos();
  const c={id:'cu_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),nome,cor:cor||MATERIA_CORES[state.cursos.length%MATERIA_CORES.length]};
  state.cursos.push(c);
  return {curso:c,n:aplicarCatalogo(c)};
}
function catalogoPrev(inputId,prevId){
  const el=document.getElementById(prevId), inp=document.getElementById(inputId); if(!el||!inp) return;
  const v=inp.value.trim(), cat=catalogoAcha(v);
  el.innerHTML = cat ? `✓ <b>${escapeHtmlCarreira(cat.nome)}</b> (${cat.t==='concurso'?'concurso':'faculdade'}): ${cat.m.length} matérias entram automaticamente.` : (v?'Não está na lista pronta — você poderá adicionar as matérias manualmente.':'');
}
function catalogoEscolher(i,inputId,prevId){ document.getElementById(inputId).value=CATALOGO[i].nome; catalogoPrev(inputId,prevId); }
function catalogoChips(inputId,prevId,boxId){
  const box=document.getElementById(boxId); if(!box) return;
  const grupo=(t,rot)=>`<div class="np-sub" style="margin:8px 0 6px">${rot}</div><div class="np-chips" style="margin-bottom:6px">`+CATALOGO.map((c,i)=>c.t===t?`<button type="button" class="np-chip" onclick="catalogoEscolher(${i},'${inputId}','${prevId}')">${escapeHtmlCarreira(c.nome)}</button>`:'').join('')+'</div>';
  box.innerHTML=grupo('concurso','Concursos')+grupo('faculdade','Faculdades');
  catalogoPrev(inputId,prevId);
}
function carregarCatalogo(id){
  const c=(state.cursos||[]).find(c=>c.id===id); if(!c) return;
  const n=aplicarCatalogo(c); saveState(); renderConteudos();
  mostrarToast(n?`${n} matérias adicionadas automaticamente`:'Todas as matérias já estavam na lista');
}

function nomeCurso(id){ const c=(state.cursos||[]).find(c=>c.id===id); return c?c.nome:(CONTEUDO_TRILHAS[id]||id); }
function corCurso(c){ const i=(state.cursos||[]).indexOf(c); return (c&&c.cor)||MATERIA_CORES[(i<0?0:i)%MATERIA_CORES.length]; }
function migrarCursos(){
  state.cursos=state.cursos||[];
  if((state.materiasEstudo||[]).length){
    state.materiasEstudo.forEach(m=>{ if(!state.cursos.some(c=>bgNorm(c.nome)===bgNorm(m.nome))) state.cursos.push({id:m.id,nome:m.nome,cor:m.cor}); });
    state.materiasEstudo=[];
  }
  (state.conteudosCustom||[]).forEach(c=>{
    if(!state.cursos.some(x=>x.id===c.trilha) && CONTEUDO_TRILHAS[c.trilha]) state.cursos.push({id:c.trilha,nome:CONTEUDO_TRILHAS[c.trilha]});
  });
}
function todasTrilhasConteudo(){
  migrarCursos();
  return Array.from(new Set(['ciencia','sefaz','direito','notario'].concat(state.cursos.map(c=>c.id))));
}
function renderConteudos(){
  migrarCursos();
  const g=document.getElementById('cursos-grid'); if(!g) return;
  if(!state.cursos.length){
    g.innerHTML='<div class="empty-state"><span class="icon-emoji">🎓</span><p>Nenhum curso ainda. Clique em "Adicionar curso" (ex: Direito, Psicologia) e depois adicione as matérias de cada um.</p></div>';
    return;
  }
  g.innerHTML=state.cursos.map(c=>{
    const itens=conteudosCustomDe(c.id), done=itens.filter(i=>i.feito).length;
    const pct=itens.length?Math.round(done/itens.length*100):0;
    const lista=itens.map(i=>`<label class="check-item${i.feito?' done':''}" style="display:flex;align-items:center;gap:8px"><input type="checkbox" ${i.feito?'checked':''} onchange="toggleConteudoCustom('${i.id}')"><span style="flex:1">${escapeHtmlCarreira(i.nome)}</span>${horasDe(c.id,i.id)?`<span style="font-size:11px;color:var(--accent-text);font-weight:700;white-space:nowrap">${horasDe(c.id,i.id)}h</span>`:''}<button type="button" onclick="event.preventDefault();excluirConteudoCustom('${i.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:13px;padding:2px 5px" title="Remover">✕</button></label>`).join('');
    return `<div class="content-card" style="margin-bottom:0">
      <h3><span class="legend-dot" style="background:${corCurso(c)};flex-shrink:0"></span> ${escapeHtmlCarreira(c.nome)}<button type="button" class="card-add-btn" onclick="abrirAddConteudo('${c.id}')" title="Adicionar matéria"><span class="icon-emoji">➕</span></button>${(catalogoAcha(c.nome)&&!c.catalogo)?`<button type="button" class="card-add-btn" style="margin-left:6px" onclick="carregarCatalogo('${c.id}')" title="Carregar as matérias automáticas deste curso"><span class="icon-emoji">📥</span></button>`:''}<button type="button" class="card-add-btn" style="margin-left:6px" onclick="excluirCurso('${c.id}')" title="Excluir curso"><span class="icon-emoji">🗑️</span></button></h3>
      <div class="prog-row"><span>${done} / ${itens.length} matérias${horasDe(c.id)?` · ${horasDe(c.id)}h estudadas`:''}</span><span>${pct}%</span></div>
      <div class="prog-bar-wrap"><div class="prog-bar" style="width:${pct}%"></div></div>
      ${lista||'<div style="font-size:11px;color:var(--text-muted);margin-top:6px">Nenhuma matéria ainda — clique no ➕ do curso.</div>'}
    </div>`;
  }).join('');
}
function abrirAddCurso(){
  document.getElementById('novo-curso-nome').value='';
  catalogoChips('novo-curso-nome','catalogo-prev-curso','catalogo-chips-curso');
  document.getElementById('add-curso-modal').classList.add('open');
  setTimeout(()=>document.getElementById('novo-curso-nome').focus(),50);
}
function fecharAddCurso(){ document.getElementById('add-curso-modal').classList.remove('open'); }
function criarCurso(){
  const nome=document.getElementById('novo-curso-nome').value.trim();
  if(!nome){ customAlert('Digite o nome do curso.'); return; }
  migrarCursos();
  if(state.cursos.some(c=>bgNorm(c.nome)===bgNorm(nome))){ customAlert('Esse curso já existe na sua lista.'); return; }
  const r=novoCursoCatalogo(nome);
  saveState(); renderConteudos(); renderMateriasEstudo(); fecharAddCurso();
  if(r.n) mostrarToast(`${r.n} matérias adicionadas automaticamente`);
}
async function excluirCurso(id){
  const quer=await customConfirm(`Excluir o curso "${nomeCurso(id)}" e todas as matérias dele?`);
  if(!quer) return;
  state.cursos=(state.cursos||[]).filter(c=>c.id!==id);
  state.conteudosCustom=(state.conteudosCustom||[]).filter(c=>c.trilha!==id);
  saveState(); renderConteudos(); renderMateriasEstudo();
}
function abrirAddConteudo(cursoId){
  migrarCursos();
  if(!state.cursos.length){ customAlert('Crie um curso primeiro (ex: Direito, Psicologia).'); abrirAddCurso(); return; }
  document.getElementById('novo-conteudo-nome').value='';
  const sel=document.getElementById('novo-conteudo-trilha');
  sel.innerHTML=state.cursos.map(c=>`<option value="${c.id}">${escapeHtmlCarreira(c.nome)}</option>`).join('');
  if(cursoId && state.cursos.some(c=>c.id===cursoId)) sel.value=cursoId;
  document.getElementById('add-conteudo-modal').classList.add('open');
  setTimeout(()=>document.getElementById('novo-conteudo-nome').focus(),50);
}
document.getElementById('add-curso-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddCurso(); });
