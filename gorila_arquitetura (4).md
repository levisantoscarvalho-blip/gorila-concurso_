**Key:**

**■ Tela principal**

**□ Primeiro nível (navegação)**

**▧ Segundo nível (abas, janelas, botões dentro da tela)**

**\[Colchetes] = arquivo, função ou chave de dados**

**──────────────────────────────────────────────────────────────────────────────**

```
■ [TELA 1: ENTRADA]  ➔ usuário abre o site
  │ [index.html #auth-screen]  [login-e-carregamento/login.js ➔ mostrarAuth(), renderLanding()]
  │ [Carregamento em silêncio: carregamento.js ➔ iniciar(), entrarApp()]
  │
  ├─► □ [Botão "Registrar grátis" no canto do topo (#tb-entrar) ➔ auAbrirLogin('cadastro')]
  │     │  (visitante dentro do site: "Entrar" ➔ auAbrirLogin('login'); logado: "Sair")
  │     │
  │     └─ ▧ [Janela de acesso (#auth-modal), no centro]  (fecha no X, clicando fora ou Esc; estilo em login.css)
  │           │  Marca + título: "Crie sua conta grátis" ou "Entrar na sua conta" (AU_TEXTOS, configurarAuthModal(modo))
  │           │
  │           ├─ [PASSO 1 (#au-opcoes) ➔ auPasso('inicio')]
  │           │     ├─ [Continuar com Google ➔ auContinuarGoogle()]  (AINDA NÃO FUNCIONA: só avisa "em breve" ➔ ligar com Supabase)
  │           │     └─ [Continuar com e-mail ➔ auPasso('email')]
  │           │
  │           ├─ [PASSO 2: formulário de e-mail + botão "Voltar" (#au-voltar)]
  │           │     ├─ [Entrar (#auth-login) ➔ entrarLogin()]  (5 tentativas erradas = espera de 30s)
  │           │     │     └─ [Esqueci minha senha ➔ esqueciSenha()]
  │           │     └─ [Criar conta (#auth-cadastro) ➔ cadastrar()]  (o que o visitante fez entra na conta: levarVisitanteParaConta() + juntarDadosDoVisitante() — também no Entrar)
  │           │
  │           ├─ [Trocar: "Não tem uma conta? Criar conta grátis" / "Já tem uma conta? Entrar" (#au-trocar)]
  │           └─ [Rodapé: "Ao continuar, você concorda com os Termos de uso e a Política de privacidade" ➔ institucional/]
  │
  ├─► □ [Ícones Calendário / Notícias SEM conta ➔ entrarComoVisitante()]
  │     └─ (conhecer o site sem cadastro: tudo funciona, nada é salvo; aviso "modo visitante" + botão "Entrar" no topo)
  │     └─ [Visitante que mexeu em algo clica Entrar / Registrar grátis ➔ ANTES pergunta "Quer salvar o que você fez?" (#visitante-modal, login.js)]
  │           ├─ Salvar na minha conta ➔ login/cadastro ➔ junta com a conta sem apagar nada (mesmo dia: soma os estudos; curso de mesmo nome: vira um só)
  │           └─ Descartar ➔ limpa o visitante ➔ login/cadastro
  │
  │
  └─► [Conta salva em PERFIL_KEY = guia_estudos_perfil_v1 (nome, e-mail, senha codificada)]
                │
                ▼
■ [TELA 2: APP]  ➔ abre direto no Guia Geral (Calendário)
  │ [Barra superior (barra-superior/): logo ➔ volta à Tela 1 (trIrInicio()) · BUSCA "Pesquise por concurso, matérias, edital..." (busca.js: tudo DENTRO do site, nada vai ao Google — reconhece concursos/cursos (reconhecimento.js) e matérias (catálogo); clicar num concurso ➔ janela de adicionar já preenchida; seus cursos, dias, mapa mental; "edital" ➔ aviso Em breve, TROCAR quando houver editais) · Ajuda (institucional/ajuda.html: o que cada parte faz e para que serve) · Equipe de suporte (institucional/suporte.html) · VER PLANOS (azul-marinho, cantos arredondados, nunca maior que o Registrar-se) · Registrar-se grátis (sem conta; a janela tem "Já tem conta? Entrar") · Sair (só logado; não há botão Entrar no topo) · no escuro: mesmo fundo da página (#0f0f0f) com linha fina embaixo, como o YouTube; no claro: fundo levemente cinza + linha em volta]
  │ [Barra de ícones FIXA à direita (#theme-rail, de cima para baixo: Sala de estudos · Questões · Calendário · Notícias · ENGRENAGEM (trAbrirConfig) ➔ tela EM BRANCO por enquanto (Configurações ainda vão ser desenvolvidas; a janela #config-modal/abrirConfig fica guardada, sem uso); Sala, Questões e Engrenagem abrem tela EM BRANCO, sem mensagem; Notícias = seção "CONCURSOS E NOTÍCIAS" (nome no ícone da barra): no topo, CABEÇALHO de página integrado ao fundo (cmAvisoHTML ➔ .cm-pagina: "CONCURSOS E NOTÍCIAS" + título "Concursos pelo Brasil" + uma linha); no canto de cima à esquerda do mapa, ESTRELA (cmSobreHTML/cmSobreAlternar) ➔ quadro "O que você pode fazer aqui": 1. Escolher o seu concurso · 2. Acompanhar os concursos (fecha com X, Entendi, estrela ou Esc); 1ª VISITA: primeiro o tour do "?" e, ao concluir ou pular, abre sozinho o quadro da estrela (cmTourPrimeira); DEMAIS VISITAS: o quadro da estrela já aparece ABERTO ao entrar e some quando a pessoa clica no mapa, rola a rodinha ou arrasta o Brasil (cmArrastaInicio/cmRoda); VISTA INICIAL (cmVistaInicial): o Brasil já começa AMPLIADO ao lado do quadro, ocupando ~73% do espaço entre o quadro e os botões (164% no notebook 1366x600); celular/tablet começam com o Brasil inteiro; a mira volta ao Brasil inteiro; abaixo, o MAPA 3D do Brasil (noticias/concursos-mapa.js + .css; contornos do IBGE em noticias/mapa-brasil.js; bandeiras em noticias/bandeiras/UF.png, domínio público). Mapa LEVE: cada estado é um canvas desenhado uma vez (cmDesenharMapaLeve) + camada invisível para o mouse; inclinado; estado AUMENTA com o mouse; CLIQUE NUM ESTADO (cmClicarEstado) ➔ ele fica levantado e aparece GRANDE e FLUTUANDO ao lado do mapa, sem caixa, no espaço livre do mesmo lado, ligado por linha tracejada (cmMostrarDestaque/cmPosicionarDestaque/cmDesenharEstadoGrande), com nome, região, cursor de mouse animado (clica 3 vezes e para) e o aviso "Clique no estado para conferir os concursos e mais!"; clicar no estado flutuante ou de novo no mapa = cmAbrirEstado (PRÓXIMAS ETAPAS, ainda a desenvolver); fecha clicando fora ou Esc; rodinha amplia, arrastar move (com limite, sem selecionar texto; arrastar não escolhe estado); área do mapa vai da borda esquerda até os Números; CONTROLE: + · nível em % · − (apagado em 100%), mira = Brasil inteiro, ? = tour. EMBAIXO do mapa: FAIXA com as 27 bandeiras dos estados passando devagar para a esquerda (cmFaixaHTML; pausa com o mouse). A chamada "Conheça sobre a história do Brasil" foi TIRADA do mapa; a leitura fica GUARDADA para uma área de estudo (abrirHistoria ➔ janela de leitura do tamanho da área (noticias/historia-brasil.js, #historia-modal: linha do tempo em coluna à esquerda com 8 períodos, texto à direita; cada período com "Cai em prova" e REFERÊNCIAS de livros; art. 37, II da Constituição citado literalmente)). Números do Brasil RETIRADOS da tela (cmNumerosHTML guardado). 1ª visita: TOUR GUIADO de 4 passos (cmTour; lembra em localStorage 'gorila_tour_noticias_v1'; o ? mostra de novo). PARTE 1 = só o mapa; a lista de concursos por região (cmListaHTML/cmAtualizar, dados de EXEMPLO em CONCURSOS_EXEMPLO) fica pronta para a próxima parte) — NÃO MOVER (layout.css; .main reserva 84px, menos a grade do mês, que passa por baixo da barra para ter o tamanho da versão antiga)]
  │ [Barra lateral: foguinho estilo TikTok (chama desenhada #fogoTT + total de dias, nunca zera; CINZA se ainda não estudou hoje, ACENDE com animação ao registrar o dia; clique ➔ cartão com contagem e tempo até o fim do dia — geral/utilidades.js) · horas do mês + ENGRENAGEM ➔ abrirCores(): "Cores do calendário" (estilo dos dias: Sólido/Degradê/Suave/Contorno/Faixa/Brilho ➔ state.estiloCal · 20 paletas ➔ state.paletaCores + "usar em tudo" · a sombra das FOTOS dos dias segue a cor e o estilo (sombraFoto) · cor de cada curso e registro antigo; paleta completa; tudo é PRÉVIA até o botão Confirmar — fechar/Cancelar desfaz) · tema claro/escuro]
  │
  ├─► □ [Ícone SALA DE ESTUDOS (#tr-sala)]  ➔ por enquanto só mostra "em breve"
  │     └─ (código pronto em sala-de-estudo/: trilhas.js, painel.js — ainda sem botão na tela)
  │
  ├─► □ [Ícone CALENDÁRIO (#tr-calendario) ➔ trAbrirCalendario() ➔ openSection('guia')]
  │     │
  │     ├─ ▧ [Aba 1: Calendário (#tab-calendario)]  [calendario/calendario.js]
  │     │     ├─ [Linha do título: "Calendário de estudos" + interruptor "Calendário ligado/desligado" à direita (#tb-cal-switch); desligado ➔ tela com desenho + "Ligar o calendário"]
  │     │     ├─ [Mês · Ano · ESTATÍSTICAS (PRO) ➔ calendario/estatisticas.js + estatisticas.css: gráfico em L (horas por dia, 7/30/90 dias, linha da média, mira com o valor) + números (total, média, constância pela mesma regra de "Dias estudados", melhor dia, tendência — "Subindo" quando começa do zero, "—" sem dados —, questões incluindo registros antigos por área); teste grátis de 3 dias (state.estatisticas.testeInicio), botão para desativar (não cobra), depois borrado com cadeado + Ver planos (o fundo borrado usa dados de demonstração, nunca os dados da pessoa); TROCAR: state.pro virá da assinatura]
  │     │     ├─ [4 cartões ➔ updateStats(): Dias estudados no total (= foguinho) · Dias estudados no MÊS DE HOJE · Horas estudadas no total · Média de horas por dia (horas do mês de hoje ÷ dias do mês que já passaram)]  (na visão Ano: "neste ano")
  │     │     ├─ [Visão Mês / Ano ➔ setCalView()]  [Ano: Cores / Fotos ➔ setCalYearView()]
  │     │     ├─ [Botão Registrar hoje ➔ registrarHoje()]
  │     │     ├─ [+ "O que você está estudando?" ➔ criarMateria(): só digitar; reconhece cursos e concursos (banco-de-dados/reconhecimento.js: cursoReconhecido, "pc sp" = Polícia Civil SP); cor automática (proximaCor)]
  │     │     ├─ [Clique no dia ➔ openDayModal(data_key): JANELA DO DIA já pronta para editar (#day-modal)]
  │     │     │     ├─ [Título por extenso · ESTUDOS DO DIA (curso | matéria | h | q | ✕) · + Adicionar estudo · Total do dia]
  │     │     │     ├─ [Registros antigos (SEFAZ, Ciência de Dados…) aparecem só para leitura]
  │     │     │     ├─ [FOTO DO DIA: Adicionar / Trocar / Remover ➔ diaFotoEscolhida(), diaRemoverFoto()]
  │     │     │     ├─ [Remover dia ➔ diaRemoverDia() · Cancelar · Salvar ➔ saveDayEdit()]  (máx. 24h por dia)
  │     │     │     └─ [Grava em state.days[data_key: YYYY-MM-DD]: estudos[] {cursoId, cursoNome, materiaId, materiaNome, horas, questoes}, foto]
  │     │     │         (campo antigo "saude" não aparece mais na janela, mas é guardado como estava)
  │     │     ├─ [Fotos do dia ➔ IndexedDB gorila-fotos (cada foto 1 vez; sem uso = apagada; imagens do Mapa Mental também contam como "em uso")] · [Dia que ainda não chegou: não aceita estudo (saveDayEdit)]
  │     │     │     ├─ [Guarda a foto ORIGINAL (comprimirImagem só reduz acima de 4 MB)]
  │     │     │     └─ [No calendário (renderCal): filtro da versão antiga com a cor do dia escurecida (escurecerCor); sem curso = azul-marinho; ícone de foto só ao passar o mouse]
  │     │     └─ [Interruptor ON/OFF ➔ toggleCalendarioAtivo() ➔ state.calendarioAtivo]  (OFF só esconde, não apaga)
  │     │
  │     ├─ ▧ [Aba 2: Mural do mês (#tab-mural)]  [calendario/mural.js ➔ renderMural() · mural.css] — meses à ESQUERDA, mês escolhido AO LADO
  │     │     ├─ [Esquerda: 12 meses (cartões com dias, horas, barrinha, selo "Este mês") + ‹ ano › ➔ muralEscolherMes(i) · abre já no mês de hoje (muralReiniciar)]
  │     │     ├─ [Ao lado: calendário do mês (entra animado) ➔ muralEscolherDia(k)]
  │     │     └─ [Embaixo do calendário: "Você fez" do dia (muralDetalhe/muralPainelDia): horas, questões, o que estudou, anotação, foto]
  │     │           └─ [Abrir / editar ➔ openDayModal() · Remover ➔ deleteDay() · dia vazio: Registrar este dia]
  │     │
  │     ├─ ▧ [Aba 3: Conteúdos (#tab-conteudos)]  [sala-de-estudo/conteudos.js ➔ renderConteudos()]
  │     │     ├─ [Adicionar curso ➔ criarCurso() ➔ state.cursos[] {id, nome, cor}]
  │     │     │     └─ [Matérias NÃO entram sozinhas: cada pessoa adiciona as dela (o catálogo só sugere o nome do curso)]
  │     │     ├─ [Adicionar matéria ➔ criarConteudo() ➔ state.conteudosCustom[] {trilha = id do curso (FK)}]
  │     │     │     └─ [Reconhece ao digitar ➔ materiaSugerir(), materiaReconhecida(): "portugues" = Língua Portuguesa; lista = catálogo + MATERIAS_EXTRAS + MATERIAS_APELIDOS; não deixa repetir no mesmo curso]
  │     │     └─ [Checkbox feito ➔ recalcula o progresso]
  │     │     (mesma lista de cursos usada no calendário)
  │     │
  │     └─ ▧ [Aba 4: Mapa Mental (janela #mindmap-modal)]  [sala-de-estudo/mapa-mental.js] ➔ imagens dos subtópicos no IndexedDB (s.imgId, mmImg); formato antigo (s.imagem nos dados) é migrado sozinho
  │           └─ [Tópicos ➔ subtópicos ➔ texto e imagem ➔ state.mindMap.topicos[]]
  │
  └─► □ [Ícone NOTÍCIAS (#tr-noticias) ➔ trAbrirNoticias()]  [noticias/]
        └─ ▧ [CONCURSOS PELO BRASIL (noticias/concursos-mapa.js + .css): cabeçalho da página · mapa 3D com as bandeiras (zoom pela rodinha, arrastar, botões + / − / mira / ?) · estrela ➔ quadro "O que você pode fazer aqui" · 1ª visita: tour guiado · LETREIRO embaixo: um concurso procurado de cada estado + a bandeira do estado (CM_FAIXA_CONCURSOS — lista escolhida à mão, só nomes, sem datas/vagas; trocar pelos mais marcados como interesse quando houver servidor; velocidade fixa ~43 px/s em cmFaixaVelocidade; FAIXA FINA de ponta a ponta em cima dele: "Concursos procurados em cada estado" — .cm-faixa-rotulo; o mapa ficou 28px mais baixo para o letreiro não mudar de lugar) · clicar num estado ➔ estado grande com a bandeira ao lado]
            ├─ [ESTADO ABERTO (2º clique no estado, ou clique no estado flutuando) ➔ cmAbrirEstado(): o Brasil some e o estado aparece GRANDE dividido nas MESORREGIÕES do IBGE, cada uma com uma cor e o nome escrito em cima SÓ quando cabe inteiro dentro dela (tamanho da letra medido; nunca invade a vizinha); passando o mouse, QUALQUER mesorregião clareia e mostra o nome num balão junto do mouse (cmMesoSobre/cmMesoDicaMove); com o estado aberto SOME o título da página (cabeçalho "Concursos pelo Brasil", visibility:hidden — classe cm-modo-estado no #news-screen); o "Voltar ao Brasil" + "Estado · N mesorregiões" sobem para o lugar do título, e o LADO ESQUERDO mostra a BANDEIRA DO ESTADO TREMULANDO com as cores reais e sombra (canvas animado #cm-ev-bandeira, cmBandeiraOndular: faixas verticais em onda, presa no lado do mastro; para ao fechar; parada se o sistema pedir menos movimento; não aparece no celular); o LETREIRO de baixo troca para os concursos daquele estado (cmFaixaTrocar: "Concursos no Maranhão" + legenda; SÓ TEXTO: bolinha verde (em alta) ou azul (previsto) + nome em cor neutra, separados por traço fino, intercalados, sem bandeiras — ⚠ dados de exemplo em cmConcursosDoEstado até haver o cadastro no Supabase) e volta ao letreiro do Brasil ao sair; e o estado fica na METADE DIREITA, usando a altura toda da tela; o estado com a bandeira e a estrela somem, e a metade esquerda fica livre para a próxima etapa; botão "Voltar ao Brasil" ou Esc ➔ cmFecharEstado(). Contornos em noticias/mesorregioes/UF.js (um arquivo por estado, 137 mesorregiões, carregado só quando abre). Celular: o estado ocupa a tela toda. Próximo passo: concursos de cada mesorregião]
            └─ [DICA: mouse branco "clicando" no espaço livre acima do mapa, à esquerda do zoom, + balão "Clique em um estado" (cmDicaHTML/cmPosicionarDica) ➔ some ao clicar num estado e volta na próxima visita; só no computador (some abaixo de 1000px)]

■ [TEMA CLARO / ESCURO]  [botão "Tema escuro/claro" na barra lateral ➔ toggleTheme() em geral/tema.js ➔ state.theme]
  │ [Acabamento visual: geral/acabamento.css (ÚLTIMO CSS; fonte Inter, botões 8px, menu, interruptor "Calendário ligado", Mês/Ano, etiquetas de curso + "Adicionar", ícones da direita 52px, barra de cima com linha só embaixo) — só aparência, nada muda de lugar]
  │ [Celular (até 760px): barra lateral vira faixa em cima com o menu em abas; conteúdo em largura total (layout.css)]
  │ [Telas vazias: telaVazia() (geral/utilidades.js) ➔ desenho estilo interface com o selo do gorila + frase + botão em Conteúdos, Mapa Mental, Mural e janela de cores; nada fica vazio (exceto Notícias, de propósito)]
  │ [Animações de toque: geral/base.css ➔ tudo que se clica sobe ao passar o mouse e afunda ao clicar; janelas abrem com "pop"]
  │ [Cores: geral/base.css ➔ :root = escuro (padrão YouTube: fundo #0f0f0f, cartões #181818, janelas #212121, ativo #272727; azul forte #2563eb só nos botões de ação, links #3ea6ff), body.light = claro]  (usar sempre as variáveis --bg, --surface-*, --text-*)
  │ [Acabamento do escuro: fim de geral/acabamento.css ➔ títulos pequenos de seção em cinza; item ativo (menu, ícones da direita, estrela) = fundo cinza + texto branco, sem azul-claro nem contorno; números de passo cinza; botões de janelinha (Entendi/Próximo) = pílula branca; sem contorno branco ao clicar]
  └ [No escuro, o logo do gorila ganha fundo claro redondo (barra-superior.css) e os ícones da direita ficam cinza, o da tela atual branco]

■ [PÁGINAS DO SITE]  [institucional/: ajuda.html · suporte.html · planos.html · termos.html · privacidade.html · contato.html · institucional.css]
  └ (versão preliminar; Contato ainda sem e-mail ➔ trocar no comentário "TROCAR" de contato.html; Planos ainda sem preços ➔ "TROCAR" de planos.html; Suporte ainda sem canal ➔ "TROCAR" de suporte.html)

■ [DADOS]  [banco-de-dados/]
  │ [armazenamento.js] ➔ único arquivo que lê/grava (get, set, delete, list) ➔ trocar aqui ao ir para o Supabase
  │ [estado.js] ➔ state em STORAGE_KEY = guia_estudos_state_v1 ➔ loadState(), saveState() (automático a cada mudança); dados salvos ilegíveis ➔ NÃO grava por cima (__dadosIlegiveis) e avisa · [calendario.js sanearDados()] ➔ ao carregar/importar, confere ids, cores, datas e números (backup estragado ou mexido não quebra a página)
  │   └ (duas abas: quando outra aba salva, esta recarrega o state — evento 'storage' — para uma não apagar a outra)
  │ [ver-dados.html] ➔ ver o que está salvo · Baixar backup · Importar meus dados (.json)
  └ [Visitante: saveState() não grava nada]
```

**Campos do state:** days, cursos, conteudosCustom, trilhasCustom, trilhasOcultas, mindMap, checks, calendarioAtivo, theme, concursosInteresse, foguinhoStart, month, year, coresAreas, estiloCal, paletaCores.
