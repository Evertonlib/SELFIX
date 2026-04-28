# SPEC - Painel do Caixa (`/caixa`)

**Projeto:** SELFIX  
**Base:** `PRD_PAINEL_CAIXA.md`  
**Data:** 2026-04-27  
**Status:** Aguardando aprovacao tecnica

---

## 1. Objetivo

Implementar a rota `/caixa` para fechamento de comandas, usando `selfix_orders`
como fonte compartilhada dos pedidos abertos.

A implementacao deve:

- preservar o fluxo visual do quiosque;
- preservar o visual do painel da cozinha;
- registrar no pedido a forma escolhida no quiosque;
- trocar a conclusao da cozinha de exclusao fisica para atualizacao de status;
- agrupar pedidos em comandas por mesa numerada;
- tratar pedidos de `Balcao` como comandas individuais;
- permitir fechamento apenas quando todos os pedidos da comanda estiverem concluidos;
- manter o historico fechado somente em memoria na tela do caixa.

---

## 2. Arquivos lidos e observacoes

Conforme solicitado, foram lidos apenas os arquivos afetados pelo PRD:

- `src/App.jsx`
- `src/pages/Payment.jsx`
- `src/context/CartContext.jsx`
- `src/pages/Kitchen.jsx`
- verificacao de existencia de `src/pages/Cashier.jsx` e `src/pages/Caixa.jsx`

### 2.1 Diferencas entre PRD e codigo real

1. `src/pages/Cashier.jsx` e `src/pages/Caixa.jsx` ainda nao existem.
   - O Spec adotara `src/pages/Cashier.jsx` como novo arquivo, mantendo nome de componente em ingles como as demais paginas existentes (`Welcome`, `Menu`, `Payment`, `Confirmation`, `Admin`, `Kitchen`).

2. `App.jsx` usa `HashRouter` e rotas declarativas simples.
   - A rota atual da cozinha e `/cozinha`.
   - A nova rota deve ser adicionada no mesmo bloco de `<Routes>`.

3. `Payment.jsx` chama `generateOrder()` diretamente nos tres botoes.
   - O codigo real nao possui handler intermediario para pagamento.
   - A alteracao minima sera passar um argumento para `generateOrder`, sem mudar textos, layout ou navegacao.

4. `CartContext.jsx` define `generateOrder()` sem parametros.
   - O pedido salvo hoje contem `id`, `tableNumber`, `customerName`, `items`, `total` e `createdAt`.
   - O Spec deve ampliar esse snapshot no proprio `generateOrder`.

5. `CartContext.jsx` le a mesa diretamente de `window.location.search`.
   - Embora o PRD mencione que o parametro de mesa existe em `StoreContext.jsx`, esse arquivo nao foi lido por restricao do pedido.
   - Para esta implementacao, prevalece o codigo lido: o pedido continua usando a mesa obtida em `CartContext.jsx`.

6. `Kitchen.jsx` hoje exibe todos os pedidos existentes em `selfix_orders`.
   - Depois da mudanca, pedidos concluidos continuarao no armazenamento ate o fechamento pelo caixa.
   - Portanto, a cozinha precisara filtrar visualmente apenas pedidos ainda nao concluidos para manter o comportamento percebido atual.

7. Os arquivos `Payment.jsx`, `CartContext.jsx` e `Kitchen.jsx` apresentam caracteres acentuados com aparencia corrompida no conteudo atual.
   - A implementacao nao deve fazer uma normalizacao ampla de encoding nesta entrega, para evitar mudanca visual ou diffs fora de escopo.
   - Novos textos do caixa devem ser escritos de forma consistente e simples.

---

## 3. Modelo de dados

### 3.1 Pedido em `selfix_orders`

Cada novo pedido salvo em `selfix_orders` deve manter os campos atuais e adicionar:

```js
{
  id: string,
  tableNumber: string,
  customerName: string,
  items: [
    {
      id: string | number,
      name: string,
      price: number,
      qty: number
    }
  ],
  total: number,
  createdAt: string,
  paymentReference: 'Debito' | 'Credito' | 'PIX',
  kitchenStatus: 'pending' | 'done',
  closedAt?: string,
  cashierPaymentMethod?: 'Dinheiro' | 'Debito' | 'Credito' | 'PIX'
}
```

### 3.2 Compatibilidade com pedidos antigos

Pedidos ja existentes sem `kitchenStatus` devem ser tratados como `pending`.

Pedidos ja existentes sem `paymentReference` devem mostrar um fallback neutro no caixa,
por exemplo `Nao informado`, sem quebrar a tela.

Pedidos com dados invalidos em `localStorage` devem resultar em lista vazia para a tela
que estiver lendo os dados.

### 3.3 Comanda derivada no caixa

A comanda nao sera persistida como estrutura separada. Ela sera derivada em memoria a
partir dos pedidos abertos em `selfix_orders`.

Campos derivados esperados:

```js
{
  key: string,
  type: 'table' | 'counter',
  tableNumber: string,
  customerName: string,
  orders: Order[],
  items: ConsolidatedItem[],
  total: number,
  openedAt: string,
  paymentReference: string,
  isReadyToClose: boolean
}
```

Item consolidado:

```js
{
  id: string | number,
  name: string,
  unitPrice: number,
  qty: number,
  total: number
}
```

---

## 4. Regras de agrupamento

### 4.1 Mesas numeradas

Pedidos com `tableNumber` diferente de `Balcao` devem ser agrupados por
`tableNumber`.

Para cada mesa:

- `openedAt` sera o menor `createdAt` entre os pedidos abertos da mesa;
- `customerName` sera o nome do pedido mais recente da mesa;
- `paymentReference` sera a referencia do pedido mais recente da mesa;
- `total` sera a soma dos totais dos pedidos da mesa;
- itens iguais devem ser consolidados por `id` e preco unitario;
- `isReadyToClose` sera verdadeiro apenas quando todos os pedidos da mesa tiverem `kitchenStatus === 'done'`.

### 4.2 Balcao

Pedidos com `tableNumber === 'Balcao'` devem virar comandas individuais.

A chave interna da comanda de balcao deve usar o `id` do pedido. O nome do cliente nao
deve ser usado para agrupamento.

Para cada pedido de balcao:

- `openedAt` sera o `createdAt` do proprio pedido;
- `customerName` sera o nome informado no pedido;
- `paymentReference` sera a referencia do proprio pedido;
- `isReadyToClose` sera verdadeiro quando esse pedido tiver `kitchenStatus === 'done'`.

Observacao: o codigo atual usa a string `Balcao` com acentuacao corrompida no arquivo.
Na implementacao, a comparacao deve respeitar a string real existente no codigo para
nao quebrar a compatibilidade dos pedidos atuais.

---

## 5. Alteracoes por arquivo

### 5.1 `src/App.jsx`

Adicionar import da nova pagina:

```js
import Cashier from './pages/Cashier'
```

Adicionar rota:

```jsx
<Route path="/caixa" element={<Cashier />} />
```

Nao alterar rotas existentes.

### 5.2 `src/pages/Payment.jsx`

Manter exatamente a mesma estrutura visual e o mesmo fluxo de navegacao.

Alterar apenas a chamada dos botoes:

- botao Debito chama `generateOrder('Debito')`;
- botao Credito chama `generateOrder('Credito')`;
- botao PIX chama `generateOrder('PIX')`.

Nao adicionar `Dinheiro` ao quiosque.

### 5.3 `src/context/CartContext.jsx`

Alterar `generateOrder` para aceitar `paymentReference`.

Ao montar o objeto `order`, adicionar:

```js
paymentReference,
kitchenStatus: 'pending'
```

Manter os campos existentes e o comportamento de gravacao em `selfix_orders`.

Fallback recomendado:

- se `paymentReference` nao vier preenchido, gravar `Nao informado` ou omitir de forma segura;
- a tela do caixa deve tolerar ausencia do campo.

### 5.4 `src/pages/Kitchen.jsx`

Manter layout, textos e fluxo de confirmacao visualmente iguais.

Na leitura de `selfix_orders`:

- continuar lendo a mesma chave;
- tratar JSON invalido como lista vazia;
- exibir apenas pedidos cujo `kitchenStatus` nao seja `done`.

Na confirmacao de conclusao:

- nao remover o pedido do array;
- atualizar o pedido correspondente com `kitchenStatus: 'done'`;
- salvar o array completo de volta em `selfix_orders`;
- atualizar o estado local com a lista filtrada visualmente, para o card sumir como hoje.

### 5.5 `src/pages/Cashier.jsx`

Criar nova pagina para o Painel do Caixa.

Responsabilidades:

- ler `selfix_orders` em polling simples;
- tratar erro de leitura como lista vazia;
- derivar comandas ativas por mesa ou por pedido de balcao;
- exibir lista ativa ordenada por `openedAt` crescente;
- permitir alternancia entre comandas ativas e historico da sessao;
- bloquear fechamento quando houver pedido pendente;
- permitir escolher forma final entre `Dinheiro`, `Debito`, `Credito` e `PIX`;
- remover de `selfix_orders` os pedidos fechados daquela comanda;
- arquivar snapshot consolidado em estado React local.

O historico arquivado deve usar `useState` e nao deve ser salvo em `localStorage`.

---

## 6. Comportamento da tela do caixa

### 6.1 Estado local

Estados sugeridos:

- `orders`: pedidos lidos de `selfix_orders`;
- `view`: `active` ou `archived`;
- `archivedTabs`: comandas fechadas na sessao atual;
- `selectedPaymentByTab`: forma final escolhida por comanda;
- `confirmTarget`: comanda selecionada para confirmacao de fechamento.

### 6.2 Polling

Usar polling simples, semelhante ao `Kitchen.jsx`.

Intervalo recomendado: 5 segundos, para manter consistencia com a cozinha.

### 6.3 Lista ativa

Quando nao houver comandas ativas, mostrar mensagem clara de estado vazio.

Cada comanda ativa deve mostrar:

- identificacao da mesa ou balcao;
- nome do cliente;
- horario de abertura;
- tempo decorrido;
- referencia de pagamento do quiosque;
- itens consolidados com quantidade, nome, valor unitario e subtotal;
- total acumulado;
- indicador visual de pronta ou aguardando cozinha;
- seletor da forma final de pagamento;
- botao de fechamento.

### 6.4 Bloqueio de fechamento

Se `isReadyToClose` for falso:

- o botao de fechamento deve estar desabilitado;
- a tela deve informar que ha pedidos em preparo aguardando a cozinha.

Se `isReadyToClose` for verdadeiro:

- o caixa pode escolher a forma final;
- o fechamento deve exigir uma confirmacao simples antes de remover a comanda ativa.

### 6.5 Fechamento

Ao confirmar o fechamento:

1. montar snapshot consolidado da comanda;
2. adicionar `cashierPaymentMethod`;
3. adicionar `closedAt` com data atual;
4. remover de `selfix_orders` todos os pedidos pertencentes a comanda;
5. atualizar `orders` local;
6. adicionar o snapshot em `archivedTabs`.

Para mesa numerada, remover todos os pedidos daquela mesa.

Para balcao, remover apenas o pedido cujo `id` corresponde a comanda.

---

## 7. Historico da sessao

O historico arquivado deve ser exibido na mesma rota `/caixa`, por alternancia de
visao.

Cada item arquivado deve mostrar:

- mesa ou balcao;
- cliente;
- itens consolidados;
- total;
- forma confirmada pelo caixa;
- horario de abertura;
- horario de encerramento.

Ao recarregar a pagina, `archivedTabs` volta vazio.

---

## 8. Criterios de aceitacao cobertos

Esta especificacao cobre:

- CA-01: mesa aparece na lista ativa com dados do pedido;
- CA-02: pedidos da mesma mesa numerada sao acumulados;
- CA-03: ordenacao por abertura da comanda;
- CA-04: cozinha conclui sem apagar referencia do caixa;
- CA-05 e CA-05b: destaque e bloqueio conforme status de cozinha;
- CA-06: forma final pode diferir da referencia do quiosque;
- CA-07: fechamento move para historico em memoria;
- CA-08: historico nao persiste apos recarregar;
- CA-09: `Dinheiro` existe apenas no caixa;
- CA-10: balcao vira comanda individual;
- CA-11: tela ativa vazia;
- CA-12: erro de armazenamento nao derruba o caixa;
- CA-13: quiosque permanece visual e funcionalmente igual;
- CA-14: cozinha permanece visualmente igual.

---

## 9. Restricoes de implementacao

- Nao alterar arquivos listados no PRD como fora de escopo.
- Nao alterar visual ou textos do quiosque alem da chamada interna de pagamento.
- Nao alterar visual da cozinha alem do filtro necessario para esconder pedidos concluidos.
- Nao criar biblioteca de estado nova.
- Nao criar backend fake.
- Nao persistir historico do caixa em `localStorage`.
- Nao adicionar `Dinheiro` ao quiosque.
- Nao tocar em `dist/` ou `node_modules/`.

---

## 10. Validacao tecnica prevista

Apos aprovacao deste Spec e implementacao:

1. executar validacao de build/lint disponivel no projeto;
2. testar manualmente o fluxo:
   - pedido no quiosque;
   - visualizacao na cozinha;
   - visualizacao no caixa;
   - conclusao na cozinha;
   - fechamento no caixa;
   - historico de sessao;
   - refresh limpando apenas o historico em memoria;
3. testar `localStorage` corrompido para garantir fallback seguro.

---

*Este documento deve ser aprovado antes da implementacao.*
