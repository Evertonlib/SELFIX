# SPEC — Painel de Cozinha (`/cozinha`)

**Projeto:** SELFIX  
**Data:** 2026-04-26  
**Status:** Aguardando aprovação  
**Baseado em:** PRD_PAINEL_COZINHA.md  
**Revisão:** incorpora estado real do código após implementação de SPEC_SIMPLIFICAR_PAGAMENTO.md

---

## 1. Visão geral

Implementar a rota `/cozinha` com um painel que:
1. Lê `selfix_orders` do `localStorage` a cada 5 segundos.
2. Exibe cards de pedidos pendentes com dados completos.
3. Permite marcar um pedido como concluído (com confirmação), removendo-o do `localStorage`.

Pré-requisito: `CartContext.jsx` precisa ser modificado para salvar cada pedido confirmado em `selfix_orders` no momento em que `generateOrder()` é chamado.

---

## 2. Discrepâncias encontradas entre o PRD e o código real

> Onde o código diverge do que o PRD descreve, o código prevalece.

---

### D-1 — `tableNumber` existe, mas em `StoreContext`, não em `CartContext` ✅ resolvido

**O que o PRD afirma:** o objeto de pedido incluirá `tableNumber`, lido do parâmetro de mesa da URL; quando ausente, o valor será `'Balcão'`.

**O que o código real faz:** `StoreContext.jsx` (linhas 35–39) inicializa `tableNumber` lendo `window.location.search` na montagem do provider:

```javascript
const [tableNumber, setTableNumber] = useState(() => {
  const params = new URLSearchParams(window.location.search)
  const mesa = params.get('mesa')
  return mesa || null
})
```

O parâmetro de mesa está na query string convencional da URL (ex: `http://device/?mesa=5#/menu`), não no hash. Com HashRouter, a query string **não muda** quando o hash muda — portanto `window.location.search` ainda contém `?mesa=5` quando o usuário está em `/#/payment`.

`Confirmation.jsx` usa `tableNumber` desta forma: `const { config, tableNumber } = useStore()`.

**Resolução para a implementação:** dentro de `generateOrder()` em `CartContext.jsx`, ler `window.location.search` diretamente, idêntico ao que `StoreContext` já faz:

```javascript
const params = new URLSearchParams(window.location.search)
const tableNum = params.get('mesa') ?? 'Balcão'
```

Isso não requer tocar em nenhum outro arquivo. Nenhuma dependência entre contextos. Nenhum parâmetro novo na assinatura de `generateOrder()`.

---

### D-2 — `Payment.jsx` foi simplificado; `generateOrder()` agora é chamado inline

**O que o PRD original descreve:** `handleConfirm()` chama `generateOrder()` e navega para `/confirmation`.

**O que o código real faz (após SPEC_SIMPLIFICAR_PAGAMENTO):** não existe mais `handleConfirm()`. Cada um dos três botões (Débito, Crédito, PIX) tem o handler inline:

```javascript
onClick={() => { generateOrder(); navigate('/confirmation') }}
```

`useStore` foi removido de `Payment.jsx`. O arquivo importa apenas `useEffect`, `useNavigate` e `useCart`.

**Impacto no Painel Cozinha:** nenhum. A lógica de persistência será adicionada *dentro* de `generateOrder()` no `CartContext.jsx`. Os três botões continuam chamando `generateOrder()` sem argumentos — exatamente como o Spec especifica.

---

### D-3 — `total` é valor derivado, não state persistido

**O que o PRD afirma:** salvar `total` no objeto do pedido.

**O que o código real faz:** `total` é calculado como `const total = items.reduce(...)` dentro de `CartProvider` (linha 41 de `CartContext.jsx`). É um `const` de escopo do provider, não acessível diretamente de dentro de `generateOrder()`. O cálculo precisa ser refeito dentro da função usando o snapshot de `items` — `items.reduce((s, i) => s + i.price * i.qty, 0)`.

Isso é seguro porque `clearCart()` é chamado em `Confirmation.jsx` dentro do `setInterval` (após 10 segundos de countdown), não na montagem do componente. No momento em que `generateOrder()` é chamado (em `Payment.jsx`), `items` ainda está intacto.

---

## 3. Modelo de dados — `selfix_orders`

Chave no `localStorage`: `"selfix_orders"`  
Tipo: array JSON de objetos  
Comportamento: acumulativo; cada novo pedido é inserido com `push`; pedidos concluídos são removidos por `filter`.

```
[
  {
    id:           string   — número do pedido gerado por generateOrder(), ex: "3712"
    tableNumber:  string   — params.get('mesa') ?? 'Balcão'
    customerName: string   — valor de customerName no CartContext no momento da confirmação
    items: [
      {
        id:    string | number   — id do produto
        name:  string            — nome do produto
        price: number            — preço unitário
        qty:   number            — quantidade
      }
    ]
    total:     number  — soma de (price × qty) para todos os itens
    createdAt: string  — new Date().toISOString()
  }
]
```

**Regra de leitura com erro:** se `JSON.parse` lançar exceção, tratar como array vazio. Nunca propagar o erro ao operador.

---

## 4. `src/context/CartContext.jsx` — Modificações

### 4.1 Localização da mudança

Modificar exclusivamente a função `generateOrder()` (linhas 29–33 do arquivo atual). Nenhuma outra função, estado ou valor do contexto será alterado. Nenhum novo import é necessário.

### 4.2 Lógica a inserir dentro de `generateOrder()`

```
função generateOrder():
  1. gerar num = String(Math.floor(1000 + Math.random() * 9000))
  2. setOrderNumber(num)                          ← já existe
  3. [NOVO — bloco try/catch]:
       a. extrair tableNumber da URL:
              params = new URLSearchParams(window.location.search)
              tableNum = params.get('mesa') ?? 'Balcão'
       b. calcular totalAtual = items.reduce((s, i) => s + i.price * i.qty, 0)
       c. montar snapshot de items: items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))
       d. montar objeto de pedido:
              { id: num, tableNumber: tableNum, customerName,
                items: snapshot, total: totalAtual, createdAt: new Date().toISOString() }
       e. ler selfix_orders do localStorage (com try interno → [] em caso de erro)
       f. fazer push do novo pedido no array
       g. salvar o array atualizado com localStorage.setItem('selfix_orders', JSON.stringify(updated))
  4. return num                                   ← já existe, fora do try/catch
```

### 4.3 Snapshot de `items`

Usar `items.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty }))` para criar uma cópia limpa — sem referências React, sem campos extras do produto.

### 4.4 Isolamento de erro

Todo o bloco de persistência (passo 3 inteiro) deve estar em `try/catch`. Qualquer exceção deve ser silenciada. O `return num` na linha 4 deve ficar fora do `try/catch` para não ser afetado por falhas de persistência.

---

## 5. `src/App.jsx` — Modificações

### 5.1 Import a adicionar

```javascript
import Kitchen from './pages/Kitchen'
```

Posição: após a linha de import de `Admin` (linha 8 do arquivo atual).

### 5.2 Route a adicionar

```jsx
<Route path="/cozinha" element={<Kitchen />} />
```

Posição: após `<Route path="/admin" ...>` (linha 20 do arquivo atual), antes do fechamento de `<Routes>`.

### 5.3 Contexto disponível

A rota `/cozinha` ficará dentro de `<StoreProvider>` e `<CartProvider>` (estrutura atual de `App.jsx`). `Kitchen` usará `useStore()` para `config.primaryColor`. Não usará `useCart()`.

---

## 6. `src/pages/Kitchen.jsx` — Novo componente

### 6.1 Imports

```javascript
import { useState, useEffect } from 'react'
import { useStore } from '../context/StoreContext'
```

### 6.2 Estado interno

| State | Tipo | Descrição |
|---|---|---|
| `orders` | `array` | Lista atual de pedidos lida do localStorage |
| `confirmTarget` | `string \| null` | `id` do pedido aguardando confirmação; `null` quando nenhum dialog está aberto |

### 6.3 Polling

```
useEffect:
  função readOrders():
    try:
      raw = localStorage.getItem('selfix_orders')
      parsed = raw ? JSON.parse(raw) : []
      setOrders(prev =>
        JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev
      )
    catch:
      setOrders(prev => prev.length === 0 ? prev : [])

  readOrders()                          ← leitura imediata ao montar
  interval = setInterval(readOrders, 5000)
  return () => clearInterval(interval)  ← cleanup ao desmontar
```

O state só é atualizado se o conteúdo mudou (comparação por `JSON.stringify`), evitando re-renders desnecessários a cada tick.

### 6.4 Função `handleDone(id)`

```
handleDone(id):
  setConfirmTarget(id)    ← abre o dialog
```

### 6.5 Função `confirmDone()`

```
confirmDone():
  try:
    raw = localStorage.getItem('selfix_orders')
    current = raw ? JSON.parse(raw) : []
    updated = current.filter(o => o.id !== confirmTarget)
    localStorage.setItem('selfix_orders', JSON.stringify(updated))
    setOrders(updated)
  catch:
    (silenciado)
  setConfirmTarget(null)
```

### 6.6 Estrutura de render

```
<div className="min-h-screen bg-gray-950">

  [Header]
  <header className="bg-gray-900 px-5 py-4 border-b border-gray-800">
    <h1 className="text-white text-2xl font-bold">Painel da Cozinha</h1>
  </header>

  [Corpo]
  <div className="p-4 flex flex-col gap-4">

    [Estado vazio — condicional: orders.length === 0]
    <p className="text-gray-400 text-center text-xl mt-16">
      Nenhum pedido no momento.
    </p>

    [Lista de cards — condicional: orders.length > 0]
    orders.map(order =>
      <div key={order.id} className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3">

        [Linha 1 — número do pedido e mesa]
        <div className="flex justify-between items-center">
          <span className="text-white text-xl font-bold">Pedido #{order.id}</span>
          {order.tableNumber === 'Balcão'
            ? <span className="text-gray-400 text-base">Balcão</span>
            : <span className="text-gray-400 text-base">Mesa {order.tableNumber}</span>
          }
        </div>

        [Linha 2 — nome do cliente]
        <span className="text-gray-300 text-base">{order.customerName}</span>

        [Linha 3 — itens]
        <ul className="flex flex-col gap-1">
          order.items.map(item =>
            <li key={item.id} className="text-gray-300 text-sm">
              {item.qty}× {item.name}
            </li>
          )
        </ul>

        [Linha 4 — total]
        <span className="text-gray-400 text-sm">
          Total: R$ {order.total.toFixed(2).replace('.', ',')}
        </span>

        [Botão Concluído]
        <button
          onClick={() => handleDone(order.id)}
          className="w-full text-white font-bold rounded-2xl py-3 active:opacity-80"
          style={{ backgroundColor: config.primaryColor }}
        >
          Concluído
        </button>

      </div>
    )

  </div>

  [Dialog de confirmação — condicional: confirmTarget !== null]
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-gray-900 rounded-2xl p-6 mx-6 flex flex-col gap-4">
      <p className="text-white text-xl font-bold text-center">
        Concluir pedido #{confirmTarget}?
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setConfirmTarget(null)}
          className="flex-1 bg-gray-700 text-white font-bold rounded-2xl py-3"
        >
          Não
        </button>
        <button
          onClick={confirmDone}
          className="flex-1 text-white font-bold rounded-2xl py-3"
          style={{ backgroundColor: config.primaryColor }}
        >
          Sim
        </button>
      </div>
    </div>
  </div>

</div>
```

---

## 7. Mapeamento dos critérios de aceitação para a implementação

| CA | Mecanismo de implementação |
|---|---|
| CA-01 — Pedido aparece no painel | `generateOrder()` salva em `selfix_orders`; Kitchen.jsx polling lê em até 5 s |
| CA-02 — Pedido sem mesa exibe "Balcão" | `new URLSearchParams(window.location.search).get('mesa') ?? 'Balcão'` em `generateOrder()` |
| CA-03 — Polling atualiza automaticamente | `setInterval(readOrders, 5000)` + leitura imediata ao montar |
| CA-04 — Botão "Concluído" com confirmação | `confirmTarget` state + dialog inline; `confirmDone()` remove do localStorage |
| CA-05 — Painel vazio exibe mensagem | Condicional `orders.length === 0` no render |
| CA-06 — Fluxo de compra intacto | Bloco de persistência em `try/catch` separado; `return num` fora do bloco |
| CA-07 — Cor primária refletida | `style={{ backgroundColor: config.primaryColor }}` nos botões |
| CA-08 — Múltiplos pedidos | `orders.map(...)` renderiza todos; ordem de inserção no array preservada |
| CA-09 — Erro no localStorage não trava | `try/catch` em toda leitura/escrita; fallback para `[]` |
| CA-10 — Rota acessível diretamente | `<Route path="/cozinha">` no `HashRouter` existente |

---

## 8. Pontos em aberto

Nenhum. Todos os pontos levantados na versão anterior foram resolvidos pela leitura do código real:

- **P-1 (tableNumber na URL)** — Resolvido. O parâmetro `mesa` está em `window.location.search`, não no hash. Com HashRouter, a query string persiste durante toda a navegação. `StoreContext.jsx` (linhas 35–39) confirma o comportamento com código já em produção.

- **P-2 (ordem do clearCart)** — Resolvido. `Confirmation.jsx` (linha 22) chama `clearCart()` dentro do `setInterval`, após 10 segundos de countdown. `items` e `customerName` estão disponíveis em CartContext quando `generateOrder()` é chamado em `Payment.jsx`.

---

*Aguardando aprovação para iniciar a implementação.*
