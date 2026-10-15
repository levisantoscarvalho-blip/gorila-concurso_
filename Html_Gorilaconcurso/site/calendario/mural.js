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

// ════════════════════════════════════════════
// MURAL: meses à ESQUERDA · ao clicar num mês, aparece AO LADO o calendário dele
// com o que a pessoa fez; clicando num dia, o que foi feito aparece logo embaixo.
// ════════════════════════════════════════════
let muralAnim='';          // 'mes' = painel do mês entra · 'dia' = detalhe do dia entra
// Ao abrir o Mural pelo menu: já mostra o mês de hoje ao lado
function muralReiniciar(){ const h=new Date(); muralAno=h.getFullYear(); muralMes=h.getMonth(); muralDia=null; muralAnim=''; }

function renderMural(){
  const box=document.getElementById('mural-grid'); if(!box) return;
  if(muralAno===null) muralReiniciar();
  const sub=document.querySelector('#tab-mural .page-sub');
  if(sub) sub.textContent='Clique em um mês para ver ao lado o que você fez.';
  const anim=muralAnim; muralAnim='';
  const hojeD=new Date();

  // esquerda — os 12 meses
  const meses=MESES.map((nome,i)=>{
    const { dias, horas }=resumoPeriodo(muralChave(muralAno,i));
    const total=new Date(muralAno,i+1,0).getDate(), pct=Math.round(dias/total*100);
    const ehHoje = muralAno===hojeD.getFullYear() && i===hojeD.getMonth();
    return `<button type="button" class="mural-mes${i===muralMes?' ativo':''}${dias?'':' vazio'}" onclick="muralEscolherMes(${i})" aria-pressed="${i===muralMes}">
      <span class="mural-mes-topo"><span class="mural-mes-nome">${nome}</span>${ehHoje?'<span class="mural-mes-selo">Este mês</span>':''}</span>
      <span class="mural-mes-dias">${dias ? `${dias} ${dias===1?'dia':'dias'} · ${muralFmtHoras(horas)}` : 'Sem estudos'}</span>
      <span class="mural-mes-barra"><i style="width:${pct}%"></i></span></button>`;
  }).join('');

  // direita — o mês escolhido
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
    cels+=`<button type="button" class="${cls}" style="${cor?`--cor:${cor};`:''}--i:${d}" onclick="muralEscolherDia('${k}')" title="${titulo}">${d}</button>`;
  }

  box.innerHTML=`<div class="mural-lado">
    <section class="mural-passo mural-lado-meses" aria-label="Meses">
      <div class="mural-lado-cab"><h3>Meses</h3>
        <div class="mural-ano">
          <button type="button" class="cal-nav-btn" onclick="muralMudarAno(-1)" aria-label="Ano anterior"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg></button>
          <b>${muralAno}</b>
          <button type="button" class="cal-nav-btn" onclick="muralMudarAno(1)" aria-label="Próximo ano"><svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button>
        </div></div>
      <div class="mural-meses">${meses}</div>
    </section>
    <section class="mural-passo mural-lado-mes${anim==='mes'?' entra':''}" id="mural-fez" aria-live="polite">
      <div class="mural-lado-cab"><div><h3>${MESES[muralMes]} de ${muralAno}</h3>
        <p>${diasMes ? `${diasMes} ${diasMes===1?'dia estudado':'dias estudados'} · ${muralFmtHoras(horasMes)}` : 'Nenhum estudo neste mês'}</p></div></div>
      <div class="mural-grade">${cels}</div>
      <div class="mural-dia-detalhe${anim==='dia'?' entra':''}">${muralDetalhe()}</div>
    </section>
  </div>`;
}
// embaixo do calendário: o dia escolhido, ou uma dica
function muralDetalhe(){
  if(muralDia && muralDia.startsWith(muralChave(muralAno,muralMes)))
    return `<div class="mural-data"><b>Você fez</b> · ${muralTituloDia()}</div>${muralPainelDia()}`;
  const temEstudo = resumoPeriodo(muralChave(muralAno,muralMes)).dias>0;
  const hoje=todayKey(), mesAtual=hoje.startsWith(muralChave(muralAno,muralMes));
  return temEstudo
    ? `<p class="mural-dica">Clique em um dia colorido para ver o que você fez.</p>`
    : telaVazia({desenho:'mural', compacto:true, titulo:`Nenhum estudo em ${MESES[muralMes].toLowerCase()}`,
        texto: mesAtual ? 'Registre o que estudou hoje e o seu mês começa a ganhar cor.' : 'Os dias que você estudar neste mês aparecem aqui.',
        botao: mesAtual ? 'Registrar hoje' : '', acao:`openDayModal('${hoje}')`});
}
function muralTituloDia(){
  if(!muralDia) return '';
  const [y,m,d]=muralDia.split('-').map(Number), data=new Date(y,m-1,d);
  return `${MURAL_DIAS_SEMANA[data.getDay()]}, ${d} de ${MESES[m-1].toLowerCase()} de ${y}`;
}
// ③ — conteúdo do dia escolhido
function muralPainelDia(){
  const v=state.days[muralDia];
  if(!v || diaVazio(v)){
    return telaVazia({desenho:'dia', compacto:true, titulo:'Nada registrado neste dia', texto:'Estudou e esqueceu de marcar? Dá tempo de registrar.', botao:'Registrar este dia', acao:`openDayModal('${muralDia}')`});
  }
  const d=Number(muralDia.split('-')[2]);
  const itens=muralItensDoDia(v);
  const questoes=itens.reduce((t,i)=>t+i.questoes,0);
  const lista=itens.map(i=>`<li style="--cor:${i.cor}">
      <div class="mural-item-topo"><b>${escapeHtmlCarreira(i.nome)}</b><span>${muralFmtHoras(i.horas)}${i.questoes?` · ${i.questoes} ${i.questoes===1?'questão':'questões'}`:''}</span></div>
      ${i.detalhe?`<div class="mural-item-det">${escapeHtmlCarreira(i.detalhe)}</div>`:''}
      ${i.texto?`<div class="mural-item-texto">${escapeHtmlCarreira(i.texto)}</div>`:''}
    </li>`).join('');
  const saude=String(v.saude||'').trim();
  const foto=temFotoVisivel(v)?`<img class="mural-foto" src="${fotoDoDia(v)}" alt="Foto do dia ${d}" title="Clique para ver em tamanho grande" onclick="mmVerImagem(this.src)">`:'';
  return `<div class="mural-fez-grade">
      <div>
        <div class="mural-resumo"><div><b>${muralFmtHoras(horasDoDia(v))}</b><span>de estudo</span></div>
          <div><b>${questoes}</b><span>${questoes===1?'questão':'questões'}</span></div></div>
        ${lista?`<ul class="mural-lista">${lista}</ul>`:''}
        ${saude?`<div class="mural-nota"><span>Anotação</span>${escapeHtmlCarreira(saude)}</div>`:''}
        <div class="mural-acoes">
          <button type="button" class="mural-acao principal" onclick="openDayModal('${muralDia}')">${MURAL_ICO.editar} Abrir / editar</button>
          <button type="button" class="mural-acao perigo" onclick="deleteDay('${muralDia}')">${MURAL_ICO.lixo} Remover</button>
        </div>
      </div>
      ${foto?`<div>${foto}</div>`:''}
    </div>`;
}

function muralEscolherMes(i){ muralMes=i; muralDia=null; muralAnim='mes'; renderMural(); }
function muralMudarAno(delta){ muralAno+=delta; renderMural(); }
function muralEscolherDia(k){ muralDia=k; muralAnim='dia'; renderMural(); }
async function deleteDay(key){
  const quer = await customConfirm('Remover o registro do dia '+key.split('-').reverse().join('/')+'?');
  if(quer){ delete state.days[key]; salvarCalendario(); renderMural(); renderCalActive(); updateFoguinho(); }
}
