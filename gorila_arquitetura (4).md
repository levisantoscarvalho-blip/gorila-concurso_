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
  │ [Barra superior (barra-superior/): logo ➔ volta à Tela 1 (trIrInicio()) · BUSCA (busca.js: seus cursos, matérias, dias, mapa mental + notícias/editais na internet) · Ajuda (institucional/ajuda.html) · Planos (institucional/planos.html) · Entrar/Sair · Registrar grátis (só sem conta) · Calendário ON/OFF (só aparece na tela do Calendário) · fundo levemente escuro + linha cinza em volta, igual ao cartão de ícones]
  │ [Barra de ícones FIXA à direita (#theme-rail: Sala · Calendário · Notícias; Notícias abre uma tela EM BRANCO — ainda não disponível) — NÃO MOVER (layout.css; .main reserva 84px, menos a grade do mês, que passa por baixo da barra para ter o tamanho da versão antiga)]
  │ [Barra lateral: foguinho estilo TikTok (chama desenhada #fogoTT + total de dias, nunca zera; CINZA se ainda não estudou hoje, ACENDE com animação ao registrar o dia; clique ➔ cartão com contagem e tempo até o fim do dia — geral/utilidades.js) · horas do mês + ENGRENAGEM ➔ abrirCores(): "Cores do calendário" (estilo dos dias: Sólido/Degradê/Suave/Contorno/Faixa/Brilho ➔ state.estiloCal · 8 paletas ➔ state.paletaCores + "usar em tudo" · a sombra das FOTOS dos dias segue a cor e o estilo (sombraFoto) · cor de cada curso e registro antigo; paleta completa; tudo é PRÉVIA até o botão Confirmar — fechar/Cancelar desfaz) · tema claro/escuro]
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
  │     │     ├─ [+ "O que você está estudando?" ➔ criarMateria(): só digitar; reconhece cursos e concursos (banco-de-dados/reconhecimento.js: cursoReconhecido, "pc sp" = Polícia Civil SP); cor automática (proximaCor)]
  │     │     ├─ [Clique no dia ➔ openDayModal(data_key): JANELA DO DIA já pronta para editar (#day-modal)]
  │     │     │     ├─ [Título por extenso · ESTUDOS DO DIA (curso | matéria | h | q | ✕) · + Adicionar estudo · Total do dia]
  │     │     │     ├─ [Registros antigos (SEFAZ, Ciência de Dados…) aparecem só para leitura]
  │     │     │     ├─ [FOTO DO DIA: Adicionar / Trocar / Remover ➔ diaFotoEscolhida(), diaRemoverFoto()]
  │     │     │     ├─ [Remover dia ➔ diaRemoverDia() · Cancelar · Salvar ➔ saveDayEdit()]  (máx. 24h por dia)
  │     │     │     └─ [Grava em state.days[data_key: YYYY-MM-DD]: estudos[] {cursoId, cursoNome, materiaId, materiaNome, horas, questoes}, foto]
  │     │     │         (campo antigo "saude" não aparece mais na janela, mas é guardado como estava)
  │     │     ├─ [Fotos do dia ➔ IndexedDB gorila-fotos (cada foto 1 vez; sem uso = apagada)]
  │     │     │     ├─ [Guarda a foto ORIGINAL (comprimirImagem só reduz acima de 4 MB)]
  │     │     │     └─ [No calendário (renderCal): filtro da versão antiga com a cor do dia escurecida (escurecerCor); sem curso = azul-marinho; ícone de foto só ao passar o mouse]
  │     │     └─ [Interruptor ON/OFF ➔ toggleCalendarioAtivo() ➔ state.calendarioAtivo]  (OFF só esconde, não apaga)
  │     │
  │     ├─ ▧ [Aba 2: Mural do mês (#tab-mural)]  [calendario/mural.js ➔ renderMural() · mural.css]
  │     │     ├─ [1º Meses do ano (12 botões com nº de dias) + ‹ ano › ➔ muralEscolherMes(i), muralMudarAno()]
  │     │     ├─ [2º Calendário do mês: dias estudados na cor do curso ➔ muralEscolherDia(data_key)]
  │     │     └─ [3º "Você fez" (#mural-fez) ➔ muralPainelDia(): horas, questões, foto, o que estudou, assunto e Saúde (se escritos)]
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
  │     └─ ▧ [Aba 4: Mapa Mental (janela #mindmap-modal)]  [sala-de-estudo/mapa-mental.js]
  │           └─ [Tópicos ➔ subtópicos ➔ texto e imagem ➔ state.mindMap.topicos[]]
  │
  └─► □ [Ícone NOTÍCIAS (#tr-noticias) ➔ trAbrirNoticias()]  [noticias/]
        └─ ▧ [Por enquanto só o botão "← Voltar ao calendário" (conteúdo a definir)]

■ [TEMA CLARO / ESCURO]  [botão "Tema escuro/claro" na barra lateral ➔ toggleTheme() em geral/tema.js ➔ state.theme]
  │ [Animações de toque: geral/base.css ➔ tudo que se clica sobe ao passar o mouse e afunda ao clicar; janelas abrem com "pop"]
  │ [Cores: geral/base.css ➔ :root = escuro (cinza neutro, estilo YouTube; azul só nos botões), body.light = claro]  (usar sempre as variáveis --bg, --surface-*, --text-*)
  └ [No escuro, o logo do gorila ganha fundo claro redondo (barra-superior.css) e os ícones da direita ficam azul-claro (layout.css)]

■ [PÁGINAS DO SITE]  [institucional/: ajuda.html · planos.html · termos.html · privacidade.html · contato.html · institucional.css]
  └ (versão preliminar; Contato ainda sem e-mail ➔ trocar no comentário "TROCAR" de contato.html; Planos ainda sem preços ➔ "TROCAR" de planos.html)

■ [DADOS]  [banco-de-dados/]
  │ [armazenamento.js] ➔ único arquivo que lê/grava (get, set, delete, list) ➔ trocar aqui ao ir para o Supabase
  │ [estado.js] ➔ state em STORAGE_KEY = guia_estudos_state_v1 ➔ loadState(), saveState() (automático a cada mudança)
  │   └ (duas abas: quando outra aba salva, esta recarrega o state — evento 'storage' — para uma não apagar a outra)
  │ [ver-dados.html] ➔ ver o que está salvo · Baixar backup · Importar meus dados (.json)
  └ [Visitante: saveState() não grava nada]
```

**Campos do state:** days, cursos, conteudosCustom, trilhasCustom, trilhasOcultas, mindMap, checks, calendarioAtivo, theme, concursosInteresse, foguinhoStart, month, year, coresAreas, estiloCal, paletaCores.
