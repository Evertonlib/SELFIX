# PRD — Painel de Cozinha (`/cozinha`)

**Projeto:** SELFIX  
**Data:** 2026-04-26  
**Status:** Aguardando aprovação  

---

## 1. Objetivo

Criar uma tela exclusiva para a equipe de cozinha, acessível pela rota `/cozinha`, que exiba em tempo real todos os pedidos confirmados pelos clientes. A cozinha deve saber o número do pedido, a mesa, o nome do cliente e o que foi pedido, sem precisar acessar o painel administrativo ou interagir com o fluxo de compra do cliente.

---

## 2. Contexto e relação com o sistema existente

Hoje o sistema funciona assim:

1. O cliente navega pelo cardápio (`/menu`).
2. Adiciona itens ao carrinho e informa o nome.
3. Escolhe o método de pagamento (`/payment`) — nesse momento o número do pedido é gerado.
4. Vê a tela de confirmação (`/confirmation`) e o carrinho é esvaziado.

**O problema:** quando o carrinho é esvaziado, todos os dados do pedido somem da memória do navegador. Não existe, hoje, nenhuma chave no `localStorage` que guarde pedidos confirmados. O `localStorage` atual contém apenas configurações da loja (`selfix_config`) e o catálogo de produtos (`selfix_products`).

Para o painel de cozinha funcionar, os pedidos precisam ser salvos em algum momento antes do carrinho ser limpo.

---

## 3. Premissas assumidas

- **P1 — Persistência mínima necessária.** Será criada uma nova chave no `localStorage` chamada `selfix_orders` (array de objetos). O pedido será salvo nessa chave no momento em que o número do pedido é gerado, antes de a tela navegar para a confirmação. Isso exigirá uma modificação pontual e cirúrgica no `Payment.jsx` ou no `CartContext.jsx` — o menor toque possível para não alterar a lógica de pagamento já existente.

- **P2 — O painel de cozinha não faz parte do fluxo do cliente.** A URL `/cozinha` será aberta diretamente em um tablet ou monitor dedicado à equipe de cozinha. Não haverá link para ela em nenhuma tela do cliente.

- **P3 — Polling simples via `setInterval`.** O React já está no projeto. Um `setInterval` de 5 segundos relendo o `localStorage` é suficiente — sem WebSockets, sem contextos adicionais, sem bibliotecas externas.

- **P4 — Estilo visual idêntico ao quiosque.** Fundo escuro (`bg-gray-950`), cards em `bg-gray-900`, `rounded-2xl`, texto branco, botão de ação usando a cor primária configurada (`config.primaryColor`). Nenhum elemento visual novo será inventado.

- **P5 — Sem autenticação.** O painel de cozinha não terá login. Ele é para uso interno em dispositivo dedicado.

- **P6 — Sem ordenação customizável.** Os pedidos serão exibidos na ordem em que chegaram — o mais antigo aparece primeiro (ordem de inserção no array).

---

## 4. Estrutura do objeto de pedido no localStorage

Cada pedido salvo em `selfix_orders` terá esta forma:

```
id           → número do pedido (string, ex: "2847")
tableNumber  → número da mesa (string); quando não houver parâmetro de mesa na URL, salvar como string 'Balcão'
customerName → nome informado pelo cliente no carrinho
items        → lista de itens, cada um com:
               - id do produto
               - nome
               - preço unitário
               - quantidade
total        → valor total calculado (número)
createdAt    → data e hora do registro (string ISO 8601)
```

---

## 5. O que será adicionado

| Item | Descrição |
|---|---|
| `selfix_orders` no localStorage | Nova chave que acumula pedidos confirmados |
| `src/pages/Kitchen.jsx` | Nova página — o painel de cozinha |
| Rota `/cozinha` em `App.jsx` | Novo `<Route>` no `HashRouter` existente |
| Lógica de persistência | Trecho mínimo inserido no `Payment.jsx` ou `CartContext.jsx` para salvar o pedido no momento em que `generateOrder()` é chamado |

---

## 6. O que será modificado (minimamente)

| Arquivo | O que muda |
|---|---|
| `App.jsx` | Adição de uma única linha de `<Route path="/cozinha" element={<Kitchen />} />` |
| `CartContext.jsx` | Adição de um `localStorage.setItem` que registra o pedido em `selfix_orders` no momento da confirmação — sem alterar nenhuma lógica existente |

A decisão está tomada: a persistência será inserida no CartContext.jsx, no momento em que generateOrder() é chamado. Payment.jsx não será tocado para esta finalidade.

---

## 7. O que não será tocado

| Arquivo | Motivo |
|---|---|
| `Menu.jsx` | Cardápio do cliente — fora do escopo |
| `CartDrawer.jsx` | Interface do carrinho — fora do escopo |
| `Confirmation.jsx` | Tela de confirmação do cliente — fora do escopo |
| `ProductCard.jsx` | Card de produto do quiosque — fora do escopo |
| `CategoryBar.jsx` | Barra de categorias — fora do escopo |
| `StoreContext.jsx` | Gerencia produtos e configurações — não será alterado |
| `Payment.jsx` |A lógica de persistência foi alocada no CartContext.jsx — Payment.jsx não deve ser modificado para nenhuma finalidade relacionada a esta melhoria.
| `Admin.jsx` | Painel administrativo — fora do escopo |
| `Welcome.jsx` | Tela inicial — fora do escopo |
| `data/seed.js` | Dados de demonstração — fora do escopo |
| Todos os arquivos de estilo (`index.css`, `tailwind.config.js`) | Nenhuma mudança global de estilo |

---

## 8. Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Modificar `Payment.jsx` introduzir bug no fluxo de pagamento | Baixa (mudança pontual) | Alto | O trecho adicionado será isolado em um bloco separado, sem alterar a lógica existente; qualquer exceção no `localStorage` será silenciada para não bloquear o fluxo |
| `selfix_orders` crescer indefinidamente no localStorage | Alta (sem limpeza automática) | Baixo (impacto em armazenamento) | O botão "Concluído" remove o pedido; em dispositivos dedicados, isso não será problema por muito tempo |
| Dois quiosques usando o mesmo navegador/device salvando pedidos sobrepostos | Baixa (cenário improvável) | Médio | Fora do escopo desta versão |
| Polling de 5 segundos causar re-render excessivo | Muito baixa | Baixo | O state só é atualizado se o conteúdo do localStorage mudou de fato |
| Cliente ver a rota `/cozinha` acidentalmente | Baixa (URL não divulgada) | Baixo | O painel não terá ação destrutiva — apenas marca pedidos como concluídos |

---

## 9. Critérios de aceitação

Cada critério descreve um cenário com entrada e resultado esperado.

---

### CA-01 — Pedido aparece no painel

**Entrada:** O cliente finaliza um pedido pelo fluxo normal (menu → carrinho → pagamento → confirmação). A mesa é "5", o cliente se chama "Ana", o pedido é "1 Classic Burger" e "2 Batata Frita", número do pedido gerado: 3712.

**Resultado esperado:** Em até 5 segundos após a confirmação, o painel em `/cozinha` exibe um card com: `Pedido #3712`, `Mesa 5`, `Ana`, a lista com "1× Classic Burger" e "2× Batata Frita", e o valor total correto. O botão "Concluído" está visível.

---

### CA-02 — Pedido sem mesa

**Entrada:** O cliente acessa o sistema sem parâmetro de mesa na URL (retirada no balcão). Finaliza o pedido normalmente.

**Resultado esperado:** O card no painel exibe Pedido #XXXX e Balcão no lugar do número
de mesa, com os demais campos normais.

---

### CA-03 — Polling atualiza o painel automaticamente

**Entrada:** O painel `/cozinha` está aberto em uma aba. Em outra aba, um novo pedido é finalizado.

**Resultado esperado:** Em até 5 segundos, o novo card aparece no painel sem necessidade de recarregar a página.

---

### CA-04 — Botão "Concluído" remove o card

**Entrada:** O painel exibe dois pedidos. O operador clica em "Concluído" no primeiro pedido.

**Resultado esperado:** Ao tocar em Concluído, o sistema exibe um pop-up de confirmação
com a mensagem: Concluir pedido #XXXX? e duas opções: Sim e Não. Se o operador confirmar com Sim, o card desaparece imediatamente do painel e a entrada correspondente é removida do localStorage. Se o operador tocar em Não ou fora do pop-up, o card permanece inalterado. O segundo pedido permanece inalterado em ambos os casos.

---

### CA-05 — Painel vazio exibe mensagem

**Entrada:** Não há pedidos pendentes no `localStorage` (array `selfix_orders` vazio ou inexistente).

**Resultado esperado:** O painel exibe uma mensagem clara, por exemplo: "Nenhum pedido no momento." Nenhum card vazio ou erro é mostrado.

---

### CA-06 — Fluxo de compra continua intacto após a mudança

**Entrada:** O cliente usa o sistema normalmente: adiciona itens, vai para o pagamento, confirma, vê a tela de confirmação, o countdown conta e redireciona.

**Resultado esperado:** Nenhum comportamento do fluxo de compra é alterado. A tela de confirmação continua funcionando exatamente como antes.

---

### CA-07 — Painel segue o estilo visual do sistema

**Entrada:** O administrador altera a cor primária para azul (`#3b82f6`) no painel admin.

**Resultado esperado:** O botão "Concluído" nos cards da cozinha reflete a nova cor primária, assim como os outros elementos do sistema.

---

### CA-08 — Múltiplos pedidos exibidos simultaneamente

**Entrada:** Três pedidos são finalizados antes de qualquer um ser marcado como concluído.

**Resultado esperado:** Os três cards aparecem no painel, em ordem de chegada (mais antigo primeiro), sem sobreposição nem corte de informações.

---

### CA-09 — Erro ao ler localStorage não trava o painel

**Entrada:** O `localStorage` está corrompido (ex: valor inválido em `selfix_orders`).

**Resultado esperado:** O painel exibe a mensagem de "nenhum pedido" ou ignora silenciosamente o erro. Nenhuma tela em branco ou mensagem técnica de erro é exibida para o operador.

---

### CA-10 — Rota /cozinha é acessível diretamente

**Entrada:** O operador digita `http://[endereço]/#/cozinha` diretamente na barra do navegador.

**Resultado esperado:** O painel de cozinha carrega normalmente, independentemente de qual tela estava sendo exibida antes.

---

## 10. O que está fora do escopo desta versão

- Autenticação ou senha para acessar o painel
- Impressão automática de pedidos
- Sons de notificação ao chegar novo pedido
- Sincronização entre múltiplos dispositivos (sem backend)
- Filtro ou busca de pedidos no painel
- Histórico de pedidos já concluídos
- Indicação de tempo de espera por pedido

---

*Aguardando aprovação para iniciar a implementação.*
