/* ════════════════════════════════════════════
   GERAL — utilidades
   Ícones do site, foguinho, janelas de confirmação/alerta, avisos (toast).
   ════════════════════════════════════════════ */

// ── Ícones do site: desenho de traço simples (no lugar de emojis). Uso: ICO.lixo ──
const ICO = (()=>{
  const s = d => `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  return {
    mais:       s('<path d="M12 5v14M5 12h14"/>'),
    lixo:       s('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'),
    lapis:      s('<path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13.5 6.5l4 4"/>'),
    check:      s('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    imagem:     s('<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>'),
    lupa:       s('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
    calendario: s('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    grafico:    s('<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>'),
    alerta:     s('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'),
    repetir:    s('<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v5h-5"/>'),
    mapa:       s('<circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5V12M12 12l-5.2 5.2M12 12l5.2 5.2"/>'),
    engrenagem: s('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  };
})();

// ════════════════════════════════════════════
// ════════════════════════════════════════════
// FOGUINHO (FIXO — nunca apaga, soma total de dias estudados)
// ════════════════════════════════════════════
function isStudyDay(v){
  if(!v) return false;
  const hasArea = AREAS_ORDEM.some(a => {
    const val = v[a];
    if(!val) return false;
    // Formato antigo (antes da atualização): eletiva podia ser salva como true/false simples.
    if(typeof val !== 'object') return !!val;
    return (val.horas||0) > 0 || (val.questoes||0) > 0 || (val.assunto && val.assunto !== '—') || (val.horasLeitura||0) > 0;
  });
  const hasHoras = (v.horasTotal||0) > 0 || (v.estudos&&v.estudos.length>0);
  return hasArea || hasHoras;
}

// Usado só no card "Sequência atual" do calendário (esse sim quebra se faltar um dia).
// O foguinho principal NÃO usa mais essa função — ele é permanente, veja updateFoguinho().
function calcularSequenciaAtual(){
  let seq = 0;
  const now = new Date();
  let hojeKey = mkKey(now.getFullYear(), now.getMonth()+1, now.getDate());
  let comecarDe = 0;
  if(!isStudyDay(state.days[hojeKey])) comecarDe = 1;

  // Sem limite de dias (antes parava em 365). Para no primeiro dia sem estudo.
  const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - comecarDe);
  while(isStudyDay(state.days[mkKey(dt.getFullYear(), dt.getMonth()+1, dt.getDate())])){
    seq++;
    dt.setDate(dt.getDate()-1);
  }
  return seq;
}

// Substitui window.confirm()/alert() nativos, que podem ficar bloqueados ou ser
// silenciosamente ignorados dentro do iframe sandbox do artifact do Claude.
// Essas versões usam um modal próprio do site, então sempre funcionam.
function customConfirm(msg){
  return new Promise((resolve)=>{
    const overlay = document.getElementById('custom-dialog-overlay');
    const msgEl = document.getElementById('custom-dialog-msg');
    const btnsEl = document.getElementById('custom-dialog-buttons');
    msgEl.textContent = msg;
    btnsEl.innerHTML = '';
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.cssText = 'padding:9px 16px;background:var(--surface-2,#eee);color:var(--text-primary,#333);border:1px solid var(--border,#ccc);border-radius:8px;cursor:pointer;font-size:13px;font-weight:600';
    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Confirmar';
    btnConfirmar.style.cssText = 'padding:9px 16px;background:var(--accent,#4a6cf7);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600';
    const fechar = (resultado) => { overlay.style.display = 'none'; resolve(resultado); };
    btnCancelar.onclick = () => fechar(false);
    btnConfirmar.onclick = () => fechar(true);
    btnsEl.appendChild(btnCancelar);
    btnsEl.appendChild(btnConfirmar);
    overlay.style.display = 'flex';
  });
}
function customAlert(msg){
  return new Promise((resolve)=>{
    const overlay = document.getElementById('custom-dialog-overlay');
    const msgEl = document.getElementById('custom-dialog-msg');
    const btnsEl = document.getElementById('custom-dialog-buttons');
    msgEl.textContent = msg;
    btnsEl.innerHTML = '';
    const btnOk = document.createElement('button');
    btnOk.textContent = 'OK';
    btnOk.style.cssText = 'padding:9px 20px;background:var(--accent,#4a6cf7);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600';
    btnOk.onclick = () => { overlay.style.display = 'none'; resolve(); };
    btnsEl.appendChild(btnOk);
    overlay.style.display = 'flex';
  });
}

// Baixa o HTML completo do site (com o código atual + seus dados embutidos),
// direto pelo navegador — não depende do sistema de download do Claude.
function baixarCopiaHtml(){
  try{
    // Clona o DOM atual e remove imagens já renderizadas na tela (calendário/mural),
    // porque elas são recriadas automaticamente pelo próprio código a partir dos dados
    // (state) assim que a página carrega — mantê-las aqui só duplicaria o mesmo dado
    // duas vezes e infla demais o arquivo final.
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('.cal-bg-img, .mural-img, .edit-foto-preview img').forEach(img => {
      img.removeAttribute('src');
    });

    const fullHtml = clone.outerHTML;

    // IMPORTANTE: para nunca cortar o código errado (o próprio texto desta função
    // contém a sequência de fechamento de script dentro de uma string, o que confundiria uma busca
    // ingênua), a limpeza do backup antigo é feita SÓ dentro do <head>, nunca no
    // documento inteiro. Isso isola completamente esse trecho do resto do código.
    const idxHeadEnd = fullHtml.indexOf('</head>');
    let headPart = idxHeadEnd >= 0 ? fullHtml.slice(0, idxHeadEnd) : fullHtml;
    const restPart = idxHeadEnd >= 0 ? fullHtml.slice(idxHeadEnd) : '';

    headPart = headPart.replace(/<script type="application\/json" id="backup-seed-data">[\s\S]*?<\/script>\s*/g,'');

    const seed = `<script type="application/json" id="backup-seed-data">${JSON.stringify(state)}<\/script>\n`;
    const html = '<!DOCTYPE html>\n' + headPart + seed + restPart;

    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataStr = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `guia-estudos-copia-${dataStr}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const tamanhoMB = (html.length / 1024 / 1024).toFixed(2);
    mostrarToast(`Cópia baixada (${tamanhoMB}MB)!`);
  }catch(e){
    customAlert('Não foi possível gerar a cópia: ' + e.message);
  }
}

// ── Atualizar sistema: cola um HTML novo (dado pelo Claude no chat) e aplica na hora ──
function abrirAtualizarSistema(){
  document.getElementById('atualizar-sistema-textarea').value = '';
  document.getElementById('atualizar-sistema-modal').classList.add('open');
}
function fecharAtualizarSistema(){
  document.getElementById('atualizar-sistema-modal').classList.remove('open');
}
async function aplicarAtualizacaoSistema(){
  const novoCodigo = document.getElementById('atualizar-sistema-textarea').value.trim();
  if(!novoCodigo){ await customAlert('Cole o código novo antes de aplicar.'); return; }

  if(!novoCodigo.includes('<script') || !/<\/html>\s*$/i.test(novoCodigo)){
    await customAlert('O código colado não parece ser um arquivo HTML completo e válido. Verifique se você copiou o arquivo inteiro, do início (<!DOCTYPE html>) até o fim (</html>).');
    return;
  }

  const quer = await customConfirm('Isso vai recarregar o site com o código novo. Seus dados atuais serão salvos antes, e devem continuar intactos depois da atualização. Deseja continuar?');
  if(!quer) return;

  try{
    // Garante que o progresso atual está salvo na nuvem antes de trocar o código,
    // assim o código novo (que também lê da mesma nuvem) encontra tudo certinho.
    await saveState();
    document.open();
    document.write(novoCodigo);
    document.close();
  }catch(e){
    await customAlert('Não foi possível aplicar a atualização: ' + e.message);
  }
}

function mostrarToast(msg){
  const wrap = document.getElementById('toast-wrap');
  if(!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

// ── Foguinho (estilo TikTok) ──
// O número é o total de dias estudados e NUNCA zera (decisão do Levi).
// Como no TikTok: a chama fica CINZA enquanto você não estudou hoje e ACENDE quando registra o dia.
function fogoTotal(){ return Object.values(state.days || {}).filter(isStudyDay).length; }
function fogoEstudouHoje(){ const d=new Date(); return isStudyDay((state.days||{})[mkKey(d.getFullYear(), d.getMonth()+1, d.getDate())]); }
function fogoFaltaHoje(){
  const agora=new Date(), fim=new Date(agora.getFullYear(), agora.getMonth(), agora.getDate()+1);
  const min=Math.max(0, Math.floor((fim-agora)/60000));
  return Math.floor(min/60)+'h '+String(min%60).padStart(2,'0')+'min';
}
function tocarFoguinho(box){
  const icon = box.querySelector('.foguinho-emoji');
  if(icon && fogoEstudouHoje()) fogoAnimar(icon);
  // abre/fecha o cartão
  const aberto = document.querySelector('.fogo-cartao');
  document.querySelectorAll('.fogo-cartao').forEach(c=>c.remove());
  if(aberto && aberto.__dono===box) return;
  const total=fogoTotal(), hoje=fogoEstudouHoje();
  const status = hoje
    ? `<div class="fogo-status ok">Você já estudou hoje. Foguinho aceso!</div>`
    : total>0
      ? `<div class="fogo-status">Estude hoje para acender o seu foguinho.<span class="fogo-tempo">O dia acaba em ${fogoFaltaHoje()}</span></div>`
      : `<div class="fogo-status">Registre o seu primeiro dia de estudo para acender o foguinho.</div>`;
  const c=document.createElement('div');
  c.className='fogo-cartao'; c.setAttribute('role','dialog'); c.onclick=e=>e.stopPropagation();
  c.innerHTML=`<span class="foguinho-emoji fogo-grande ${hoje?'fogo-aceso':'fogo-apagado'}"><svg class="fogo-svg" viewBox="0 0 24 28" aria-hidden="true"><use href="#fogoTT"/></svg></span>
    <b>${total}</b><div class="fogo-rotulo">${total===1?'dia estudado':'dias estudados'}</div>${status}`;
  // fica no <body> (por cima de tudo, sem ser cortado pela barra lateral), logo abaixo do foguinho
  c.__dono=box; document.body.appendChild(c);
  const r=box.getBoundingClientRect(), w=c.offsetWidth;
  c.style.left=Math.max(8, Math.min(innerWidth-w-8, r.left+r.width/2-w/2))+'px';
  c.style.top=(r.bottom+10)+'px';
}
// fecha o cartão ao clicar em qualquer outro lugar
document.addEventListener('click', e=>{ if(!e.target.closest('.foguinho-box,.fogo-cartao')) document.querySelectorAll('.fogo-cartao').forEach(c=>c.remove()); });

// animação de acender (depois volta a balançar normal)
function fogoAnimar(el){ el.classList.remove('fogo-acendendo'); void el.offsetWidth; el.classList.add('fogo-acendendo'); el.addEventListener('animationend', ()=>el.classList.remove('fogo-acendendo'), {once:true}); }
let fogoEstavaAceso = null;
function updateFoguinho() {
  const total = fogoTotal(), aceso = fogoEstudouHoje();
  const acendeuAgora = fogoEstavaAceso===false && aceso;   // registrou o estudo de hoje agora
  fogoEstavaAceso = aceso;
  ['-home', '-sb'].forEach(suf => {
    const fn = document.getElementById('foguinho-num' + suf);
    const fi = document.getElementById('foguinho-icon' + suf);
    if(!fn || !fi) return;
    fn.textContent = total;
    fi.classList.toggle('fogo-aceso', aceso);
    fi.classList.toggle('fogo-apagado', !aceso);
    const box = fi.closest('.foguinho-box');
    if(box){ box.classList.toggle('apagado', !aceso); box.title = aceso ? `${total} dias estudados · aceso hoje` : `${total} dias estudados · estude hoje para acender`; }
    if(acendeuAgora) fogoAnimar(fi);
  });
}
const bgNorm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
