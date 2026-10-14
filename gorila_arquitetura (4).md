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
  │           │     └─ [Criar conta (#auth-cadastro) ➔ cadastrar()]  (guarda o que o visitante já fez: juntarDadosDoVisitante())
  │           │
  │           ├─ [Trocar: "Não tem uma conta? Criar conta grátis" / "Já tem uma conta? Entrar" (#au-trocar)]
  │           └─ [Rodapé: "Ao continuar, você concorda com os Termos de uso e a Política de privacidade" ➔ institucional/]
  │
  ├─► □ [Ícones Calendário / Notícias SEM conta ➔ entrarComoVisitante()]
  │     └─ (conhecer o site sem cadastro: tudo funciona, nada é salvo; aviso "modo visitante" + botão "Entrar" no topo)
  │
  │
  └─► [Conta salva em PERFIL_KEY = guia_estudos_perfil_v1 (nome, e-mail, senha codificada)]
                │
                ▼
■ [TELA 2: APP]  ➔ abre direto no Guia Geral (Calendário)
  │ [Barra superior (barra-superior/): logo ➔ volta à Tela 1 (trIrInicio()) · busca (busca.js) · Calendário ON/OFF · Entrar/Sair]
  │ [Barra de ícones da direita (#theme-rail, geral/navegacao.js)]
  │ [Barra lateral: foguinho (dias estudados) · horas do mês · tema claro/escuro]
  │
  ├─► □ [Ícone SALA DE ESTUDOS (#tr-sala)]  ➔ por enquanto só mostra "em breve"
  │     └─ (código pronto em sala-de-estudo/: trilhas.js, painel.js — ainda sem botão na tela)
  │
  ├─► □ [Ícone CALENDÁRIO (#tr-calendario) ➔ trAbrirCalendario() ➔ openSection('guia')]
  │     │
  │     ├─ ▧ [Aba 1: Calendário (#tab-calendario)]  [calendario/calendario.js]
  │     │     ├─ [4 cartões ➔ updateStats(): Dias estudados no total (= foguinho) · Dias estudados este mês ·
  │     │     │   Sequência atual (dias seguidos) · Média por dia estudado este mês]  (na visão Ano: "neste ano")
  │     │     ├─ [Visão Mês / Ano ➔ setCalView()]  [Ano: Cores / Fotos ➔ setCalYearView()]
  │     │     ├─ [Botão Registrar hoje ➔ registrarHoje()]
  │     │     ├─ [Clique no dia ➔ openDayModal(data_key) ➔ Editar ➔ saveDayEdit()]  (máx. 24h por dia)
  │     │     │     └─ [Grava em state.days[data_key: YYYY-MM-DD]: estudos[] {cursoId, materiaId, horas, questoes}, foto]
  │     │     ├─ [Fotos do dia ➔ IndexedDB gorila-fotos (cada foto 1 vez; sem uso = apagada)]
  │     │     └─ [Interruptor ON/OFF ➔ toggleCalendarioAtivo() ➔ state.calendarioAtivo]  (OFF só esconde, não apaga)
  │     │
  │     ├─ ▧ [Aba 2: Mural do mês (#tab-mural)]  [calendario/mural.js ➔ renderMural()]
  │     │     └─ [Dias do mês aberto, do mais novo para o mais antigo · apagar dia ➔ deleteDay()]
  │     │
  │     ├─ ▧ [Aba 3: Conteúdos (#tab-conteudos)]  [sala-de-estudo/conteudos.js ➔ renderConteudos()]
  │     │     ├─ [Adicionar curso ➔ criarCurso() ➔ state.cursos[] {id, nome, cor}]
  │     │     │     └─ [Se o nome está no catálogo ➔ matérias entram sozinhas (banco-de-dados/catalogo-concursos.js)]
  │     │     ├─ [Adicionar matéria ➔ criarConteudo() ➔ state.conteudosCustom[] {trilha = id do curso (FK)}]
  │     │     └─ [Checkbox feito ➔ recalcula o progresso]
  │     │     (mesma lista de cursos usada no calendário)
  │     │
  │     └─ ▧ [Aba 4: Mapa Mental (janela #mindmap-modal)]  [sala-de-estudo/mapa-mental.js]
  │           └─ [Tópicos ➔ subtópicos ➔ texto e imagem ➔ state.mindMap.topicos[]]
  │
  └─► □ [Ícone NOTÍCIAS (#tr-noticias) ➔ trAbrirNoticias()]  [noticias/]
        └─ ▧ [Por enquanto só o botão "← Voltar ao calendário" (conteúdo a definir)]

■ [PÁGINAS DO SITE]  [institucional/: termos.html · privacidade.html · contato.html · institucional.css]
  └ (versão preliminar; Contato ainda sem e-mail ➔ trocar no comentário "TROCAR" de contato.html)

■ [DADOS]  [banco-de-dados/]
  │ [armazenamento.js] ➔ único arquivo que lê/grava (get, set, delete, list) ➔ trocar aqui ao ir para o Supabase
  │ [estado.js] ➔ state em STORAGE_KEY = guia_estudos_state_v1 ➔ loadState(), saveState() (automático a cada mudança)
  │ [ver-dados.html] ➔ ver o que está salvo · Baixar backup · Importar meus dados (.json)
  └ [Visitante: saveState() não grava nada]
```

**Campos do state:** days, cursos, conteudosCustom, trilhasCustom, trilhasOcultas, mindMap, checks, calendarioAtivo, theme, concursosInteresse, foguinhoStart, month, year.
