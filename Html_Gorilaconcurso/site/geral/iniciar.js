/* ════════════════════════════════════════════
   INICIAR O SITE
   Carregado por ÚLTIMO: liga o site depois que todos os outros arquivos carregaram.
   ════════════════════════════════════════════ */

(function(){
  const logo = document.querySelector('.ld-logo'), tb = document.getElementById('tb-logo');
  if(logo && tb) tb.src = logo.src;   // reaproveita a mesma imagem do mascote (sem peso extra)
  renderNewsPanel();
})();


iniciar();
