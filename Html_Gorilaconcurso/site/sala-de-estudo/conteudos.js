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
  const digitado = document.getElementById('novo-conteudo-nome').value.trim().replace(/\s+/g,' ');
  const trilha = document.getElementById('novo-conteudo-trilha').value;
  if(!digitado){ customAlert('Digite o nome da matéria.'); return; }
  const conhecida = materiaReconhecida(digitado);
  const nome = conhecida || digitado;           // matéria conhecida fica sempre com o mesmo nome
  state.conteudosCustom = state.conteudosCustom || [];
  if(state.conteudosCustom.some(x=>x.trilha===trilha && bgNorm(x.nome)===bgNorm(nome))){
    customAlert(`"${nome}" já está neste curso.`); return;
  }
  state.conteudosCustom.push({ id:'ct_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), nome, trilha, feito:false });
  saveState();
  renderConteudos();
  fecharAddConteudo();
  if(conhecida && bgNorm(conhecida)!==bgNorm(digitado)) mostrarToast(`Matéria reconhecida: ${conhecida}`);
}

// ── Matérias que o sistema reconhece (lista em banco-de-dados/catalogo-concursos.js) ──
let _materiasConhecidas=null;
function materiasConhecidas(){
  if(_materiasConhecidas) return _materiasConhecidas;
  const nomes=new Set(MATERIAS_EXTRAS);
  CATALOGO.forEach(c=>(c.m||[]).forEach(m=>nomes.add(m)));
  Object.keys(MATERIAS_APELIDOS).forEach(m=>nomes.add(m));
  _materiasConhecidas=[...nomes].sort((a,b)=>a.localeCompare(b,'pt-BR')).map(nome=>({nome, chaves:[bgNorm(nome), ...(MATERIAS_APELIDOS[nome]||[]).map(bgNorm)]}));
  return _materiasConhecidas;
}
// "portugues" → "Língua Portuguesa"; "matematica" → "Matemática"; nome desconhecido → null
function materiaReconhecida(texto){
  const n=bgNorm(texto||'').trim(); if(!n) return null;
  const m=materiasConhecidas().find(x=>x.chaves.includes(n));
  return m ? m.nome : null;
}
// Sugestões enquanto a pessoa digita (até 6)
function materiaSugerir(){
  const inp=document.getElementById('novo-conteudo-nome'), box=document.getElementById('materia-sugestoes'); if(!inp||!box) return;
  const n=bgNorm(inp.value).trim();
  if(n.length<2){ box.innerHTML=''; return; }
  const exata=materiaReconhecida(inp.value);
  const comeca=x=>x.chaves.some(k=>k.startsWith(n) || k.split(' ').some(p=>p.startsWith(n)));
  const lista=materiasConhecidas().filter(x=>x.nome!==exata && comeca(x)).slice(0, exata?5:6);
  box.innerHTML=(exata?`<div class="mat-ok">✓ Matéria reconhecida: <b>${escapeHtmlCarreira(exata)}</b></div>`:'')
    +(lista.length?`<div class="mat-sug">${lista.map(x=>`<button type="button" class="np-chip" onclick="materiaEscolher(this.textContent)">${escapeHtmlCarreira(x.nome)}</button>`).join('')}</div>`:'');
}
function materiaEscolher(nome){ const inp=document.getElementById('novo-conteudo-nome'); inp.value=nome; materiaSugerir(); inp.focus(); }

document.getElementById('add-conteudo-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddConteudo(); });
// ── Cursos e matérias (Conteúdos) — tudo definido pela própria pessoa ──

function novoCursoCatalogo(nome,cor){
  migrarCursos();
  const c={id:'cu_'+Date.now().toString(36)+Math.random().toString(36).slice(2,5),nome,cor:cor||proximaCor()};   // cor: muda na engrenagem do menu
  state.cursos.push(c);
  // As matérias NÃO entram sozinhas: cada instituição/edital tem a sua grade — a pessoa adiciona as dela.
  return {curso:c,n:0};
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
    g.innerHTML='<div class="empty-state"><p>Nenhum curso ainda. Clique em "Adicionar curso" (ex: Direito, Psicologia) e depois adicione as matérias de cada um.</p></div>';
    return;
  }
  g.innerHTML=state.cursos.map(c=>{
    const itens=conteudosCustomDe(c.id), done=itens.filter(i=>i.feito).length;
    const pct=itens.length?Math.round(done/itens.length*100):0;
    const lista=itens.map(i=>`<label class="check-item${i.feito?' done':''}" style="display:flex;align-items:center;gap:8px"><input type="checkbox" ${i.feito?'checked':''} onchange="toggleConteudoCustom('${i.id}')"><span style="flex:1">${escapeHtmlCarreira(i.nome)}</span>${horasDe(c.id,i.id)?`<span style="font-size:11px;color:var(--accent-text);font-weight:700;white-space:nowrap">${horasDe(c.id,i.id)}h</span>`:''}<button type="button" onclick="event.preventDefault();excluirConteudoCustom('${i.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:13px;padding:2px 5px" title="Remover">✕</button></label>`).join('');
    return `<div class="content-card" style="margin-bottom:0">
      <h3><span class="legend-dot" style="background:${corCurso(c)};flex-shrink:0"></span> ${escapeHtmlCarreira(c.nome)}<button type="button" class="card-add-btn" onclick="abrirAddConteudo('${c.id}')" title="Adicionar matéria" aria-label="Adicionar matéria"><svg class="ico-card" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><button type="button" class="card-add-btn perigo" style="margin-left:6px" onclick="excluirCurso('${c.id}')" title="Excluir curso" aria-label="Excluir curso"><svg class="ico-card" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg></button></h3>
      <div class="prog-row"><span>${done} / ${itens.length} matérias${horasDe(c.id)?` · <b class="prog-horas">${horasDe(c.id)}h estudadas</b>`:''}</span><span>${pct}%</span></div>
      <div class="prog-bar-wrap"><div class="prog-bar" style="width:${pct}%"></div></div>
      ${lista||'<div style="font-size:11px;color:var(--text-muted);margin-top:6px">Nenhuma matéria ainda — clique no + do curso.</div>'}
    </div>`;
  }).join('');
}
function abrirAddCurso(){
  document.getElementById('novo-curso-nome').value='';
  cursoDica('novo-curso-nome','dica-curso');
  document.getElementById('add-curso-modal').classList.add('open');
  setTimeout(()=>document.getElementById('novo-curso-nome').focus(),50);
}
function fecharAddCurso(){ document.getElementById('add-curso-modal').classList.remove('open'); }
function criarCurso(){
  const digitado=document.getElementById('novo-curso-nome').value.trim().replace(/\s+/g,' ');
  if(!digitado){ customAlert('Digite o nome do curso.'); return; }
  const r=cursoReconhecido(digitado), nome=r?r.nome:digitado;   // reconhecido → nome padronizado
  migrarCursos();
  if(state.cursos.some(c=>bgNorm(c.nome)===bgNorm(nome))){ customAlert(`"${nome}" já está na sua lista.`); return; }
  novoCursoCatalogo(nome);
  saveState(); renderConteudos(); renderMateriasEstudo(); fecharAddCurso();
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
  document.getElementById('novo-conteudo-nome').value=''; materiaSugerir();
  const sel=document.getElementById('novo-conteudo-trilha');
  sel.innerHTML=state.cursos.map(c=>`<option value="${c.id}">${escapeHtmlCarreira(c.nome)}</option>`).join('');
  if(cursoId && state.cursos.some(c=>c.id===cursoId)) sel.value=cursoId;
  document.getElementById('add-conteudo-modal').classList.add('open');
  setTimeout(()=>document.getElementById('novo-conteudo-nome').focus(),50);
}
document.getElementById('add-curso-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddCurso(); });
