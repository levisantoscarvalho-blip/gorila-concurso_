/* ════════════════════════════════════════════
   SALA DE ESTUDO — PAINEL INFOGRÁFICO
   Números, gráficos e análises do seu estudo.
   ════════════════════════════════════════════ */


// ════════════════════════════════════════════
// NOVO RENDER DO DASHBOARD (Baseado na Imagem)
// ════════════════════════════════════════════
function renderInfografico(area){
  // Essa mesma tela é usada tanto para Área Única quanto para Painel Geral.
  let isGeral = (area === 'geral' || !area);
  
  const nomes={ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário e Registrador', geral: 'Visão Global'};
  document.getElementById('info-area-title').textContent = isGeral ? 'Dashboard Global' : `Dashboard - ${nomes[area]}`;
  document.getElementById('info-area-sub').textContent = isGeral ? 'Panorama Completo de Todas as Áreas' : `Progresso Acumulado nesta Área`;

  let dias=0,horas=0,questoes=0,pdfs=0,apostilas=0;
  const areaHoras={ciencia:0,sefaz:0,direito:0,notario:0};
  const areaQuestoes={ciencia:0,sefaz:0,direito:0,notario:0};
  const registros=[];

  Object.entries(state.days).sort((a,b)=>b[0].localeCompare(a[0])).forEach(([k,v])=>{
    if(!v) return;
    
    // Coleta dados específicos
    if(isGeral) {
        const hasStudy = v.ciencia || v.sefaz || v.direito || v.notario || v.eletiva || (v.estudos&&v.estudos.length);
        if(hasStudy) dias++;
        horas += (v.horasTotal || 0);
        AREAS_ORDEM.forEach(a => {
            if(v[a]) {
                if(areaHoras[a]!==undefined) areaHoras[a] += (v[a].horas||0);
                if(areaQuestoes[a]!==undefined) areaQuestoes[a] += (v[a].questoes||0);
                questoes += (v[a].questoes||0);
                const meta = AREA_META[a];
                if(meta){
                  const val = v[a][meta.materialKey] || 0;
                  if(meta.materialKey==='pdfs') pdfs += val;
                  else if(meta.materialKey==='apostilas') apostilas += val;
                }
            }
        });
    } else {
        if(v[area]) {
            dias++;
            horas += v[area].horas || 0;
            questoes += v[area].questoes || 0;
            const meta = AREA_META[area];
            if(meta){
              const val = v[area][meta.materialKey] || 0;
              if(meta.materialKey==='pdfs') pdfs += val;
              else if(meta.materialKey==='apostilas') apostilas += val;
            }
            
            // Popula também a base isolada para o gráfico preencher
            if(areaHoras[area]!==undefined) areaHoras[area] += (v[area].horas||0);
            if(areaQuestoes[area]!==undefined) areaQuestoes[area] += (v[area].questoes||0);
            
            const [y,m,d]=k.split('-');
            const matTxt = meta ? ` · ${meta.materialIcon} ${v[area][meta.materialKey]||0} ${meta.materialLabel.toLowerCase()}` : '';
            registros.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;"><span>${d}/${m}/${y} — ${escapeHtmlCarreira(v[area].assunto||'—')}${matTxt}</span><span><strong>${v[area].horas||0}h</strong></span></div>`);
        }
    }
  });

  // Atualiza Cartões Superiores
  const setEl=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v;};
  setEl('img-horas', horas);
  setEl('img-dias', dias);
  setEl('img-questoes', questoes);
  setEl('img-pdfs', pdfs);
  setEl('img-apostilas', apostilas);

  // Progresso Geral: baseado no que você realmente marcou como concluído em Conteúdos
  // (disciplinas fixas + itens adicionados por você) — assim o número se mexe de verdade
  // conforme você usa o app, em vez de ficar travado em 0% esperando 500 horas.
  const trilhasConteudo = todasTrilhasConteudo();
  let totalItensConteudo = 0, doneItensConteudo = 0;
  trilhasConteudo.forEach(t=>{
    const fixos = CONTEUDO_FIXO[t] || [];
    const fixedDone = fixos.filter((_,i)=>(state.checks[t]||{})[i]).length;
    const customs = (state.conteudosCustom||[]).filter(c=>c.trilha===t);
    const customDone = customs.filter(c=>c.feito).length;
    totalItensConteudo += fixos.length + customs.length;
    doneItensConteudo += fixedDone + customDone;
  });
  const metaPct = totalItensConteudo>0 ? Math.round((doneItensConteudo/totalItensConteudo)*100) : 0;
  const donutBg = document.getElementById('img-donut-bg');
  if(donutBg) donutBg.style.background = `conic-gradient(#f49e11 ${metaPct}%, #153250 0)`;
  setEl('img-donut-val', metaPct + '%');

  // Atualiza Gráfico de Barras com as 4 áreas
  const maxH = Math.max(...Object.values(areaHoras), 1);
  const maxQ = Math.max(...Object.values(areaQuestoes), 1);
  const somaHoras = Object.values(areaHoras).reduce((a,b)=>a+b,0);
  const somaQuestoes = Object.values(areaQuestoes).reduce((a,b)=>a+b,0);

  const areasParaBarras = isGeral ? ['ciencia','sefaz','direito','notario'] : [area];
  const barsContainer = document.getElementById('img-bars');
  if(barsContainer){
    if(somaHoras===0 && somaQuestoes===0){
      barsContainer.innerHTML = `<div class="sim-bar-empty">Nenhum registro ainda. Marque conteúdos ou registre um dia no calendário para ver o gráfico aqui.</div>`;
    } else {
      const barsHtml = areasParaBarras.map(a => {
          const ph = Math.round((areaHoras[a] / maxH) * 100);
          const pq = Math.round((areaQuestoes[a] / maxQ) * 100);
          const n = {ciencia:'CD', sefaz:'SF', direito:'DIR', notario:'NOT'}[a] || a;
          return `
          <div class="sim-bar-group">
            <div class="sim-bar-pair">
              <div class="sim-bar-a" style="height:${ph}%;" title="${areaHoras[a]}h"></div>
              <div class="sim-bar-b" style="height:${pq}%;" title="${areaQuestoes[a]} questões"></div>
            </div>
            <div class="sim-bar-lbl">${n}</div>
          </div>
          `;
      }).join('');
      barsContainer.innerHTML = barsHtml;
    }
  }

  // Atualiza Histórico (só exibe registros se for visão de área específica)
  const rl=document.getElementById('info-registros-list');
  if(rl) {
    if(isGeral) {
       rl.innerHTML = gerarInsightsHtml(areaHoras, areaQuestoes, horas, dias, questoes);
    } else {
       rl.innerHTML = registros.length ? registros.join('') : '<span style="color:var(--text-muted)">Nenhum registro ainda para esta área.</span>';
    }
  }

  // guarda o último cálculo pra os botões "Check Now" / "Analisar Dados" usarem
  window.__ultimoPainel = {areaHoras, areaQuestoes, horas, dias, questoes, pdfs, apostilas, metaPct};
}

// Gera um resumo com informações realmente úteis pro painel geral
function gerarInsightsHtml(areaHoras, areaQuestoes, horas, dias, questoes){
  const nomes={ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário e Registrador'};
  const entradasHoras = Object.entries(areaHoras).filter(([,v])=>v>0);

  const trilhasConteudo = todasTrilhasConteudo();
  let totalItens=0, doneItens=0;
  const porTrilha = {};
  trilhasConteudo.forEach(t=>{
    const fixos = CONTEUDO_FIXO[t] || [];
    const fixedDone = fixos.filter((_,i)=>(state.checks[t]||{})[i]).length;
    const customs = (state.conteudosCustom||[]).filter(c=>c.trilha===t);
    const customDone = customs.filter(c=>c.feito).length;
    const total = fixos.length + customs.length;
    const done = fixedDone + customDone;
    porTrilha[t] = {done, total};
    totalItens += total; doneItens += done;
  });

  if(horas===0 && questoes===0 && dias===0 && totalItens===0){
    return '<span style="color:var(--text-muted)">Ainda não há nada registrado. Registre um dia pela aba "Agente de IA", pelo calendário, ou marque itens em "Conteúdos" para começar a ver estatísticas aqui.</span>';
  }

  let topArea = null;
  entradasHoras.forEach(([k,v])=>{ if(!topArea || v>topArea[1]) topArea = [k,v]; });
  const mediaHoras = dias>0 ? (horas/dias).toFixed(1) : 0;
  const totalDiasEstudados = Object.values(state.days||{}).filter(isStudyDay).length;

  const linhas = [];
  if(totalDiasEstudados>0){
    linhas.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="icon-emoji">🔥</span> Você já estudou em <strong>${totalDiasEstudados}</strong> dia(s) no total.</div>`);
  }
  if(topArea){
    linhas.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="icon-emoji">🏆</span> Área com mais horas: <strong>${nomes[topArea[0]]||topArea[0]}</strong> (${topArea[1]}h).</div>`);
  }
  if(dias>0){
    linhas.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="icon-emoji">📈</span> Média de <strong>${mediaHoras}h</strong> por dia estudado, somando <strong>${questoes}</strong> questões feitas.</div>`);
  }
  if(totalItens>0){
    const pctGeral = Math.round((doneItens/totalItens)*100);
    linhas.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="icon-emoji">✅</span> Conteúdos: <strong>${doneItens}/${totalItens}</strong> itens concluídos (${pctGeral}%).</div>`);
    let melhorTrilha = null;
    trilhasConteudo.forEach(t=>{
      if(porTrilha[t].total>0){
        const p = porTrilha[t].done/porTrilha[t].total;
        if(!melhorTrilha || p>melhorTrilha[1]) melhorTrilha=[t,p];
      }
    });
    if(melhorTrilha && melhorTrilha[1]>0){
      linhas.push(`<div style="padding:8px 0;border-bottom:1px solid var(--border)"><span class="icon-emoji">📚</span> Trilha mais avançada em conteúdo: <strong>${(nomes[melhorTrilha[0]]||nomeCurso(melhorTrilha[0]))}</strong> (${Math.round(melhorTrilha[1]*100)}%).</div>`);
    }
  }
  linhas.push(`<div style="padding:8px 0"><span class="icon-emoji">💡</span> Selecione uma área específica no menu lateral para ver o histórico dia a dia.</div>`);
  return linhas.join('');
}

function analisarDadosGerais(){
  const p = window.__ultimoPainel;
  if(!p || (p.horas===0 && p.questoes===0 && p.dias===0)){
    mostrarToast('Ainda não há dados suficientes. Registre um dia de estudo primeiro!');
    return;
  }
  const nomes={ciencia:'Ciência de Dados',sefaz:'SEFAZ SP',direito:'Direito',notario:'Notário e Registrador'};
  let topArea=null, baixaArea=null;
  Object.entries(p.areaHoras).forEach(([k,v])=>{
    if(!topArea || v>topArea[1]) topArea=[k,v];
    if(v>0 && (!baixaArea || v<baixaArea[1])) baixaArea=[k,v];
  });
  let msg = `📊 Meta geral em ${p.metaPct}%. `;
  if(topArea && topArea[1]>0) msg += `${nomes[topArea[0]]} é a área mais forte (${topArea[1]}h). `;
  if(baixaArea && topArea && baixaArea[0]!==topArea[0]) msg += `Vale reforçar ${nomes[baixaArea[0]]}.`;
  mostrarToast(msg);
  const rl = document.getElementById('info-registros-list');
  if(rl) rl.style.animation = 'fadeIn .4s ease';
}
