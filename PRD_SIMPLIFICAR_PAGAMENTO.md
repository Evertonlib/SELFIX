# PRD — Simplificar Fluxo de Pagamento

**Projeto:** SELFIX — Sistema de Pedidos Digital  
**Data:** 2026-04-26  
**Status:** Aguardando aprovação

---

## Objetivo da Melhoria

Transformar a tela de pagamento em um registro de intenção de pagamento — sem processar nenhuma cobrança real. O cliente escolhe a forma que vai pagar (PIX, Débito ou Crédito) e é levado direto para a tela de confirmação do pedido, onde é orientado a informar o número da mesa ao atendente. O pagamento acontece presencialmente, mediado pelo atendente, e não pelo aplicativo.

A mudança principal está na remoção de toda a lógica de exibição de QR Code PIX e de telas intermediárias. O aplicativo passa a ser apenas um organizador de pedidos, sem qualquer responsabilidade sobre a transação financeira.

---

## Relação com os Componentes Existentes

O projeto já possui uma tela de confirmação (`Confirmation.jsx`) que exibe o número do pedido, o nome do cliente e um contador regressivo de 10 segundos. Ela foi projetada para ser o ponto final do fluxo — e continuará sendo. A única alteração nela é textual: a mensagem de instrução ao cliente.

A tela de pagamento (`Payment.jsx`) hoje tem dois modos de exibição: um para PIX (com QR Code e chave) e outro para Cartão (com texto orientando o cliente a ir ao caixa). Ambos os modos exigem que o cliente toque em um botão de confirmação depois de ver os detalhes. Esse comportamento intermediário será eliminado por completo.

Os demais componentes — cardápio, carrinho, campo de nome, contexto do carrinho e contexto da loja — não possuem nenhuma relação com a mudança e permanecem intocados.

---

## Arquivos Afetados

| Arquivo | Tipo de Mudança |
|---|---|
| `src/pages/Payment.jsx` | Alteração significativa — novo layout e novo comportamento |
| `src/pages/Confirmation.jsx` | Alteração pontual — somente o texto da mensagem exibida |
| `src/pages/Admin.jsx` | Alteração pontual — remoção dos campos pixKey e pixQrUrl da interface do painel administrativo |

---

## O Que Será Adicionado

**Em `Payment.jsx`:**
- Terceira opção de pagamento: Débito, ao lado de PIX e Crédito
- Comportamento de seleção direta: ao tocar em qualquer uma das três opções, o pedido é gerado e o cliente é levado imediatamente à tela de confirmação, sem nenhuma tela intermediária

**Em `Confirmation.jsx`:**
- Mensagem de instrução ao cliente: "Seu pedido foi registrado. Apresente o número da mesa ao atendente para efetuar o pagamento."

---

## O Que Será Removido

**De `Payment.jsx`:**
- Exibição do QR Code PIX (gerado dinamicamente ou configurado via Admin)
- Exibição da chave PIX (`pixKey`)
- Subtexto "Instantâneo" associado ao método PIX
- Toda a lógica de dois estágios: selecionar método → ver detalhes → confirmar
- O botão "Confirmar Pagamento" que existia após a exibição dos detalhes
- Referências às variáveis `config.pixKey` e `config.pixQrUrl` dentro do componente de pagamento

**De `Admin.jsx`:**
- Os campos `pixKey` e `pixQrUrl` devem ser removidos da interface visível do painel administrativo — não apenas desativados ou ocultados, mas eliminados da tela

---

## O Que Não Será Tocado

Os itens abaixo não devem ser modificados em hipótese alguma:

- `src/pages/Welcome.jsx` — Tela inicial
- `src/pages/Menu.jsx` — Cardápio e botão flutuante do carrinho
- `src/components/CartDrawer.jsx` — Gaveta de revisão do carrinho e campo de nome
- `src/components/ProductCard.jsx` — Card de produto
- `src/components/CategoryBar.jsx` — Barra de categorias
- `src/context/CartContext.jsx` — Lógica do carrinho, geração de número de pedido
- `src/context/StoreContext.jsx` — Configurações da loja, modo mesa, persistência
- `src/App.jsx` — Rotas, providers, estrutura da aplicação
- `src/data/seed.js` — Dados de demonstração
- Arquivos de configuração: `vite.config.js`, `tailwind.config.js`, `package.json`
- Lógica de redirecionamento do contador regressivo em `Confirmation.jsx` — o comportamento de redirecionar para o menu quando há mesa, ou para a tela inicial quando não há mesa, não deve ser alterado

---

## Premissas Assumidas

1. **Sem pagamento real:** O aplicativo não se conecta a nenhum gateway de pagamento agora nem após esta melhoria. A escolha do método é apenas informativa para o atendente.

2. **A tela de confirmação já é suficiente:** A estrutura atual de `Confirmation.jsx` — número do pedido em destaque, nome do cliente e contador regressivo — é adequada. Apenas o texto da mensagem precisa mudar.

3. **"Crédito" substitui "Cartão":** O método anteriormente chamado de "Cartão" passa a se chamar "Crédito" para consistência com os termos usados em terminais de pagamento.

4. **O fluxo sem mesa continua funcionando:** Mesmo sem o parâmetro `?mesa=` na URL, as três opções de pagamento devem funcionar e levar à confirmação. A mensagem sobre "número da mesa" faz sentido principalmente no contexto de uso com mesa, mas não quebra o fluxo sem mesa.

5. **Geração do número de pedido:** A função `generateOrder()` do `CartContext` já existe e já é chamada antes de navegar para `/confirmation`. Esse comportamento é mantido — só muda o momento em que é chamado (ao tocar na opção, não ao tocar em "confirmar").

---

## Riscos Identificados

**Risco 1 — Mensagem sobre "número da mesa" em modo sem mesa**  
A mensagem instruindo o cliente a "apresentar o número da mesa" não faz sentido quando o aplicativo está sendo usado sem o modo mesa (sem `?mesa=` na URL). O risco é baixo porque o Modo Mesa é o uso principal do sistema, mas existe.

**Risco 2 — Geração duplicada de número de pedido**  
Se o cliente tocar rapidamente em duas opções diferentes antes da navegação acontecer, `generateOrder()` pode ser chamado mais de uma vez. O número exibido seria o do segundo toque. Esse risco é mitigado pelo fato de que a navegação para `/confirmation` acontece imediatamente após o primeiro toque.

---

## Critérios de Aceitação

Cada critério descreve um cenário com entrada e resultado esperado.

---

### Cenário 1 — Três opções visíveis na tela de pagamento

**Entrada:** O cliente finalizou o carrinho, informou o nome e chegou à tela de pagamento.  
**Resultado esperado:** A tela exibe exatamente três opções: PIX, Débito e Crédito. Nenhuma outra opção aparece. Nenhum QR Code é exibido. Nenhum subtexto "Instantâneo" é exibido.

---

### Cenário 2 — Nomenclatura correta das opções de pagamento

**Entrada:** O cliente chegou à tela de pagamento.  
**Resultado esperado:** As três opções exibidas são nomeadas exatamente como PIX, Débito e Crédito. O termo "Cartão" não aparece em nenhum lugar da tela de pagamento.

---

### Cenário 3 — PIX leva direto à confirmação

**Entrada:** O cliente está na tela de pagamento e toca em "PIX".  
**Resultado esperado:** Nenhuma tela intermediária é exibida. O cliente é levado imediatamente para a tela de confirmação com o número do pedido gerado.

---

### Cenário 4 — Débito leva direto à confirmação

**Entrada:** O cliente está na tela de pagamento e toca em "Débito".  
**Resultado esperado:** O cliente é levado imediatamente para a tela de confirmação com o número do pedido gerado. Comportamento idêntico ao cenário de PIX.

---

### Cenário 5 — Crédito leva direto à confirmação

**Entrada:** O cliente está na tela de pagamento e toca em "Crédito".  
**Resultado esperado:** O cliente é levado imediatamente para a tela de confirmação com o número do pedido gerado. Comportamento idêntico ao cenário de PIX.

---

### Cenário 6 — Mensagem correta na tela de confirmação

**Entrada:** O cliente chegou à tela de confirmação após escolher qualquer método de pagamento.  
**Resultado esperado:** A tela exibe a mensagem: "Seu pedido foi registrado. Apresente o número da mesa ao atendente para efetuar o pagamento." O número do pedido e o nome do cliente continuam visíveis.

---

### Cenário 7 — Número do pedido e countdown não foram afetados

**Entrada:** O cliente chegou à tela de confirmação.  
**Resultado esperado:** O número do pedido (4 dígitos) é exibido em destaque. O contador regressivo de 10 segundos funciona normalmente e retorna para a tela correta ao zerar (menu se houver mesa, welcome se não houver).

---

### Cenário 8 — Carrinho vazio na tela de pagamento (cenário de erro)

**Entrada:** O cliente tenta acessar diretamente a URL `/#/payment` com o carrinho vazio (sem itens).  
**Resultado esperado:** O sistema redireciona automaticamente para a tela inicial (`/`), sem exibir a tela de pagamento. Esse comportamento já existe e deve ser preservado.

---

### Cenário 9 — Sem nome informado (cenário de erro — prevenção antes do pagamento)

**Entrada:** O cliente tenta finalizar o pedido no carrinho sem preencher o campo de nome.  
**Resultado esperado:** O sistema exibe uma mensagem de erro no campo de nome e não permite avançar para a tela de pagamento. Esse comportamento já existe no `CartDrawer.jsx` e não deve ser afetado pela melhoria.

---

### Cenário 10 — Confirmação sem número de pedido (cenário de erro)

**Entrada:** O cliente tenta acessar diretamente a URL `/#/confirmation` sem ter passado pelo fluxo de pagamento (sem `orderNumber` gerado).  
**Resultado esperado:** O sistema redireciona automaticamente para a tela inicial (`/`), sem exibir a tela de confirmação. Esse comportamento já existe e deve ser preservado.

---

*Este documento deve ser aprovado antes de qualquer implementação.*
