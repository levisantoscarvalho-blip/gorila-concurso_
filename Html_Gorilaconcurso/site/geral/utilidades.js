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
// TELA VAZIA — nunca mostrar um espaço vazio: desenho + frase útil + botão para começar
// (como a Amazon faz quando não há nada para mostrar). Cores em geral/base.css (.iv-*)
// ════════════════════════════════════════════
// Estilo profissional: um "cartão" do próprio site em traço limpo, nas cores do site,
// com o selo do gorila (marca) no canto. Nada de desenho infantil.
const SELO_GORILA = (x,y) => `<circle cx="${x}" cy="${y}" r="17" class="iv-selo"/><image href="imagens/gorila.webp" x="${x-12}" y="${y-12}" width="24" height="24" preserveAspectRatio="xMidYMid meet"/>`;
const DESENHOS = {
  // lista de matérias com caixas marcadas e barra de progresso (= tela Conteúdos)
  cursos: `<rect x="44" y="25" width="112" height="92" rx="10" class="iv-sombra-c"/><rect x="44" y="20" width="112" height="92" rx="10" class="iv-cartao"/>
    <rect x="56" y="32" width="46" height="7" rx="3.5" class="iv-esq-forte"/><rect x="122" y="31" width="22" height="9" rx="4.5" class="iv-ac2"/>
    <rect x="56" y="50" width="10" height="10" rx="2.5" class="iv-ac"/><path d="M58.6 55.2l1.8 1.8 3.4-3.6" class="iv-check"/><rect x="72" y="52" width="58" height="6" rx="3" class="iv-esq"/>
    <rect x="56" y="66" width="10" height="10" rx="2.5" class="iv-ac"/><path d="M58.6 71.2l1.8 1.8 3.4-3.6" class="iv-check"/><rect x="72" y="68" width="44" height="6" rx="3" class="iv-esq"/>
    <rect x="56" y="82" width="10" height="10" rx="2.5" class="iv-cb"/><rect x="72" y="84" width="52" height="6" rx="3" class="iv-esq"/>
    <rect x="56" y="99" width="88" height="5" rx="2.5" class="iv-esq"/><rect x="56" y="99" width="58" height="5" rx="2.5" class="iv-ac"/>
    ${SELO_GORILA(156,110)}`,
  // tópico central ligado a subtópicos (= Mapa Mental)
  mapa: `<path d="M86 60C70 52 66 40 62 34M114 60C130 50 134 38 140 32M88 76C72 86 66 96 62 102" class="iv-conector"/>
    <rect x="22" y="22" width="44" height="22" rx="7" class="iv-cartao"/><rect x="30" y="30" width="28" height="6" rx="3" class="iv-esq"/>
    <rect x="134" y="20" width="44" height="22" rx="7" class="iv-cartao"/><rect x="142" y="28" width="22" height="6" rx="3" class="iv-esq"/>
    <rect x="26" y="94" width="44" height="22" rx="7" class="iv-cartao"/><rect x="34" y="102" width="26" height="6" rx="3" class="iv-esq"/>
    <rect x="72" y="55" width="56" height="30" rx="9" class="iv-sombra-c" transform="translate(0 4)"/><rect x="72" y="52" width="56" height="30" rx="9" class="iv-ac"/>
    <rect x="82" y="61" width="36" height="5" rx="2.5" class="iv-branco"/><rect x="82" y="70" width="22" height="5" rx="2.5" class="iv-branco" opacity=".7"/>
    ${SELO_GORILA(158,104)}`,
  // folha de calendário com dias marcados (= Mural / Calendário)
  mural: `<rect x="46" y="25" width="108" height="92" rx="10" class="iv-sombra-c"/><rect x="46" y="20" width="108" height="92" rx="10" class="iv-cartao"/>
    <path d="M46 30a10 10 0 0 1 10-10h88a10 10 0 0 1 10 10v10H46z" class="iv-ac"/><rect x="58" y="27" width="34" height="6" rx="3" class="iv-branco"/>
    ${[0,1,2].map(l=>[0,1,2,3,4].map(c=>{ const marc={'0,1':'iv-ac','0,3':'iv-ac2','1,0':'iv-ac2','1,2':'iv-ac','2,1':'iv-ac','2,4':'iv-ac2'}[l+','+c]||'iv-esq'; return `<rect x="${56+c*18.5}" y="${50+l*18}" width="14" height="12" rx="3" class="${marc}"/>`; }).join('')).join('')}
    ${SELO_GORILA(156,110)}`,
  // calendário desligado: folha em cinza + chave desligada (no lugar do antigo emoji de pausa)
  desligado: `<rect x="46" y="25" width="108" height="92" rx="10" class="iv-sombra-c"/><rect x="46" y="20" width="108" height="92" rx="10" class="iv-cartao"/>
    <path d="M46 30a10 10 0 0 1 10-10h88a10 10 0 0 1 10 10v10H46z" class="iv-esq-forte"/><rect x="58" y="27" width="34" height="6" rx="3" class="iv-branco" opacity=".8"/>
    ${[0,1,2].map(l=>[0,1,2,3,4].map(c=>`<rect x="${56+c*18.5}" y="${50+l*18}" width="14" height="12" rx="3" class="iv-esq"/>`).join('')).join('')}
    <rect x="128" y="96" width="40" height="22" rx="11" class="iv-chave"/><circle cx="139" cy="107" r="8" class="iv-branco"/>`,
  // folha do dia em branco com "+" (= registrar o dia)
  dia: `<rect x="60" y="23" width="80" height="96" rx="10" class="iv-sombra-c"/><rect x="60" y="18" width="80" height="96" rx="10" class="iv-cartao"/>
    <rect x="72" y="30" width="38" height="7" rx="3.5" class="iv-esq-forte"/>
    <rect x="72" y="46" width="56" height="6" rx="3" class="iv-esq"/><rect x="72" y="58" width="44" height="6" rx="3" class="iv-esq"/>
    <rect x="72" y="76" width="56" height="26" rx="7" class="iv-tracejado"/><path d="M100 84v10M95 89h10" class="iv-mais"/>
    ${SELO_GORILA(144,108)}`,
};
// o: {desenho, titulo, texto, passos:[...], botao:'texto', acao:'código onclick', compacto:true}
function telaVazia(o){
  const svg = `<svg class="tv-desenho" viewBox="0 0 200 135" aria-hidden="true">${DESENHOS[o.desenho]||DESENHOS.dia}</svg>`;
  const passos = (o.passos||[]).length ? `<ol class="tv-passos">${o.passos.map(p=>`<li>${p}</li>`).join('')}</ol>` : '';
  const botao = o.botao ? `<button type="button" class="tv-botao" onclick="${o.acao}">${o.icone===false?'':ICO.mais+' '}${o.botao}</button>` : '';
  return `<div class="tela-vazia${o.compacto?' compacta':''}">${svg}<h3>${o.titulo}</h3>${o.texto?`<p>${o.texto}</p>`:''}${passos}${botao}</div>`;
}

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


function mostrarToast(msg){
  const wrap = document.getElementById('toast-wrap');
  if(!wrap) return;
  const el = document.createElement('div');
  el.className = 'toast-msg';
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 3000);
}

// ── Foguinho (desenho estilo TikTok) ──
// REGRA DO LEVI: o foguinho NUNCA apaga e NUNCA fica cinza — nem depois de 1 dia, 1 ano ou mais sem estudar.
// O número é o total de dias estudados e NUNCA zera. Ao registrar o estudo de hoje, a chama dá um "pulo" (animação).
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
    ? `<div class="fogo-status ok">Você já estudou hoje. Mais um dia somado!</div>`
    : total>0
      ? `<div class="fogo-status">Estude hoje para somar mais um dia ao seu foguinho.<span class="fogo-tempo">O dia acaba em ${fogoFaltaHoje()}</span></div>`
      : `<div class="fogo-status">Registre o seu primeiro dia de estudo e comece a contar.</div>`;
  const c=document.createElement('div');
  c.className='fogo-cartao'; c.setAttribute('role','dialog'); c.onclick=e=>e.stopPropagation();
  c.innerHTML=`<span class="foguinho-emoji fogo-grande fogo-aceso"><svg class="fogo-svg" viewBox="0 0 24 28" aria-hidden="true"><use href="#fogoTT"/></svg></span>
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
let fogoJaEstudouHoje = null;
function updateFoguinho() {
  const total = fogoTotal(), hoje = fogoEstudouHoje();
  const somouAgora = fogoJaEstudouHoje===false && hoje;   // acabou de registrar o estudo de hoje
  fogoJaEstudouHoje = hoje;
  ['-home', '-sb'].forEach(suf => {
    const fn = document.getElementById('foguinho-num' + suf);
    const fi = document.getElementById('foguinho-icon' + suf);
    if(!fn || !fi) return;
    fn.textContent = total;
    fi.classList.add('fogo-aceso'); fi.classList.remove('fogo-apagado');   // sempre aceso
    const box = fi.closest('.foguinho-box');
    if(box){ box.classList.remove('apagado'); box.title = `${total} ${total===1?'dia estudado':'dias estudados'}`; }
    if(somouAgora) fogoAnimar(fi);
  });
}
const bgNorm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
