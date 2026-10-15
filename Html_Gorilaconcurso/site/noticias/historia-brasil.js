/* ════════════════════════════════════════════
   NOTÍCIAS — HISTÓRIA DO BRASIL (resumo para leitura)
   Botão "Ler a história do Brasil" no canto do mapa ➔ janela de leitura com linha do tempo.
   Texto escrito para o Gorila Concurso. Cada período tem um "Cai em prova" com o que mais aparece em concursos.
   ════════════════════════════════════════════ */

const HISTORIA_BR = [
  { id:'antes', periodo:'Antes de 1500', titulo:'Os primeiros povos',
    texto:[
      'Muito antes da chegada dos europeus, o território que hoje chamamos de Brasil já era habitado havia milhares de anos. Viviam aqui centenas de povos indígenas, com línguas, costumes e formas de organização próprias, de grandes famílias linguísticas como a tupi-guarani, a macro-jê, a aruak e a karib.',
      'Esses povos dominavam a caça, a pesca, a coleta e a agricultura — a mandioca e o milho eram a base da alimentação de muitos deles — e tinham um conhecimento profundo das plantas, dos rios e das matas. Boa parte das palavras, alimentos e lugares do Brasil de hoje vem dessa herança.'
    ],
    prova:'A diversidade dos povos indígenas e o impacto da colonização sobre eles.',
    fontes:['CUNHA, Manuela Carneiro da (org.). <i>História dos índios no Brasil</i>. São Paulo: Companhia das Letras, 1992.',
            'SCHWARCZ, Lilia M.; STARLING, Heloisa M. <i>Brasil: uma biografia</i>. São Paulo: Companhia das Letras, 2015.'] },

  { id:'colonia', periodo:'1500 – 1822', titulo:'Brasil Colônia',
    texto:[
      'Em 22 de abril de 1500, a esquadra de Pedro Álvares Cabral chegou ao litoral do atual sul da Bahia, e Portugal tomou posse da terra. Nas primeiras décadas, o interesse principal foi o pau-brasil, árvore que deu nome ao país.',
      'Para ocupar o território, a Coroa criou as capitanias hereditárias (1534) e, depois, o Governo-Geral (1549), com sede em Salvador. A economia passou por grandes ciclos: o açúcar no Nordeste, nos séculos XVI e XVII, sustentado pelo trabalho de africanos escravizados; e o ouro em Minas Gerais, no século XVIII, que levou a capital para o Rio de Janeiro em 1763.',
      'O período também teve revoltas contra o domínio português, como a Inconfidência Mineira (1789), da qual Tiradentes se tornou símbolo, e a Conjuração Baiana (1798). Em 1808, fugindo de Napoleão, a família real portuguesa se instalou no Rio de Janeiro e abriu os portos às nações amigas. Em 1815, o Brasil foi elevado a Reino Unido a Portugal e Algarves.'
    ],
    prova:'Capitanias e Governo-Geral, ciclos do açúcar e do ouro, Inconfidência Mineira e a vinda da família real (1808).',
    fontes:['FAUSTO, Boris. <i>História do Brasil</i>. São Paulo: Edusp.',
            'PRADO JÚNIOR, Caio. <i>Formação do Brasil contemporâneo</i>. São Paulo: Companhia das Letras (1ª ed. 1942).',
            'ALENCASTRO, Luiz Felipe de. <i>O trato dos viventes</i>. São Paulo: Companhia das Letras, 2000.'] },

  { id:'imperio', periodo:'1822 – 1889', titulo:'Império',
    texto:[
      'Em 7 de setembro de 1822, Dom Pedro I proclamou a independência do Brasil. A Constituição de 1824 criou o Poder Moderador, que dava ao imperador a palavra final sobre os outros poderes.',
      'Com a abdicação de Dom Pedro I, em 1831, o país viveu o Período Regencial, marcado por revoltas como a Cabanagem, a Sabinada, a Balaiada e a Revolução Farroupilha. Em 1840, o Golpe da Maioridade levou Dom Pedro II ao trono, onde ficou por quase cinquenta anos. Nesse tempo o café se tornou a principal riqueza do país, e o Brasil lutou na Guerra do Paraguai (1864–1870).',
      'A escravidão foi sendo encerrada aos poucos, por pressão interna e externa: a Lei Eusébio de Queirós (1850) proibiu o tráfico, a Lei do Ventre Livre (1871) declarou livres os filhos de mulheres escravizadas nascidos a partir dali e a Lei dos Sexagenários (1885) libertou os escravizados com 60 anos ou mais. Em 13 de maio de 1888, a Lei Áurea aboliu a escravidão — o Brasil foi o último país das Américas a fazê-lo.'
    ],
    prova:'Independência, Constituição de 1824 e Poder Moderador, revoltas regenciais e as leis abolicionistas até a Lei Áurea.',
    fontes:['FAUSTO, Boris. <i>História do Brasil</i>. São Paulo: Edusp.',
            'SCHWARCZ, Lilia M.; STARLING, Heloisa M. <i>Brasil: uma biografia</i>. São Paulo: Companhia das Letras, 2015.',
            'BRASIL. Lei nº 3.353, de 13 de maio de 1888 (Lei Áurea).'] },

  { id:'velha', periodo:'1889 – 1930', titulo:'Primeira República (República Velha)',
    texto:[
      'Em 15 de novembro de 1889, o marechal Deodoro da Fonseca proclamou a República, e a Constituição de 1891 adotou o federalismo e o regime presidencialista.',
      'A política era dominada pelas elites de São Paulo e de Minas Gerais, na chamada política do café com leite, e pelo coronelismo, com o voto de cabresto no interior. O período teve conflitos marcantes, como Canudos (1896–1897), a Revolta da Vacina (1904), a Revolta da Chibata (1910) e a Guerra do Contestado (1912–1916). Nos anos 1920, o movimento tenentista e a Semana de Arte Moderna (1922) mostraram um país em transformação.'
    ],
    prova:'Proclamação da República, Constituição de 1891, café com leite, coronelismo e as revoltas do período.',
    fontes:['CARVALHO, José Murilo de. <i>Os bestializados: o Rio de Janeiro e a República que não foi</i>. São Paulo: Companhia das Letras, 1987.',
            'FERREIRA, Jorge; DELGADO, Lucilia de Almeida Neves (org.). <i>O Brasil Republicano</i>, v. 1. Rio de Janeiro: Civilização Brasileira, 2003.'] },

  { id:'vargas', periodo:'1930 – 1945', titulo:'Era Vargas',
    texto:[
      'A Revolução de 1930 levou Getúlio Vargas ao poder e encerrou a República Velha. O Código Eleitoral de 1932 trouxe o voto feminino e o voto secreto, e a Constituição de 1934 ampliou direitos sociais.',
      'Em 1937, Vargas instalou o Estado Novo, uma ditadura com censura e forte centralização. Ao mesmo tempo, criou boa parte da legislação trabalhista: o salário mínimo (1940) e a Consolidação das Leis do Trabalho, a CLT (1943). O Brasil entrou na Segunda Guerra Mundial ao lado dos Aliados e enviou a Força Expedicionária Brasileira à Itália. Vargas foi deposto em 1945.'
    ],
    prova:'Voto feminino (1932), Constituições de 1934 e 1937, Estado Novo e a criação da CLT (1943).',
    fontes:['FAUSTO, Boris. <i>Getúlio Vargas: o poder e o sorriso</i>. São Paulo: Companhia das Letras, 2006.',
            'CARVALHO, José Murilo de. <i>Cidadania no Brasil: o longo caminho</i>. Rio de Janeiro: Civilização Brasileira, 2001.'] },

  { id:'46', periodo:'1946 – 1964', titulo:'República de 1946',
    texto:[
      'A Constituição de 1946 devolveu a democracia ao país. Vargas voltou eleito em 1951, criou a Petrobras em 1953 e, em meio a uma grave crise política, suicidou-se em 1954.',
      'Juscelino Kubitschek (1956–1961) governou com o Plano de Metas — "cinquenta anos em cinco" — e construiu Brasília, inaugurada em 1960 como nova capital. Depois, Jânio Quadros renunciou em 1961, e João Goulart assumiu em meio a disputas sobre suas reformas de base, num período de forte instabilidade.'
    ],
    prova:'Constituição de 1946, criação da Petrobras, Plano de Metas e a construção de Brasília.',
    fontes:['FERREIRA, Jorge; DELGADO, Lucilia de Almeida Neves (org.). <i>O Brasil Republicano</i>, v. 3. Rio de Janeiro: Civilização Brasileira, 2003.',
            'FAUSTO, Boris. <i>História do Brasil</i>. São Paulo: Edusp.'] },

  { id:'militar', periodo:'1964 – 1985', titulo:'Ditadura Militar',
    texto:[
      'O golpe de 1964 derrubou João Goulart e deu início a um regime governado por generais. Os Atos Institucionais concentraram o poder; o AI-5, de 1968, fechou o Congresso temporariamente, ampliou a censura e abriu caminho para perseguições, prisões e tortura de opositores.',
      'Entre 1968 e 1973, o chamado "milagre econômico" trouxe crescimento acelerado, mas também aumento da dívida externa e da desigualdade. A abertura política começou no governo Geisel e seguiu com a Lei da Anistia (1979), no governo Figueiredo. Em 1984, o movimento Diretas Já levou multidões às ruas pedindo eleições diretas para presidente.'
    ],
    prova:'Golpe de 1964, Atos Institucionais (em especial o AI-5), milagre econômico, Anistia e Diretas Já.',
    fontes:['NAPOLITANO, Marcos. <i>1964: história do regime militar brasileiro</i>. São Paulo: Contexto, 2014.',
            'GASPARI, Elio. <i>A ditadura envergonhada</i>. São Paulo: Companhia das Letras, 2002.',
            'BRASIL. Comissão Nacional da Verdade. <i>Relatório</i>. Brasília: CNV, 2014.'] },

  { id:'nova', periodo:'1985 – hoje', titulo:'Nova República',
    texto:[
      'Em 1985, Tancredo Neves foi eleito de forma indireta, mas morreu antes de tomar posse, e José Sarney assumiu a Presidência. Em 1988 foi promulgada a atual Constituição, chamada de "Constituição Cidadã", que garantiu direitos fundamentais. É dela a regra que dá base a todo concurso: <q>a investidura em cargo ou emprego público depende de aprovação prévia em concurso público de provas ou de provas e títulos</q> (art. 37, II).',
      'Em 1989 ocorreu a primeira eleição direta para presidente desde 1960. Desde então, o país viveu dois processos de impeachment (Fernando Collor, em 1992, e Dilma Rousseff, em 2016), o Plano Real (1994), que estabilizou a moeda e acabou com a hiperinflação, e a alternância de diferentes governos eleitos pelo voto popular.'
    ],
    prova:'Constituição de 1988 (e o art. 37, que trata do concurso público), Plano Real e os impeachments.',
    fontes:['BRASIL. <i>Constituição da República Federativa do Brasil de 1988</i>, art. 37, II.',
            'SCHWARCZ, Lilia M.; STARLING, Heloisa M. <i>Brasil: uma biografia</i>. São Paulo: Companhia das Letras, 2015.',
            'FAUSTO, Boris. <i>História do Brasil</i>. São Paulo: Edusp.'] },
];

function abrirHistoria(id){
  let ov = document.getElementById('historia-modal');
  if(!ov){
    ov = document.createElement('div'); ov.id='historia-modal'; ov.className='modal-overlay';
    ov.onclick = e => { if(e.target===ov) fecharHistoria(); };
    ov.innerHTML = `<div class="modal-inner hb-janela" role="dialog" aria-modal="true" aria-labelledby="hb-titulo">
      <div class="hb-cab">
        <div><div class="hb-sobre">Gorila Concurso · Leitura</div><h2 id="hb-titulo">História do Brasil</h2>
          <p>Um resumo dos grandes períodos, do Brasil antes de 1500 até hoje.</p></div>
        <button type="button" class="dia-fechar" onclick="fecharHistoria()" aria-label="Fechar"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
      </div>
      <nav class="hb-linha" aria-label="Linha do tempo">${HISTORIA_BR.map(p=>`<button type="button" data-id="${p.id}" onclick="hbIr('${p.id}')"><b>${p.periodo}</b><span>${p.titulo}</span></button>`).join('')}</nav>
      <div class="hb-texto" id="hb-texto" onscroll="hbMarcarAtual()">
        ${HISTORIA_BR.map(p=>`<section class="hb-periodo" id="hb-${p.id}">
          <div class="hb-data">${p.periodo}</div><h3>${p.titulo}</h3>
          ${p.texto.map(t=>`<p>${t}</p>`).join('')}
          <div class="hb-prova"><b>Cai em prova</b>${p.prova}</div>
          <div class="hb-fontes"><b>Referências para conferir e se aprofundar</b><ul>${p.fontes.map(f=>`<li>${f}</li>`).join("")}</ul></div>
        </section>`).join('')}
        <p class="hb-fim">Resumo de estudo do Gorila Concurso, conferido com as obras de referência citadas em cada período. Para a prova, siga sempre o conteúdo do edital do seu concurso.</p>
      </div>
    </div>`;
    document.body.appendChild(ov);
  }
  ov.classList.add('open');
  document.getElementById('hb-texto').scrollTop = 0;
  if(id) hbIr(id); else hbMarcarAtual();
}
function fecharHistoria(){ const ov=document.getElementById('historia-modal'); if(ov) ov.classList.remove('open'); }
function hbIr(id){
  const caixa=document.getElementById('hb-texto'), alvo=document.getElementById('hb-'+id); if(!caixa||!alvo) return;
  caixa.scrollTo({ top: alvo.offsetTop - caixa.offsetTop - 8, behavior:'smooth' });
  hbMarcar(id);
}
function hbMarcar(id){ document.querySelectorAll('.hb-linha button').forEach(b=>{ const on=b.dataset.id===id; b.classList.toggle('atual', on); if(on) b.scrollIntoView({block:'nearest', inline:'nearest'}); }); }
// destaca na linha do tempo o período que está sendo lido
function hbMarcarAtual(){
  const caixa=document.getElementById('hb-texto'); if(!caixa) return;
  const topo=caixa.scrollTop + caixa.offsetTop + 40;
  let atual=HISTORIA_BR[0].id;
  HISTORIA_BR.forEach(p=>{ const s=document.getElementById('hb-'+p.id); if(s && s.offsetTop<=topo) atual=p.id; });
  if(caixa.scrollTop + caixa.clientHeight >= caixa.scrollHeight - 4) atual=HISTORIA_BR[HISTORIA_BR.length-1].id;
  document.querySelectorAll('.hb-linha button').forEach(b=>b.classList.toggle('atual', b.dataset.id===atual));
}
document.addEventListener('keydown', e=>{ if(e.key==='Escape') fecharHistoria(); });
