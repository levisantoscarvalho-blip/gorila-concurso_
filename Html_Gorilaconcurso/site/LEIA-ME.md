# Mapa do site Gorila Concurso

Aperte **Go Live** no VS Code: o site abre direto pelo `index.html`.

```
site/
├── index.html                 ← as telas (HTML). Cada parte tem um comentário dizendo onde está o código dela
├── imagens/gorila.webp        ← o gorila do topo e da tela de carregamento
│
├── geral/                     ← o que TODAS as telas usam
│   ├── base.css                  cores, tema claro/escuro, janelas, avisos
│   ├── layout.css                ajustes finais de posição + barra de ícones da direita
│   ├── utilidades.js             foguinho, janelas de confirmação, avisos
│   ├── tema.js                   tema claro/escuro e cor de destaque
│   ├── navegacao.js              troca de telas/abas, setas, barra de ícones
│   ├── dados-preferencias.js     🗄️ dados: tema e cor
│   └── iniciar.js                liga o site (sempre o último a carregar)
│
├── login-e-carregamento/      ← tela de carregamento, login, cadastro, sair
├── barra-superior/            ← faixa do topo e busca
│
├── sala-de-estudo/            ← 🪑 ícone "Sala de estudos" (o botão ainda mostra "em breve")
│   ├── trilhas.js / .css         trilhas fixas e carreiras criadas por você
│   ├── conteudos.js / .css       cursos, matérias e conteúdos
│   ├── mapa-mental.js / .css     mapa mental
│   ├── painel.js / .css          painel infográfico (gráficos)
│   └── dados-sala-de-estudo.js   🗄️ dados: carreiras, conteúdos, mapa mental
│
├── calendario/                ← 📅 ícone "Calendário"
│   ├── calendario.js / .css      calendário do mês/ano, editar um dia, fotos
│   ├── mural.js / .css           mural do mês
│   └── dados-calendario.js       🗄️ dados: todos os seus dias estudados
│
├── noticias/                  ← 📰 ícone "Notícias"
│
├── institucional/             ← Termos de uso, Política de privacidade e Contato (links no rodapé da janela de acesso)
│
└── banco-de-dados/            ← como e onde os dados são salvos
    ├── LEIA-ME.md                explicação do banco de dados
    ├── ver-dados.html            👀 página para VER o que está salvo
    ├── armazenamento.js          ÚNICO arquivo que salva/lê dados (trocar aqui p/ banco real)
    ├── estado.js                 a variável "state" com tudo, carregar/salvar, backup
    └── catalogo-concursos.js     lista pronta de concursos/cursos e suas matérias
```

## Regras para não quebrar o site

1. **Para mudar uma tela, mexa só na pasta dela.** O código de cada tela ficou separado nessas pastas.
2. **Não mude a ordem dos `<link>` e `<script>` no fim do `index.html`.** Os dados carregam primeiro, e o `iniciar.js` por último.
3. **Arquivo novo:** crie dentro da pasta da seção e adicione uma linha `<script src="...">` (ou `<link>`) no `index.html`, antes do `geral/iniciar.js`.

A versão antiga, em um arquivo só, está guardada em `../versoes-antigas/`.
