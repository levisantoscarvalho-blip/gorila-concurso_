/* ════════════════════════════════════════════
   RECONHECIMENTO — o que a pessoa digita em "O que você está estudando?"
   O site reconhece cursos de faculdade e concursos (conhecidos e menos conhecidos)
   e guarda sempre com o mesmo nome. O que não está aqui é salvo como a pessoa escreveu.
   ════════════════════════════════════════════ */

// porEstado: aceita a sigla do estado depois (ex.: "tj sp", "policia civil mg", "sefaz rj")
const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

const CONCURSOS_CONHECIDOS = [
  {nome:'INSS', a:['instituto nacional do seguro social']},
  {nome:'Receita Federal', a:['rfb','auditor fiscal da receita federal','afrfb','analista tributario']},
  {nome:'Polícia Federal', a:['pf','agente pf','delegado pf','escrivao pf']},
  {nome:'Polícia Rodoviária Federal', a:['prf']},
  {nome:'Polícia Civil', a:['pc','delegado de policia','escrivao','investigador'], porEstado:true},
  {nome:'Polícia Militar', a:['pm','soldado pm','oficial pm'], porEstado:true},
  {nome:'Polícia Penal', a:['agente penitenciario','ppf'], porEstado:true},
  {nome:'Corpo de Bombeiros', a:['bombeiros','cbm','bombeiro militar'], porEstado:true},
  {nome:'Guarda Municipal', a:['gcm','guarda civil municipal']},
  {nome:'Polícia Legislativa', a:[]},
  {nome:'Polícia Científica', a:['perito criminal','pericia'], porEstado:true},
  {nome:'Tribunal de Justiça', a:['tj'], porEstado:true},
  {nome:'TRT', a:['tribunal regional do trabalho']},
  {nome:'TRF', a:['tribunal regional federal']},
  {nome:'TRE', a:['tribunal regional eleitoral'], porEstado:true},
  {nome:'TST', a:['tribunal superior do trabalho']},
  {nome:'STF', a:['supremo tribunal federal']},
  {nome:'STJ', a:['superior tribunal de justica']},
  {nome:'TSE', a:['tribunal superior eleitoral']},
  {nome:'MPU', a:['ministerio publico da uniao']},
  {nome:'MPF', a:['ministerio publico federal']},
  {nome:'Ministério Público', a:['mp','promotor de justica'], porEstado:true},
  {nome:'Defensoria Pública', a:['defensoria','dpe','defensor publico'], porEstado:true},
  {nome:'DPU', a:['defensoria publica da uniao']},
  {nome:'Magistratura', a:['juiz','magistratura estadual','magistratura federal']},
  {nome:'Procuradoria do Estado', a:['pge','procurador do estado','procuradoria'], porEstado:true},
  {nome:'AGU', a:['advocacia geral da uniao','advogado da uniao']},
  {nome:'PGFN', a:['procuradoria da fazenda nacional','procurador da fazenda']},
  {nome:'CGU', a:['controladoria geral da uniao']},
  {nome:'TCU', a:['tribunal de contas da uniao']},
  {nome:'Tribunal de Contas', a:['tce','tribunal de contas do estado'], porEstado:true},
  {nome:'SEFAZ', a:['secretaria da fazenda','auditor fiscal estadual','icms'], porEstado:true},
  {nome:'ISS', a:['fiscal de tributos municipais','auditor fiscal municipal']},
  {nome:'Auditor Fiscal do Trabalho', a:['aft','auditor do trabalho']},
  {nome:'Banco do Brasil', a:['bb','escriturario bb']},
  {nome:'Caixa Econômica Federal', a:['caixa','cef','tecnico bancario']},
  {nome:'Banco Central', a:['bacen','bcb']},
  {nome:'BNDES', a:['banco nacional de desenvolvimento']},
  {nome:'Banco do Nordeste', a:['bnb']},
  {nome:'Banrisul', a:[]},
  {nome:'Petrobras', a:[]},
  {nome:'Correios', a:['ect']},
  {nome:'IBGE', a:['recenseador']},
  {nome:'ABIN', a:['agencia brasileira de inteligencia']},
  {nome:'Agências Reguladoras', a:['anvisa','anatel','aneel','anp','ans','antt','anac','ana']},
  {nome:'Senado Federal', a:['senado']},
  {nome:'Câmara dos Deputados', a:[]},
  {nome:'Assembleia Legislativa', a:['alesp','alerj','alemg'], porEstado:true},
  {nome:'Câmara Municipal', a:['vereadores']},
  {nome:'Prefeitura', a:['prefeitura municipal','concurso de prefeitura']},
  {nome:'Detran', a:[], porEstado:true},
  {nome:'CNU — Concurso Nacional Unificado', a:['cnu','cpnu','enem dos concursos','concurso nacional unificado']},
  {nome:'Exército (EsPCEx / ESA)', a:['espcex','esa','exercito']},
  {nome:'Marinha', a:['escola naval','fuzileiros navais','aprendiz marinheiro']},
  {nome:'Aeronáutica (EPCAR / EEAR)', a:['epcar','eear','aeronautica','fab']},
  {nome:'Oficial de Justiça', a:[]},
  {nome:'Analista Judiciário', a:[]},
  {nome:'Técnico Judiciário', a:[]},
  {nome:'Professor (Rede Pública)', a:['professor','seduc','professor estadual','professor municipal']},
  {nome:'Residência Médica', a:['residencia']},
  {nome:'OAB — Exame de Ordem', a:['oab','exame de ordem']},
  {nome:'Cartório (Notário e Registrador)', a:['cartorio','notario','registrador','cartorios']},
  {nome:'Saúde Pública (SUS / EBSERH)', a:['ebserh','sus','agente de saude']},
];

const CURSOS_FACULDADE = ['Administração','Agronomia','Análise e Desenvolvimento de Sistemas','Arquitetura e Urbanismo','Artes Visuais',
  'Biblioteconomia','Biologia','Biomedicina','Ciência da Computação','Ciência de Dados','Ciências Contábeis','Ciências Econômicas',
  'Cinema','Comércio Exterior','Comunicação Social','Design','Design Gráfico','Direito','Educação Física','Enfermagem','Engenharia Ambiental',
  'Engenharia Civil','Engenharia de Computação','Engenharia de Produção','Engenharia de Software','Engenharia Elétrica','Engenharia Mecânica',
  'Engenharia Química','Estatística','Farmácia','Filosofia','Física','Fisioterapia','Fonoaudiologia','Gastronomia','Geografia',
  'Gestão de Recursos Humanos','Gestão Pública','História','Jornalismo','Letras','Logística','Marketing','Matemática','Medicina',
  'Medicina Veterinária','Música','Nutrição','Odontologia','Pedagogia','Psicologia','Publicidade e Propaganda','Química',
  'Relações Internacionais','Serviço Social','Sistemas de Informação','Sociologia','Teologia','Turismo','Zootecnia'];

const CURSOS_APELIDOS = {
  'Ciência da Computação':['cc','computacao'], 'Ciências Contábeis':['contabeis','contabilidade'], 'Ciências Econômicas':['economia'],
  'Análise e Desenvolvimento de Sistemas':['ads'], 'Sistemas de Informação':['si'], 'Medicina Veterinária':['veterinaria','vet'],
  'Educação Física':['ed fisica'], 'Arquitetura e Urbanismo':['arquitetura'], 'Relações Internacionais':['ri'],
  'Publicidade e Propaganda':['publicidade'],
};

// Monta a lista uma vez: {nome, tipo, chaves[], porEstado}
let _cursosConhecidos=null;
function cursosConhecidos(){
  if(_cursosConhecidos) return _cursosConhecidos;
  const lista=[];
  const add=(nome,tipo,apelidos,porEstado)=>{ if(lista.some(x=>x.nome===nome)) return; lista.push({nome,tipo,porEstado:!!porEstado,chaves:[bgNorm(nome),...(apelidos||[]).map(bgNorm)]}); };
  CONCURSOS_CONHECIDOS.forEach(c=>add(c.nome,'concurso',c.a,c.porEstado));
  (typeof CATALOGO!=='undefined'?CATALOGO:[]).forEach(c=>add(c.nome,c.t==='faculdade'?'curso de faculdade':'concurso',c.alias||[]));
  CURSOS_FACULDADE.forEach(n=>add(n,'curso de faculdade',CURSOS_APELIDOS[n]));
  _cursosConhecidos=lista;
  return lista;
}
// "inss" → {nome:'INSS', tipo:'concurso'}; "tj sp" → {nome:'Tribunal de Justiça SP'}; desconhecido → null
function cursoReconhecido(texto){
  const n=bgNorm(texto||'').trim().replace(/\s+/g,' '); if(!n) return null;
  for(const c of cursosConhecidos()){
    if(c.chaves.includes(n)) return {nome:c.nome, tipo:c.tipo};
    if(c.porEstado){
      const m=n.match(/^(.*)\s+([a-z]{2})$/);
      if(m && c.chaves.includes(m[1]) && UFS.includes(m[2].toUpperCase())) return {nome:`${c.nome} ${m[2].toUpperCase()}`, tipo:c.tipo};
    }
  }
  return null;
}
// Aviso embaixo do campo: "✓ Reconhecido: INSS · concurso"
function cursoDica(inputId,dicaId){
  const inp=document.getElementById(inputId), el=document.getElementById(dicaId); if(!inp||!el) return;
  const r=cursoReconhecido(inp.value);
  el.innerHTML = r ? `${ICO.check} Reconhecido: <b>${escapeHtmlCarreira(r.nome)}</b> · ${r.tipo}` : '';
}
