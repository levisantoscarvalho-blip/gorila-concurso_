// ════════════════════════════════════════════
// ARMAZENAMENTO — onde os dados do site ficam guardados
// ════════════════════════════════════════════
// Hoje os dados ficam guardados NO NAVEGADOR (localStorage) de quem usa o site.
// Este é o ÚNICO arquivo que conversa com o "banco de dados". O resto do site só
// chama window.storage.get / set / delete / list.
//
// Quando você for usar um banco de dados de verdade (ex.: Supabase, Firebase),
// basta trocar o que está dentro destas 4 funções — nenhum outro arquivo muda.
//
// Chaves usadas pelo site:
//   'guia_estudos_state_v1'  → todo o progresso (calendário, sala de estudo, preferências)
//   'guia_estudos_perfil_v1' → cadastro (nome, e-mail, senha codificada)
// As FOTOS ficam em outro lugar (window.fotosDB, mais abaixo).

window.storage = {
  async get(key){
    const value = localStorage.getItem(key);
    return value === null ? null : { key, value };
  },
  async set(key, value){
    localStorage.setItem(key, value);
    return { key, value };
  },
  async delete(key){
    localStorage.removeItem(key);
    return { key, deleted: true };
  },
  async list(prefix = ''){
    const keys = [];
    for(let i = 0; i < localStorage.length; i++){
      const k = localStorage.key(i);
      if(k.startsWith(prefix)) keys.push(k);
    }
    return { keys, prefix };
  }
};

// ── FOTOS ──
// As fotos ficam separadas, no IndexedDB do navegador (cabem centenas de MB).
// O localStorage acima só aguenta ~5 MB: com fotos dentro, ele enchia em ~2 anos de uso.
// Banco 'gorila-fotos', tabela 'fotos': { id → imagem em texto (data:image/...) }
window.fotosDB = (() => {
  let conexao = null;
  const abrir = () => conexao || (conexao = new Promise((ok, falha) => {
    const req = indexedDB.open('gorila-fotos', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('fotos');
    req.onsuccess = () => ok(req.result);
    req.onerror = () => falha(req.error);
  }));
  const pedido = async (modo, fazer) => {
    const db = await abrir();
    return new Promise((ok, falha) => {
      const tx = db.transaction('fotos', modo);
      const req = fazer(tx.objectStore('fotos'));
      tx.oncomplete = () => ok(req && req.result);
      tx.onerror = tx.onabort = () => falha(tx.error);
    });
  };
  return {
    set: (id, src) => pedido('readwrite', s => s.put(src, id)),
    delete: id => pedido('readwrite', s => s.delete(id)),
    async todas(){
      const db = await abrir();
      return new Promise((ok, falha) => {
        const tudo = {};
        const req = db.transaction('fotos').objectStore('fotos').openCursor();
        req.onsuccess = () => { const c = req.result; if(c){ tudo[c.key] = c.value; c.continue(); } else ok(tudo); };
        req.onerror = () => falha(req.error);
      });
    }
  };
})();

// Dados iniciais de cada seção (preenchidos pelos arquivos dados-*.js de cada pasta).
// Só são usados na PRIMEIRA vez que o site abre num navegador sem nada salvo.
window.DADOS_INICIAIS = {};
