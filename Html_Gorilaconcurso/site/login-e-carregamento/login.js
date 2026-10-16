/* ════════════════════════════════════════════
   LOGIN / CADASTRO / SAIR
   Conta local (guardada neste navegador), entrar, criar conta, visitante.
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// CONTA
// A conta fica guardada neste navegador (banco-de-dados/armazenamento.js).
// A senha NUNCA é guardada: guardamos só uma "impressão digital" dela
// (SHA-256 com sal, repetido várias vezes), que não dá para reverter.
// Perfil salvo: { versao:2, nome, email, sal, hash, criadoEm, bootVisto }
// ════════════════════════════════════════════
const PERFIL_KEY = 'guia_estudos_perfil_v1';
const SENHA_MIN = 8;
const REPETICOES_HASH = 5000;
const TENTATIVAS_MAX = 5, BLOQUEIO_SEG = 30;
let perfilSalvo = null;
let tentativasErradas = 0, bloqueadoAte = 0, authOcupado = false;

// Formato antigo (versão 1): a senha ficava só "disfarçada" em base64.
function encode(v){ try{ return btoa(unescape(encodeURIComponent(v))); }catch(e){ return v; } }

// SHA-256 (texto → hexadecimal), feito aqui para funcionar em qualquer navegador e endereço
function sha256(texto){
  const K=[0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
  const bytes=new TextEncoder().encode(texto);
  const len=bytes.length, total=((len+9+63)>>6)<<6;
  const m=new Uint8Array(total); m.set(bytes); m[len]=0x80;
  const bits=len*8; for(let i=0;i<4;i++) m[total-1-i]=(bits>>>(i*8))&0xff;
  let H=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
  const w=new Uint32Array(64), r=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let o=0;o<total;o+=64){
    for(let i=0;i<16;i++) w[i]=(m[o+i*4]<<24)|(m[o+i*4+1]<<16)|(m[o+i*4+2]<<8)|m[o+i*4+3];
    for(let i=16;i<64;i++){ const s0=r(w[i-15],7)^r(w[i-15],18)^(w[i-15]>>>3), s1=r(w[i-2],17)^r(w[i-2],19)^(w[i-2]>>>10); w[i]=(w[i-16]+s0+w[i-7]+s1)|0; }
    let [a,b,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){
      const t1=(h+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0;
      const t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))|0;
      h=g; g=f; f=e; e=(d+t1)|0; d=c; c=b; b=a; a=(t1+t2)|0;
    }
    H=[(H[0]+a)|0,(H[1]+b)|0,(H[2]+c)|0,(H[3]+d)|0,(H[4]+e)|0,(H[5]+f)|0,(H[6]+g)|0,(H[7]+h)|0];
  }
  return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('');
}
function gerarSal(){
  const b=new Uint8Array(16);
  (window.crypto||{}).getRandomValues ? crypto.getRandomValues(b) : b.forEach((_,i)=>b[i]=Math.random()*256|0);
  return Array.from(b,x=>x.toString(16).padStart(2,'0')).join('');
}
function hashSenha(senha, sal){
  let h=sha256(sal+':'+senha);
  for(let i=1;i<REPETICOES_HASH;i++) h=sha256(h+sal);
  return h;
}
const normalizarEmail = e => String(e||'').trim().toLowerCase();
const emailValido = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
function regrasSenha(s){ return { tamanho: s.length>=SENHA_MIN, letra: /[A-Za-zÀ-ÿ]/.test(s), numero: /\d/.test(s) }; }

async function carregarPerfil(){
  try{
    const result = await window.storage.get(PERFIL_KEY, false);
    if(result && result.value){ perfilSalvo = JSON.parse(result.value); }
  }catch(e){ perfilSalvo = null; }
}

// ── Pequenas ajudas da tela ──
function mostrarErroAuth(id, msg, campoId){
  const el=document.getElementById(id);
  el.textContent=msg; el.style.display='block';
  document.querySelectorAll('.auth-input.invalido').forEach(i=>i.classList.remove('invalido'));
  if(campoId){ const c=document.getElementById(campoId); if(c){ c.classList.add('invalido'); c.focus(); } }
}
function limparErrosAuth(){
  ['auth-login-erro','auth-cadastro-erro'].forEach(id=>{ const e=document.getElementById(id); if(e){ e.style.display='none'; e.textContent=''; } });
  document.querySelectorAll('.auth-input.invalido').forEach(i=>i.classList.remove('invalido'));
}
function alternarSenha(id, btn){
  const i=document.getElementById(id); if(!i) return;
  const mostrar = i.type==='password';
  i.type = mostrar ? 'text' : 'password';
  btn.textContent = mostrar ? 'Ocultar' : 'Mostrar';
  btn.setAttribute('aria-label', mostrar ? 'Ocultar senha' : 'Mostrar senha');
}
function mostrarRegrasSenha(){
  const r=regrasSenha(document.getElementById('auth-senha').value);
  document.querySelectorAll('#auth-regras li').forEach(li=>li.classList.toggle('ok', !!r[li.dataset.regra]));
}
function botaoOcupado(id, ocupado, texto){
  const b=document.getElementById(id); if(!b) return;
  b.disabled=ocupado; if(texto) b.textContent=texto;
}
function primeiroNome(n){ return String(n||'').trim().split(/\s+/)[0] || ''; }

(function(){ const m=document.getElementById('auth-modal'); if(m) document.body.appendChild(m); })();
function mostrarAuth(){
  document.getElementById('loading-screen').style.display='none';
  document.getElementById('auth-screen').style.display='flex';
  document.body.classList.add('pre-login');
  renderLanding(); auFecharLogin();
  if(typeof renderInicio==='function') renderInicio(document.getElementById('au-principal'));   // página principal de quem entra no site
  const _b = document.getElementById('busca-global'); if(_b){ _b.value=''; _b.placeholder='Pesquise por concurso, matérias, edital...'; }
  const _tv=document.getElementById('tb-visitante'); if(_tv) _tv.style.display='inline-block';
  const _tb=document.getElementById('tb-entrar'); if(_tb) _tb.style.display='none';   // sem "Entrar": a conta é aberta pelo Registrar grátis
  const _tc=document.getElementById('tb-cadastro'); if(_tc) _tc.style.display='inline-block';
  configurarAuthModal(perfilSalvo ? 'login' : 'cadastro');
}

async function cadastrar(){
  if(authOcupado) return;            // evita clique duplo
  limparErrosAuth();
  const nome = document.getElementById('auth-nome').value.trim().replace(/\s+/g,' ');
  const email = normalizarEmail(document.getElementById('auth-email').value);
  const senha = document.getElementById('auth-senha').value;
  const senha2 = document.getElementById('auth-senha2').value;
  const E = 'auth-cadastro-erro';

  if(nome.replace(/[^A-Za-zÀ-ÿ]/g,'').length < 2) return mostrarErroAuth(E, 'Informe seu nome (pelo menos 2 letras).', 'auth-nome');
  if(!emailValido(email)) return mostrarErroAuth(E, 'Informe um e-mail válido, como nome@exemplo.com.', 'auth-email');
  const r = regrasSenha(senha);
  if(!r.tamanho || !r.letra || !r.numero){ mostrarRegrasSenha(); return mostrarErroAuth(E, `A senha precisa ter pelo menos ${SENHA_MIN} caracteres, com letras e números.`, 'auth-senha'); }
  if(senha !== senha2) return mostrarErroAuth(E, 'As duas senhas não são iguais.', 'auth-senha2');

  authOcupado = true; botaoOcupado('cadastro-btn', true, 'Criando conta...');
  try{
    const sal = gerarSal();
    const novo = { versao:2, nome, email, sal, hash: hashSenha(senha, sal), criadoEm: new Date().toISOString(), bootVisto: true };
    try{
      await window.storage.set(PERFIL_KEY, JSON.stringify(novo), false);
    }catch(e){
      return mostrarErroAuth(E, 'Não foi possível salvar a conta neste navegador. Verifique se o navegador não está em modo anônimo e tente de novo.');
    }
    perfilSalvo = novo;
    tentativasErradas = 0; bloqueadoAte = 0;
    ['auth-senha','auth-senha2'].forEach(id=>{ document.getElementById(id).value=''; });
    mostrarRegrasSenha();
    window.__cadastroNovo = true;
    await entrarDepoisDoCadastro();
  } finally {
    authOcupado = false; botaoOcupado('cadastro-btn', false, 'Criar conta');
  }
}

async function entrarDepoisDoCadastro(){
  await levarVisitanteParaConta();
  await entrarApp();
}

// ════════════════════════════════════════════
// VISITANTE ➔ CONTA
// Quem mexeu no site como visitante e clica em Entrar / Registrar grátis recebe ANTES
// a pergunta: salvar o que fez na conta ou descartar. Nada se perde sem a pessoa decidir.
// ════════════════════════════════════════════
// O que o visitante fez que vale a pena guardar
function resumoVisitante(v){
  v = v || state;
  return {
    dias: Object.values(v.days||{}).filter(d=>d && !diaVazio(d)).length,
    cursos: (v.cursos||[]).length,
    materias: (v.conteudosCustom||[]).length,
    mapa: (((v.mindMap||{}).topicos)||[]).length,
  };
}
function visitanteTemDados(){
  if(!window.__guest) return false;
  const r = resumoVisitante();
  return r.dias + r.cursos + r.materias + r.mapa > 0;
}
let visitanteModoPendente = null;   // 'login' ou 'cadastro': para onde seguir depois da resposta
function perguntarVisitante(modo){
  visitanteModoPendente = modo;
  const r = resumoVisitante(), plural = (n,um,varios)=>`${n} ${n===1?um:varios}`;
  const itens = [
    r.dias && plural(r.dias,'dia de estudo','dias de estudo'),
    r.cursos && plural(r.cursos,'curso ou concurso','cursos ou concursos'),
    r.materias && plural(r.materias,'matéria','matérias'),
    r.mapa && plural(r.mapa,'tópico no mapa mental','tópicos no mapa mental'),
  ].filter(Boolean);
  document.getElementById('visitante-lista').innerHTML = itens.map(t=>`<li>${t}</li>`).join('');
  document.getElementById('visitante-modal').classList.add('open');
}
function fecharPerguntaVisitante(){ document.getElementById('visitante-modal').classList.remove('open'); visitanteModoPendente = null; }
function visitanteSalvar(){
  const modo = visitanteModoPendente;
  window.__visitanteDecidiu = true;           // não pergunta de novo nesta visita
  fecharPerguntaVisitante();
  abrirJanelaLogin(modo);
}
function visitanteDescartar(){
  const modo = visitanteModoPendente;
  // limpa o que foi feito como visitante (fotos só existiam na memória)
  const tema = state.theme;
  if(typeof fotosSoNaMemoria!=='undefined'){ fotosSoNaMemoria.forEach(id=>{ delete FOTOS[id]; }); fotosSoNaMemoria.clear(); }
  state = defaultState(); state.theme = tema;
  try{ renderCalActive(); renderConteudos(); renderMural(); updateFoguinho(); }catch(e){}
  fecharPerguntaVisitante();
  abrirJanelaLogin(modo);
}
// Depois que a senha confere / a conta é criada: carrega a conta e junta o que o visitante fez
async function levarVisitanteParaConta(){
  if(!window.__guest) return;
  const visitante = visitanteTemDados() ? state : null;
  window.__guest = false;
  if(window.__estadoReal){ state = window.__estadoReal; window.__estadoOk = true; }
  else { window.__estadoOk = false; window.__loadPromise = null; if(visitante) await carregarEstadoUmaVez(); }
  window.__visitanteDecidiu = false;
  if(visitante){ juntarDadosDoVisitante(visitante); await saveState(); }
}

// Junta o que foi feito no modo visitante com o progresso da conta, SEM apagar nada da conta:
// - mesmo dia nos dois: os estudos são somados no mesmo dia
// - curso/matéria com o mesmo nome: vira um só
function juntarDadosDoVisitante(v){
  if(!v) return;
  const n = s => bgNorm(String(s||'')).trim();
  // cursos (mapa: id do visitante ➔ id na conta)
  const idCurso = {};
  state.cursos = state.cursos || [];
  (v.cursos||[]).forEach(c=>{
    const igual = state.cursos.find(x=>x.id===c.id || n(x.nome)===n(c.nome));
    if(igual) idCurso[c.id] = igual.id; else { state.cursos.push(c); idCurso[c.id] = c.id; }
  });
  // matérias
  const idMateria = {};
  state.conteudosCustom = state.conteudosCustom || [];
  (v.conteudosCustom||[]).forEach(m=>{
    const trilha = idCurso[m.trilha] || m.trilha;
    const igual = state.conteudosCustom.find(x=>x.id===m.id || (x.trilha===trilha && n(x.nome)===n(m.nome)));
    if(igual) idMateria[m.id] = igual.id; else { state.conteudosCustom.push({...m, trilha}); idMateria[m.id] = m.id; }
  });
  (v.trilhasCustom||[]).forEach(t=>{ state.trilhasCustom = state.trilhasCustom || []; if(!state.trilhasCustom.some(x=>x.id===t.id)) state.trilhasCustom.push(t); });
  // dias
  state.days = state.days || {};
  Object.entries(v.days||{}).forEach(([k,dv])=>{
    if(!dv || diaVazio(dv)) return;
    const estudosV = (dv.estudos||[]).map(e=>({...e, cursoId: idCurso[e.cursoId]||e.cursoId, materiaId: idMateria[e.materiaId]||e.materiaId}));
    const da = state.days[k];
    if(!da || diaVazio(da)){ state.days[k] = {...dv, estudos: estudosV.length ? estudosV : undefined}; if(!estudosV.length) delete state.days[k].estudos; }
    else {
      if(estudosV.length) da.estudos = (da.estudos||[]).concat(estudosV);
      AREAS_ORDEM.forEach(a=>{ if(!da[a] && dv[a]) da[a] = dv[a]; });
      const sa=String(da.saude||'').trim(), sv=String(dv.saude||'').trim();
      if(sv && sv!==sa) da.saude = sa ? sa+' · '+sv : sv;
      if(!da.imgId && dv.imgId){ da.imgId = dv.imgId; if('usarImg' in dv) da.usarImg = dv.usarImg; }
    }
    state.days[k].horasTotal = somaHorasPartes(state.days[k]);
  });
  // mapa mental
  const topicos = ((v.mindMap||{}).topicos) || [];
  if(topicos.length){
    if(!state.mindMap || !Array.isArray(state.mindMap.topicos)) state.mindMap = { topicos: [] };
    topicos.forEach(t=>{ if(!state.mindMap.topicos.some(x=>x.id===t.id || n(x.nome)===n(t.nome))) state.mindMap.topicos.push(t); });
  }
  // cores e estilo do calendário escolhidos como visitante
  ['estiloCal','paletaCores'].forEach(c=>{ if(v[c]) state[c] = v[c]; });
  if(v.coresAreas) state.coresAreas = {...(state.coresAreas||{}), ...v.coresAreas};
}

// Confere e-mail e senha (aceita também contas do formato antigo e as atualiza)
function senhaConfere(email, senha){
  if(!perfilSalvo || email !== normalizarEmail(perfilSalvo.email)) return false;
  if(perfilSalvo.versao === 2) return hashSenha(senha, perfilSalvo.sal) === perfilSalvo.hash;
  return encode(senha) === perfilSalvo.senha;
}

async function entrarLogin(){
  if(authOcupado) return;            // evita clique duplo
  limparErrosAuth();
  const E = 'auth-login-erro';
  const email = normalizarEmail(document.getElementById('login-email').value);
  const senha = document.getElementById('login-senha').value;

  const espera = Math.ceil((bloqueadoAte - Date.now())/1000);
  if(espera > 0) return mostrarErroAuth(E, `Muitas tentativas. Aguarde ${espera} segundos e tente de novo.`);
  if(!perfilSalvo) return mostrarErroAuth(E, 'Ainda não existe conta neste navegador. Use "Criar conta".');
  if(!emailValido(email)) return mostrarErroAuth(E, 'Informe o e-mail da sua conta.', 'login-email');
  if(!senha) return mostrarErroAuth(E, 'Informe sua senha.', 'login-senha');

  authOcupado = true; botaoOcupado('login-btn', true, 'Entrando...');
  try{
    if(!senhaConfere(email, senha)){
      tentativasErradas++;
      document.getElementById('login-senha').value='';
      if(tentativasErradas >= TENTATIVAS_MAX){
        bloqueadoAte = Date.now() + BLOQUEIO_SEG*1000; tentativasErradas = 0;
        return mostrarErroAuth(E, `E-mail ou senha incorretos. Por segurança, aguarde ${BLOQUEIO_SEG} segundos para tentar de novo.`, 'login-senha');
      }
      return mostrarErroAuth(E, 'E-mail ou senha incorretos.', 'login-senha');
    }
    tentativasErradas = 0; bloqueadoAte = 0;
    // conta do formato antigo: troca a senha "disfarçada" pela impressão digital segura
    if(perfilSalvo.versao !== 2){
      const sal = gerarSal();
      const atualizado = { versao:2, nome: perfilSalvo.nome||'', email, sal, hash: hashSenha(senha, sal), criadoEm: new Date().toISOString(), bootVisto: true };
      try{ await window.storage.set(PERFIL_KEY, JSON.stringify(atualizado), false); perfilSalvo = atualizado; }catch(e){}
    }
    document.getElementById('login-senha').value='';
    await levarVisitanteParaConta();   // antes só trocava de dados e o que o visitante fez se perdia
    await entrarApp();
  } finally {
    authOcupado = false; botaoOcupado('login-btn', false, 'Entrar');
  }
}

// A conta fica só neste navegador: não existe e-mail de recuperação.
async function esqueciSenha(){
  await customAlert('Sua conta fica guardada apenas neste navegador, por isso não há envio de e-mail para recuperar a senha. Você pode criar um novo acesso: seu progresso de estudo continua salvo.');
  configurarAuthModal('cadastro');
  const e=document.getElementById('auth-email'); if(e && perfilSalvo) e.value = perfilSalvo.email || '';
  const n=document.getElementById('auth-nome'); if(n && perfilSalvo) n.value = perfilSalvo.nome || '';
  const s=document.getElementById('auth-senha'); if(s) s.focus();
}
// ════════════════════════════════════════════
// SAIR DA SEÇÃO (não apaga nada — só volta pra tela de login)
// ════════════════════════════════════════════
function atualizarBotaoConta(){
  const _tv=document.getElementById('tb-visitante'); if(_tv) _tv.style.display='none';
  const b=document.getElementById('tb-entrar'); if(!b) return;
  // visitante: sem "Entrar" (fica só o Registrar grátis); logado: "Sair"
  if(window.__guest){ b.style.display='none'; }
  else { b.style.display='inline-block'; b.textContent='Sair'; b.onclick=sairDaSecao; }
  // "Registrar grátis" só para quem ainda não tem conta (visitante)
  const c=document.getElementById('tb-cadastro'); if(c) c.style.display = window.__guest ? 'inline-block' : 'none';
  const bu=document.getElementById('busca-global'); if(bu) bu.placeholder='Pesquise por concurso, matérias, edital...';
}
function entrarComoVisitante(){
  const novo = !window.__guest;
  if(novo){ window.__estadoReal = window.__estadoOk ? state : null; state = defaultState(); } // dados da conta (se existirem) ficam guardados, sem aparecer
  window.__guest = true; window.__logado = true;
  document.getElementById('auth-screen').style.display='none';
  document.body.classList.remove('pre-login');
  const lo=document.getElementById('loading-screen'); if(lo) lo.style.display='none';
  atualizarBotaoConta(); renderNewsPanel();
  applyTheme(); updateFoguinho(); renderTrilhasFixas(); renderCarreirasCustom();
  navReset(); openSection('guia'); trMarcarAtivo('tr-calendario');
}
async function sairDaSecao(){
  if(window.__guest) return;
  await saveState();
  window.__estadoOk = true; // dados seguem em memória
  window.__logado = false; renderNewsPanel();
  const bgi=document.getElementById('busca-global'); if(bgi){ bgi.value=''; bgFechar(); }
  document.getElementById('home-screen').style.display='none';
  document.getElementById('app-shell').style.display='none';
  document.getElementById('login-email').value='';
  document.getElementById('login-senha').value='';
  mostrarAuth();
}
// ── Tela inicial pública (concursos em destaque) + login em modal ──
const AU_CORES = ['#1e3a8a,#3b82f6','#14532d,#22c55e','#7c2d12,#f97316','#581c87,#a855f7','#831843,#ec4899','#134e4a,#14b8a6','#7f1d1d,#ef4444','#312e81,#6366f1'];
function auIcone(n){
  const t = bgNorm(n);
  if(/receita|sefaz|fazenda|fiscal/.test(t)) return '🏛️';
  if(/inss/.test(t)) return '🧾';
  if(/policia|pf|prf/.test(t)) return '🛡️';
  if(/trt|trf|tribunal|oab/.test(t)) return '⚖️';
  if(/banco|caixa/.test(t)) return '🏦';
  if(/cartorio|notario/.test(t)) return '✍️';
  if(/medic|residencia/.test(t)) return '🩺';
  return '📚';
}
function renderLanding(){
  const g = document.getElementById('au-grid'); if(!g) return;
  g.innerHTML = CONCURSOS_SUGESTOES.map((n,i)=>{
    const [c1,c2] = AU_CORES[i % AU_CORES.length].split(',');
    return `<div class="au-card" data-n="${escapeHtmlCarreira(bgNorm(n))}">
      <div class="au-band" style="background:linear-gradient(135deg,${c1},${c2})"><span>${auIcone(n)}</span><span>${escapeHtmlCarreira(n)}</span></div>
      <div class="au-cbody"><p>Notícias, editais e informações sobre o concurso de ${escapeHtmlCarreira(n)}.</p>
        <div class="au-links"><a href="${linkNoticias(n)}" target="_blank" rel="noopener">Notícias</a><a href="${linkPci(n)}" target="_blank" rel="noopener">PCI Concursos</a></div>
      </div></div>`;
  }).join('');
}
function auFiltrar(q){
  const nq = bgNorm(q||'').trim();
  let vis = 0;
  document.querySelectorAll('#au-grid .au-card').forEach(c=>{
    const ok = !nq || c.dataset.n.includes(nq);
    c.style.display = ok ? '' : 'none'; if(ok) vis++;
  });
  const v = document.getElementById('au-vazio');
  if(!v) return;
  if(vis===0){
    v.style.display='block';
    v.innerHTML = `Nenhum concurso da lista corresponde a "${escapeHtmlCarreira(q)}". <a href="${linkNoticias(q)}" target="_blank" rel="noopener">Ver notícias</a> · <a href="${linkPci(q)}" target="_blank" rel="noopener">Buscar no PCI Concursos</a>`;
  } else v.style.display='none';
}
// ── Janela de acesso: passo 1 (Google ou e-mail) → passo 2 (formulário de e-mail) ──
const AU_TEXTOS = {
  cadastro: { titulo:'Crie sua conta grátis', sub:'Organize seus estudos e acompanhe sua evolução até a aprovação.',
              trocar:'Já tem uma conta? <button type="button" class="auth-link" onclick="configurarAuthModal(\'login\')">Entrar</button>' },
  login:    { titulo:'Entrar na sua conta',   sub:'Que bom ter você de volta. Continue de onde parou.',
              trocar:'Não tem uma conta? <button type="button" class="auth-link" onclick="configurarAuthModal(\'cadastro\')">Criar conta grátis</button>' }
};
function configurarAuthModal(modo){
  if(modo!=='login' && modo!=='cadastro') modo = perfilSalvo ? 'login' : 'cadastro';
  const t = AU_TEXTOS[modo];
  document.getElementById('au-titulo').textContent = t.titulo;
  let sub = t.sub;
  if(modo==='login' && perfilSalvo && perfilSalvo.nome) sub = `Que bom ter você de volta, ${primeiroNome(perfilSalvo.nome)}.`;
  document.getElementById('au-subtitulo').textContent = sub;
  document.getElementById('au-trocar').innerHTML = t.trocar;
  const av=document.getElementById('au-aviso-cadastro'); if(av) av.style.display = (modo==='cadastro' && perfilSalvo) ? 'block' : 'none';
  // e-mail da conta já preenchido no "Entrar"
  const le=document.getElementById('login-email'); if(le && perfilSalvo && !le.value) le.value = perfilSalvo.email || '';
  limparErrosAuth();
  window.__authModo = modo;
  auPasso(window.__authPasso || 'inicio');
}
// 'inicio' = botões Google / e-mail · 'email' = formulário
function auPasso(p){
  window.__authPasso = p;
  const email = p==='email', modo = window.__authModo;
  document.getElementById('au-opcoes').style.display = email ? 'none' : 'block';
  document.getElementById('auth-login').style.display = email && modo==='login' ? 'block' : 'none';
  document.getElementById('auth-cadastro').style.display = email && modo==='cadastro' ? 'block' : 'none';
  document.getElementById('au-voltar').style.display = email ? 'flex' : 'none';
  document.querySelector('#auth-modal .auth-box').classList.toggle('au-passo-email', email); // formulário mais compacto
  if(email) setTimeout(()=>{
    let id = 'auth-nome';
    if(modo==='login') id = document.getElementById('login-email').value ? 'login-senha' : 'login-email';
    const i=document.getElementById(id); if(i) i.focus();
  },50);
}
// Botão "Registrar-se grátis" do topo: quem JÁ tem conta neste navegador vai direto para "Entrar"
// (antes caía no formulário de criar conta e podia criar outra por cima da antiga)
function tbRegistrar(){ auAbrirLogin(perfilSalvo ? 'login' : 'cadastro'); }
function auAbrirLogin(modo){
  if(typeof modo!=='string') modo=undefined;
  // visitante que já fez algo: primeiro pergunta se quer salvar ou descartar
  if(window.__guest && !window.__visitanteDecidiu && visitanteTemDados()){ perguntarVisitante(modo); return; }
  abrirJanelaLogin(modo);
}
function abrirJanelaLogin(modo){
  window.__authPasso = 'inicio';
  configurarAuthModal(modo);
  document.getElementById('auth-modal').classList.add('open');
}
// TROCAR quando o Supabase estiver ligado: aqui entra o login de verdade com a conta Google
function auContinuarGoogle(){
  mostrarToast('Entrar com Google estará disponível em breve. Por enquanto, continue com seu e-mail.');
}
function auEscolher(modo){ if(modo==='visitante'){ entrarComoVisitante(); return; } auAbrirLogin(modo); }
function auFecharLogin(){ const m = document.getElementById('auth-modal'); if(m) m.classList.remove('open'); }
document.addEventListener('keydown', e=>{ if(e.key==='Escape') auFecharLogin(); });
document.addEventListener('input', e=>{ if(e.target && e.target.id==='busca-global' && !window.__logado) auFiltrar(e.target.value); });
