/* ════════════════════════════════════════════
   GERAL — utilidades
   Foguinho, janelas de confirmação/alerta, avisos (toast).
   ════════════════════════════════════════════ */

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

function tocarFoguinho(box){
  const icon = box.querySelector('.foguinho-emoji');
  if(icon){
    icon.classList.remove('foguinho-pulo');
    void icon.offsetWidth; // reinicia a animação
    icon.classList.add('foguinho-pulo');
  }
  const totalDiasEstudados = Object.values(state.days || {}).filter(isStudyDay).length;
  const frases = totalDiasEstudados > 0
    ? [`🔥 ${totalDiasEstudados} dia(s) estudados no total. Continue assim!`,
       `Cada dia registrado conta. Você já tem ${totalDiasEstudados} no seu histórico!`,
       `Foguinho aceso! ${totalDiasEstudados} dias de estudo registrados.`]
    : ['Registre seu primeiro dia de estudo para acender o foguinho! 🔥'];
  mostrarToast(frases[Math.floor(Math.random()*frases.length)]);
}

function updateFoguinho() {
  // Fixo: soma TODOS os dias que já teve estudo registrado, sem quebrar nunca.
  // Se você esquecer de entrar por dias/semanas, o número continua exatamente onde parou.
  const totalDiasEstudados = Object.values(state.days || {}).filter(isStudyDay).length;

  const ids = ['-home', '-sb'];
  ids.forEach(suf => {
    const fn = document.getElementById('foguinho-num' + suf);
    const fi = document.getElementById('foguinho-icon' + suf);
    if(fn && fi) {
      fn.textContent = totalDiasEstudados;
      // Sempre aceso/colorido — nunca fica cinza ou apagado
      let color = '#ff9900';
      if(totalDiasEstudados >= 7)   color = '#ff6a00';
      if(totalDiasEstudados >= 14)  color = '#ff3d00';
      if(totalDiasEstudados >= 30)  color = '#ff1744';
      if(totalDiasEstudados >= 60)  color = '#d500f9';
      if(totalDiasEstudados >= 100) color = '#00e5ff';
      const blur = 3 + Math.min(totalDiasEstudados / 8, 6);
      const escala = 1 + Math.min(totalDiasEstudados / 150, 0.25);
      fi.style.filter = `drop-shadow(0 0 ${blur}px ${color})`;
      fi.style.transform = `scale(${escala})`;
    }
  });
}
const bgNorm = s => String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
