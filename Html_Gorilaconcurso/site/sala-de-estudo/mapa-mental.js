/* ════════════════════════════════════════════
   SALA DE ESTUDO — MAPA MENTAL
   Tópicos e subtópicos com texto e imagem.
   ════════════════════════════════════════════ */

// ── Mapa Mental (tópicos e subtópicos, estilo lista expansível) ──
function mmGarantirEstado(){
  if(!state.mindMap || !Array.isArray(state.mindMap.topicos)) state.mindMap = { topicos: [] };
}

function abrirMindMap(){
  mmGarantirEstado();
  document.getElementById('mindmap-modal').classList.add('open');
  mmRenderLista();
}
function fecharMindMap(){
  document.getElementById('mindmap-modal').classList.remove('open');
  const visivel = document.querySelector('.tab-content.active');
  if(visivel){
    const idVisivel = visivel.id.replace('tab-','');
    document.querySelectorAll('.sidebar .nav-item').forEach(n=>n.classList.toggle('active', n.dataset.tab===idVisivel));
  }
}

function mmNovoId(){ return 'mm_' + Date.now() + '_' + Math.floor(Math.random()*10000); }
function mmEscape(str){ const d = document.createElement('div'); d.textContent = str || ''; return d.innerHTML; }

function mmRenderLista(){
  mmGarantirEstado();
  const cont = document.getElementById('mindmap-list');
  if(!cont) return;
  const topicos = state.mindMap.topicos;
  if(topicos.length === 0){
    cont.innerHTML = '<div style="text-align:center;color:var(--text-muted);font-size:13px;padding:40px 10px">Nenhum tópico ainda. Clique em "Novo tópico" para começar.</div>';
    return;
  }
  cont.innerHTML = topicos.map(t => mmRenderTopico(t)).join('');
}

function mmRenderTopico(t){
  const aberto = !!t.aberto;
  const subs = t.subtopicos || [];
  const feitos = subs.filter(s => (s.texto && s.texto.trim()) || s.imagem).length;
  return `
  <div class="mm-topico-card" style="background:var(--surface-1);border:1px solid var(--border);border-radius:14px;margin-bottom:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,.08)">
    <div style="display:flex;align-items:center;gap:12px;padding:16px 20px;cursor:pointer" onclick="mmToggleTopico('${t.id}')">
      <span style="font-size:15px;color:var(--text-secondary);width:16px;text-align:center">${aberto ? '⌄' : '⌃'}</span>
      <div style="flex:1;font-size:16px;font-weight:700;color:var(--text-primary)">${mmEscape(t.nome)}</div>
      <span style="font-size:12px;color:var(--text-muted);font-weight:600">${feitos}/${subs.length} preenchidos</span>
      <button title="Renomear" onclick="event.stopPropagation();mmRenomearTopico('${t.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:13px;padding:2px">${ICO.lapis}</button>
      <button title="Excluir tópico" onclick="event.stopPropagation();mmExcluirTopico('${t.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:13px;padding:2px">${ICO.lixo}</button>
    </div>
    ${aberto ? `
    <div style="border-top:1px solid var(--border)">
      ${subs.map(s => mmRenderSubtopico(t.id, s)).join('')}
      <div style="padding:12px 20px">
        <button onclick="mmNovoSubtopico('${t.id}')" style="padding:8px 14px;background:var(--surface-2);border:1px solid var(--border);border-radius:8px;color:var(--text-secondary);font-size:12px;font-weight:600;cursor:pointer">${ICO.mais} Adicionar subtópico</button>
      </div>
    </div>` : ''}
  </div>`;
}

function mmRenderSubtopico(topicoId, s){
  const aberto = !!s.aberto;
  const temTexto = !!(s.texto && s.texto.trim());
  const temConteudo = temTexto || s.imagem;
  const editando = s.editando !== false && !temTexto ? true : !!s.editando;
  const marcador = temConteudo
    ? `<span style="width:20px;height:20px;border-radius:6px;background:var(--success);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">✓</span>`
    : `<span style="width:20px;height:20px;border-radius:6px;border:2px solid var(--border-strong);flex-shrink:0"></span>`;
  return `
  <div style="border-bottom:1px solid var(--border)">
    <div style="display:flex;align-items:center;gap:12px;padding:13px 20px;cursor:pointer" onclick="mmToggleSubtopico('${topicoId}','${s.id}')">
      ${marcador}
      <div style="flex:1;font-size:14px;color:var(--text-primary)">${mmEscape(s.nome)}</div>
      ${s.imagem ? `<button title="Ver imagem" onclick="event.stopPropagation();mmVerImagem('${s.imagem.replace(/'/g,"\\'")}')" style="background:none;border:none;color:var(--accent-text);cursor:pointer;font-size:14px;padding:2px">${ICO.imagem}</button>` : ''}
      <button title="Renomear" onclick="event.stopPropagation();mmRenomearSubtopico('${topicoId}','${s.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:2px">${ICO.lapis}</button>
      <button title="Excluir subtópico" onclick="event.stopPropagation();mmExcluirSubtopico('${topicoId}','${s.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:12px;padding:2px">${ICO.lixo}</button>
      <span style="font-size:15px;color:var(--accent-text);transform:rotate(${aberto ? '90deg' : '0deg'});transition:transform .15s;display:inline-block">›</span>
    </div>
    ${aberto ? `
    <div style="padding:6px 20px 18px 52px;display:flex;flex-direction:column;gap:10px;background:var(--surface-2)">
      ${editando ? `
      <textarea id="mm-textarea-${s.id}" placeholder="Escreva aqui o conteúdo desse subtópico..." style="width:100%;min-height:110px;padding:10px;border-radius:8px;border:1px solid var(--border);background:var(--surface-1);color:var(--text-primary);font-size:13px;font-family:inherit;resize:vertical">${mmEscape(s.texto || '')}</textarea>
      <div style="display:flex;gap:8px">
        <button onclick="mmSalvarTextoBtn('${topicoId}','${s.id}')" style="padding:8px 16px;background:var(--accent);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">${ICO.check} Salvar texto</button>
        ${temTexto ? `<button onclick="mmCancelarEdicaoTexto('${topicoId}','${s.id}')" style="padding:8px 16px;background:var(--surface-1);color:var(--text-secondary);border:1px solid var(--border);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">Cancelar</button>` : ''}
      </div>
      ` : `
      <div style="background:var(--surface-1);border:1px solid var(--border);border-radius:8px;padding:12px;white-space:pre-wrap;font-size:13px;color:var(--text-primary);line-height:1.5">${mmEscape(s.texto)}</div>
      <button onclick="mmEditarTexto('${topicoId}','${s.id}')" style="padding:8px 16px;background:var(--surface-1);color:var(--text-secondary);border:1px solid var(--border);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;width:fit-content">${ICO.lapis} Editar texto</button>
      `}
      <div>
        ${s.imagem ? `<div style="position:relative;display:inline-block"><img src="${s.imagem}" style="max-width:100%;max-height:200px;border-radius:8px;display:block;cursor:zoom-in" onclick="mmVerImagem('${s.imagem.replace(/'/g,"\\'")}')"><button onclick="event.stopPropagation();mmVerImagem('${s.imagem.replace(/'/g,"\\'")}')" style="position:absolute;top:6px;right:66px;background:rgba(0,0,0,.6);border:none;color:#fff;border-radius:6px;padding:3px 7px;font-size:11px;cursor:pointer">${ICO.lupa} Ver imagem</button><button onclick="event.stopPropagation();mmRemoverImagem('${topicoId}','${s.id}')" style="position:absolute;top:6px;right:6px;background:rgba(0,0,0,.6);border:none;color:#fff;border-radius:6px;padding:3px 7px;font-size:11px;cursor:pointer">remover</button></div>` : ''}
      </div>
      <label style="display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--text-secondary);cursor:pointer;background:var(--surface-1);border:1px solid var(--border);border-radius:8px;padding:7px 12px;width:fit-content">
        ${ICO.imagem} ${s.imagem ? 'Trocar imagem' : 'Adicionar imagem'}
        <input type="file" accept="image/*" style="display:none" onchange="mmUploadImagem('${topicoId}','${s.id}', this)">
      </label>
    </div>` : ''}
  </div>`;
}

function mmToggleTopico(id){
  const t = state.mindMap.topicos.find(t=>t.id===id);
  if(!t) return;
  t.aberto = !t.aberto;
  mmRenderLista();
}
function mmToggleSubtopico(topicoId, subId){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  s.aberto = !s.aberto;
  mmRenderLista();
}

function mmSalvarTextoBtn(topicoId, subId){
  const ta = document.getElementById('mm-textarea-'+subId);
  if(!ta) return;
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  s.texto = ta.value;
  s.editando = false;
  saveState();
  mostrarAvisoSalvamento(true);
  mmRenderLista();
}
function mmEditarTexto(topicoId, subId){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  s.editando = true;
  mmRenderLista();
  setTimeout(()=>{ const ta = document.getElementById('mm-textarea-'+subId); if(ta) ta.focus(); }, 30);
}
function mmCancelarEdicaoTexto(topicoId, subId){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  s.editando = false;
  mmRenderLista();
}

function mmSalvarTexto(topicoId, subId, texto){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  s.texto = texto;
  saveState();
}


function mmUploadImagem(topicoId, subId, input){
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e)=>{
    const t = state.mindMap.topicos.find(t=>t.id===topicoId);
    if(!t) return;
    const s = (t.subtopicos||[]).find(s=>s.id===subId);
    if(!s) return;
    s.imagem = e.target.result;
    saveState();
    mmRenderLista();
  };
  reader.readAsDataURL(file);
}
function mmRemoverImagem(topicoId, subId){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  s.imagem = null;
  saveState();
  mmRenderLista();
}

function mmVerImagem(src){
  document.getElementById('mm-lightbox-img').src = src;
  document.getElementById('mm-lightbox-modal').classList.add('open');
}
function mmFecharLightbox(){
  document.getElementById('mm-lightbox-modal').classList.remove('open');
  document.getElementById('mm-lightbox-img').src = '';
}

async function mmExcluirTopico(id){
  const quer = await customConfirm('Excluir este tópico e todos os subtópicos dele?');
  if(!quer) return;
  state.mindMap.topicos = state.mindMap.topicos.filter(t=>t.id!==id);
  saveState();
  mmRenderLista();
}
async function mmExcluirSubtopico(topicoId, subId){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const quer = await customConfirm('Excluir este subtópico?');
  if(!quer) return;
  t.subtopicos = (t.subtopicos||[]).filter(s=>s.id!==subId);
  saveState();
  mmRenderLista();
}

// ── Modal auxiliar de nome (novo tópico / novo subtópico / renomear) ──
let mmNomeContexto = null; // {tipo:'topico'|'subtopico'|'renomear-topico'|'renomear-subtopico', topicoId, subId}

function mmNovoTopico(){
  mmNomeContexto = { tipo: 'topico' };
  document.getElementById('mm-nome-titulo').textContent = 'Novo tópico';
  document.getElementById('mm-nome-input').value = '';
  document.getElementById('mm-nome-modal').classList.add('open');
  setTimeout(()=>document.getElementById('mm-nome-input').focus(), 50);
}
function mmNovoSubtopico(topicoId){
  mmNomeContexto = { tipo: 'subtopico', topicoId };
  document.getElementById('mm-nome-titulo').textContent = 'Novo subtópico';
  document.getElementById('mm-nome-input').value = '';
  document.getElementById('mm-nome-modal').classList.add('open');
  setTimeout(()=>document.getElementById('mm-nome-input').focus(), 50);
}
function mmRenomearTopico(id){
  const t = state.mindMap.topicos.find(t=>t.id===id);
  if(!t) return;
  mmNomeContexto = { tipo: 'renomear-topico', topicoId: id };
  document.getElementById('mm-nome-titulo').textContent = 'Renomear tópico';
  document.getElementById('mm-nome-input').value = t.nome;
  document.getElementById('mm-nome-modal').classList.add('open');
  setTimeout(()=>document.getElementById('mm-nome-input').focus(), 50);
}
function mmRenomearSubtopico(topicoId, subId){
  const t = state.mindMap.topicos.find(t=>t.id===topicoId);
  if(!t) return;
  const s = (t.subtopicos||[]).find(s=>s.id===subId);
  if(!s) return;
  mmNomeContexto = { tipo: 'renomear-subtopico', topicoId, subId };
  document.getElementById('mm-nome-titulo').textContent = 'Renomear subtópico';
  document.getElementById('mm-nome-input').value = s.nome;
  document.getElementById('mm-nome-modal').classList.add('open');
  setTimeout(()=>document.getElementById('mm-nome-input').focus(), 50);
}
function mmFecharNomeModal(){
  document.getElementById('mm-nome-modal').classList.remove('open');
  mmNomeContexto = null;
}
function mmConfirmarNome(){
  const nome = document.getElementById('mm-nome-input').value.trim();
  if(!nome || !mmNomeContexto) { mmFecharNomeModal(); return; }
  mmGarantirEstado();
  if(mmNomeContexto.tipo === 'topico'){
    state.mindMap.topicos.push({ id: mmNovoId(), nome, aberto: true, subtopicos: [] });
  } else if(mmNomeContexto.tipo === 'subtopico'){
    const t = state.mindMap.topicos.find(t=>t.id===mmNomeContexto.topicoId);
    if(t){
      if(!t.subtopicos) t.subtopicos = [];
      t.subtopicos.push({ id: mmNovoId(), nome, aberto: true, texto: '', imagem: null });
      t.aberto = true;
    }
  } else if(mmNomeContexto.tipo === 'renomear-topico'){
    const t = state.mindMap.topicos.find(t=>t.id===mmNomeContexto.topicoId);
    if(t) t.nome = nome;
  } else if(mmNomeContexto.tipo === 'renomear-subtopico'){
    const t = state.mindMap.topicos.find(t=>t.id===mmNomeContexto.topicoId);
    if(t){
      const s = (t.subtopicos||[]).find(s=>s.id===mmNomeContexto.subId);
      if(s) s.nome = nome;
    }
  }
  saveState();
  mmFecharNomeModal();
  mmRenderLista();
}
