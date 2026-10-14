/* ════════════════════════════════════════════
   CALENDÁRIO — MURAL DO MÊS
   1º escolhe o mês → 2º calendário do mês (dias estudados coloridos) → 3º "Você fez" (o dia clicado).
   ════════════════════════════════════════════ */

// Mês/dia escolhidos no mural (independentes do calendário; começam no mês aberto lá)
let muralAno=null, muralMes=null, muralDia=null;

const MURAL_AREAS = {
  ciencia:{ nome:'Ciência de Dados',      cor:'#3567c8' },
  sefaz:  { nome:'SEFAZ SP',              cor:'#2f8a5c' },
  direito:{ nome:'Direito',               cor:'#b5682b' },
  notario:{ nome:'Notário e Registrador', cor:'#7a4bc2' },
  eletiva:{ nome:'Eletiva',               cor:'#8a5cc8' },
};
const MURAL_DIAS_SEMANA = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const MURAL_ICO = {
  editar:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/></svg>',
  lixo:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/></svg>',
  mais:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
};

function muralChave(a,m){ return `${a}-${String(m+1).padStart(2,'0')}`; }
function muralFmtHoras(h){ return String(arred1(h||0)).replace('.',',')+'h'; }

// O que foi estudado num dia, em linhas simples: {nome, detalhe, horas, questoes, texto, cor}
function muralItensDoDia(v){
  const itens=[];
  AREAS_ORDEM.forEach(a=>{
    const x=v[a]; if(!x) return;
    const o = typeof x==='object' ? x : {};
    let texto = String(o.assunto || (a==='eletiva' ? v.eletivaDesc : '') || '').trim();
    if(/^[-—–\s.]*$/.test(texto)) texto=''; // registros antigos guardavam só um traço quando não havia assunto
    itens.push({ nome:MURAL_AREAS[a].nome, detalhe:'', horas:Number(o.horas)||0, questoes:Number(o.questoes)||0, texto, cor:corArea(a) });
  });
  (v.estudos||[]).forEach(e=>{
    itens.push({ nome:cursoNomeEst(e), detalhe:materiaNome(e), horas:Number(e.horas)||0, questoes:Number(e.questoes)||0, texto:'', cor:corCursoId(e.cursoId) });
  });
  return itens;
}
// Cor de um dia no calendário do mural (a mesma do calendário principal)
function muralCorDoDia(v){
  if(!isStudyDay(v)) return '';
  const ref=dayRefEstudo(v);
  return ref ? corCursoId(ref.cursoId) : (getCellColor(v) || 'var(--accent)');
}

function renderMural(){
  const box=document.getElementById('mural-grid'); if(!box) return;
  if(muralAno===null){ muralAno=state.year; muralMes=state.month; muralDia=muralUltimoDia(); }
  const sub=document.querySelector('#tab-mural .page-sub');
  if(sub) sub.textContent='Escolha o mês e depois o dia para ver o que você fez.';

  // 1º — os 12 meses do ano, com quantos dias estudados em cada um
  const meses=MESES.map((nome,i)=>{
    const { dias }=resumoPeriodo(muralChave(muralAno,i));
    const cls='mural-mes'+(i===muralMes?' ativo':'')+(dias?'':' vazio');
    return `<button type="button" class="${cls}" onclick="muralEscolherMes(${i})" aria-pressed="${i===muralMes}">
      <span class="mural-mes-nome">${nome}</span><span class="mural-mes-dias">${dias ? dias+(dias===1?' dia':' dias') : '—'}</span></button>`;
  }).join('');

  // 2º — calendário do mês escolhido
  const pref=muralChave(muralAno,muralMes);
  const { dias:diasMes, horas:horasMes }=resumoPeriodo(pref);
  const inicio=new Date(muralAno,muralMes,1).getDay(), total=new Date(muralAno,muralMes+1,0).getDate();
  const hoje=todayKey();
  let cels=['D','S','T','Q','Q','S','S'].map(l=>`<div class="mural-sem">${l}</div>`).join('');
  for(let i=0;i<inicio;i++) cels+='<div></div>';
  for(let d=1; d<=total; d++){
    const k=mkKey(muralAno,muralMes+1,d), v=state.days[k], cor=muralCorDoDia(v);
    const cls='mural-dia'+(cor?' estudou':'')+(k===muralDia?' sel':'')+(k===hoje?' hoje':'');
    const titulo = cor ? `${d}: ${muralFmtHoras(horasDoDia(v))} de estudo` : `${d}: sem estudo`;
    cels+=`<button type="button" class="${cls}"${cor?` style="--cor:${cor}"`:''} onclick="muralEscolherDia('${k}')" title="${titulo}">${d}</button>`;
  }

  box.innerHTML=`
    <div class="mural-passo mural-meses-box">
      <div class="mural-ano">
        <button type="button" class="cal-nav-btn" onclick="muralMudarAno(-1)" aria-label="Ano anterior">‹</button>
        <b>${muralAno}</b>
        <button type="button" class="cal-nav-btn" onclick="muralMudarAno(1)" aria-label="Próximo ano">›</button>
      </div>
      <div class="mural-meses">${meses}</div>
    </div>
    <div class="mural-corpo">
      <section class="mural-passo mural-cal" aria-label="Calendário de ${MESES[muralMes]}">
        <div class="mural-cab"><h3>${MESES[muralMes]} de ${muralAno}</h3>
          <span>${diasMes} ${diasMes===1?'dia estudado':'dias estudados'} · ${muralFmtHoras(horasMes)}</span></div>
        <div class="mural-grade">${cels}</div>
        <p class="mural-dica">Clique em um dia para ver o que você fez.</p>
      </section>
      <section class="mural-passo mural-fez" id="mural-fez" aria-live="polite">${muralPainelDia()}</section>
    </div>`;
}

// 3º — "Você fez": o dia escolhido
function muralPainelDia(){
  if(!muralDia || !muralDia.startsWith(muralChave(muralAno,muralMes)))
    return `<h3>Você fez</h3><div class="mural-vazio">Escolha um dia no calendário ao lado.</div>`;
  const [y,m,d]=muralDia.split('-').map(Number);
  const data=new Date(y,m-1,d);
  const titulo=`${MURAL_DIAS_SEMANA[data.getDay()]}, ${d} de ${MESES[m-1].toLowerCase()} de ${y}`;
  const v=state.days[muralDia];
  if(!v || diaVazio(v)){
    return `<h3>Você fez</h3><div class="mural-data">${titulo}</div>
      <div class="mural-vazio">Nada registrado neste dia.</div>
      <button type="button" class="mural-acao principal" onclick="openDayModal('${muralDia}')">${MURAL_ICO.mais} Registrar este dia</button>`;
  }
  const itens=muralItensDoDia(v);
  const questoes=itens.reduce((t,i)=>t+i.questoes,0);
  const lista=itens.map(i=>`<li style="--cor:${i.cor}">
      <div class="mural-item-topo"><b>${escapeHtmlCarreira(i.nome)}</b><span>${muralFmtHoras(i.horas)}${i.questoes?` · ${i.questoes} ${i.questoes===1?'questão':'questões'}`:''}</span></div>
      ${i.detalhe?`<div class="mural-item-det">${escapeHtmlCarreira(i.detalhe)}</div>`:''}
      ${i.texto?`<div class="mural-item-texto">${escapeHtmlCarreira(i.texto)}</div>`:''}
    </li>`).join('');
  const saude=String(v.saude||'').trim();
  const foto=temFotoVisivel(v)?`<img class="mural-foto" src="${fotoDoDia(v)}" alt="Foto do dia ${d}">`:'';
  return `<h3>Você fez</h3><div class="mural-data">${titulo}</div>
    <div class="mural-resumo"><div><b>${muralFmtHoras(horasDoDia(v))}</b><span>de estudo</span></div>
      <div><b>${questoes}</b><span>${questoes===1?'questão':'questões'}</span></div></div>
    ${foto}
    ${lista?`<ul class="mural-lista">${lista}</ul>`:''}
    ${saude?`<div class="mural-nota"><span>Anotação</span>${escapeHtmlCarreira(saude)}</div>`:''}
    <div class="mural-acoes">
      <button type="button" class="mural-acao principal" onclick="openDayModal('${muralDia}')">${MURAL_ICO.editar} Abrir / editar</button>
      <button type="button" class="mural-acao perigo" onclick="deleteDay('${muralDia}')">${MURAL_ICO.lixo} Remover</button>
    </div>`;
}

// último dia estudado do mês escolhido (para o painel "Você fez" não começar vazio)
function muralUltimoDia(){
  const ks=Object.keys(state.days||{}).filter(k=>k.startsWith(muralChave(muralAno,muralMes)) && isStudyDay(state.days[k])).sort();
  return ks.length ? ks[ks.length-1] : null;
}
function muralEscolherMes(i){ muralMes=i; muralDia=muralUltimoDia(); renderMural(); }
function muralMudarAno(delta){ muralAno+=delta; muralEscolherMes(muralMes); }
function muralEscolherDia(k){
  muralDia=k;
  document.querySelectorAll('#mural-grid .mural-dia').forEach(b=>b.classList.toggle('sel', b.getAttribute('onclick').includes(`'${k}'`)));
  const p=document.getElementById('mural-fez'); if(p) p.innerHTML=muralPainelDia();
}

async function deleteDay(key){
  const quer = await customConfirm('Remover o registro do dia '+key.split('-').reverse().join('/')+'?');
  if(quer){ delete state.days[key]; salvarCalendario(); renderMural(); renderCalActive(); updateFoguinho(); }
}
