// ════════════════════════════════════════════
// BANCO DE DADOS — CALENDÁRIO
// ════════════════════════════════════════════
// O que o calendário guarda (tudo dentro da chave 'guia_estudos_state_v1'):
//
//   month, year      → mês/ano que estava aberto no calendário (month: 0 = janeiro ... 11 = dezembro)
//   days             → UM REGISTRO POR DIA, no formato "AAAA-MM-DD": { ... }
//                        horasTotal   → total de horas estudadas no dia
//                        saude        → anotação de saúde do dia
//                        ciencia / sefaz / direito / notario / eletiva →
//                                       { horas, assunto, questoes, pdfs | apostilas | horasLeitura }
//                        estudos      → estudos ligados a cursos [{ cursoId, materiaId, horas, questoes }]
//                        imgId        → id da foto do dia (a foto em si fica no IndexedDB, veja abaixo)
//                        usarImg      → mostrar a foto no calendário (true/false)
//                      Regras: horasTotal = soma das horas das partes (máx. 24h para o que é digitado);
//                              dias sem nada guardado são apagados automaticamente.
//
// FOTOS: ficam fora desta chave, no IndexedDB do navegador (banco 'gorila-fotos').
// Cada foto é guardada UMA vez, mesmo que vários dias usem a mesma; fotos que
// nenhum dia usa são apagadas. O backup (.json) leva as fotos junto, no campo "fotos".
//   foguinhoStart    → data de início do foguinho
//   calendarioAtivo  → calendário ligado (true) ou desligado (false)          [criado pelo site]
//   materiasEstudo   → matérias mostradas na legenda do calendário           [criado pelo site]
//
// Vazio de propósito: cada pessoa nova começa do zero. (Seu progresso antigo foi
// para Html_Gorilaconcurso/dados-pessoais/, fora do site, e entra pelo botão "Importar".)
// Para ver o que está salvo agora, abra: banco-de-dados/ver-dados.html

window.DADOS_INICIAIS.calendario = {};
