# SPEC — Modo Mesa via QR Code

**Projeto:** SELFIX  
**Data:** 2026-04-26  
**Status:** Aguardando aprovação  
**Baseado no PRD:** PRD_MODO_MESA_QR.md (2026-04-25)

---

## 1. Escopo

Esta especificação cobre exclusivamente as mudanças necessárias para habilitar o Modo Mesa via QR Code. Nenhum outro comportamento do app é alterado.

Arquivos que mudam: `StoreContext.jsx`, `Welcome.jsx`, `Menu.jsx`, `Confirmation.jsx`.  
Arquivos que **não mudam**: `App.jsx` (ver Observação 1), e todos os demais listados na seção 6 do PRD.

---

## 2. Decisão de Arquitetura

### 2.1 — Onde a leitura da URL e o estado `tableNumber` vivem

O PRD indica `App.jsx` como local de leitura do parâmetro `?mesa=` e armazenamento no contexto. Entretanto, o código real impossibilita isso:

```
App()
 └── <StoreProvider>        ← define o contexto
      └── <CartProvider>
           └── <HashRouter>  ← habilita useNavigate()
                └── <Routes>
```

O componente `App` está **fora** do `StoreProvider` e **fora** do `HashRouter`. Ele não pode chamar `useStore()` (lançaria erro) nem `useNavigate()` (não está dentro do Router). Qualquer lógica que precise de ambos precisa viver dentro da árvore do `HashRouter`.

**Decisão adotada no Spec:**

1. `tableNumber` é inicializado diretamente em `StoreContext.jsx` via lazy initializer — padrão já usado por `config` e `products`. Isso é funcionalmente idêntico ao descrito no PRD: ocorre uma única vez, na inicialização do app.
2. O redirecionamento para `/menu` é feito em `Welcome.jsx`, que já usa `useNavigate()` e já tem um `useEffect` de inicialização.

`App.jsx` não recebe nenhuma modificação.

### 2.2 — Parâmetro antes do `#` (HashRouter)

O app usa `HashRouter`. A URL com QR Code tem o formato:

```
https://dominio.github.io/SELFIX/?mesa=4#/
```

O `window.location.search` retorna `?mesa=4` neste caso. A leitura via `new URLSearchParams(window.location.search)` funciona corretamente.

Se o parâmetro vier após o `#` (URL malformada, ex.: `/#/menu?mesa=4`), `window.location.search` retornará string vazia — o app cai no comportamento padrão (tela de boas-vindas), conforme Cenário 10 do PRD.

---

## 3. Mudanças por Arquivo

### 3.1 `src/context/StoreContext.jsx`

**Linha de referência:** adição após o estado `products` (linha 33 atual), antes do primeiro `useEffect`.

**O que adicionar:**

```jsx
const [tableNumber, setTableNumber] = useState(() => {
  const params = new URLSearchParams(window.location.search)
  const mesa = params.get('mesa')
  return mesa || null
})
```

- Tipo: `string | null`
- Persistência: apenas em memória (sem `localStorage`, sem `useEffect` de sincronização)
- Valor inicial: string do parâmetro `mesa` se presente e não-vazia; `null` caso contrário
- Padrão de leitura: `new URLSearchParams(window.location.search).get('mesa')` — mesmo mecanismo confirmado na Premissa 2 do PRD

**No objeto `value` do Provider** (linha 64 atual), adicionar os dois novos campos:

```jsx
tableNumber,
setTableNumber,
```

Nenhuma outra linha do arquivo é alterada. A lógica de `config`, `products` e todos os demais estados permanece intocada.

---

### 3.2 `src/pages/Welcome.jsx`

**O que adicionar:**

1. Importar `tableNumber` de `useStore()` (linha 8 atual já tem `const { config } = useStore()`):

```jsx
const { config, tableNumber } = useStore()
```

2. Modificar o `useEffect` existente (linhas 11–13 atuais) para redirecionar quando `tableNumber` estiver definido:

```jsx
useEffect(() => {
  if (tableNumber) {
    navigate('/menu', { replace: true })
    return
  }
  clearCart()
}, [])
```

**Comportamento resultante:**
- Com `tableNumber`: redireciona para `/menu` imediatamente. `clearCart()` não é chamado (cart já está vazio — sem persistência no LocalStorage).
- Sem `tableNumber`: comportamento atual mantido — `clearCart()` é chamado, tela de boas-vindas renderiza.

**O que não muda:** todo o JSX do componente (logo, título, botão, link admin) permanece intocado. A tela de boas-vindas continua existindo e acessível sem parâmetro.

---

### 3.3 `src/pages/Menu.jsx`

**O que adicionar:**

1. Importar `tableNumber` de `useStore()` (linha 12 atual já tem `const { config, products } = useStore()`):

```jsx
const { config, products, tableNumber } = useStore()
```

2. No `<header>` (linhas 43–56 atuais), substituir o `<span>` estático "Cardápio" por um elemento condicional:

```jsx
{tableNumber
  ? <span className="text-sm font-semibold text-gray-300 bg-gray-800 border border-gray-700 rounded-full px-3 py-1">Mesa {tableNumber}</span>
  : <span className="text-gray-500 text-sm">Cardápio</span>
}
```

**Resultado visual:**
- Com mesa: label "Mesa 4" (ou o valor do parâmetro) substitui "Cardápio" no canto direito do header
- Sem mesa: "Cardápio" exibido como hoje

**O que não muda:** grid de produtos, CategoryBar, CartDrawer, botão flutuante do carrinho, todo o restante do componente.

---

### 3.4 `src/pages/Confirmation.jsx`

**O que adicionar:**

1. Importar `tableNumber` de `useStore()` (linha 4 atual já tem `const { config } = useStore()`):

```jsx
const { config, tableNumber } = useStore()
```

2. Modificar o `<p>` da linha 70 atual de:

```jsx
<p className="text-gray-300 text-xl font-medium mb-2">
  Aguarde ser chamado no balcão
</p>
```

para:

```jsx
<p className="text-gray-300 text-xl font-medium mb-2">
  {tableNumber
    ? `Pedido enviado para a cozinha! ✅ Mesa ${tableNumber} — Pedido #${orderNumber}`
    : 'Aguarde ser chamado no balcão'}
</p>
```

`orderNumber` já está disponível via `useCart()` na linha 9 atual — nenhuma importação adicional necessária.

3. Substituir o `navigate('/')` existente — que aparece em dois pontos do componente (dentro do `setInterval` do countdown e no `onClick` do botão "Novo pedido") — por:

```jsx
navigate(tableNumber ? '/menu' : '/')
```

Isso garante que em modo mesa o cliente retorne direto ao cardápio sem passar pela tela de boas-vindas. Em modo sem mesa (totem/legado), o comportamento atual (`navigate('/')`) é mantido.

**O que não muda:** `<h1>Pedido Confirmado!</h1>` permanece acima da mensagem condicional, sem alteração. Card com o número do pedido em destaque, nome do cliente, countdown de 10 segundos e botão "Novo pedido" permanecem intocados.

---

## 4. Observações — Diferenças entre PRD e Código Real

### Observação 1 — App.jsx: PRD prescreve mudança, código inviabiliza

**PRD diz:** leitura do parâmetro `?mesa=` e armazenamento no `StoreContext` devem ocorrer em `App.jsx`.

**Código real:** `App.jsx` é o componente-raiz que instancia os Providers. Ele não pode chamar `useStore()` (não está dentro do `StoreProvider`) nem `useNavigate()` (não está dentro do `HashRouter`). Modificar `App.jsx` para essa lógica exigiria criar um componente-filho intermediário dentro do Router, aumentando a complexidade sem ganho.

**Resolução adotada:** a leitura da URL é movida para o lazy initializer de `StoreContext.jsx` (onde `config` e `products` também são inicializados). O redirecionamento é feito em `Welcome.jsx`. `App.jsx` permanece sem alterações.

---

### Observação 2 — Welcome.jsx: link admin usa href absoluto (bug pré-existente)

**Linha 67 atual:**
```jsx
<a href="/admin" ...>⚙</a>
```

Com `HashRouter`, a rota admin é `/#/admin`. O `href="/admin"` (caminho absoluto sem hash) causaria um reload para uma URL que o GitHub Pages não serve, resultando em 404.

**Isso é um bug pré-existente, fora do escopo desta entrega.** O Spec não altera essa linha. Registrado apenas para conhecimento.

**Correção incluída nesta entrega:** trocar `href="/admin"` por `href="/#/admin"` em `Welcome.jsx`. Nenhuma outra linha do componente é alterada por esta correção.

---

### Observação 3 — Confirmation.jsx: número do pedido aparece duas vezes com tableNumber

**PRD diz:** quando `tableNumber` está presente, a mensagem deve ser "Pedido enviado para a cozinha! ✅ Mesa X — Pedido #XXXX".

**Código real:** a tela de confirmação já exibe `#{orderNumber}` em destaque visual com fonte `text-8xl` no card acima da mensagem. Com a mudança do PRD, o número do pedido aparecerá duas vezes na mesma tela (no card e na linha de texto).

**Resolução:** o Spec implementa o PRD exatamente como escrito. A redundância é visualmente aceitável: o card exibe o número de forma destacada para fácil identificação; a linha de texto contextualiza mesa e pedido juntos para a equipe da cozinha. Nenhuma alteração no card.

---

### Observação 4 — Retorno à tela inicial em modo mesa (countdown e "Novo pedido")

**Comportamento atual:** o countdown e o botão "Novo pedido" em `Confirmation.jsx` navegam para `/` (Welcome).

**Com tableNumber ativo:** ao navegar para `/`, `Welcome.jsx` detectará `tableNumber` e redirecionará para `/menu`. O fluxo completo:

```
Confirmation → clearCart() + navigate('/') → Welcome monta →
useEffect detecta tableNumber → navigate('/menu', { replace: true }) → Menu (carrinho vazio)
```

Isso produz um flash imperceptível da tela de boas-vindas antes de redirecionar. O comportamento final é correto: o cliente volta para o cardápio pronto para um novo pedido.

**Decisão:** a correção do `navigate` está incluída no escopo desta entrega, conforme seção 3.4. O Codex não deve fazer nenhuma outra alteração na lógica de navegação de `Confirmation.jsx` além das duas descritas: a mensagem condicional e a troca do destino do `navigate`.

---

## 5. Mapeamento Critérios de Aceitação → Implementação

| Cenário PRD | Cobertura neste Spec |
|---|---|
| 1 — Acesso via QR, redireciona para cardápio | Welcome.jsx: `if (tableNumber) navigate('/menu')` |
| 2 — "Mesa X" no topo do cardápio | Menu.jsx: badge condicional no header |
| 3 — "Mesa X" na confirmação com número | Confirmation.jsx: `<p>` condicional com tableNumber e orderNumber |
| 4 — Acesso sem parâmetro (modo legado) | Welcome.jsx: `else clearCart()` — comportamento atual mantido |
| 5 — Parâmetro `?mesa=` sem valor | StoreContext: `mesa || null` — string vazia torna-se null |
| 6 — Painel admin não exibe mesa | Admin.jsx não é alterado |
| 7 — Troca de mesa via reload | tableNumber relido do URL no lazy initializer a cada mount |
| 8 — CartDrawer sem referência à mesa | CartDrawer.jsx não é alterado |
| 9 — Payment sem referência à mesa | Payment.jsx não é alterado |
| 10 — Parâmetro após `#` (URL malformada) | `window.location.search` retorna vazio → tableNumber é null |

---

## 6. O Que Não é Tocado

Mantém-se exatamente o PRD seção 6. Listagem resumida dos arquivos não modificados:
`CartContext.jsx`, `CartDrawer.jsx`, `ProductCard.jsx`, `CategoryBar.jsx`, `Payment.jsx`, `Admin.jsx`, `AdminProductForm.jsx`, `App.jsx`, `seed.js`, `vite.config.js`, `tailwind.config.js`, `index.html`.

---

*Este documento deve ser aprovado antes de qualquer implementação.*
