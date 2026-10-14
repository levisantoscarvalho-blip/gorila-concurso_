/* ════════════════════════════════════════════
   NOTÍCIAS DE CONCURSOS
   Painel de notícias e notícias abaixo do calendário.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// BARRA SUPERIOR: BUSCA GLOBAL (2) + NOTÍCIAS DE CONCURSOS (3)
// ════════════════════════════════════════════
const CONCURSOS_SUGESTOES = ['SEFAZ SP','Receita Federal','INSS','Polícia Federal','Polícia Rodoviária Federal','TRT / TRF','Banco do Brasil','Caixa Econômica','Cartório (Notário e Registrador)','OAB','Residência Médica','Professor (SEDUC)'];

// Notícias próprias: cole aqui itens que você quiser destacar (o painel mostra os que combinam com o concurso de interesse).
// Formato: { titulo:'...', concurso:'SEFAZ SP', url:'https://...', fonte:'PCI Concursos', data:'02/10/2026' }
const NOTICIAS_MANUAIS = [];

function linkNoticias(nome){ return 'https://news.google.com/search?q='+encodeURIComponent('concurso '+nome)+'&hl=pt-BR&gl=BR&ceid=BR%3Apt-419'; }
function linkPci(nome){ return 'https://www.google.com/search?q='+encodeURIComponent('site:pciconcursos.com.br '+nome); }

// ── Painel de notícias ──
function renderNewsPanel(){
  const el = document.getElementById('news-panel'); if(!el) return;
  const logado = !!window.__logado;
  const interesses = logado ? (state.concursosInteresse||[]) : [];
  let h = '<div class="np-head"><span>Notícias de concursos</span><small>PCI Concursos e Google Notícias</small></div>';
  if(!logado){
    h += '<div class="np-msg">Entre na sua conta para acompanhar os concursos que você quer prestar. Enquanto isso, veja os mais buscados:</div><div class="np-chips">'
      + CONCURSOS_SUGESTOES.slice(0,6).map(n=>`<a class="np-chip" style="text-decoration:none" href="${linkNoticias(n)}" target="_blank" rel="noopener">${escapeHtmlCarreira(n)}</a>`).join('') + '</div>';
  } else {
    h += '<div class="np-add"><input id="np-input" placeholder="Adicionar concurso..." onkeydown="if(event.key===\'Enter\')newsAdd()"><button onclick="newsAdd()" title="Adicionar">+</button></div>';
    if(!interesses.length) h += '<div class="np-msg">Escolha os concursos que você quer acompanhar. Eu mostro atalhos para as notícias de cada um.</div>';
    interesses.forEach((n,i)=>{
      const m = NOTICIAS_MANUAIS.filter(x=>bgNorm(x.concurso).includes(bgNorm(n)) || bgNorm(n).includes(bgNorm(x.concurso))).slice(0,3);
      h += `<div class="np-card"><div class="np-card-h"><span>${escapeHtmlCarreira(n)}</span><button class="np-x" title="Remover" onclick="newsRemover(${i})">✕</button></div>
        <div class="np-links"><a href="${linkNoticias(n)}" target="_blank" rel="noopener">Notícias</a><a href="${linkPci(n)}" target="_blank" rel="noopener">PCI Concursos</a></div>
        ${m.map(x=>`<a class="np-item" href="${escapeHtmlCarreira(x.url||'#')}" target="_blank" rel="noopener">${escapeHtmlCarreira(x.titulo)}<small>${escapeHtmlCarreira(x.fonte||'')}${x.data?' · '+escapeHtmlCarreira(x.data):''}</small></a>`).join('')}</div>`;
    });
    const faltam = CONCURSOS_SUGESTOES.filter(n=>!interesses.includes(n));
    if(faltam.length) h += '<div class="np-sub">Sugestões</div><div class="np-chips">' + faltam.slice(0,8).map(n=>`<button class="np-chip" onclick="newsAdd(${JSON.stringify(n).replace(/"/g,'&quot;')})">+ ${escapeHtmlCarreira(n)}</button>`).join('') + '</div>';
  }
  h += '<div class="np-nota">Os botões abrem as notícias em outra aba. Não copiamos o conteúdo dos sites.</div>';
  el.innerHTML = h;
}
function newsAdd(nome){
  const inp = document.getElementById('np-input');
  const n = (nome || (inp?inp.value:'')).trim();
  if(!n) return;
  state.concursosInteresse = state.concursosInteresse || [];
  if(!state.concursosInteresse.some(x=>bgNorm(x)===bgNorm(n))) state.concursosInteresse.push(n);
  saveState(); renderNewsPanel();
}
function newsRemover(i){
  (state.concursosInteresse||[]).splice(i,1);
  saveState(); renderNewsPanel();
}
// ── Notícias abaixo do calendário ──
function renderNewsCal(){
  const list=document.getElementById('cal-news-list'), sug=document.getElementById('cal-news-sug');
  if(!list||!sug) return;
  const interesses=state.concursosInteresse||[];
  list.innerHTML = interesses.length ? interesses.map((n,i)=>{
    const m=(typeof NOTICIAS_MANUAIS!=='undefined'?NOTICIAS_MANUAIS:[]).filter(x=>bgNorm(x.concurso).includes(bgNorm(n))||bgNorm(n).includes(bgNorm(x.concurso))).slice(0,3);
    return `<div class="np-card" style="margin:0"><div class="np-card-h"><span>${escapeHtmlCarreira(n)}</span><button class="np-x" title="Remover" onclick="ncRemover(${i})">✕</button></div>
      <div class="np-links"><a href="${linkNoticias(n)}" target="_blank" rel="noopener">Notícias</a><a href="${linkPci(n)}" target="_blank" rel="noopener">PCI Concursos</a></div>
      ${m.map(x=>`<a class="np-item" href="${escapeHtmlCarreira(x.url||'#')}" target="_blank" rel="noopener">${escapeHtmlCarreira(x.titulo)}<small>${escapeHtmlCarreira(x.fonte||'')}${x.data?' · '+escapeHtmlCarreira(x.data):''}</small></a>`).join('')}</div>`;
  }).join('') : '<div style="grid-column:1/-1;font-size:12.5px;color:var(--text-muted)">Nenhum concurso adicionado ainda. Escolha um nas sugestões abaixo ou digite o nome acima.</div>';
  const faltam=CONCURSOS_SUGESTOES.filter(n=>!interesses.some(x=>bgNorm(x)===bgNorm(n)));
  sug.innerHTML = faltam.length ? '<div class="np-sub" style="margin-top:0">Sugestões</div><div class="np-chips">'+faltam.map(n=>`<button class="np-chip" onclick="ncAdd(${JSON.stringify(n).replace(/"/g,'&quot;')})">+ ${escapeHtmlCarreira(n)}</button>`).join('')+'</div>' : '';
}
function ncAdd(nome){
  const inp=document.getElementById('nc-input');
  const n=(nome||(inp?inp.value:'')).trim();
  if(!n) return;
  state.concursosInteresse=state.concursosInteresse||[];
  if(!state.concursosInteresse.some(x=>bgNorm(x)===bgNorm(n))) state.concursosInteresse.push(n);
  if(inp) inp.value='';
  saveState(); renderNewsCal(); renderNewsPanel();
}
function ncRemover(i){
  (state.concursosInteresse||[]).splice(i,1);
  saveState(); renderNewsCal(); renderNewsPanel();
}
