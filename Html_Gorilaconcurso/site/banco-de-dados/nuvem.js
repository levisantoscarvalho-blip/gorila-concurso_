// ════════════════════════════════════════════
// NUVEM (Supabase) — contas de verdade e progresso salvo na internet (18/10/2026)
// ════════════════════════════════════════════
// Antes, a conta e o progresso ficavam SÓ no navegador (trocou de celular ou limpou o navegador = perdeu tudo).
// Agora:
//   • a CONTA (e-mail + senha, depois Google) fica no Supabase — a senha nunca passa por este código depois do envio
//     e nunca é guardada aqui;
//   • o PROGRESSO (o "state" inteiro) fica na tabela public.progresso, uma linha por pessoa, trancada por RLS
//     (cada um só lê e grava a própria linha — regra no banco, não aqui);
//   • o navegador guarda uma CÓPIA (localStorage, como antes) para abrir rápido; NUVEM_DONO_KEY diz de quem é a cópia,
//     para nunca misturar o progresso de duas pessoas no mesmo computador;
//   • as FOTOS do calendário continuam só no navegador (IndexedDB) por enquanto.
// A chave abaixo é a PÚBLICA ("publishable"): foi feita para ficar no site. A chave secreta NUNCA entra no código.
// Projeto: gorila-concurso (região São Paulo). Endereço liberado na CSP do vercel.json (connect-src).
const NUVEM_URL = 'https://esnradctsbohnyrnxbyh.supabase.co';
const NUVEM_CHAVE = 'sb_publishable_PdCLX4_09eTNX80n_SoG0Q_ESLMCeAq';
const NUVEM_DONO_KEY = 'gorila_nuvem_dono';                  // id da conta dona da cópia local do progresso
const NUVEM_ANTIGO_KEY = 'guia_estudos_state_v1_antes_da_nuvem';   // progresso de antes da nuvem que a pessoa não quis levar (não apaga nada)
const NUVEM_GOOGLE = false;   // ligar quando o "Google" estiver configurado no Supabase (Authentication ➔ Sign In / Providers)

window.sb = (window.supabase && window.supabase.createClient)
  ? window.supabase.createClient(NUVEM_URL, NUVEM_CHAVE, { auth:{ persistSession:true, autoRefreshToken:true, detectSessionInUrl:true } })
  : null;
window.__uid = null;

// endereço para onde os links de e-mail (confirmar conta, nova senha) e o Google mandam a pessoa de volta
const nuvemVolta = () => location.origin + location.pathname;

// erro do Supabase ➔ frase simples em português
function nuvemErro(e){
  const m = String(e?.message || e || ''), c = String(e?.code || '');
  if(/Invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if(/Email not confirmed/i.test(m) || c==='email_not_confirmed') return 'Confirme seu e-mail antes de entrar: abra o link que enviamos para a sua caixa de entrada (veja também o spam).';
  if(/already registered|already been registered/i.test(m) || c==='user_already_exists') return 'Já existe uma conta com este e-mail. Use "Entrar" ou "Esqueci minha senha".';
  if(/rate limit|For security purposes|too many/i.test(m) || /rate_limit/.test(c)) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
  if(/Password should|weak_password|password.*(short|weak)/i.test(m)) return 'Essa senha é fraca demais. Use pelo menos 8 caracteres, com letras e números.';
  if(/Failed to fetch|NetworkError|network/i.test(m)) return 'Sem conexão com o servidor. Verifique sua internet e tente de novo.';
  if(/invalid.*email|Unable to validate email/i.test(m)) return 'Esse e-mail não parece válido.';
  return 'Não foi possível concluir agora. Tente de novo em instantes.';
}

// quem está logado (sessão guardada pelo Supabase neste navegador) — null se ninguém
async function nuvemSessao(){
  if(!window.sb) return null;
  try{ const { data } = await sb.auth.getSession(); return data?.session?.user || null; }catch(e){ return null; }
}
// guarda quem entrou (o resto do site usa perfilSalvo: nome e e-mail para mostrar)
function nuvemUsuario(u){
  window.__uid = u?.id || null;
  perfilSalvo = u ? { nome: u.user_metadata?.nome || u.user_metadata?.full_name || '', email: u.email || '', bootVisto: true, nuvem: true } : null;
}

// quantos dias de estudo há num progresso guardado em texto (para perguntar se leva para a conta)
function nuvemDiasNoTexto(txt){
  try{ const s = JSON.parse(txt); return Object.values(s?.days || {}).filter(d => d && typeof diaVazio==='function' ? !diaVazio(d) : !!d).length; }catch(e){ return 0; }
}

// ANTES de carregar o progresso (loadState): põe no navegador a cópia certa para esta conta.
//   conta com progresso na nuvem       ➔ a cópia local vira a da nuvem
//   conta nova + progresso desta pessoa de antes da nuvem (sem dono) ➔ PERGUNTA se leva para a conta (perguntar=true)
//   cópia de OUTRA conta neste navegador ➔ não usa (começa do zero; a outra pessoa tem a dela na nuvem)
async function nuvemPrepararLocal(perguntar){
  if(!window.sb || !window.__uid) return 'sem-nuvem';
  const { data, error } = await sb.from('progresso').select('dados').eq('user_id', window.__uid).maybeSingle();
  if(error) throw error;
  const dono = localStorage.getItem(NUVEM_DONO_KEY), local = localStorage.getItem(STORAGE_KEY);
  if(data && data.dados){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.dados)); localStorage.setItem(NUVEM_DONO_KEY, window.__uid);
    return 'nuvem';
  }
  if(local && dono === window.__uid){ nuvemAgendar(local, 0); return 'local'; }   // a nuvem ainda não recebeu: manda agora
  if(local && !dono){
    const dias = nuvemDiasNoTexto(local);
    if(dias && perguntar && await customConfirm(`Encontramos ${dias} ${dias===1?'dia':'dias'} de estudo salvos neste navegador, de antes de existir a conta na nuvem. Quer levar esse progresso para a sua conta?`)){
      localStorage.setItem(NUVEM_DONO_KEY, window.__uid); nuvemAgendar(local, 0); return 'levado';
    }
    if(dias) localStorage.setItem(NUVEM_ANTIGO_KEY, local);   // guardado à parte: nada se perde
  }
  localStorage.removeItem(STORAGE_KEY); localStorage.setItem(NUVEM_DONO_KEY, window.__uid);
  return 'novo';
}

// ENVIO para a nuvem: espera a pessoa parar de mexer (~1 s) e manda o progresso inteiro de uma vez.
// Se a internet cair, tenta de novo sozinho (a cada 15 s e quando a conexão volta).
let nuvemPendente = null, nuvemTimer = null, nuvemEnviando = false;
function nuvemAgendar(payload, ms){
  if(!window.sb || !window.__uid || window.__guest) return;
  nuvemPendente = payload; clearTimeout(nuvemTimer);
  nuvemTimer = setTimeout(nuvemEnviar, ms ?? 1000);
}
async function nuvemEnviar(){
  if(nuvemEnviando || nuvemPendente === null || !window.__uid) return;
  nuvemEnviando = true; const payload = nuvemPendente, uid = window.__uid;
  try{
    const { error } = await sb.from('progresso').upsert({ user_id: uid, dados: JSON.parse(payload), atualizado_em: new Date().toISOString() });
    if(error) throw error;
    if(nuvemPendente === payload) nuvemPendente = null;
  }catch(e){
    console.warn('Não foi possível salvar na nuvem agora; tentando de novo em 15 s.', e);
    clearTimeout(nuvemTimer); nuvemTimer = setTimeout(nuvemEnviar, 15000);
  }finally{
    nuvemEnviando = false;
    if(nuvemPendente !== null && nuvemPendente !== payload){ clearTimeout(nuvemTimer); nuvemTimer = setTimeout(nuvemEnviar, 300); }
  }
}
window.addEventListener('online', () => { if(nuvemPendente !== null) nuvemEnviar(); });
// fechando a aba com algo ainda não enviado: o navegador avisa (só nesse caso)
window.addEventListener('beforeunload', e => { if(nuvemPendente !== null && window.__uid){ nuvemEnviar(); e.preventDefault(); e.returnValue = ''; } });

// SAIR: encerra a sessão e tira deste navegador a cópia do progresso (computador compartilhado não guarda nada da pessoa)
async function nuvemSair(){
  if(nuvemPendente !== null){ clearTimeout(nuvemTimer); await nuvemEnviar(); }
  try{ await sb?.auth.signOut(); }catch(e){}
  localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(NUVEM_DONO_KEY);
  nuvemUsuario(null);
}

// LINK "ESQUECI MINHA SENHA": a pessoa volta do e-mail já com uma sessão de recuperação ➔ pede a senha nova aqui
function nuvemPedirNovaSenha(){
  const overlay = document.getElementById('custom-dialog-overlay'), msg = document.getElementById('custom-dialog-msg'), bts = document.getElementById('custom-dialog-buttons');
  if(!overlay) return;
  msg.innerHTML = `<b style="display:block;margin-bottom:8px">Criar uma senha nova</b>
    <input id="nuvem-nova-senha" type="password" autocomplete="new-password" placeholder="Nova senha (8+ caracteres, letras e números)" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid var(--border,#ccc);border-radius:8px;font-size:14px">
    <small id="nuvem-nova-erro" style="display:block;margin-top:6px;color:#dc2626"></small>`;
  bts.innerHTML = '';
  const ok = document.createElement('button'); ok.textContent = 'Salvar senha';
  ok.style.cssText = 'padding:9px 16px;background:var(--accent,#4a6cf7);color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600';
  ok.onclick = async () => {
    const s = document.getElementById('nuvem-nova-senha').value, er = document.getElementById('nuvem-nova-erro');
    const r = regrasSenha(s); if(!r.tamanho || !r.letra || !r.numero){ er.textContent = 'A senha precisa ter pelo menos 8 caracteres, com letras e números.'; return; }
    ok.disabled = true; ok.textContent = 'Salvando...';
    const { error } = await sb.auth.updateUser({ password: s });
    ok.disabled = false; ok.textContent = 'Salvar senha';
    if(error){ er.textContent = nuvemErro(error); return; }
    overlay.style.display = 'none'; customAlert('Senha trocada. Você já está dentro da sua conta.');
  };
  bts.appendChild(ok); overlay.style.display = 'flex';
  setTimeout(() => document.getElementById('nuvem-nova-senha')?.focus(), 50);
}
if(window.sb) sb.auth.onAuthStateChange(ev => { if(ev === 'PASSWORD_RECOVERY') setTimeout(nuvemPedirNovaSenha, 400); });
