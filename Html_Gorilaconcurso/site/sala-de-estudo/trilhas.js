/* ════════════════════════════════════════════
   SALA DE ESTUDO — TRILHAS E CARREIRAS
   Trilhas fixas (Ciência de Dados, SEFAZ, Direito, Notário) e carreiras criadas por você.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// CARREIRAS PERSONALIZADAS (Trilhas de Estudo)
// ════════════════════════════════════════════
const CARREIRA_ICONES = ['🎯','📈','🧪','💻','🏦','🔬','🌐','🏗️','📐','🩺','🌾','🎨'];
const CARREIRA_CORES = ['blue','green','orange','purple'];

const TRILHAS_FIXAS_INFO = {
  ciencia: { cor:'blue',   arrow:'📊', icone:'🗄️', titulo:'Ciência de Dados',       desc:'Estácio — disciplinas, horas, questões, PDFs, progresso da grade curricular' },
  sefaz:   { cor:'green',  arrow:'🏛️', icone:'🧾', titulo:'SEFAZ SP',                desc:'Concurso fiscal — matérias, questões, horas, apostilas e progresso por disciplina' },
  direito: { cor:'orange', arrow:'⚖️', icone:'🔨', titulo:'Direito',                 desc:'Estudo jurídico geral — horas, questões, apostilas e acompanhamento de progresso' },
  notario: { cor:'purple', arrow:'🎓', icone:'✍️', titulo:'Notário e Registrador',   desc:'Concurso de cartório — matérias específicas, horas, questões e progresso' }
};

function renderTrilhasFixas(){
  const grid = document.getElementById('trilhas-fixas-grid');
  if(!grid) return;
  const ocultas = state.trilhasOcultas || [];
  const anchor = document.getElementById('carreiras-custom-grid');
  // remove cards fixos antigos (mantém o anchor de custom e o card de "+")
  grid.querySelectorAll('.trilha-fixa-card').forEach(el=>el.remove());
  const html = Object.keys(TRILHAS_FIXAS_INFO).filter(id=>!ocultas.includes(id)).map(id=>{
    const info = TRILHAS_FIXAS_INFO[id];
    return `<div class="home-card hc-${info.cor} trilha-fixa-card" onclick="openSection('${id}')">
      <span class="icon-emoji hc-arrow">${info.arrow}</span>
      <button class="hc-del-btn" onclick="event.stopPropagation();ocultarTrilhaFixa('${id}')" title="Remover esta trilha da tela inicial"><span class="icon-emoji">🗑️</span></button>
      <div class="hc-icon"><span class="icon-emoji">${info.icone}</span></div>
      <div class="hc-title">${info.titulo}</div>
      <div class="hc-desc">${info.desc}</div>
    </div>`;
  }).join('');
  anchor.insertAdjacentHTML('beforebegin', html);
}

async function ocultarTrilhaFixa(id){
  const info = TRILHAS_FIXAS_INFO[id];
  const quer = await customConfirm(`Remover "${info.titulo}" da tela inicial? Seus dados continuam salvos e você pode reativar quando quiser pelo botão "Adicionar carreira".`);
  if(!quer) return;
  state.trilhasOcultas = state.trilhasOcultas || [];
  if(!state.trilhasOcultas.includes(id)) state.trilhasOcultas.push(id);
  saveState();
  renderTrilhasFixas();
}

function reativarTrilhaFixa(id){
  state.trilhasOcultas = (state.trilhasOcultas||[]).filter(x=>x!==id);
  saveState();
  renderTrilhasFixas();
  fecharAddCarreira();
}

function renderCarreirasCustom(){
  const grid = document.getElementById('carreiras-custom-grid');
  if(!grid) return;
  const lista = state.trilhasCustom || [];
  grid.innerHTML = lista.map((c,i)=>{
    const done = (c.disciplinas||[]).filter(d=>d.feito).length;
    const total = (c.disciplinas||[]).length;
    const cor = CARREIRA_CORES[i % CARREIRA_CORES.length];
    return `<div class="home-card hc-${cor}" onclick="openSection('${c.id}')">
      <button class="hc-del-btn" onclick="event.stopPropagation();excluirCarreira('${c.id}')" title="Excluir carreira"><span class="icon-emoji">🗑️</span></button>
      <div class="hc-icon"><span class="icon-emoji">${c.icone||'🎯'}</span></div>
      <div class="hc-title">${c.nome}</div>
      <div class="hc-desc">${total>0 ? `${done}/${total} disciplinas concluídas` : 'Nenhuma disciplina adicionada ainda'}</div>
    </div>`;
  }).join('');
}

function abrirAddCarreira(){
  document.getElementById('nova-carreira-nome').value='';
  const iconGrid = document.getElementById('nova-carreira-icones');
  let selecionado = CARREIRA_ICONES[0];
  function draw(){
    iconGrid.innerHTML = CARREIRA_ICONES.map(ic=>`<button type="button" onclick="selecionarIconeCarreira('${ic}')" data-icone="${ic}" style="width:38px;height:38px;border-radius:8px;border:2px solid ${ic===selecionado?'var(--accent)':'var(--border)'};background:var(--surface-2);cursor:pointer;font-size:17px">${ic}</button>`).join('');
  }
  window.selecionarIconeCarreira = function(ic){ selecionado = ic; window._carreiraIconeSelecionado = ic; draw(); };
  window._carreiraIconeSelecionado = selecionado;
  draw();

  // Mostra trilhas fixas que foram removidas, pra reativar com um clique
  const ocultas = state.trilhasOcultas || [];
  const reativarBox = document.getElementById('reativar-trilhas-box');
  if(reativarBox){
    if(ocultas.length===0){
      reativarBox.style.display = 'none';
    } else {
      reativarBox.style.display = 'block';
      reativarBox.innerHTML = `
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">Ou reative uma trilha que você removeu:</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${ocultas.map(id=>{
            const info = TRILHAS_FIXAS_INFO[id];
            return `<button type="button" onclick="reativarTrilhaFixa('${id}')" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--surface-2);color:var(--text-primary);cursor:pointer;font-size:12px;display:flex;align-items:center;gap:5px">${info.icone} ${info.titulo}</button>`;
          }).join('')}
        </div>
      `;
    }
  }

  document.getElementById('add-carreira-modal').classList.add('open');
}
function fecharAddCarreira(){ document.getElementById('add-carreira-modal').classList.remove('open'); }

function criarCarreira(){
  const nome = document.getElementById('nova-carreira-nome').value.trim();
  if(!nome){ customAlert('Digite um nome para a carreira.'); return; }
  const carreira = {
    id: 'car_' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    nome, icone: window._carreiraIconeSelecionado || '🎯',
    disciplinas: []
  };
  state.trilhasCustom.push(carreira);
  saveState();
  renderCarreirasCustom();
  fecharAddCarreira();
}

async function excluirCarreira(id){
  const c = (state.trilhasCustom||[]).find(c=>c.id===id);
  if(!c) return;
  const quer = await customConfirm(`Excluir a carreira "${c.nome}"? Isso vai apagar todas as disciplinas dela.`);
  if(!quer) return;
  state.trilhasCustom = state.trilhasCustom.filter(c=>c.id!==id);
  saveState();
  renderCarreirasCustom();
  goHome();
}

let currentCarreiraId = null;

function renderCarreiraCustom(id){
  currentCarreiraId = id;
  const c = (state.trilhasCustom||[]).find(c=>c.id===id);
  if(!c) return;
  document.getElementById('carreira-titulo').textContent = c.nome;
  const lista = c.disciplinas || [];
  const done = lista.filter(d=>d.feito).length;
  const horas = lista.reduce((t,d)=>t+(Number(d.horas)||0),0);
  document.getElementById('carreira-stat-total').textContent = lista.length;
  document.getElementById('carreira-stat-done').textContent = done;
  document.getElementById('carreira-stat-horas').textContent = horas+'h';

  const el = document.getElementById('carreira-lista');
  el.innerHTML = lista.length ? lista.map(d=>`
    <div style="background:var(--surface-1);border:1px solid var(--border);border-radius:8px;padding:11px 13px;display:flex;align-items:center;gap:12px">
      <input type="checkbox" ${d.feito?'checked':''} onchange="toggleDisciplinaCarreira('${d.id}')" style="width:17px;height:17px;accent-color:var(--accent);cursor:pointer">
      <div style="flex:1;font-size:13.5px;font-weight:600;${d.feito?'text-decoration:line-through;color:var(--text-muted)':''}">${escapeHtmlCarreira(d.nome)}</div>
      <input type="number" min="0" step="0.5" value="${d.horas||0}" onchange="atualizarCampoDisciplina('${d.id}','horas',this.value)" style="width:56px;background:var(--surface-2);border:1px solid var(--border);border-radius:5px;color:var(--text-primary);font-size:12px;padding:5px;text-align:center" title="Horas">
      <button onclick="removerDisciplinaCarreira('${d.id}')" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:14px;padding:2px 6px;border-radius:5px">✕</button>
    </div>
  `).join('') : '<div style="text-align:center;padding:30px;color:var(--text-muted);font-size:13px">Nenhuma disciplina ainda. Adicione abaixo.</div>';
}

function escapeHtmlCarreira(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function adicionarDisciplinaCarreira(){
  const input = document.getElementById('carreira-nova-disciplina');
  const nome = input.value.trim();
  if(!nome || !currentCarreiraId) return;
  const c = state.trilhasCustom.find(c=>c.id===currentCarreiraId);
  if(!c) return;
  c.disciplinas.push({ id:'d'+Date.now().toString(36)+Math.random().toString(36).slice(2,5), nome, horas:0, feito:false });
  input.value='';
  saveState();
  renderCarreiraCustom(currentCarreiraId);
}
function toggleDisciplinaCarreira(id){
  const c = state.trilhasCustom.find(c=>c.id===currentCarreiraId);
  if(!c) return;
  const d = c.disciplinas.find(d=>d.id===id);
  if(d){ d.feito = !d.feito; saveState(); renderCarreiraCustom(currentCarreiraId); }
}
function atualizarCampoDisciplina(id,campo,val){
  const c = state.trilhasCustom.find(c=>c.id===currentCarreiraId);
  if(!c) return;
  const d = c.disciplinas.find(d=>d.id===id);
  if(d){ d[campo] = val===''?0:Number(val); saveState(); renderCarreiraCustom(currentCarreiraId); }
}
function removerDisciplinaCarreira(id){
  const c = state.trilhasCustom.find(c=>c.id===currentCarreiraId);
  if(!c) return;
  c.disciplinas = c.disciplinas.filter(d=>d.id!==id);
  saveState();
  renderCarreiraCustom(currentCarreiraId);
}

document.getElementById('add-carreira-modal').addEventListener('click',function(e){ if(e.target===this) fecharAddCarreira(); });
