/* ════════════════════════════════════════════
   DADOS DO SITE (estado)
   Guarda tudo na variável "state", carrega/salva pelo armazenamento.js,
   e faz backup (exportar/importar).
   ════════════════════════════════════════════ */

// ════════════════════════════════════════════
// DADOS
// ════════════════════════════════════════════
const DIAS_SEM = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// (Listas fixas de disciplinas removidas — agora tudo em Conteúdos é adicionado manualmente pelo usuário)

let state = {
  month: new Date().getMonth(), year: new Date().getFullYear(),
  days: {}, checks: {fac:{}, sefaz:{}, livros:{}}, mapas: [],
  theme: 'light',
  foguinhoStart: null, // Data de início do foguinho
  trilhasCustom: [], // Carreiras adicionadas pelo usuário
  trilhasOcultas: [], // IDs das 4 trilhas fixas que o usuário removeu da tela inicial
  conteudosCustom: [], // Itens de conteúdo adicionados manualmente, ligados a uma trilha
  mindMap: { topicos: [] } // Mapa mental: topicos = [{id,nome,aberto,subtopicos:[{id,nome,aberto,texto,imagem}]}]
};
let currentSection = '';
const STORAGE_KEY = 'guia_estudos_state_v1';

// Cada área tem um tipo de material: PDFs (faculdade) ou Apostilas digitais (concursos)
const AREA_META = {
  ciencia: { nome:'Ciência de Dados', materialLabel:'PDFs lidos', materialKey:'pdfs', materialIcon:'📄' },
  sefaz:   { nome:'SEFAZ SP',         materialLabel:'Apostilas lidas', materialKey:'apostilas', materialIcon:'📘' },
  direito: { nome:'Direito',          materialLabel:'Apostilas lidas', materialKey:'apostilas', materialIcon:'📘' },
  notario: { nome:'Notário',          materialLabel:'Apostilas lidas', materialKey:'apostilas', materialIcon:'📘' },
  eletiva: { nome:'Eletiva de Base',  materialLabel:'Horas de leitura', materialKey:'horasLeitura', materialIcon:'📖', materialTipo:'horas' }
};
const AREAS_ORDEM = ['ciencia','sefaz','direito','notario','eletiva'];
const CONTEUDO_TRILHAS = { ciencia:'Ciência de Dados', sefaz:'SEFAZ SP', direito:'Direito', notario:'Notário e Registrador' };

// Listas fixas de disciplinas (Direito e Notário não têm lista pronta — você adiciona pelo botão "+")
const FACULDADE = [];
const SEFAZ_LISTA = [];
const CONTEUDO_FIXO = { ciencia: FACULDADE, sefaz: SEFAZ_LISTA };

function defaultState(){
  return {month:new Date().getMonth(),year:new Date().getFullYear(),days:{},checks:{fac:{},sefaz:{},livros:{}},mapas:[],theme:'light', corDestaque:'azul', foguinhoStart: null, calendarioAtivo: true, trilhasCustom: [], conteudosCustom: [], cursos: [], materiasEstudo: [], trilhasOcultas: [], concursosInteresse: [], mindMap: { topicos: [] }};
}

function mostrarAvisoSalvamento(sucesso, esgotouTentativas){
  let el = document.getElementById('save-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'save-toast';
    el.style.cssText = 'position:fixed;bottom:18px;right:18px;z-index:3000;padding:10px 16px;border-radius:8px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px;transition:opacity .3s;box-shadow:0 4px 14px rgba(0,0,0,.3);max-width:320px';
    document.body.appendChild(el);
  }
  if(sucesso){
    el.style.background = 'var(--success-bg)';
    el.style.color = 'var(--success)';
    el.style.border = '1px solid var(--success)';
    el.innerHTML = ICO.check+' Salvo';
  } else {
    el.style.background = 'var(--danger-bg)';
    el.style.color = 'var(--danger)';
    el.style.border = '1px solid var(--danger)';
    el.innerHTML = esgotouTentativas
      ? ICO.alerta+' Não foi possível salvar após várias tentativas. Não feche esta página: tente de novo em alguns instantes.'   // (o botão "Exportar" não existe mais na barra lateral)
      : ICO.repetir+' Falha ao salvar, tentando de novo...';
  }
  el.style.opacity = '1';
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(()=>{ el.style.opacity = '0'; }, sucesso ? 1400 : (esgotouTentativas ? 8000 : 2000));
}

// Carrega o progresso salvo (veja banco-de-dados/armazenamento.js)
async function loadState(){
  let tentativa = 0;
  const maxTentativas = 3;
  const delays = [300, 700];
  let carregou = false;

  while (tentativa < maxTentativas && !carregou) {
    try{
      const result = await window.storage.get(STORAGE_KEY, false);
      if(result && result.value){
        let lido;
        try{ lido = JSON.parse(result.value); }
        catch(errLeitura){
          // Dados guardados estragados: NÃO abre em branco por cima deles (o próximo salvamento apagaria tudo).
          // Trava os salvamentos desta visita e avisa; os dados originais ficam intactos no navegador.
          window.__dadosIlegiveis = true;
          console.error('Os dados salvos não puderam ser lidos:', errLeitura);
          carregou = true; break;
        }
        state = Object.assign(defaultState(), (lido && typeof lido==='object' && !Array.isArray(lido)) ? lido : {});
      } else {
        // Nada salvo ainda nesta conta/artifact. Se houver progresso embutido
        // no próprio arquivo (seed de uma versão anterior), usa ele como ponto
        // de partida e já salva, para não perder o progresso na próxima vez.
        const dadosIniciais = window.DADOS_INICIAIS || {};
        if(Object.keys(dadosIniciais).length){
          try{
            const seedData = JSON.parse(JSON.stringify(Object.assign({}, dadosIniciais.preferencias, dadosIniciais.calendario, dadosIniciais.salaDeEstudo)));
            state = Object.assign(defaultState(), seedData);
            if(typeof normalizarCalendario === 'function') normalizarCalendario();
            await window.storage.set(STORAGE_KEY, JSON.stringify(state), false);
          }catch(seedErr){
            console.warn('Não foi possível carregar o progresso embutido (seed):', seedErr);
          }
        }
      }
      // Arruma dados antigos/repetidos do calendário (fotos repetidas, registros vazios, totais)
      if(result && result.value && typeof normalizarCalendario === 'function'){
        normalizarCalendario();
        const arrumado = JSON.stringify(state);
        if(arrumado !== result.value) await window.storage.set(STORAGE_KEY, arrumado, false);
      }
      carregou = true; // chave não existe ainda (primeiro uso) também conta como "carregou" sem erro
    }catch(e){
      // Pode ser: chave ainda não existe (primeiro uso) OU falha real do servidor.
      // Como não dá pra diferenciar com certeza, tentamos de novo algumas vezes.
      console.log(`Tentativa ${tentativa + 1}/${maxTentativas} de carregar dados falhou:`, e);
      tentativa++;
      if(tentativa < maxTentativas){
        await new Promise(r => setTimeout(r, delays[tentativa - 1]));
      }
    }
  }

  if(!carregou){
    console.warn('Não foi possível confirmar se há dados salvos. Mostrando estado em branco — se você já tinha progresso, recarregue a página antes de continuar usando.');
  }

  if(typeof carregarFotos === 'function') await carregarFotos();
  if(!state.temaEscolhido) state.theme = 'light'; // o tema salvo só vale se a pessoa escolheu
  applyTheme();
  updateFoguinho();
  return carregou;
}

// Salva o progresso (veja banco-de-dados/armazenamento.js)
async function saveState() {
  if(typeof updateFoguinho === 'function') updateFoguinho(); // foguinho acende na hora em que o dia de hoje é registrado
  if(window.__guest) return true; // visitante: nada é gravado na conta
  if(window.__dadosIlegiveis){   // dados salvos estragados: não grava por cima (veja loadState)
    if(!window.__avisouIlegivel){ window.__avisouIlegivel = true; customAlert('Não conseguimos ler o seu progresso salvo neste navegador. Para não apagar nada, as mudanças desta visita não serão salvas. Fale com a Equipe de suporte.'); }
    return false;
  }
  if(window.__loadPromise && !window.__dadosProntos){ try{ await window.__loadPromise; }catch(e){} }
  let tentativa = 0;
  const maxTentativas = 3;
  const delays = [600, 1500, 3000]; // ms entre tentativas

  // Apaga do armazenamento as fotos que nenhum dia usa mais (calendario/calendario.js)
  if(typeof limparFotosSemUso === 'function') limparFotosSemUso();

  // Aviso preventivo: o limite de armazenamento é de 5MB. As fotos ficam fora deste
  // limite (IndexedDB); aqui ficam só os textos e números.
  const payload = JSON.stringify(state);
  const tamanhoMB = payload.length / 1024 / 1024;
  if(tamanhoMB > 4){
    mostrarToast(`Atenção: seus dados estão em ${tamanhoMB.toFixed(1)}MB, perto do limite de 5MB. Considere remover fotos antigas do calendário.`);
  }

  while (tentativa < maxTentativas) {
    try {
      const result = await window.storage.set(STORAGE_KEY, payload, false);
      if (result) {
        mostrarAvisoSalvamento(true);
        return true;
      }
    } catch (e) {
      console.error(`Erro ao salvar (tentativa ${tentativa + 1}/${maxTentativas}):`, e);
    }
    tentativa++;
    if (tentativa < maxTentativas) {
      await new Promise(r => setTimeout(r, delays[tentativa - 1]));
    }
  }

  // Esgotou as tentativas — avisa e sugere backup manual
  mostrarAvisoSalvamento(false, true);
  return false;
}

// Duas abas abertas: quando OUTRA aba salva, esta aba traz a versão nova para a memória.
// Sem isso, o próximo salvamento desta aba apagaria o que a outra fez.
window.addEventListener('storage', async e=>{
  if(e.key!==STORAGE_KEY || !e.newValue || window.__guest || !window.__logado) return;
  try{
    const novo = Object.assign(defaultState(), JSON.parse(e.newValue));
    novo.month = state.month; novo.year = state.year;   // o mês aberto é só desta tela
    state = novo;
    if(typeof normalizarCalendario === 'function') normalizarCalendario();
    if(typeof carregarFotos === 'function') await carregarFotos();
    ['updateFoguinho','updateSidebarHours','renderMateriasEstudo','renderCalActive','renderMural','renderConteudos','renderTrilhasFixas','renderCarreirasCustom']
      .forEach(f=>{ try{ if(typeof window[f]==='function') window[f](); }catch(err){} });
  }catch(err){ console.warn('Não foi possível atualizar com os dados da outra aba:', err); }
});

// Baixa um arquivo .json com todo o progresso atual (backup manual)
function exportBackup(){
  try{
    // O backup leva as fotos junto (elas ficam guardadas fora do "state")
    const comFotos = Object.assign({}, state, typeof FOTOS === 'object' ? { fotos: FOTOS } : {});
    const blob = new Blob([JSON.stringify(comFotos, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dataStr = new Date().toISOString().slice(0,10);
    a.href = url;
    a.download = `guia-estudos-backup-${dataStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }catch(e){
    customAlert('Não foi possível gerar o backup: ' + e.message);
  }
}

// Restaura o progresso a partir de um arquivo .json exportado anteriormente
function importBackup(input){
  const file = input.files && input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async (e) => {
    try{
      const parsed = JSON.parse(e.target.result);
      const quer = await customConfirm('Isso vai SUBSTITUIR seu progresso atual pelo conteúdo do arquivo importado. Deseja continuar?');
      if(!quer) return;

      // Avisa se o arquivo é grande (perto do limite de armazenamento) — fotos em base64
      // costumam ser o motivo. Isso não impede a importação, só avisa antes.
      const tamanhoMB = (e.target.result.length / 1024 / 1024).toFixed(1);
      if(e.target.result.length > 4.3 * 1024 * 1024){
        await customAlert(`Atenção: esse backup tem ${tamanhoMB}MB. O limite de armazenamento é de 5MB por conta. Se tiver muitas fotos, a importação pode não conseguir salvar. Vamos tentar mesmo assim.`);
      }

      state = Object.assign(defaultState(), parsed);
      if(typeof normalizarCalendario === 'function') normalizarCalendario();
      applyTheme();
      updateFoguinho();
      if(typeof renderCalActive === 'function') try{ renderCalActive(); }catch(err){}
      if(typeof renderMural === 'function') try{ renderMural(); }catch(err){}
      if(typeof renderTrilhasFixas === 'function') try{ renderTrilhasFixas(); }catch(err){}
      if(typeof renderCarreirasCustom === 'function') try{ renderCarreirasCustom(); }catch(err){}
      if(typeof renderConteudos === 'function') try{ renderConteudos(); }catch(err){}

      const salvou = await saveState();
      if(salvou){
        await customAlert('Backup importado e salvo com sucesso!');
      } else {
        await customAlert('O backup foi carregado na tela, MAS não foi possível salvar (provavelmente o arquivo é grande demais ou houve falha de conexão). Se você recarregar a página agora, vai perder essa importação. Tente novamente, ou reduza o tamanho do backup removendo fotos antigas.');
      }
    }catch(err){
      await customAlert('Arquivo inválido. Selecione um backup .json exportado por este app.');
    }finally{
      input.value = '';
    }
  };
  reader.readAsText(file);
}

// Botão manual: força salvar o estado atual agora, com feedback visual no próprio botão
async function salvarAgora(btn){
  const originalHTML = btn ? btn.innerHTML : null;
  if(btn){
    btn.disabled = true;
    btn.innerHTML = '<span class="icon-emoji" style="animation:spin 0.8s linear infinite">⏳</span> Salvando...';
  }
  await saveState();
  if(btn){
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
}
