# PRD — Modo Mesa via QR Code

**Projeto:** SELFIX  
**Data:** 2026-04-25  
**Status:** Aguardando aprovação  

---

## 1. Objetivo

Adaptar o fluxo do SELFIX para simular o modelo de autoatendimento por QR Code de mesa, eliminando a tela de boas-vindas e substituindo a entrada manual por uma entrada automática via URL. Quando o cliente escaneia o QR Code da mesa, o app já abre diretamente no cardápio identificando a mesa, sem nenhuma interação extra.

---

## 2. Contexto e Relação com os Componentes Existentes

O SELFIX hoje funciona como um totem de autoatendimento: o cliente se aproxima, toca em "Toque para começar", navega pelo cardápio, adiciona itens ao carrinho, escolhe o pagamento e recebe a confirmação. Todo esse fluxo é local, sem servidor.

O novo modelo muda apenas o ponto de entrada e dois pontos de exibição:

- **Ponto de entrada:** URL com parâmetro `?mesa=4` substitui o toque na tela de boas-vindas.
- **Topo do cardápio:** passa a exibir o número da mesa em vez de nada.
- **Tela de confirmação:** passa a incluir o número da mesa na mensagem de sucesso.

O núcleo do app — cardápio, filtro por categoria, carrinho, drawer de itens, seleção de pagamento, geração de número de pedido — permanece intocado.

---

## 3. Arquivos Afetados

| Arquivo | Tipo de mudança |
|---|---|
| `src/App.jsx` | Leitura do parâmetro `?mesa=` na URL e lógica de redirecionamento |
| `src/context/StoreContext.jsx` | Adição de estado de sessão para o número da mesa |
| `src/pages/Welcome.jsx` | Remoção da rota como destino padrão quando mesa está presente |
| `src/pages/Menu.jsx` | Exibição de "Mesa X" no topo quando número de mesa está disponível |
| `src/pages/Confirmation.jsx` | Inclusão do número da mesa na mensagem de confirmação |

---

## 4. O Que Será Adicionado

**No `StoreContext`:**  
Um campo de sessão chamado `tableNumber` (texto ou nulo) armazenado apenas em memória — não salvo no localStorage. Uma função `setTableNumber` para definir esse valor na inicialização. Esse campo segue o mesmo padrão dos demais estados do contexto.

**No `App.jsx`:**  
Na inicialização do app, leitura de `window.location.search` para extrair o parâmetro `mesa`. Se o parâmetro estiver presente e tiver um valor, o valor é armazenado em `tableNumber` via StoreContext e a navegação é redirecionada diretamente para `/menu`, pulando a rota `/`. Se não houver parâmetro `mesa`, o comportamento atual é mantido: o app abre na tela de boas-vindas normalmente.

**No `Menu.jsx`:**  
Quando `tableNumber` estiver definido no StoreContext, exibir uma etiqueta discreta no topo do cardápio com o texto "Mesa X" (onde X é o número). Quando `tableNumber` for nulo ou vazio, essa etiqueta simplesmente não aparece — nenhuma quebra de layout.

**No `Confirmation.jsx`:**  
Quando `tableNumber` estiver definido, substituir a linha atual "Aguarde ser chamado no balcão" por "Pedido enviado para a cozinha! ✅ Mesa X — Pedido #XXXX". Quando `tableNumber` for nulo, a mensagem atual permanece inalterada.

---

## 5. O Que Será Removido

**Na interface visível ao cliente:**
- O botão "Toque para começar" da tela de boas-vindas **não é removido do arquivo**, mas a rota `/` deixa de ser o destino inicial quando o app é acessado com parâmetro `?mesa=`. A tela de boas-vindas continua existindo para acesso sem parâmetro (modo totem/teste).
- Textos como "Retire no balcão" na tela de boas-vindas não precisam ser removidos agora, pois a tela não será exibida no fluxo de mesa.

Nenhum arquivo é deletado. Nenhuma rota é removida do roteador.

---

## 6. O Que Não Será Tocado

Os itens abaixo **não devem ser alterados em hipótese alguma** nesta entrega:

- `CartContext.jsx` — toda a lógica de carrinho (addItem, removeItem, updateQty, generateOrder, clearCart, total, itemCount)
- `CartDrawer.jsx` — componente do carrinho, comportamento e layout
- `ProductCard.jsx` — exibição dos produtos
- `CategoryBar.jsx` — filtro de categorias
- `Payment.jsx` — fluxo de pagamento (PIX e cartão)
- `Admin.jsx` — painel administrativo
- `AdminProductForm.jsx` — formulário de produtos
- `StoreContext.jsx` — lógica de persistência de config e produtos no localStorage
- `seed.js` — dados demo
- `vite.config.js`, `tailwind.config.js`, `index.html` — configurações de build e deploy
- Credenciais de admin padrão (`admin` / `selfix123`)
- Geração de número de pedido (algoritmo de 4 dígitos, 1000–9999)
- Countdown de 10 segundos na tela de confirmação (mantido)
- Botão "Novo pedido" na confirmação (mantido)

---

## 7. Premissas Assumidas

1. O parâmetro na URL é `?mesa=` seguido de um valor numérico ou alfanumérico curto (ex.: `?mesa=4`, `?mesa=A3`). Qualquer valor será aceito e exibido como está — sem validação de formato.
2. O app continua sendo uma SPA hospedada no GitHub Pages com roteamento via HashRouter. O parâmetro `?mesa=` aparece antes do `#` na URL (ex.: `https://dominio.github.io/SELFIX/?mesa=4#/menu`). A leitura é feita via `window.location.search`, não via `useSearchParams` do React Router, pois este último lê apenas os parâmetros dentro do hash.
3. O número da mesa é um dado de sessão: dura até o app ser fechado ou recarregado. Não é persistido no localStorage.
4. Se o cliente recarregar a página no meio do pedido, o parâmetro `?mesa=` ainda estará na URL (pois a URL não muda), então a mesa será recuperada corretamente.
5. A responsabilidade de gerar e imprimir o QR Code com a URL correta para cada mesa é do operador do estabelecimento, fora do escopo deste sistema.
6. A tela de boas-vindas continua acessível sem parâmetro (para testes e modo totem legado).
7. Não há integração com backend, impressora de comanda ou qualquer sistema externo — o comportamento do app continua inteiramente local e offline-first.

---

## 8. Riscos Identificados

**Risco 1 — Parâmetro ausente ou malformado.**  
Se o QR Code for gerado com URL errada (ex.: `?mesa=` sem valor, ou sem o parâmetro), o app abrirá na tela de boas-vindas normalmente. Não há quebra, apenas ausência do comportamento esperado.

**Risco 2 — HashRouter e posição do parâmetro na URL.**  
O HashRouter do React Router usa fragmentos (`#/rota`). Se o QR Code for gerado com o parâmetro depois do hash (ex.: `.../#/menu?mesa=4`), a leitura via `window.location.search` não funcionará. A leitura deve usar `window.location.hash` ou `useSearchParams` nesse caso. A premissa 2 define o formato correto, mas o gerador de QR Code deve seguir essa convenção.

**Risco 3 — Cache do app no navegador do cliente.**  
Em dispositivos que já acessaram o app anteriormente, o Service Worker ou cache do navegador pode servir uma versão antiga. Não é um risco desta mudança especificamente, mas vale monitorar após deploy.

**Risco 4 — Exibição em dispositivos sem suporte a parâmetros de URL.**  
Improvável com smartphones modernos, mas QR Codes escaneados por apps de câmera muito antigos podem truncar a URL. Sem impacto no app: o comportamento fallback é a tela de boas-vindas.

---

## 9. Critérios de Aceitação

Cada critério descreve um cenário completo com entrada, ação e resultado esperado.

---

### Cenário 1 — Acesso via QR Code da mesa (fluxo principal)

**Entrada:** Cliente escaneia QR Code que aponta para `https://.../?mesa=4`  
**Ação:** App carrega no navegador do celular  
**Resultado esperado:** A tela de boas-vindas ("Toque para começar") nunca aparece. O app abre diretamente no cardápio com a etiqueta "Mesa 4" visível no topo. O cliente pode navegar pelo cardápio imediatamente.

---

### Cenário 2 — Número da mesa no topo do cardápio

**Entrada:** App foi aberto com `?mesa=7`  
**Ação:** Cliente está na tela do cardápio  
**Resultado esperado:** O texto "Mesa 7" está visível no topo da tela do cardápio. O layout do cardápio (grid de produtos, barra de categorias, botão do carrinho) não sofre nenhuma alteração de posição ou comportamento.

---

### Cenário 3 — Número da mesa na confirmação do pedido

**Entrada:** App foi aberto com `?mesa=7`. Cliente adicionou itens, escolheu pagamento e confirmou o pedido  
**Ação:** Tela de confirmação é exibida. Suponha que o número de pedido gerado foi 3842  
**Resultado esperado:** A mensagem exibida é "Pedido enviado para a cozinha! ✅ Mesa 7 — Pedido #3842". O countdown de 10 segundos e o botão "Novo pedido" continuam funcionando normalmente.

---

### Cenário 4 — Acesso sem parâmetro de mesa (modo legado / totem)

**Entrada:** App é acessado via URL sem parâmetro: `https://...` ou `https://.../#/`  
**Ação:** App carrega  
**Resultado esperado:** A tela de boas-vindas com o botão "Toque para começar" é exibida normalmente. Nenhuma etiqueta de mesa aparece em nenhuma tela. A mensagem de confirmação permanece "Aguarde ser chamado no balcão" sem menção à mesa.

---

### Cenário 5 — Parâmetro mesa presente mas sem valor

**Entrada:** URL acessada é `https://.../?mesa=` (parâmetro vazio)  
**Ação:** App carrega  
**Resultado esperado:** O app se comporta como se não houvesse parâmetro de mesa — exibe a tela de boas-vindas. Nenhuma etiqueta de mesa aparece. Nenhum erro é exibido ao usuário.

---

### Cenário 6 — Número da mesa não aparece no painel admin

**Entrada:** Operador acessa `/#/admin` enquanto o app foi aberto com `?mesa=4`  
**Ação:** Operador navega pelas abas de configurações e produtos  
**Resultado esperado:** O painel admin não exibe nem menciona o número da mesa em nenhuma parte da interface. A mesa é informação do cliente, não da operação.

---

### Cenário 7 — Múltiplas mesas no mesmo dispositivo (troca de sessão)

**Entrada:** Um dispositivo de teste acessa `?mesa=2`, faz um pedido, retorna à tela inicial, depois acessa `?mesa=5` em uma nova aba ou após recarregar com nova URL  
**Ação:** App carrega com nova URL  
**Resultado esperado:** O app exibe "Mesa 5" corretamente na nova sessão. Não há contaminação entre as sessões de mesa (o tableNumber da sessão anterior não persiste).

---

### Cenário 8 — Comportamento do carrinho com mesa ativa

**Entrada:** App foi aberto com `?mesa=3`. Cliente adiciona produtos ao carrinho  
**Ação:** Cliente abre o CartDrawer  
**Resultado esperado:** O CartDrawer se comporta exatamente como hoje: lista de itens, controles de quantidade, campo de nome (opcional), botão "Finalizar Pedido". Nenhuma referência à mesa aparece dentro do drawer.

---

### Cenário 9 — Fluxo de pagamento com mesa ativa

**Entrada:** App foi aberto com `?mesa=3`. Cliente escolhe pagamento PIX  
**Ação:** Tela de pagamento é exibida  
**Resultado esperado:** A tela de pagamento é exibida sem alteração. O QR Code de PIX funciona normalmente. O número da mesa não aparece na tela de pagamento.

---

*Este documento deve ser aprovado antes de qualquer implementação.*
