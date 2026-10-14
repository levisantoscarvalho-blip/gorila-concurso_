# Banco de dados do Gorila Concurso

## Onde os dados ficam hoje

Ficam **no navegador** de quem usa o site (`localStorage`). Isso quer dizer:

- Cada navegador e cada endereço têm os **seus próprios dados**. O Chrome não vê os dados do Edge, e `127.0.0.1:5500` não vê os dados de outro endereço.
- Apagar os dados de navegação do navegador **apaga o progresso**. Faça backup de vez em quando.
- Os textos e números têm um limite de **~5 MB**. Isso dá para muitos anos: na simulação de 5 anos de uso, ficaram bem abaixo disso.
- As **fotos** ficam num espaço separado e bem maior (IndexedDB, banco `gorila-fotos`). Cada foto é guardada uma vez só, e as que nenhum dia usa são apagadas.

## Como ver os dados

Com o site aberto pelo **Go Live**, acesse `/banco-de-dados/ver-dados.html`. A página mostra tudo separado por seção e tem o botão **Baixar backup (.json)**.

## O que é salvo (2 chaves)

| Chave | O que guarda | Seção | Documentado em |
|---|---|---|---|
| `guia_estudos_state_v1` | dias estudados, horas, questões, fotos | Calendário | `calendario/dados-calendario.js` |
| | carreiras, cursos, conteúdos, mapa mental | Sala de estudo | `sala-de-estudo/dados-sala-de-estudo.js` |
| | concursos de interesse | Notícias | `geral/dados-preferencias.js` |
| | tema e cor de destaque | Preferências | `geral/dados-preferencias.js` |
| `guia_estudos_perfil_v1` | nome, e-mail, senha codificada | Conta | `login-e-carregamento/login.js` |
| IndexedDB `gorila-fotos` | as fotos dos dias (cada uma guardada 1 vez) | Calendário | `calendario/dados-calendario.js` |

## Os arquivos `dados-*.js`

Explicam **cada campo** que cada seção guarda. Os dados iniciais estão **vazios de propósito**: cada pessoa nova começa do zero.

O progresso do Levi (os 113 dias) está num arquivo privado em `Html_Gorilaconcurso/dados-pessoais/`, fora do site e fora do GitHub. Para colocá-lo numa conta, use o botão **Importar meus dados (.json)** da página `ver-dados.html`. O mesmo botão serve para restaurar qualquer backup baixado pelo **Baixar backup**.

## Quando for para um banco de dados de verdade

Troque só o `armazenamento.js`. Ele tem 4 funções (`get`, `set`, `delete`, `list`), e o resto do site só usa essas funções. As tabelas sugeridas seguem as seções acima:

- **usuarios**: o perfil
- **dias_estudo**: um registro por dia (o `days` do calendário)
- **carreiras**, **cursos**, **conteudos**, **mapa_mental**: os dados da sala de estudo
- **preferencias**: tema e cor

> Atenção: o login de hoje é só uma "trava de porta", guardada no próprio navegador. Com um banco de verdade, use um login de verdade (Supabase Auth, Firebase Auth etc.).
