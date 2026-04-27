# PRD - Painel do Caixa (`/caixa`)

**Projeto:** SELFIX  
**Data:** 2026-04-27  
**Status:** Aguardando aprovacao

---

## 1. Objetivo da melhoria

Criar a rota `/caixa`, uma tela dedicada ao funcionario responsavel por fechar as contas do estabelecimento.

O Painel do Caixa deve:

- Exibir as mesas com comandas abertas.
- Consolidar, por mesa, tudo o que foi consumido enquanto a comanda estiver aberta.
- Mostrar ao caixa quando a mesa ja pode ser fechada porque todos os pedidos daquela mesa foram concluidos pela cozinha.
- Permitir que o caixa confirme a forma de pagamento efetivamente usada no fechamento.
- Remover a comanda da lista ativa apos o fechamento.
- Manter um historico somente em memoria das comandas encerradas na sessao atual.

O foco desta entrega e simplicidade, reaproveitamento do que ja existe e zero alteracao visual no quiosque e na cozinha.

---

## 2. Relacao com os componentes e fluxos existentes

### 2.1 O que o sistema faz hoje

- O quiosque ja possui as rotas principais do cliente: `Welcome`, `Menu`, `Payment` e `Confirmation`.
- O parametro de mesa ja existe no sistema e e lido em `StoreContext.jsx`.
- O cliente ja escolhe uma forma de pagamento em `Payment.jsx`, mas essa escolha ainda nao e registrada junto com o pedido.
- Os pedidos confirmados ja sao persistidos em `localStorage` na chave `selfix_orders` dentro de `CartContext.jsx`.
- O painel da cozinha ja existe em `src/pages/Kitchen.jsx` e le `selfix_orders` em polling.
- Hoje o botao `Concluido` da cozinha nao marca status compartilhado: ele remove o pedido do armazenamento compartilhado.

### 2.2 O que isso significa para o Painel do Caixa

O projeto ja tem uma base pronta para a melhoria:

- Ja existe uma fonte compartilhada de dados de pedidos: `selfix_orders`.
- Ja existe a rota da cozinha e o comportamento de acompanhamento de pedidos.
- Ja existe o conceito de mesa e a volta do cliente ao cardapio para novos pedidos.

O problema e que o modelo atual atende bem a cozinha, mas ainda nao atende o caixa:

- O pagamento escolhido no quiosque nao fica salvo.
- A cozinha apaga o pedido quando conclui, entao o caixa perde a referencia.
- O sistema hoje trabalha com pedidos individuais, enquanto o caixa precisa enxergar a comanda agregada por mesa.

### 2.3 Decisao de consistencia com a base atual

A proposta mais simples e manter `selfix_orders` como a fonte unica de verdade dos pedidos abertos e derivados da sessao, em vez de introduzir biblioteca nova, reducer global novo, backend simulado ou uma segunda estrutura persistida para comandas.

O Painel do Caixa deve derivar a comanda agrupando os pedidos abertos por mesa.

Isso reaproveita o desenho atual do projeto:

- `CartContext.jsx` continua sendo o ponto de entrada do pedido confirmado.
- `Kitchen.jsx` continua lendo a mesma origem de dados.
- `App.jsx` continua adicionando rotas declarativas simples no `HashRouter`.

---

## 3. Padrao externo adotado para a implementacao

Com base nas tecnologias do projeto e na documentacao oficial pesquisada, a implementacao deve seguir tres principios simples:

### 3.1 Uma unica fonte de verdade para o estado compartilhado

O React recomenda manter um ponto unico para cada estado compartilhado. Neste projeto, o ponto mais natural para isso ja e `selfix_orders`.

Aplicacao pratica nesta melhoria:

- O quiosque grava os pedidos em `selfix_orders`.
- A cozinha atualiza o status do pedido nessa mesma estrutura.
- O caixa le essa mesma estrutura e deriva a visao por mesa.

### 3.2 Evitar estados contraditorios e duplicados

O React tambem recomenda evitar duplicacao e contradicao de estado. Por isso, o caminho mais simples nao e criar varias flags independentes em lugares diferentes.

Aplicacao pratica nesta melhoria:

- Cada pedido aberto deve carregar seu proprio status de cozinha.
- A comanda nao precisa persistir um "pronta para fechar" separado; isso deve ser derivado pelo caixa verificando se todos os pedidos daquela mesa ja foram concluidos.
- O historico arquivado do caixa nao deve ser salvo em `localStorage`, porque isso contrariaria o requisito de existir apenas durante a sessao em memoria.

### 3.3 Rotas declarativas e sem nova infraestrutura

O React Router atual do projeto ja usa `<Routes>` e `<Route>`. A rota `/caixa` deve seguir exatamente esse mesmo padrao, sem troca de arquitetura.

### 3.4 O que foi descartado por simplicidade

Nao faz sentido para esta entrega:

- Introduzir Zustand, Redux, React Query ou outra biblioteca de estado.
- Criar backend fake ou camada de API.
- Trocar o polling atual da cozinha por arquitetura mais sofisticada.
- Persistir o historico arquivado do caixa em `localStorage`.
- Criar status por item individual, porque a cozinha hoje conclui o pedido inteiro com um unico botao.

---

## 4. Como a funcionalidade relacionada esta implementada hoje

### 4.1 Registro do pedido

Hoje o pedido e gerado em `CartContext.jsx` quando `generateOrder()` e chamado por `Payment.jsx`.

O objeto salvo hoje em `selfix_orders` registra:

- numero do pedido
- numero da mesa
- nome do cliente
- itens
- total
- horario de criacao

Ainda nao registra:

- forma de pagamento escolhida no quiosque
- status de cozinha
- dados de fechamento de caixa

### 4.2 Escolha de pagamento no quiosque

`Payment.jsx` ja exibe as tres opcoes:

- Debito
- Credito
- PIX

Os tres botoes hoje disparam o mesmo `generateOrder()` sem informar qual opcao foi escolhida. Por isso, o pedido salvo nao distingue a forma de pagamento selecionada.

### 4.3 Painel da cozinha

`Kitchen.jsx` ja:

- le `selfix_orders`
- exibe um card por pedido
- usa polling simples
- possui confirmacao antes do botao `Concluido`

Mas, ao concluir, remove o pedido do armazenamento compartilhado. Para o Painel do Caixa, isso precisa mudar internamente para que a cozinha continue "sumindo com o card" visualmente, mas sem apagar a informacao necessaria para o fechamento da conta.

### 4.4 Comanda por mesa ainda nao existe

Hoje cada pedido e tratado isoladamente. Ainda nao existe consolidacao por mesa.

Para o caixa funcionar, a comanda aberta deve ser derivada pela agregacao de todos os pedidos ainda abertos da mesma mesa.

---

## 5. Arquivos afetados por esta melhoria

### 5.1 Arquivos que devem mudar

| Arquivo | Motivo |
|---|---|
| `src/App.jsx` | adicionar a rota `/caixa` |
| `src/pages/Payment.jsx` | informar ao registro do pedido qual forma foi escolhida, sem alterar visual nem fluxo |
| `src/context/CartContext.jsx` | ampliar o snapshot salvo em `selfix_orders` |
| `src/pages/Kitchen.jsx` | trocar a remocao fisica do pedido por atualizacao de status compartilhado, mantendo o comportamento visual atual |
| `src/pages/Cashier.jsx` ou `src/pages/Caixa.jsx` | nova tela do Painel do Caixa |

### 5.2 Arquivo novo desta etapa

| Arquivo | Motivo |
|---|---|
| `PRD_PAINEL_CAIXA.md` | documento desta melhoria |

### 5.3 Estruturas de dados afetadas

| Estrutura | Mudanca esperada |
|---|---|
| `selfix_orders` | passa a guardar tambem forma escolhida no quiosque e status de cozinha do pedido |

---

## 6. O que sera adicionado

### 6.1 Nova rota

- Rota `/caixa` no roteador atual.

### 6.2 Nova tela de Caixa

A nova tela deve ter duas visoes dentro da mesma pagina:

- lista ativa de mesas
- secoes de comandas arquivadas da sessao atual

Nao precisa existir uma rota separada para o historico. Basta um botao de alternancia na propria tela.

### 6.3 Registro da forma de pagamento escolhida no quiosque

Cada pedido novo deve passar a salvar, como referencia:

- Debito
- Credito
- PIX

Essa referencia vem do quiosque e nao substitui a confirmacao final do caixa.

### 6.4 Status compartilhado de cozinha

Cada pedido aberto deve passar a carregar um estado de cozinha compartilhado, suficiente para o caixa saber se aquele pedido ja foi concluido.

Como o botao da cozinha hoje e por pedido, a interpretacao mais simples e:

- ao concluir um pedido na cozinha, todos os itens daquele pedido passam a ser considerados concluidos

Nao sera criado controle individual por item nesta entrega.

### 6.5 Agregacao por mesa

O Painel do Caixa deve agrupar os pedidos abertos por mesa para formar a comanda ativa.

Cada mesa ativa deve exibir:

- nome do cliente
- lista consolidada de itens consumidos
- quantidade por item
- valor unitario por item
- valor total acumulado
- tempo decorrido desde a abertura da comanda
- forma de pagamento escolhida no quiosque como referencia
- destaque visual quando todos os pedidos daquela mesa ja estiverem concluidos pela cozinha

### 6.6 Fechamento da comanda

No fechamento, o caixa deve escolher a forma efetivamente usada entre:

- Dinheiro
- Debito
- Credito
- PIX

Depois da confirmacao:

- a comanda sai da lista ativa
- os pedidos daquela mesa deixam de existir como abertos
- uma versao consolidada da comanda vai para o historico arquivado da sessao atual

### 6.7 Historico arquivado apenas em memoria

O historico do caixa deve existir apenas enquanto a sessao da pagina estiver viva.

Ao recarregar a pagina ou fechar o navegador:

- o historico arquivado se perde
- as comandas ja fechadas nao precisam ser recuperadas

---

## 7. O que sera removido

Nenhum arquivo sera removido.

Os comportamentos que deixam de existir sao:

- a exclusao imediata do pedido de `selfix_orders` quando a cozinha clica em `Concluido`
- a ausencia de registro da forma escolhida no quiosque
- a falta de uma visao agregada por mesa para o fechamento da conta

Tambem deixa de existir, para o caixa, a necessidade de interpretar varios pedidos soltos manualmente.

---

## 8. O que nao deve ser tocado

Os itens abaixo nao devem ser alterados visualmente ou funcionalmente nesta entrega:

- `src/pages/Welcome.jsx`
- `src/pages/Menu.jsx`
- `src/components/CartDrawer.jsx`
- `src/components/ProductCard.jsx`
- `src/components/CategoryBar.jsx`
- `src/pages/Confirmation.jsx`
- `src/pages/Admin.jsx`
- `src/components/AdminProductForm.jsx`
- `src/context/StoreContext.jsx`
- `src/data/seed.js`
- `src/theme.js`
- `src/index.css`
- `tailwind.config.js`
- `vite.config.js`
- `postcss.config.js`
- `index.html`
- `public/404.html`

Tambem nao devem ser tocados:

- visual do quiosque
- visual do painel da cozinha
- opcoes de pagamento do quiosque
- fluxo de navegacao do cliente
- `dist/`
- `node_modules/`

Restricoes explicitas desta entrega:

- Nao adicionar `Dinheiro` ao quiosque.
- Nao transformar o painel da cozinha em uma tela diferente da atual.
- Nao introduzir persistencia de historico de caixa fora da memoria da sessao.

---

## 9. Premissas assumidas

### P1 - A comanda e o agrupamento por mesa

Uma comanda aberta sera tratada como a soma de todos os pedidos ainda abertos da mesma mesa.

### P2 - O status de cozinha pode ser por pedido, nao por item

Como a cozinha hoje conclui um pedido inteiro com um unico botao, o status compartilhado mais simples e por pedido. O destaque da mesa no caixa sera derivado de "todos os pedidos abertos daquela mesa ja foram concluidos".

### P3 - O nome do cliente exibido na mesa seguira regra simples

Quando houver varios pedidos na mesma mesa com nomes diferentes ou variacoes de digitacao, a tela do caixa exibira o nome mais recente informado naquela mesa. Isso evita criar logica de conciliacao desnecessaria.

### P4 - A forma de pagamento de referencia da mesa seguira regra simples

Se uma mesma mesa tiver pedidos com referencias de pagamento diferentes no quiosque, o Painel do Caixa exibira como referencia a forma escolhida no pedido mais recente daquela mesa. A confirmacao final do caixa continua sendo o registro oficial do fechamento.

### P5 - O historico arquivado pertence ao dispositivo do caixa

O historico arquivado em memoria e apenas demonstrativo e nao precisa ser compartilhado com cozinha, quiosque ou outras abas.

### P6 - O comportamento visual da cozinha deve parecer igual ao atual

Mesmo que a logica interna mude de "remover pedido" para "marcar pedido como concluido", o operador da cozinha deve continuar percebendo que o card saiu da lista ao concluir.

### P7 - Sem backend, a sessao continua local

Sem backend, continua valendo a limitacao atual do projeto: o estado compartilhado depende do navegador e do armazenamento local do dispositivo.

---

## 10. Riscos identificados

| Risco | Probabilidade | Impacto | Mitigacao proposta |
|---|---|---|---|
| Mesa com varios pedidos e metodos diferentes no quiosque gerar ambiguidade na referencia de pagamento | Media | Medio | assumir e documentar que o painel mostra a referencia do pedido mais recente e que o registro oficial e a confirmacao do caixa |
| Alterar o comportamento interno da cozinha quebrar o fluxo atual | Baixa | Alto | manter o mesmo layout e a mesma interacao visivel, trocando apenas a escrita no estado compartilhado |
| Dados corrompidos em `localStorage` quebrarem a tela do caixa | Media | Alto | tratar leitura invalida como lista vazia e nunca mostrar erro tecnico ao operador |
| Comandas antigas permanecerem abertas por erro de fechamento | Media | Medio | destacar claramente o fechamento, exigir confirmacao da forma final e remover a mesa ativa somente apos a confirmacao |
| Historico arquivado se perder em refresh gerar surpresa | Alta | Baixo | explicitar no texto e no PRD que o historico e apenas de sessao e demonstrativo |
| Agrupamento por mesa mascarar pedidos de balcao | Baixa | Medio | tratar `Balcao` como uma comanda propria e explicitar isso na interface |

---

## 11. Criterios de aceitacao

Cada criterio descreve um cenario com entrada e resultado esperado.

### CA-01 - Nova mesa aparece na lista ativa

**Entrada:** o cliente da mesa 5 faz um pedido no quiosque com nome "Ana", escolhe Debito e confirma 1 Classic Burger e 2 Batata Frita.

**Resultado esperado:** a mesa 5 aparece na lista ativa do `/caixa` com o nome da cliente, os itens consumidos, as quantidades, os valores unitarios, o total acumulado, o tempo desde a abertura e a referencia de pagamento "Debito".

### CA-02 - Mesa acumula varios pedidos

**Entrada:** a mesma mesa 5 faz um segundo pedido depois do primeiro, ainda sem fechar a conta.

**Resultado esperado:** o `/caixa` nao cria uma segunda comanda ativa para a mesma mesa. A tela mostra uma unica mesa 5 com todos os itens acumulados e total somado desde a abertura da comanda.

### CA-03 - Ordenacao respeita a abertura da comanda

**Entrada:** a mesa 2 abre comanda as 19:00, a mesa 7 abre as 19:05 e a mesa 4 abre as 19:10.

**Resultado esperado:** a lista ativa do `/caixa` mostra as mesas na ordem 2, 7 e 4, da mais antiga para a mais recente.

### CA-04 - Cozinha conclui pedido sem apagar a referencia para o caixa

**Entrada:** existe um pedido aberto da mesa 3 visivel na cozinha e no caixa. O operador da cozinha clica em `Concluido` e confirma a acao.

**Resultado esperado:** o card desaparece da tela da cozinha como hoje, mas a mesa correspondente continua visivel no `/caixa` e passa a refletir que aquele pedido ja foi concluido pela cozinha.

### CA-05 - Mesa pronta para fechar recebe destaque visual

**Entrada:** uma mesa possui dois pedidos abertos. O primeiro ja foi concluido na cozinha e o segundo ainda nao. Depois, o segundo tambem e concluido.

**Resultado esperado:** antes da conclusao do segundo pedido, a mesa nao aparece como pronta. Depois que todos os pedidos abertos daquela mesa forem concluidos, a mesa recebe destaque visual indicando que a conta pode ser fechada.

### CA-06 - Caixa confirma forma final diferente da referencia do quiosque

**Entrada:** a mesa 8 foi registrada com referencia "PIX" no quiosque, mas no fechamento o cliente paga em Dinheiro.

**Resultado esperado:** o caixa consegue fechar a comanda escolhendo Dinheiro. A comanda sai da lista ativa e, no historico arquivado, a forma registrada e Dinheiro, nao PIX.

### CA-07 - Fechamento move a comanda para o arquivo da sessao

**Entrada:** o operador fecha a conta de uma mesa com sucesso.

**Resultado esperado:** a mesa desaparece da lista ativa imediatamente e passa a aparecer apenas na secao de comandas arquivadas, com cliente, itens, total, forma confirmada pelo caixa, horario de abertura e horario de encerramento.

### CA-08 - Historico arquivado nao persiste apos recarregar

**Entrada:** o operador fecha duas comandas, visualiza ambas no historico arquivado e depois recarrega a pagina ou fecha e reabre o navegador.

**Resultado esperado:** o historico arquivado volta vazio, porque ele existe apenas em memoria durante a sessao.

### CA-09 - Opcao Dinheiro existe apenas no caixa

**Entrada:** o operador acessa `/payment` no quiosque e depois acessa `/caixa`.

**Resultado esperado:** o quiosque continua oferecendo apenas Debito, Credito e PIX. O painel do caixa oferece Dinheiro, Debito, Credito e PIX no fechamento.

### CA-10 - Balcao continua funcionando

**Entrada:** um pedido e feito sem parametro de mesa, sendo registrado como Balcao.

**Resultado esperado:** o `/caixa` exibe uma comanda ativa de Balcao com os dados corretos e permite o fechamento normal.

### CA-11 - Tela ativa vazia

**Entrada:** nao existe nenhuma comanda aberta no estado compartilhado.

**Resultado esperado:** o `/caixa` mostra uma mensagem clara de que nao ha comandas ativas, sem cards quebrados e sem erro tecnico na tela.

### CA-12 - Erro de armazenamento nao derruba o caixa

**Entrada:** o conteudo de `selfix_orders` no navegador esta invalido ou corrompido.

**Resultado esperado:** o `/caixa` trata a situacao sem quebrar a interface. O operador ve a tela vazia ou um fallback seguro, nunca uma tela branca ou mensagem tecnica.

### CA-13 - Quiosque permanece visual e funcionalmente igual

**Entrada:** um cliente percorre o fluxo completo do quiosque antes e depois da implementacao.

**Resultado esperado:** o visual, os textos, as telas e o comportamento do quiosque permanecem os mesmos. A unica diferenca e interna: a forma escolhida passa a ser salva junto com o pedido.

### CA-14 - Cozinha permanece visualmente igual

**Entrada:** o operador usa a rota `/cozinha` depois da implementacao.

**Resultado esperado:** a tela continua com o mesmo layout, a mesma lista de pedidos e o mesmo botao `Concluido`. A diferenca e apenas interna: o clique atualiza o estado compartilhado em vez de apagar definitivamente a referencia necessaria ao caixa.

---

## 12. Resumo do recorte desta entrega

Esta melhoria cria o Painel do Caixa sem redesenhar o sistema inteiro.

O menor caminho consistente com a base atual e:

- continuar usando `selfix_orders` como origem compartilhada
- registrar a forma de pagamento escolhida no quiosque no momento do pedido
- fazer a cozinha marcar conclusao no estado compartilhado, sem mudar seu visual
- derivar a comanda ativa agrupando pedidos por mesa
- manter o historico fechado apenas em memoria na tela do caixa

Esse recorte atende o objetivo do negocio, respeita as restricoes do projeto e evita overengineering.

---

*Este documento deve ser aprovado antes de qualquer implementacao.*
