/* ════════════════════════════════════════════
   CALENDÁRIO — ESTATÍSTICAS (recurso do Gorila Pro)
   Botão "Estatísticas" ao lado de Mês / Ano. Mostra SÓ o que a pessoa registrou no calendário:
   um gráfico em L (horas por dia) + números do desempenho.

   Acesso (decisão do Levi):
   - Todo mundo pode usar por 3 DIAS (teste grátis do Pro). Depois, precisa assinar.
   - Quem não quer ser cobrado DESATIVA no botão do topo desta parte.
   state.estatisticas = { ativo: true/false, testeInicio: 'AAAA-MM-DD' }  ·  state.pro = true quando assinar
   TROCAR quando o pagamento existir: state.pro deve vir da assinatura de verdade (Supabase + Mercado Pago/Asaas).
   ════════════════════════════════════════════ */

const ESTAT_TESTE_DIAS = 3;
let estatPeriodo = 30;   // dias mostrados no gráfico: 7, 30 ou 90
let estatCache = {};

function estatConfig(){ return state.estatisticas || (state.estatisticas = { ativo:true, testeInicio:null }); }
// quantos dias de teste ainda restam (3, 2, 1, 0)
function estatDiasRestantes(){
  const c = estatConfig(); if(!c.testeInicio) return ESTAT_TESTE_DIAS;
  const [y,m,d] = c.testeInicio.split('-').map(Number);
  const passou = Math.round((new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) - new Date(y,m-1,d)) / 86400000);   // round: um dia com horário de verão tem 23h ou 25h
  return Math.max(0, ESTAT_TESTE_DIAS - passou);
}
function estatAlternar(){
  const c = estatConfig(); c.ativo = !c.ativo;
  saveState(); renderEstatisticas();
}

// horas de cada dia no período que termina hoje: [{k, d:Date, h}]
function estatSerie(n){
  const hoje = new Date(), out = [];
  for(let i=n-1;i>=0;i--){
    const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()-i);
    const k = mkKey(d.getFullYear(), d.getMonth()+1, d.getDate());
    out.push({ k, d, h: horasDoDia(state.days[k]), estudou: isStudyDay(state.days[k]) });
  }
  return out;
}
const estatFmtH = h => formatarHoras(h);
// série de DEMONSTRAÇÃO (só para o fundo borrado de quem não tem acesso): não usa dados da pessoa
function estatSerieDemo(n){ const hoje=new Date(), out=[]; for(let i=n-1;i>=0;i--){ const d=new Date(hoje.getFullYear(),hoje.getMonth(),hoje.getDate()-i); const h=[2,0,3,1.5,0,4,2.5,0,1,3][i%10]; out.push({k:'demo-'+i, d, h, estudou:h>0}); } return out; }
const estatData = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
// os números do desempenho ("dados matemáticos")
function estatNumeros(serie){
  const n = serie.length, total = serie.reduce((t,p)=>t+p.h,0);
  const estudados = serie.filter(p=>p.estudou).length;   // mesma regra de "Dias estudados" (antes contava só dias com horas > 0)
  const melhor = serie.reduce((a,p)=>p.h>a.h?p:a, serie[0]);
  const meio = Math.floor(n/2);
  const m1 = serie.slice(0,meio).reduce((t,p)=>t+p.h,0) / Math.max(1,meio);
  const m2 = serie.slice(meio).reduce((t,p)=>t+p.h,0) / Math.max(1,n-meio);
  // tendência: % só quando dá para comparar; de zero para algo é "subindo" (não existe +100% de zero)
  const tend = m1>0 ? Math.round((m2-m1)/m1*100) : null;
  const tendTipo = m1>0 ? (tend>0?'sobe':tend<0?'desce':'igual') : (m2>0 ? 'comecou' : 'sem');
  // questões: dos estudos de hoje E dos registros antigos por área (antes ficavam de fora)
  const questoes = serie.reduce((t,p)=>{ const v=state.days[p.k]; if(!v) return t;
    let q=(v.estudos||[]).reduce((s,e)=>s+(Number(e.questoes)||0),0);
    AREAS_ORDEM.forEach(a=>{ if(v[a]&&typeof v[a]==='object') q+=Number(v[a].questoes)||0; });
    return t+q; },0);
  return { total, media: total/n, estudados, constancia: Math.round(estudados/n*100), melhor, tend, tendTipo, questoes };
}

// ── gráfico em L: eixo vertical (horas) + eixo horizontal (dias), linha com área, linha da média ──
function estatGrafico(serie, media){
  const W=760, H=280, mE=44, mD=16, mT=16, mB=34;           // margens
  const w=W-mE-mD, h=H-mT-mB, n=serie.length;
  const maxH = Math.max(...serie.map(p=>p.h), media, 1);
  const passo = maxH<=2 ? .5 : maxH<=4 ? 1 : maxH<=8 ? 2 : maxH<=16 ? 4 : 6;
  const topo = Math.ceil(maxH/passo)*passo;
  estatCache = { serie, topo };   // a mira do mouse reaproveita
  const x = i => mE + (n===1 ? w/2 : i*w/(n-1));
  const y = v => mT + h - v/topo*h;
  // grade horizontal discreta + rótulos do eixo vertical
  let grade=''; for(let v=0; v<=topo+1e-9; v+=passo){
    grade += `<line x1="${mE}" x2="${W-mD}" y1="${y(v)}" y2="${y(v)}" class="eg-grade${v===0?' base':''}"/>
      <text x="${mE-8}" y="${y(v)+4}" class="eg-rotulo" text-anchor="end">${String(v).replace('.',',')}h</text>`;
  }
  // rótulos do eixo horizontal (no máximo ~7, sem encavalar)
  const cada = Math.max(1, Math.ceil(n/7)); let xs='';
  serie.forEach((p,i)=>{ if(i%cada===0 || i===n-1) xs += `<text x="${x(i)}" y="${H-10}" class="eg-rotulo" text-anchor="middle">${estatData(p.d)}</text>`; });
  const pts = serie.map((p,i)=>`${x(i).toFixed(1)},${y(p.h).toFixed(1)}`).join(' ');
  const area = `${mE},${y(0)} ${pts} ${x(n-1)},${y(0)}`;
  const yM = y(media);
  return `<svg class="estat-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Horas estudadas por dia nos últimos ${n} dias">
      ${grade}
      <line x1="${mE}" x2="${mE}" y1="${mT}" y2="${y(0)}" class="eg-eixo"/>
      <polygon points="${area}" class="eg-area"/>
      <polyline points="${pts}" class="eg-linha"/>
      <line x1="${mE}" x2="${W-mD}" y1="${yM}" y2="${yM}" class="eg-media"/>
      <text x="${mE+8}" y="${yM-7}" class="eg-media-txt" text-anchor="start">média: ${estatFmtH(media)} por dia</text>
      ${xs}
      <line class="eg-mira" x1="0" x2="0" y1="${mT}" y2="${y(0)}" style="display:none"/>
      <circle class="eg-ponto" r="5" cx="0" cy="0" style="display:none"/>
      <rect class="eg-alvo" x="${mE}" y="${mT}" width="${w}" height="${h}" fill="transparent"
        onmousemove="estatMira(event)" onmouseleave="estatMiraSai()" ontouchstart="estatMira(event)"/>
    </svg>`;
}
// cruz + caixinha ao passar o mouse sobre o gráfico
function estatMira(ev){
  const svg = ev.currentTarget.ownerSVGElement, box = svg.closest('.estat-grafico'), dica = box.querySelector('.estat-dica');
  const r = svg.getBoundingClientRect(), esc = 760 / r.width;
  const px = ((ev.touches ? ev.touches[0].clientX : ev.clientX) - r.left) * esc;
  const serie = estatCache.serie || estatSerie(estatPeriodo), n = serie.length, mE=44, w=760-44-16;
  const i = Math.max(0, Math.min(n-1, Math.round((px-mE)/w*(n-1))));
  const p = serie[i], cx = mE + (n===1?w/2:i*w/(n-1));
  const topo = estatCache.topo;
  const cy = 16 + (280-16-34) - p.h/topo*(280-16-34);
  const mira = svg.querySelector('.eg-mira'), ponto = svg.querySelector('.eg-ponto');
  mira.setAttribute('x1',cx); mira.setAttribute('x2',cx); mira.style.display='';
  ponto.setAttribute('cx',cx); ponto.setAttribute('cy',cy); ponto.style.display='';
  const dias = ['dom','seg','ter','qua','qui','sex','sáb'];
  dica.innerHTML = `<b>${estatFmtH(p.h)}</b><span>${dias[p.d.getDay()]}, ${estatData(p.d)}</span>`;
  dica.style.display='block';
  const left = cx / esc, larg = dica.offsetWidth;
  dica.style.left = Math.min(r.width - larg, Math.max(0, left - larg/2)) + 'px';
  dica.style.top = Math.max(0, cy/esc - 52) + 'px';
}
function estatMiraSai(){ document.querySelectorAll('.estat-dica').forEach(d=>d.style.display='none'); document.querySelectorAll('.eg-mira,.eg-ponto').forEach(e=>e.style.display='none'); }
function estatMudarPeriodo(n){ estatPeriodo = n; renderEstatisticas(); }

function renderEstatisticas(){
  const el = document.getElementById('cal-stats-view'); if(!el) return;
  const c = estatConfig();
  // começa o teste de 3 dias na primeira vez que a pessoa abre (só com conta: visitante não é cobrado)
  if(c.ativo && !c.testeInicio && !window.__guest && !state.pro){ c.testeInicio = todayKey(); saveState(); }
  const restam = estatDiasRestantes(), pro = !!state.pro;

  // faixa do topo: situação do Pro + botão para desativar
  const situacao = pro ? '<b>Gorila Pro</b> ativo'
    : window.__guest ? '<b>Recurso Pro.</b> Crie sua conta para testar grátis por 3 dias.'
    : !c.ativo ? '<b>Estatísticas desativadas.</b> Você não será cobrado.'
    : restam>0 ? `<b>Teste grátis do Pro:</b> ${restam===1?'falta 1 dia':`faltam ${restam} dias`}. Depois, a assinatura começa — desative aqui se não quiser ser cobrado.`
    : '<b>Seu teste grátis terminou.</b> Assine o Gorila Pro para continuar vendo as suas estatísticas.';
  const topo = `<div class="estat-topo">
      <span class="pro-selo grande">PRO</span>
      <span class="estat-situacao">${situacao}</span>
      ${pro||window.__guest ? '' : `<div class="estat-chave"><span>${c.ativo?'Ativadas':'Desativadas'}</span>
        <button type="button" class="cal-switch${c.ativo?' on':''}" role="switch" aria-checked="${c.ativo}" aria-label="Ativar ou desativar as Estatísticas" onclick="estatAlternar()"></button></div>`}
    </div>`;

  if(!pro && !window.__guest && !c.ativo){
    el.innerHTML = topo + telaVazia({desenho:'mural', compacto:true, titulo:'Estatísticas desativadas',
      texto:'Ative de novo quando quiser acompanhar o seu desempenho em gráficos.', botao:'Ativar estatísticas', acao:'estatAlternar()'});
    return;
  }
  const bloqueado = !pro && !window.__guest && restam<=0;

  const serie = bloqueado ? estatSerieDemo(estatPeriodo) : estatSerie(estatPeriodo), num = estatNumeros(serie);
  const tendTxt = {sobe:`+${num.tend}%`, desce:`${num.tend}%`, igual:'0%', comecou:'Subindo', sem:'—'}[num.tendTipo];
  const tendCls = num.tendTipo==='sobe'||num.tendTipo==='comecou' ? 'sobe' : num.tendTipo==='desce' ? 'desce' : '';
  const periodos = [7,30,90].map(p=>`<button type="button" class="${p===estatPeriodo?'ativo':''}" onclick="estatMudarPeriodo(${p})">${p} dias</button>`).join('');
  const conteudo = `
    <div class="estat-cab">
      <div><h3>Seu desempenho</h3><p>Só o que você registrou no calendário, nos últimos ${estatPeriodo} dias.</p></div>
      <div class="estat-periodos" role="group" aria-label="Período">${periodos}</div>
    </div>
    <div class="estat-numeros">
      <div><span>Total estudado</span><b>${estatFmtH(num.total)}</b></div>
      <div><span>Média por dia</span><b>${estatFmtH(num.media)}</b></div>
      <div><span>Constância</span><b>${num.constancia}%</b><small>${num.estudados} de ${estatPeriodo} dias</small></div>
      <div><span>Melhor dia</span><b>${num.melhor.h?estatFmtH(num.melhor.h):'—'}</b><small>${num.melhor.h?estatData(num.melhor.d):'ainda sem estudo'}</small></div>
      <div><span>Tendência</span><b class="${tendCls}">${tendTxt}</b><small>2ª metade x 1ª metade</small></div>
      <div><span>Questões</span><b>${num.questoes}</b><small>no período</small></div>
    </div>
    <div class="estat-grafico">
      <div class="estat-grafico-titulo">Horas estudadas por dia</div>
      ${estatGrafico(serie, num.media)}
      <div class="estat-dica" style="display:none"></div>
    </div>`;
  el.innerHTML = topo + (bloqueado
    ? `<div class="estat-bloqueio"><div class="estat-borrado" aria-hidden="true">${conteudo}</div>
        <div class="estat-cadeado"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <h3>Continue acompanhando o seu desempenho</h3><p>O teste grátis de 3 dias terminou. Assine o Gorila Pro para ver as suas estatísticas.</p>
          <a class="tv-botao" href="institucional/planos.html" target="_blank" rel="noopener">Ver planos</a></div></div>`
    : conteudo);
}
