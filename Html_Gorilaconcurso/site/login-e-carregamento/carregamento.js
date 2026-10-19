/* ════════════════════════════════════════════
   TELA DE CARREGAMENTO + ENTRADA NO APP
   Mostra o carregamento, lê os dados e abre o app.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// INICIALIZAÇÃO DO APP (depois de cadastro/login)
// ════════════════════════════════════════════
// ── Tela de carregamento adaptada à conexão ──
// Detecta o tipo de conexão (Network Information API, quando o navegador oferece) e ajusta
// o tempo mínimo/máximo da tela e as mensagens. Em conexão rápida a tela é curta; em lenta, espera mais dados.
const sleep = ms => new Promise(r => setTimeout(r, ms));

function detectarConexao(){
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection || null;
  const r = { tipo:'desconhecida', rotulo:'Conexão não identificada', dica:'', minMs:800, maxMs:6000, offline:false, economia:false };
  if(navigator.onLine === false){
    r.tipo='offline'; r.rotulo='Sem internet'; r.dica='Verifique sua conexão — vamos tentar carregar mesmo assim.'; r.minMs=800; r.maxMs=4000; r.offline=true;
    return r;
  }
  if(!c) return r;
  const et = c.effectiveType || '', dl = c.downlink || 0, rtt = c.rtt || 0;
  r.economia = !!c.saveData;
  const det = (dl ? ` · ~${dl} Mbps` : '') + (rtt ? ` · ${rtt} ms` : '');
  if(r.economia || et==='slow-2g' || et==='2g' || rtt > 1000){
    r.tipo='lenta'; r.rotulo='Conexão lenta' + det; r.dica = r.economia ? 'Modo economia de dados ativo.' : 'Carregando em modo econômico.';
    r.minMs=2000; r.maxMs=12000;
  } else if(et==='3g' || (dl && dl < 1.5) || rtt > 400){
    r.tipo='media'; r.rotulo='Conexão média' + det; r.dica='Carregando com tolerância maior de rede.';
    r.minMs=1500; r.maxMs=8000;
  } else {
    r.tipo='rapida'; r.rotulo='Conexão rápida' + det; r.dica='Carregamento otimizado.';
    r.minMs=500; r.maxMs=5000;
  }
  return r;
}

function mostrarLoading(passos, con){
  document.getElementById('loading-screen').style.display='flex';
  const ul = document.getElementById('ld-steps');
  ul.innerHTML = passos.map(p => `<li><span class="ld-ic"></span><span>${p}</span></li>`).join('');
  document.getElementById('ld-fill').classList.remove('lento');
  const st = document.getElementById('ld-status'); st.classList.remove('lento'); st.textContent = passos[0] + '...';
  const cn = document.getElementById('ld-conn'); if(cn) cn.textContent = con ? (con.rotulo + (con.dica ? ' — ' + con.dica : '')) : '';
  setLoadingPct(0, passos);
}
function setLoadingPct(pct, passos){
  pct = Math.max(0, Math.min(100, pct));
  document.getElementById('ld-fill').style.width = pct + '%';
  document.getElementById('ld-pct').textContent = Math.floor(pct) + '%';
  const lis = document.querySelectorAll('#ld-steps li');
  const faixa = 90 / lis.length;
  const st = document.getElementById('ld-status');
  lis.forEach((li, i) => {
    const feito = pct >= 100 || pct >= (i + 1) * faixa;
    const ativo = !feito && pct >= i * faixa;
    li.className = feito ? 'feito' : (ativo ? 'ativo' : '');
    if(ativo && !st.classList.contains('lento')) st.textContent = passos[i] + '...';
  });
}
// Executa o trabalho (carregar dados). A tela dura só o necessário: some quando o trabalho termina
// E o tempo mínimo da conexão passou; ou quando o limite máximo estoura. Lê con.minMs/maxMs ao vivo
// e pode ser encerrada na hora com con.encerrar = true (ex.: visitante sem conta).
async function rodarLoading(trabalho, passos, con){
  con = con || detectarConexao();
  // A tela só aparece com internet fraca (lenta/offline). Nos demais casos o site abre direto, sem espera obrigatória.
  if(true){ // tela de carregamento desativada: o site sempre abre direto
    const t0=performance.now(); let pronto=false;
    const promessa=Promise.resolve(trabalho).catch(()=>{}).then(()=>{ pronto=true; });
    while(!pronto && !con.encerrar && performance.now()-t0 < con.maxMs) await sleep(30);
    return { pronto, promessa, ms: performance.now()-t0 };
  }
  con.minMs = 800; // evita um "piscar" da tela; depois some assim que os dados chegam
  mostrarLoading(passos, con);
  let pronto = false, msTrabalho = 0, pctMax = 0;
  const t0 = performance.now();
  const promessa = Promise.resolve(trabalho).catch(()=>{}).then(()=>{ pronto = true; msTrabalho = performance.now() - t0; });
  let lento = false, rodando = true;
  (function quadro(){
    if(!rodando) return;
    const t = performance.now() - t0, MIN = con.minMs, MAX = Math.max(con.maxMs, con.minMs + 500);
    let pct;
    if(t <= MIN) pct = 90 * (t / MIN);
    else {
      if(!lento){
        lento = true;
        document.getElementById('ld-fill').classList.add('lento');
        const st = document.getElementById('ld-status'); st.classList.add('lento');
        st.textContent = con.offline ? 'Sem internet — aguardando a conexão...' : 'Aguardando resposta do servidor...';
      }
      pct = 90 + 9 * Math.min((t - MIN) / (MAX - MIN), 1);
    }
    pctMax = Math.max(pctMax, pct);
    setLoadingPct(pctMax, passos);
    requestAnimationFrame(quadro);
  })();
  while(!con.encerrar){
    const t = performance.now() - t0;
    if(pronto && t >= con.minMs) break;
    if(t >= Math.max(con.maxMs, con.minMs + 500)) break;
    await sleep(40);
  }
  rodando = false;
  if(con.encerrar){
    document.getElementById('loading-screen').style.display='none';
    return { pronto:true, promessa, ms:0, cancelado:true };
  }
  const terminou = pronto;
  document.getElementById('ld-fill').classList.remove('lento');
  const st = document.getElementById('ld-status'); st.classList.remove('lento');
  st.textContent = terminou ? ('Concluído' + (msTrabalho ? ' — dados em ' + (msTrabalho/1000).toFixed(1) + 's' : '')) : 'Continuando em segundo plano...';
  setLoadingPct(terminou ? 100 : 99, passos);
  await sleep(200);
  document.getElementById('loading-screen').style.display='none';
  return { pronto: terminou, promessa, ms: msTrabalho };
}

// Carrega o state UMA única vez por sessão (sem redundância): reutiliza a mesma promessa.
function carregarEstadoUmaVez(){
  if(!window.__loadPromise){
    window.__dadosProntos = false; window.__estadoOk = false;
    window.__loadPromise = loadState().then(ok=>{ window.__estadoOk = !!ok; window.__dadosProntos = true; });
  }
  return window.__loadPromise;
}

async function entrarApp(){
  document.getElementById('auth-screen').style.display='none';
  auFecharLogin(); document.body.classList.remove('pre-login');
  const _bb = document.getElementById('busca-global'); if(_bb) _bb.placeholder='Pesquise por concurso, matérias, edital...';
  // Os dados já foram carregados antes do login (iniciar). Só recarrega se aquela leitura não foi confirmada.
  let r = { pronto:true };
  if(!window.__estadoOk){
    window.__loadPromise = null;
    const con = detectarConexao();
    if(window.__cadastroNovo){ con.minMs = Math.max(con.minMs, 2000); con.maxMs = Math.max(con.maxMs, con.minMs + 2000); window.__cadastroNovo = false; }
    r = await rodarLoading(carregarEstadoUmaVez(),
      ['Autenticando usuário','Sincronizando registros de estudo','Montando painel'], con);
  }
  window.__guest = false; window.__logado = true; atualizarBotaoConta(); renderNewsPanel();
  document.getElementById('home-screen').style.display='block';
  applyTheme(); updateFoguinho(); renderTrilhasFixas(); renderCarreirasCustom();
  navReset(); openSection('guia'); trMarcarAtivo('tr-calendario');
  if(!r.pronto){
    mostrarToast('Conexão lenta: seus dados continuam carregando em segundo plano.');
    window.__loadPromise.then(()=>{
      applyTheme(); updateFoguinho(); renderTrilhasFixas(); renderCarreirasCustom(); renderNewsPanel(); renderNewsCal();
    });
  }
}
// ════════════════════════════════════════════
// PONTO DE ENTRADA: sempre pede cadastro/login antes de mostrar o app
// ════════════════════════════════════════════
async function iniciar(){
  const con = detectarConexao();
  // 1) lê só o perfil (leitura pequena). 2) Se há conta, pré-carrega os dados na mesma tela de carregamento.
  //    Se NÃO há conta (visitante), encerra o carregamento na hora e mostra a landing.
  // CONTA NA NUVEM (18/10/2026): sessão guardada pelo Supabase ➔ traz o progresso da nuvem e ENTRA DIRETO
  // (também é assim que a pessoa volta do link de confirmação do e-mail ou do Google). Sem sessão ➔ página principal.
  const trabalho = nuvemSessao().then(async u=>{
    nuvemUsuario(u);
    if(!u) return;
    try{ await nuvemPrepararLocal(false); }catch(e){ console.warn('Não foi possível ler o progresso na nuvem:', e); }
    return carregarEstadoUmaVez();
  });
  await rodarLoading(trabalho,
    ['Iniciando ambiente seguro','Pré-carregando seus dados','Validando acesso','Preparando tela de acesso'], con);
  if(window.__uid){ await entrarApp(); return; }
  mostrarAuth();
}
