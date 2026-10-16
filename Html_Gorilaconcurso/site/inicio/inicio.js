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
  </section>`;
}
