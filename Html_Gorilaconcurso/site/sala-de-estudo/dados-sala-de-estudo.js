// ════════════════════════════════════════════
// BANCO DE DADOS — SALA DE ESTUDO
// ════════════════════════════════════════════
// O que a Sala de estudo guarda (tudo dentro da chave 'guia_estudos_state_v1'):
//
//   trilhasCustom    → carreiras que você criou [{ id, nome, icone, disciplinas: [{ id, nome, horas, feito }] }]
//   trilhasOcultas   → trilhas fixas que você removeu da tela inicial (ex.: ['sefaz'])
//   conteudosCustom  → itens de conteúdo [{ id, nome, trilha (id do curso), feito }]
//   cursos           → cursos/concursos criados por você [{ id, nome, cor }]      [criado pelo site]
//   checks           → marcações de concluído das listas (fac, sefaz, livros, ciencia)
//   mindMap          → mapa mental { topicos: [{ id, nome, aberto, subtopicos: [{ id, nome, aberto, texto, imagem }] }] }
//   mapas            → mapas mentais antigos (imagens) — não usado mais
//
// Vazio de propósito: cada pessoa nova começa do zero. (Seu progresso antigo foi
// para Html_Gorilaconcurso/dados-pessoais/, fora do site, e entra pelo botão "Importar".)
// Para ver o que está salvo agora, abra: banco-de-dados/ver-dados.html

window.DADOS_INICIAIS.salaDeEstudo = {};
