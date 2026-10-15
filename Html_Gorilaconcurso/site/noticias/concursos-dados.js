/* ════════════════════════════════════════════
   CONCURSOS REAIS POR ESTADO E CIDADE (pedido do Levi: só dado real, com fonte)
   Levantamento feito em 15/10/2026 em sites de notícias de concursos. Cada item traz a FONTE.
   ⚠ Concursos mudam toda semana: isto é um levantamento manual até existir o cadastro no Supabase.
   Por enquanto só SÃO PAULO (piloto). Os outros estados aparecem como "em levantamento".

   status: 'aberto'      = inscrições abertas
           'andamento'   = inscrições encerradas, provas/resultado em andamento
           'previsto'    = autorizado ou anunciado, edital ainda não saiu
           'semprevisao' = sem edital recente nem autorização
   area:   'pm' | 'pc' | 'fazenda' | 'educacao' | 'prefeitura'
   estaduais: valem para TODAS as cidades do estado · municipais: { código IBGE da cidade: [...] }
   ════════════════════════════════════════════ */
const CONCURSOS_REAIS = {
  SP: {
    atualizado: '15/10/2026',
    estaduais: [
      { area:'pm', orgao:'Polícia Militar de SP', cargo:'Aluno-Soldado', status:'andamento', vagas:2000, banca:'Vunesp',
        quando:'Inscrições encerradas em 21/08/2026; prova em 20/09/2026',
        fonte:{ nome:'Nova Concursos', url:'https://www.novaconcursos.com.br/portal/?p=313425' } },
      { area:'pm', orgao:'Polícia Militar de SP', cargo:'Soldado (próximo edital)', status:'previsto', vagas:4000,
        quando:'Autorização divulgada em 29/06/2026',
        fonte:{ nome:'Estratégia Concursos', url:'https://estrategiaconcursos.com.br/blog/concurso-pm-sp' } },
      { area:'pc', orgao:'Polícia Civil de SP', cargo:'Delegado, escrivão e investigador', status:'semprevisao', vagas:0,
        quando:'Sem autorização oficial; a instituição tenta autorizar um novo edital',
        fonte:{ nome:'Gran Cursos', url:'https://blog.grancursosonline.com.br/concurso-pc-sp-autorizacao-2026/' } },
      { area:'fazenda', orgao:'SEFAZ-SP', cargo:'Auditor Fiscal', status:'andamento', vagas:200, banca:'FCC',
        quando:'Provas em fev–mar/2026; resultado final publicado em jun/2026',
        fonte:{ nome:'JC Concursos', url:'https://jcconcursos.com.br/concurso/sefaz-sp-73854' } },
      { area:'educacao', orgao:'Seduc-SP', cargo:'Professor (Ensino Fundamental e Médio)', status:'previsto', vagas:5000,
        quando:'Autorizado em 01/09/2026; edital ainda não publicado',
        fonte:{ nome:'Money Times', url:'https://www.moneytimes.com.br/novo-concurso-aprovado-rede-estadual-professores-isca/' } },
    ],
    municipais: {
      '3506003': [ { area:'prefeitura', orgao:'Prefeitura de Bauru', cargo:'Merendeira, médicos e professor de Arte', status:'andamento', vagas:5,
        quando:'Inscrições até 13/08/2026; provas em setembro/2026',
        fonte:{ nome:'JC Concursos', url:'https://jcconcursos.com.br/noticia/concursos/concurso-da-prefeitura-de-bauru-sp-abre-inscricoes-para-cargos-na-educacao-e-saude-144462' } } ],
      '3500709': [ { area:'prefeitura', orgao:'Prefeitura de Agudos', cargo:'Cargos de nível médio e superior', status:'andamento', vagas:7, banca:'IBEPP',
        quando:'Inscrições até 19/07/2026; prova em 13/09/2026',
        fonte:{ nome:'Tribuna de Jundiaí', url:'https://tribunadejundiai.com.br/economia/concursos/concurso-prefeitura-agudos-sp/' } } ],
      '3507506': [ { area:'prefeitura', orgao:'Prefeitura de Botucatu', cargo:'Último edital: Controlador Interno (2025)', status:'semprevisao', vagas:1,
        quando:'Sem edital em 2026',
        fonte:{ nome:'Concursos no Brasil', url:'https://concursosnobrasil.com/concursos/sp/2025/04/11/concurso-prefeitura-de-botucatu-sp-tem-edital-publicado' } } ],
      '3527108': [ { area:'prefeitura', orgao:'Prefeitura de Lins', cargo:'Último edital: 113 vagas (2024)', status:'semprevisao', vagas:113, banca:'Vunesp',
        quando:'Sem edital em 2026',
        fonte:{ nome:'Concursos no Brasil', url:'https://concursosnobrasil.com/concursos/sp/2024/03/03/concurso-prefeitura-de-lins/' } } ],
    },
  },
};
