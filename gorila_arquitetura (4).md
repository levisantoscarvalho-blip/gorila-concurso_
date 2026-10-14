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
  ├─► □ [Botão "Entrar ▾" (#tb-entrar) ➔ menu: Entrar · Criar conta · Continuar sem cadastro]
  │     │
  │     ├─ ▧ [Janela de acesso (#auth-modal), abas Entrar / Criar conta]
  │     │     ├─ [Entrar ➔ entrarLogin()]  (5 tentativas erradas = espera de 30s)
  │     │     ├─ [Criar conta ➔ cadastrar()]  (guarda o que o visitante já fez: juntarDadosDoVisitante())
  │     │     └─ [Esqueci minha senha ➔ esqueciSenha()]
  │     │
  │     └─ ▧ [Continuar sem cadastro ➔ entrarComoVisitante()]  (visitante: nada é gravado)
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

■ [DADOS]  [banco-de-dados/]
  │ [armazenamento.js] ➔ único arquivo que lê/grava (get, set, delete, list) ➔ trocar aqui ao ir para o Supabase
  │ [estado.js] ➔ state em STORAGE_KEY = guia_estudos_state_v1 ➔ loadState(), saveState() (automático a cada mudança)
  │ [ver-dados.html] ➔ ver o que está salvo · Baixar backup · Importar meus dados (.json)
  └ [Visitante: saveState() não grava nada]
```

**Campos do state:** days, cursos, conteudosCustom, trilhasCustom, trilhasOcultas, mindMap, checks, calendarioAtivo, theme, concursosInteresse, foguinhoStart, month, year.
