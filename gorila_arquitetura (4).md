**Key:**

**■ Homepage (Portão de Entrada / Fundo Preto)**

**□ Primary Level (Nível Global de Navegação / Borda Azul)**

**▧ Secondary Level (Sub-abas e Tabelas Dependentes / Caixa Cinza)**

**\[Texto em Azul/Colchetes] = Chaves Lógicas, IDs e Ações de Banco**

**──────────────────────────────────────────────────────────────────────────────**



**■ \[TELA 1: HOMEPAGE (BOOT)] ➔ Usuário abre o link no navegador**

&#x20; **│ \[Ação: Contador de Carregamento 0% a 100%]**

&#x20; **│ \[Mascote animado na tela]**

&#x20; **│**

&#x20; **└───► □ \[Tela de Cadastro Local / Primeiro Acesso]**

&#x20; **│      └─ \[Gera id\_usuario (PK) privado]**

&#x20; **│**

&#x20; **└───► □ \[Tela de Login / Boas-Vindas]**

&#x20;        **└─ \[Valida id\_usuario (PK) - Ex: "Levi Santos"]**

&#x20;             **│**

&#x20;             **▼**

**■ \[TELA 2: MESA DE ESTUDOS (DASHBOARD CENTRAL)] ➔ Usuário é autenticado**

&#x20; **│ \[Estado Ativo Geral: state\_v1]**

&#x20; **│ \[Indicadores Fixos no Topo: Streak Diário 🔥 113 ── Tema Escuro ── Sair]**

&#x20; **│**

&#x20; **├─► □ \[1º CLIQUE: VISÃO GERAL]**

&#x20; **│    └─ ▧ \[Painel Infográfico Dashboard]**

&#x20; **│        └─ \[Puxa métricas agregadas: Horas Acumuladas, Questões Feitas]**

&#x20; **│**

&#x20; **├─► □ \[2º CLIQUE: TRILHAS DE ESTUDO]**

&#x20; **│    ├─ ▧ \[Card: Ciência de Dados] ➔ \[Disciplinas Estácio]**

&#x20; **│    ├─ ▧ \[Card: SEFAZ SP] ➔ \[Concurso Fiscal]**

&#x20; **│    ├─ ▧ \[Card: Direito] ➔ \[Estudo Jurídico Geral]**

&#x20; **│    ├─ ▧ \[Card: Notário e Registrador] ➔ \[Concurso de Cartório]**

&#x20; **│    │**

&#x20; **│    └─ \[AÇÃO SECUNDÁRIA: Botão Adicionar Carreira ➕]**

&#x20; **│       └─ \[Abre Modal: Escolha um Ícone ➔ Cria Curso Pai (PK)]**

&#x20; **│       └─ \[AÇÃO CRÍTICA: Lixeira 🗑️ ➔ ON DELETE CASCADE (Apaga sub-matérias)]**

&#x20; **│**

&#x20; **├─► □ \[3º CLIQUE: GUIA GERAL DE ESTUDOS]**

&#x20; **│    │**

&#x20; **│    ├─ ▧ \[Aba 1: 📅 Calendário de Estudos]**

&#x20; **│    │   ├─ \[Filtro Temporal por Mês/Ano]**

&#x20; **│    │   └─ \[Botão: ➕ Registrar Hoje]**

&#x20; **│    │       └─ \[▲ AGENTE DE IA: Chat Conversal Passo a Passo]**

&#x20; **│    │       └─ \[Grava dados na data\_key (PK): YYYY-MM-DD]**

&#x20; **│    │       └─ \[Ação: Botão Salvar ➔ Executa saveState() (Commit Local)]**

&#x20; **│    │**

&#x20; **│    ├─ ▧ \[Aba 2: 🗒️ Mural do Mês]**

&#x20; **│    │   └─ \[Lista decrescente de atividades salvas por data]**

&#x20; **│    │**

&#x20; **│    ├─ ▧ \[Aba 3: ✅ Conteúdos]**

&#x20; **│    │   ├─ \[Botão: Adicionar Curso/Matéria]**

&#x20; **│    │   │   └─ \[Cria vínculo de Chave Estrangeira (FK) trilha\_pai\_id]**

&#x20; **│    │   └─ \[Mecanismo: Checkbox Feito (Boolean true/false)]**

&#x20; **│    │       └─ \[▲ TRIGGER: Recalcula Métrica de Progresso Geral 0%]**

&#x20; **│    │**

&#x20; **│    └─ ▧ \[Aba 4: 🧠 Mapa Mental]**

&#x20; **│        └─ \[Janela Flutuante Interativa: Novo Tópico ── Subtópicos ── Salvar]**

&#x20; **│**

&#x20; **└─► □ \[4º CLIQUE: MANUTENÇÃO]**

&#x20;      **└─ ▧ \[Botão: 🔧 Atualizar Sistema]**

&#x20;          **└─ \[Abre Modal Overlay: Backup de Segurança ── Cole Código HTML]**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v16 — TELA 1 (BOOT): CARREGAMENTO ENXUTO, ADAPTATIVO E COM PRÉ-CARGA**

**Princípio: a tela dura só o necessário. Some quando o trabalho real termina E o tempo mínimo da conexão passou, ou no limite máximo.**

**\[detectarConexao()] ➔ lê navigator.connection (effectiveType, downlink, rtt, saveData) e navigator.onLine**

  **│ \[rapida]  4G/Wi-Fi ➔ mínimo 0,5s · limite 5s**

  **│ \[media]   3G, downlink < 1,5 Mbps ou rtt > 400 ms ➔ mínimo 1,5s · limite 8s**

  **│ \[lenta]   2G / saveData / rtt > 1000 ms ➔ mínimo 2s · limite 12s (modo econômico)**

  **│ \[offline] navigator.onLine = false ➔ mínimo 0,8s · limite 4s · aviso "Sem internet"**

  **│ \[desconhecida] navegador sem a API ➔ mínimo 0,8s · limite 6s**

**\[iniciar()] ➔ fluxo do boot**

  **│ 1. \[carregarPerfil()] ➔ lê PERFIL_KEY (leitura pequena)**

  **│ 2. SEM perfil (visitante) ➔ con.encerrar = true ➔ landing de concursos aparece NA HORA, sem esperar dados**

  **│ 3. COM perfil ➔ \[carregarEstadoUmaVez()] pré-carrega STORAGE_KEY (guia_estudos_state_v1 ➔ state) ➔ uma única promessa (window.\_\_loadPromise) = sem leitura redundante**

  **│ 4. Mascote completo (mínimo 2s) SÓ na 1ª vez: campo novo perfilSalvo.bootVisto (false/ausente ➔ completo; true ➔ curto)**

  **│ 5. Ao terminar ➔ pré-monta telas ocultas (applyTheme, updateFoguinho, renderTrilhasFixas, renderCarreirasCustom) e grava bootVisto = true**

**\[cadastrar()] ➔ novo cadastro nasce com bootVisto = true e window.\_\_cadastroNovo = true ➔ o carregamento seguinte usa o mascote completo (2s) uma única vez**

**\[entrarApp()] ➔ NÃO recarrega se window.\_\_estadoOk = true. Se a pré-carga não foi confirmada (ou é conta nova) ➔ carrega uma vez com tela**

**\[sairDaSecao()] ➔ saveState() e volta ao login; state continua em memória (sem novo carregamento)**

**\[rodarLoading(trabalho, passos, con)] ➔ lê con.minMs / con.maxMs ao vivo; barra nunca regride; con.encerrar cancela na hora**

**Proteção de dados mantida: app só é liberado após leitura confirmada (window.\_\_estadoOk), evitando que um state em branco sobrescreva o progresso real.**

**Chaves preservadas: state, state.days\[data\_key], state.cursos, state.conteudosCustom\[].trilha, STORAGE\_KEY, PERFIL\_KEY. Nenhuma renomeada. Campo novo: perfilSalvo.bootVisto.**

**Registro de versões: v13 ➔ v14 (carregamento adaptado à conexão + pré-carga sem redundância) ➔ v15 (tempos mínimos curtos, visitante sem espera, mascote completo só na 1ª vez) ➔ v16 (conexão média 1,5s; 1ª visita 2s).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v17 — CALENDÁRIO ATIVO (BOTÃO ON/OFF)**

**Princípio: a pessoa decide se o calendário funciona ou não. Desligar apenas oculta e bloqueia a interface; nenhum dado é apagado.**

**□ [3º CLIQUE: GUIA GERAL ➔ Aba 1: 📅 Calendário de Estudos]**

  **│ ▧ [Interruptor compacto ON/OFF na barra superior (topbar), visível só após o login]**

  **│    └─ [toggleCalendarioAtivo()] ➔ inverte state.calendarioAtivo ➔ saveState() ➔ renderCalActive()**

  **│    └─ [calAtivo()] ➔ retorna state.calendarioAtivo !== false (padrão = ligado; contas antigas continuam ligadas)**

  **│    └─ [aplicarCalendarioAtivo()] ➔ alterna a classe .cal-off na aba, atualiza rótulo ON/OFF e texto de apoio**

  **│ [ON]  ➔ estatísticas, legenda, visão Mês/Ano, ➕ Registrar hoje, foto e modal do dia funcionam normalmente**

  **│ [OFF] ➔ estatísticas, legenda, grade e botão Registrar hoje ficam ocultos; aparece o aviso "Calendário desligado"**

  **│       ➔ [openDayModal()] e [triggerCalImg()] retornam sem fazer nada (bloqueio por segurança)**

  **│       ➔ Mural, Conteúdos, Painel e Foguinho continuam funcionando e lendo state.days normalmente**

**Chaves preservadas: state, state.days[data_key], STORAGE_KEY, PERFIL_KEY. Campo novo: state.calendarioAtivo (boolean, ausente = true).**

**Registro de versões: ... ➔ v16 (conexão média 1,5s; 1ª visita 2s) ➔ v17 (Calendário ativo ON/OFF).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v18 — RODAPÉ ENXUTO E LISTA ÚNICA (CALENDÁRIO ↔ CONTEÚDOS)**

**Rodapé da barra lateral: removidos Exportar, Importar, Baixar cópia HTML, Atualizar sistema, Salvar agora e Sair da seção. Mantidos: Horas este mês, Tema e cores. O salvamento continua automático (saveState() a cada alteração).**

**Lista única: "Clique no + para adicionar o que você está estudando" (Calendário) e "Adicionar curso" (Conteúdos) gravam no MESMO lugar: state.cursos[] = {id, nome, cor}.**

  **│ [Calendário ON]  ➔ state.cursos aparece como legenda colorida no calendário; ✕ remove o curso também de Conteúdos**

  **│ [Calendário OFF] ➔ legenda e calendário ocultos; state.cursos e Conteúdos continuam salvos e funcionando**

  **│ [migrarCursos()] ➔ move state.materiasEstudo (antigo) para state.cursos, sem duplicar nomes; state.materiasEstudo passa a []**

**Chaves preservadas: state, state.days[data_key], state.cursos, state.conteudosCustom[].trilha, state.calendarioAtivo, STORAGE_KEY, PERFIL_KEY. Campo novo: state.cursos[].cor.**

**Registro de versões: ... ➔ v17 (Calendário ativo ON/OFF) ➔ v18 (rodapé enxuto + lista única Calendário/Conteúdos).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v19 — REGISTRO DO DIA LIGADO A CONTEÚDOS + ESCOLHA DE IMAGEM**

**Editar dia (modal do calendário): removidos os blocos fixos por área (Ciência de Dados, SEFAZ, Direito, Notário, Eletiva). Registros antigos nessas áreas são preservados ao salvar.**

**▧ [Bloco "O que você estudou neste dia"]**

  **│ [estudos[]] ➔ cada item: cursoId (FK ➔ state.cursos[].id), materiaId (FK ➔ state.conteudosCustom[].id, opcional), horas, questoes**

  **│ [Listas] ➔ Curso e Matéria vêm de Conteúdos (fonte única). Várias linhas por dia.**

  **│ [state.days[data_key].horasTotal] ➔ soma das horas dos estudos + horas das áreas antigas**

  **│ [Conteúdos ➔ Matéria] ➔ mostra as horas acumuladas vindas do calendário (horasDe)**

**▧ [Bloco "Colocar imagem neste dia?"] ➔ Sim, com imagem / Não, sem imagem**

  **│ [usarImg] true ➔ imagem aparece no calendário Mensal e no Anual (modo Fotos), sem filtro de cor, com selo do dia/horas e etiqueta da matéria/curso na cor do curso**

  **│ [imgEstudo] ➔ índice do estudo que a imagem representa (escolhível quando há mais de um)**

  **│ [usarImg] false ➔ imagem fica guardada, mas não é exibida**

  **│ [comprimirImagem()] ➔ redimensiona (máx. 1000 px) e salva em JPEG qualidade 0,88 para respeitar o limite de 5 MB**

**Chaves preservadas: state, state.days[data_key], state.cursos, state.conteudosCustom, state.calendarioAtivo, STORAGE_KEY, PERFIL_KEY. Campos novos em state.days[data_key]: estudos[], usarImg, imgEstudo.**

**Registro de versões: ... ➔ v18 (rodapé enxuto + lista única) ➔ v19 (registro do dia ligado a Conteúdos + escolha de imagem).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v20 — CATÁLOGO AUTOMÁTICO DE MATÉRIAS + ANIMAÇÃO DE 3s NA TELA DE ESPERA**

**□ [Conteúdos / Calendário "+"] ➔ catálogo pronto (CATALOGO): concursos (foco) e faculdades**

  **│ [CATALOGO[]] ➔ {t: concurso|faculdade, nome, alias[], m[] (matérias)}. Concursos: SEFAZ SP, Receita Federal, INSS, Polícia Federal, PRF, TRT/TRF, Banco do Brasil, Caixa, Cartório (Notário e Registrador), OAB, Residência Médica, Professor (SEDUC). Faculdades: Direito, Ciência de Dados, Ciência da Computação, Administração, Ciências Contábeis, Psicologia, Pedagogia, Engenharia Civil, Enfermagem, Economia.**

  **│ [novoCursoCatalogo(nome,cor)] ➔ cria state.cursos[] e, se o nome (ou alias) está no catálogo, [aplicarCatalogo()] cria state.conteudosCustom[] {trilha = id do curso, auto:true} sem duplicar**

  **│ [Mesma lista] ➔ o "+" do calendário e "Adicionar curso" de Conteúdos usam a mesma função (lista única)**

  **│ [catalogoPrev()/catalogoChips()] ➔ prévia "X matérias entram automaticamente" + atalhos clicáveis nos dois modais**

  **│ [carregarCatalogo(id)] ➔ botão 📥 no curso já existente: acrescenta as matérias que faltam**

  **│ Cursos fora do catálogo ➔ continuam com matérias manuais (➕). Matérias automáticas podem ser ajustadas (✕ / ➕).**

**□ [TELA 1: BOOT] ➔ animações de 3s**

  **│ [rodarLoading] ➔ minMs mínimo de 3000 ms (visitante sem conta continua sem espera)**

  **│ [CSS] ➔ ldEntrada (mascote entra, quica e brilha, 3s), ldSobe (barra aparece), ldBrilho (barra animada), ldPulso (percentual); respeita prefers-reduced-motion**

**Chaves preservadas: state, state.days[data_key], state.cursos, state.conteudosCustom[].trilha, state.calendarioAtivo, STORAGE_KEY, PERFIL_KEY. Campos novos: state.cursos[].catalogo, state.conteudosCustom[].auto.**

**Registro de versões: ... ➔ v19 ➔ v20 (catálogo automático + animação 3s).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v21 — TELA DE CARREGAMENTO COM GORILA ANIMADO (3 QUADROS, 3s)**

**□ [TELA 1: BOOT]**

  **│ [Quadros] ➔ 3 imagens do gorila (longe ➔ médio ➔ perto), 1s cada, em ciclo de 3s (CSS ldF1/ldF2/ldF3 + ldBalanca), como se o gorila se aproximasse**

  **│ [Tempo] ➔ espera de 3s para todos (rodarLoading: minMs = 3000); o visitante sem conta também vê os 3s, mas não espera dados**

  **│ [Rodapé da tela] ➔ barra + porcentagem (0–100%) + tipo de conexão de cada pessoa (detectarConexao)**

  **│ [Imagens] ➔ embutidas em WebP (≈900 px) dentro do HTML; mascote antigo fica oculto só para servir de logo na barra superior**

**Chaves preservadas: state, state.days[data_key], state.cursos, state.conteudosCustom, state.calendarioAtivo, STORAGE_KEY, PERFIL_KEY. Nenhuma chave nova.**

**Registro de versões: ... ➔ v20 ➔ v21 (gorila animado no carregamento).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v22 — ESPERA OBRIGATÓRIA DE 3,5s + TRANSIÇÃO SUAVE ENTRE QUADROS**

**□ [TELA 1: BOOT]**

  **│ [rodarLoading] ➔ minMs = 3500 (obrigatório para todos, inclusive visitante); limite máximo = mínimo + 2s**

  **│ [Quadros] ➔ 2 imagens do gorila (menor ➔ maior) em ciclo de 3,5s com transição suave (ldFa/ldFb: fade cruzado + escala) e balanço (ldBalanca)**

  **│ [Rodapé] ➔ barra + porcentagem + tipo de conexão (inalterado)**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v21 ➔ v22 (3,5s + transição suave).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v23 — TROCA SIMPLES ENTRE AS 2 IMAGENS (SEM ANIMAÇÃO)**

**□ [TELA 1: BOOT]**

  **│ [Quadros] ➔ removidos fade, zoom e balanço; as 2 imagens do gorila alternam em corte seco, 8 trocas ao longo dos 3,5s (ciclo de 0,875s, CSS ldTroca1/ldTroca2)**

  **│ [Tempo] ➔ espera obrigatória de 3,5s e rodapé (barra, porcentagem, conexão) inalterados**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v22 ➔ v23 (troca simples).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v24 — TROCA DUPLICADA**

**□ [TELA 1: BOOT] ➔ as 2 imagens do gorila alternam 16 vezes em 3,5s (ciclo de 0,4375s, ldTroca1/ldTroca2), o dobro da v23. Resto inalterado.**

**Registro de versões: ... ➔ v23 ➔ v24 (troca duplicada).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v25 — RITMO DA TROCA REDUZIDO**

**□ [TELA 1: BOOT] ➔ as 2 imagens do gorila alternam 12 vezes em 3,5s (ciclo de 0,5833s, ldTroca1/ldTroca2), entre a v23 (8) e a v24 (16). Resto inalterado.**

**Registro de versões: ... ➔ v24 ➔ v25 (ritmo reduzido).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v26 — TELA DE CARREGAMENTO SÓ COM INTERNET FRACA**

**□ [TELA 1: BOOT]**

  **│ [Espera obrigatória] ➔ REMOVIDA. O site abre direto assim que os dados estão prontos.**

  **│ [rodarLoading] ➔ só mostra a tela se detectarConexao() = "lenta" (2G, saveData, rtt > 1000 ms) ou offline. Nos demais casos espera os dados em silêncio (limite = con.maxMs).**

  **│ [Tela] ➔ a cara do gorila (mascote da cabeça, em azul, o mesmo da barra superior), barra, porcentagem e tipo de conexão. Quando aparece, dura o tempo real dos dados (mínimo 0,8s para não piscar). Entrada com fade de 0,3s.**

  **│ [Removido] ➔ os 2 quadros do gorila de corpo inteiro e a troca entre imagens.**

  **│ [Limite técnico] ➔ navegadores sem navigator.connection (ex.: Safari, Firefox) caem em "desconhecida" e não mostram a tela.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v25 ➔ v26 (tela só com internet fraca).**

**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v29 — SEM TELA DE CARREGAMENTO E LAYOUT ORIGINAL**

**□ [TELA 1: BOOT] ➔ tela de carregamento DESATIVADA para todos (rodarLoading sempre espera os dados em silêncio, limite = con.maxMs). Mascote antigo continua só como logo da barra superior.**

**□ [Layout] ➔ layout anterior mantido (sem a restilização v27/v28 inspirada em marketplace/portal). Tela inicial inalterada.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v26 ➔ v29 (sem tela de carregamento; v27 e v28 descartadas).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v30 — ENTRADA SEM CADASTRO (VISITANTE) + TEMA CLARO POR PADRÃO**

**■ [TELA 1: BOOT] ➔ o site abre direto no app, como VISITANTE (window.__guest = true). Cadastro/login deixa de ser obrigatório.**

  **│ □ [Visitante] ➔ usa tudo (calendário, conteúdos, mapa mental), mas NADA é gravado na conta: saveState() retorna sem gravar. Ao fechar, o progresso se perde.**

  **│ □ [Botão da barra superior (#tb-entrar)] ➔ visitante vê "Criar conta para salvar" (sem conta) ou "Entrar e continuar" (com conta); logado vê "Sair".**

  **│ □ [Criar conta] ➔ [cadastrar()] guarda o progresso feito como visitante (se não havia dados salvos antes) e entra logado.**

  **│ □ [Entrar] ➔ [entrarLogin()] descarta o progresso de visitante e restaura os dados salvos da conta (continua de onde parou).**

  **│ □ [Sair] ➔ [sairDaSecao()] salva e volta ao modo visitante (estado limpo).**

  **│ □ [Logo da barra superior] ➔ só volta ao calendário (não desloga mais).**

  **│ ▧ [Modal de login] ➔ movido para o body e aberto por auAbrirLogin()/configurarAuthModal(), por cima do app.**

**■ [TEMA] ➔ padrão CLARO para todos (defaultState.theme = light).**

  **│ □ [state.temaEscolhido] ➔ novo campo boolean; vira true ao usar o botão de tema. Se false, o tema salvo é ignorado e abre claro.**

  **│ □ Depois do login, o tema escolhido pela pessoa é aplicado.**

**Chaves preservadas: state, state.days, state.cursos, state.conteudosCustom, state.calendarioAtivo, STORAGE_KEY, PERFIL_KEY. Campo novo: state.temaEscolhido. Variáveis de sessão: window.__guest, window.__estadoReal.**

**Registro de versões: ... ➔ v29 ➔ v30 (visitante sem cadastro + tema claro).**

**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v32 — IMAGEM DO DIA NO ESTILO ORIGINAL (COM DEGRADÊ)**

**□ [Calendário Mensal] ➔ a imagem ocupa a célula inteira (object-fit: cover) com borda de 2px na cor do curso e um degradê por cima (cal-bg-overlay): cor do curso suave no topo ➔ escurecendo até a base. Número do dia e horas centralizados com sombra de texto. Etiqueta da matéria discreta na base.**

**□ [comprimirImagem()] ➔ máx. 1000 px, JPEG 0,90, respeitando o limite de 5 MB.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v30 ➔ v32 (imagem no estilo original; v31 substituída).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v33 — TELA INICIAL DE VOLTA + "CONTINUAR SEM CADASTRO"**

**■ [TELA 1: HOMEPAGE] ➔ volta a ser a primeira tela (boot ➔ mostrarAuth()). A v30–v32 pulavam direto para o calendário; isso foi corrigido.**

  **│ □ [Botão "Continuar sem cadastro" (#tb-visitante), na barra superior da tela inicial] ➔ entra no app como visitante (entrarComoVisitante()). Nada é gravado na conta.**

  **│ □ [Entrar / Registrar] ➔ continua igual: login ou cadastro para salvar e continuar de onde parou.**

  **│ □ [Visitante dentro do app] ➔ botão "Criar conta para salvar" / "Entrar e continuar" na barra superior (inalterado da v30).**

  **│ □ [Sair] ➔ salva e volta à tela inicial (como antes).**

**■ Tema claro por padrão e imagem do dia com degradê (v30/v32) ➔ mantidos.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v32 ➔ v33 (tela inicial restaurada + continuar sem cadastro).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v34 — LOGO VOLTA À TELA INICIAL + MENU "ENTRAR" (LOGIN / CRIAR CONTA) + BARRA SUPERIOR DESTACADA**

**□ [Logo/título "Gorila Ensino" na barra superior] ➔ volta à TELA INICIAL (trIrInicio()). Visitante volta sem perder o que fez nesta visita; logado salva e sai (sairDaSecao()).**

**□ [Botão "Entrar ▾" (#tb-entrar), na tela inicial e para o visitante] ➔ abre menu com duas opções: "Fazer login" e "Criar conta" (auEscolher(modo)).**

  **│ ▧ [Modal de acesso] ➔ abas "Fazer login" / "Criar conta" (configurarAuthModal(modo)). Login sem conta existente ➔ aviso "Nenhuma conta encontrada". Criar conta com conta existente ➔ aviso de que o login atual será substituído (dados continuam).**

  **│ ▧ [Logado] ➔ o botão vira "Sair".**

  **│ ▧ [Tela inicial] ➔ também tem "Continuar sem cadastro" (#tb-visitante).**

**□ [Barra superior] ➔ no tema claro agora é branca com borda e sombra (antes cinza, igual ao fundo do calendário). Interruptor rotulado "Calendário ON/OFF".**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v33 ➔ v34.**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v35 — SÓ "ENTRAR" NA TELA INICIAL + ÍCONES LATERAIS SEM BECO SEM SAÍDA**

**□ [TELA 1: HOMEPAGE] ➔ a barra superior mostra apenas o botão "Entrar ▾". O menu tem: Fazer login, Criar conta e (só na tela inicial) Continuar sem cadastro.**

**□ [Ícones laterais]**

  **│ ▧ [📅 Calendário] ➔ quem ainda não entrou vira visitante e vai direto ao layout principal (calendário), sem exigir cadastro.**

  **│ ▧ [📰 Notícias] ➔ abre a tela de notícias com botão "← Voltar ao calendário" (antes a tela ficava em branco e sem saída). O painel de notícias é reaproveitado dentro da tela.**

  **│ ▧ [Logo "Gorila Ensino"] ➔ continua voltando à tela inicial.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v34 ➔ v35.**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v36 — REMOVIDAS AS SETAS ← → DA BARRA LATERAL**

**□ [Barra lateral de ícones (#theme-rail)] ➔ removido o bloco de setas Voltar/Avançar (.tr-nav). Permanecem: Sala de estudos, Calendário e Notícias. As funções de histórico (navIr, navAtualizarSetas) continuam no código, sem efeito visual.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v35 ➔ v36.**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v37 — TELA DE NOTÍCIAS ESVAZIADA (CONTEÚDO A DEFINIR)**

**□ [📰 Notícias] ➔ a tela mostra apenas o botão "← Voltar ao calendário". Removidos: lista de concursos, campo de adicionar, sugestões e notas. O conteúdo desta tela ainda será definido.**

**Chaves preservadas: state.concursosInteresse e as funções de notícias permanecem no código, sem aparecer na tela. Registro de versões: ... ➔ v36 ➔ v37.**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v40 — BARRA LATERAL DE ÍCONES FIXA (SEM FLUTUAR)**

**□ [Barra lateral direita (#theme-rail)] ➔ removida a animação de flutuação (trFloat) dos ícones; ficam parados na posição, mantendo apenas o destaque ao passar o mouse e o ícone ativo.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v37 ➔ v40 (v38 e v39 desfeitas).**


**──────────────────────────────────────────────────────────────────────────────**

**■ ATUALIZAÇÃO v41 — PAINEL BRANCO NA BARRA LATERAL DE ÍCONES**

**□ [Barra lateral direita (#theme-rail)] ➔ ganha fundo e borda brancos (cantos arredondados, sombra leve) envolvendo os ícones. O painel usa flex em coluna sem altura fixa, então cresce automaticamente a cada ícone novo adicionado.**

**Chaves preservadas: nenhuma alterada. Registro de versões: ... ➔ v40 ➔ v41.**
