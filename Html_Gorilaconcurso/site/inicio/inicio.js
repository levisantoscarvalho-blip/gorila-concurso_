/* ════════════════════════════════════════════
   PÁGINA PRINCIPAL (16/10/2026) — referência escolhida pelo Levi: a faixa de entrada do Qconcursos (só o ESTILO; textos
   e conteúdo são nossos). Faixa grande no degradê da marca (marinho ➔ azul do Pro), título em maiúsculas/itálico branco,
   botão verde, o GORILA da logo em branco à direita (como mascote) e um cartão de vidro com um NÚMERO REAL do dia:
   quantos concursos estão com inscrições abertas (concursos-levantamento.js). Aparece no lugar da tela em branco
   (mostrarNoticias(true) em geral/navegacao.js).
   ════════════════════════════════════════════ */
const iniNum = n=>Number(n||0).toLocaleString('pt-BR');

// concursos com inscrições abertas hoje (sem repetir) e quantos estados têm algum
function iniAbertos(){
  if(typeof cmFontes!=='function' || typeof cmConcursoHoje!=='function') return {n:0, ufs:0};
  const vistos=new Set(), ufs=new Set();
  cmFontes().forEach(f=>Object.entries(f).forEach(([uf,e])=>{
    [...(e.estaduais||[]), ...Object.values(e.municipais||{}).flat()].forEach(c0=>{
      const c=cmConcursoHoje(c0); if(c.status!=='aberto' && c.status!=='edital') return;
      const k=c.fonte?.url+'|'+c.orgao+'|'+c.cargo; if(vistos.has(k)) return; vistos.add(k); ufs.add(uf);
    });
  }));
  return {n:vistos.size, ufs:ufs.size};
}

function renderInicio(alvo){
  if(!alvo) return;
  const a=iniAbertos();
  alvo.innerHTML=`<section class="ini-faixa">
    <img class="ini-foto" src="imagens/principal.jpg" alt="">
    <div class="ini-txt">
      <h1>Seu próximo<br>concurso</h1>
      <p>Encontre os concursos abertos e previstos e prepare-se com foco na sua aprovação.</p>
      <button type="button" class="ini-bt" onclick="trAbrirNoticias()">Concursos <span aria-hidden="true">›</span></button>
    </div>
    <div class="ini-arte" aria-hidden="true">
      <div class="ini-vidro">
        <small>Hoje no Gorila</small>
        <b>${iniNum(a.n)}</b>
        <span>concursos com<br>inscrições abertas</span>
        <em>em ${a.ufs} estados</em>
      </div>
    </div>
    <svg class="ini-mascote" id="ini-mascote" viewBox="0 0 36 40" aria-hidden="true">
      <g class="ini-braco"><path d="M26 26 L31 10" stroke="#2338c9" stroke-width="5" stroke-linecap="round"/><circle cx="31.5" cy="8.5" r="3.4" fill="#2338c9"/><circle cx="31.5" cy="8.8" r="1.9" fill="#dfe6ff"/></g>
      <ellipse cx="18" cy="31" rx="11" ry="9" fill="#2338c9"/>
      <ellipse cx="18" cy="32" rx="6" ry="5.5" fill="#3b55e0"/>
      <path d="M9 28 L3 27" stroke="#2338c9" stroke-width="5" stroke-linecap="round"/>
      <circle cx="8.5" cy="15" r="2.7" fill="#2338c9"/><circle cx="27.5" cy="15" r="2.7" fill="#2338c9"/>
      <circle cx="8.6" cy="15" r="1.3" fill="#dfe6ff"/><circle cx="27.4" cy="15" r="1.3" fill="#dfe6ff"/>
      <circle cx="18" cy="15" r="10" fill="#2338c9"/>
      <ellipse cx="18" cy="18.5" rx="6.5" ry="5.8" fill="#dfe6ff"/>
      <ellipse cx="15" cy="14" rx="3" ry="2.6" fill="#dfe6ff"/><ellipse cx="21" cy="14" rx="3" ry="2.6" fill="#dfe6ff"/>
      <path d="M11.5 12.2 Q18 9.5 24.5 12.2" stroke="#172a9e" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <circle cx="15" cy="14.3" r="1.15" fill="#111"/><circle cx="21" cy="14.3" r="1.15" fill="#111"/>
      <ellipse cx="18" cy="18" rx="2.6" ry="1.5" fill="#9aa8e0"/><circle cx="17" cy="18.2" r=".5" fill="#172a9e"/><circle cx="19" cy="18.2" r=".5" fill="#172a9e"/>
      <path d="M15.2 21.3 Q18 23.4 20.8 21.3" stroke="#172a9e" stroke-width="1.1" fill="none" stroke-linecap="round"/>
    </svg>
  </section>`;
  requestAnimationFrame(iniPosMascote);
}
// MINI GORILA: agarrado na lateral direita da barra de ícones, na altura do 1º ícone, dando tchau (a barra é fixa e muda de altura com a tela)
function iniPosMascote(){
  const m=document.getElementById('ini-mascote'), rail=document.getElementById('theme-rail'); if(!m) return;
  const r=rail?.getBoundingClientRect();
  if(!r || !r.width){ m.style.display='none'; return; }
  const ic=[...rail.querySelectorAll('button,a')].find(b=>b.offsetParent), topo=ic ? ic.getBoundingClientRect().top : r.top+10;   // 1º ícone VISÍVEL (Sala/Questões podem estar escondidas)
  m.style.display=''; m.style.left=(r.right-4)+'px'; m.style.top=(topo-4)+'px';
}
window.addEventListener('resize', iniPosMascote);
