/* ════════════════════════════════════════════
   CALENDÁRIO — MURAL DO MÊS
   Cartões com os dias estudados.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// MURAL
// ════════════════════════════════════════════
// Mostra só o mês aberto no calendário (antes mostrava todos os dias de todos os anos)
function renderMural(){
  const g=document.getElementById('mural-grid');
  if(!g) return;
  const mkey=`${state.year}-${String(state.month+1).padStart(2,'0')}`;
  const sub=document.querySelector('#tab-mural .page-sub');
  if(sub) sub.textContent=`O que você fez em cada dia de ${MESES[state.month]} de ${state.year}`;
  const entries=Object.entries(state.days).filter(([k])=>k.startsWith(mkey)).sort((a,b)=>b[0].localeCompare(a[0]));
  if(!entries.length){ g.innerHTML=`<div class="empty-state"><span class="icon-emoji">😐</span><p>Nenhum dia registrado em ${MESES[state.month]} de ${state.year}.</p></div>`; return; }
  g.innerHTML=entries.map(([k,v])=>{
    const [y,m,d]=k.split('-');
    const nAreas=[v.ciencia,v.sefaz,v.direito,v.notario,v.eletiva].filter(Boolean).length;
    let badgeCls='badge-nda',badgeTxt='Sem estudo';
    if(nAreas>1){badgeCls='badge-multi';badgeTxt='Múltiplas';}
    else if(v.ciencia){badgeCls='badge-ciencia';badgeTxt='Ciência de Dados';}
    else if(v.sefaz){badgeCls='badge-sefaz';badgeTxt='SEFAZ SP';}
    else if(v.direito){badgeCls='badge-direito';badgeTxt='Direito';}
    else if(v.notario){badgeCls='badge-notario';badgeTxt='Notário';}
    else if(v.eletiva){badgeCls='badge-multi';badgeTxt='Eletiva';}
    if(v.estudos&&v.estudos.length&&nAreas===0){badgeCls='badge-multi';badgeTxt=v.estudos.length>1?'Múltiplas':cursoNomeEst(v.estudos[0]);}
    const imgHtml=temFotoVisivel(v)?`<img class="mural-img" src="${fotoDoDia(v)}" alt="foto do dia" onclick="openDayModal('${k}')">`:'' ;
    const area=(rot,x)=>`<div class="mural-item-row"><span class="mural-item-label">${rot}</span><span class="mural-item-val">${x.horas||0}h · ${escapeHtmlCarreira(x.assunto||'—')} · ${x.questoes||0}q</span></div>`;
    const rows=[
      v.ciencia?area('C. Dados',v.ciencia):'',
      v.sefaz?area('SEFAZ',v.sefaz):'',
      v.direito?area('Direito',v.direito):'',
      v.notario?area('Notário',v.notario):'',
      v.eletiva?area('Eletiva',typeof v.eletiva==='object'?v.eletiva:{assunto:v.eletivaDesc}):'',
      ...(v.estudos||[]).map(e=>`<div class="mural-item-row"><span class="mural-item-label">${escapeHtmlCarreira(cursoNomeEst(e))}</span><span class="mural-item-val">${materiaNome(e)?escapeHtmlCarreira(materiaNome(e))+' · ':''}${e.horas||0}h${e.questoes?' · '+e.questoes+'q':''}</span></div>`),
      horasDoDia(v)?`<div class="mural-item-row"><span class="mural-item-label">Total</span><span class="mural-hours">${horasDoDia(v)}h</span></div>`:'',
      v.saude?`<div class="mural-item-row"><span class="mural-item-label">Saúde</span><span class="mural-item-val">${escapeHtmlCarreira(v.saude)}</span></div>`:'',
    ].filter(Boolean).join('');
    return `<div class="mural-card">${imgHtml}
      <div class="mural-date-row"><div class="mural-date">${d}/${m}/${y}</div><span class="mural-badge ${badgeCls}">${badgeTxt}</span></div>
      <div class="mural-items">${rows}</div>
      <button class="mural-del" onclick="deleteDay('${k}')"><span class="icon-emoji">🗑️</span> Remover</button>
    </div>`;
  }).join('');
}

async function deleteDay(key){
  const quer = await customConfirm('Remover o registro do dia '+key.split('-').reverse().join('/')+'?');
  if(quer){ delete state.days[key]; salvarCalendario(); renderMural(); renderCalActive(); updateFoguinho(); }
}
