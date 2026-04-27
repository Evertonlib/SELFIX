# SPEC — Simplificar Fluxo de Pagamento

**Baseado em:** PRD_SIMPLIFICAR_PAGAMENTO.md  
**Data:** 2026-04-26  
**Status:** Aguardando aprovação  

---

## Resumo das Mudanças

Três arquivos são alterados. Nenhum outro arquivo é tocado.

| Arquivo | Natureza da mudança |
|---|---|
| `src/pages/Payment.jsx` | Reescrita do conteúdo principal — remoção do fluxo em dois estágios, remoção do estado `method`, layout novo com três opções diretas |
| `src/pages/Confirmation.jsx` | Troca de um único elemento de texto |
| `src/pages/Admin.jsx` | Remoção de uma seção inteira (`<section>` "Configuração PIX") |

---

## 1. `src/pages/Payment.jsx`

### Estado atual do código

- `useState(null)` controla a variável `method` (valores possíveis: `null`, `'pix'`, `'card'`).
- O componente tem três renderizações condicionais:
  - `!method` → tela de seleção com dois botões (PIX e Cartão) em `grid-cols-2`
  - `method === 'pix'` → tela intermediária com QR Code, chave PIX, valor e botão "Confirmar Pagamento"
  - `method === 'card'` → tela intermediária com texto orientando ir ao caixa e botão "Confirmar Pedido"
- A função `handleConfirm()` chama `generateOrder()` e navega para `/confirmation`.
- A variável `pixQrSrc` constrói a URL do QR Code a partir de `config.pixQrUrl` ou `config.pixKey`.
- O botão Voltar da header usa `method` para decidir entre voltar para a seleção (`setMethod(null)`) ou voltar para `/menu`.
- `useStore` é importado exclusivamente para ler `config.pixKey`, `config.pixQrUrl` e `config.primaryColor` (este último só aparece na tela intermediária de PIX).

### O que remover

- O `import { useState }` (será o único `useState` no arquivo; `useEffect` vem de importação separada — ajustar o import para `import { useEffect } from 'react'`).
- A variável de estado `const [method, setMethod] = useState(null)`.
- A variável `pixQrSrc` e toda lógica de QR Code.
- A função `handleConfirm`.
- O import de `useStore` e a desestruturação `const { config } = useStore()` — `config` não será mais usado.
- O bloco condicional `{method === 'pix' && (…)}` inteiro.
- O bloco condicional `{method === 'card' && (…)}` inteiro.
- A lógica condicional do botão Voltar (`method ? setMethod(null) : navigate('/menu')`).

### O que adicionar / alterar

**Três botões de seleção direta** no lugar do `grid-cols-2` atual.

Cada botão:
- `onClick`: chama `generateOrder()` e navega imediatamente para `/confirmation` (comportamento que hoje está em `handleConfirm`, agora inline em cada botão).
- Não altera nenhum estado local — não há mais `method`.

As três opções, na ordem de exibição:

| Label exibido | Emoji | Observação |
|---|---|---|
| PIX | 📱 | Renomear apenas o label; remover subtexto "Instantâneo" |
| Débito | 💳 | Opção nova |
| Crédito | 💳 | Substitui o botão Cartão inteiro — o subtexto "No caixa" desaparece como consequência, não como passo cirúrgico |

**Layout dos três botões:** Débito e Crédito exibidos na linha superior em `grid-cols-2`. PIX exibido na linha inferior ocupando a largura total. O `minHeight` de `180px` é mantido — não há necessidade de redução com este layout.

**Botão Voltar da header:** sempre `onClick={() => navigate('/menu')}` — sem condicional de `method`.

**Bloco do total do pedido** (card cinza com "Total do pedido" + valor formatado): permanece inalterado acima dos botões.

**Cabeçalho "Como deseja pagar?"**: permanece inalterado.

### Imports finais esperados em Payment.jsx

```
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
```

`useStore` é removido.

---

## 2. `src/pages/Confirmation.jsx`

### Estado atual do código

A mensagem de instrução ao cliente (linhas 69–73) é condicional:

```
{tableNumber
  ? `Pedido enviado para a cozinha! ✅ Mesa ${tableNumber} — Pedido #${orderNumber}`
  : 'Aguarde ser chamado no balcão'}
```

### O que alterar

Substituir o conteúdo da `<p>` acima por texto fixo e incondicional:

> Seu pedido foi registrado. Apresente o número da mesa ao atendente para efetuar o pagamento.

O elemento `<p>` mantém exatamente as mesmas classes CSS (`text-gray-300 text-xl font-medium mb-2`).

### O que não tocar

- A lógica do `useEffect` (guarda de `orderNumber`, intervalo de countdown, `clearCart()`, redirecionamento condicional para `/menu` ou `/`).
- O círculo com ✓ e `config.primaryColor`.
- O número do pedido em destaque e suas classes.
- A saudação com `customerName`.
- A linha de countdown ("Voltando à tela inicial em {countdown}s…").
- O botão "Novo pedido".

**Nenhuma importação muda.**

---

## 3. `src/pages/Admin.jsx`

### Estado atual do código

A função `SettingsTab` contém três `<section>`. A segunda seção (linhas 168–211) é intitulada **"Configuração PIX"** e contém:

- Campo de texto `pixKey` (label "Chave PIX")
- Campo de texto `pixQrUrl` (label "URL do QR Code PIX", marcado como opcional)
- Bloco de pré-visualização do QR Code (renderizado condicionalmente quando `form.pixKey` está preenchido)

### O que remover

A `<section>` "Configuração PIX" inteira, incluindo o bloco de pré-visualização. Nenhum outro elemento da tela é alterado.

### O que não tocar

- A função `handleSave` e `updateConfig(form)` — continuarão salvando o objeto `form` completo. Como `form` é inicializado com `{ ...config }`, os valores de `pixKey` e `pixQrUrl` continuarão presentes no estado local e serão re-persistidos a cada save, mas simplesmente não serão editáveis pelo usuário. Isso é comportamento correto e intencional: a remoção é apenas da UI.
- A seção "Identidade do Estabelecimento".
- A seção "Credenciais de Acesso".
- O botão "Salvar Configurações".

**Nenhuma importação muda.**

---

## Observações — Diferenças entre PRD e Código Real

### OBS-1 — `useStore` pode ser removido completamente de `Payment.jsx`

O PRD diz para remover as referências a `config.pixKey` e `config.pixQrUrl`. No código, `config` também fornece `config.primaryColor`, usado exclusivamente nas telas intermediárias de PIX e Cartão — que serão removidas. Consequência: `useStore` deixa de ter qualquer uso em `Payment.jsx` e deve ser removido do arquivo.

O PRD não menciona explicitamente a remoção do import, mas é o que o código exige.

### OBS-2 — Botão Voltar muda de comportamento, não apenas de aparência

O PRD não menciona o botão Voltar da header de `Payment.jsx`. No código, esse botão tem lógica bifurcada: volta para a tela de seleção se um método já foi escolhido, ou volta para `/menu` se ainda está na seleção.

Com a remoção do estado `method` e das telas intermediárias, o botão Voltar passa a ter um único comportamento possível: sempre `navigate('/menu')`. Isso é uma mudança de comportamento decorrente da simplificação, não descrita no PRD.

### OBS-3 — Layout de três colunas não está especificado no PRD

O PRD não especifica como os três botões devem ser dispostos. O layout proposto neste Spec (`grid-cols-3`) é uma decisão de implementação. O `minHeight` atual de `180px` precisa ser reduzido (proposta: `140px`) para que três colunas caibam confortavelmente em telas de 375px sem texto cortado.

### OBS-4 — Mensagem de confirmação é sempre sobre "número da mesa"

O PRD substitui a mensagem condicional (`tableNumber ? ... : ...`) por texto fixo que menciona "número da mesa". No código atual, quando não há `tableNumber`, a mensagem é "Aguarde ser chamado no balcão" — texto mais adequado para o modo sem mesa.

O PRD reconhece isso como Risco 1 e aceita. O Spec segue o PRD: texto fixo incondicional. Esta é uma decisão consciente e aceita para o escopo de demonstração comercial, onde o uso sem mesa é improvável. Registrado para revisão futura caso o modo sem mesa ganhe relevância.

### OBS-5 — `pixKey` e `pixQrUrl` permanecem no `config` em localStorage

O PRD não pede alterações em `StoreContext.jsx`. Os campos `pixKey` e `pixQrUrl` continuarão existindo no objeto `config` persistido em localStorage. Eles se tornam dados mortos — não lidos por nenhum componente após esta melhoria. Isso é aceitável; uma limpeza futura desses campos no `StoreContext` está fora do escopo.

---

## Critérios de Aceitação → Mapeamento para o Código

| Cenário PRD | O que verifica no código |
|---|---|
| 1 — Três opções visíveis | `Payment.jsx` renderiza exatamente três botões; ausência de QR Code e subtexto "Instantâneo" |
| 2 — Nomenclatura correta | Labels dos botões são "PIX", "Débito", "Crédito"; string "Cartão" não aparece |
| 3, 4, 5 — Seleção leva direto à confirmação | `onClick` de cada botão chama `generateOrder()` + `navigate('/confirmation')` sem alterar estado intermediário |
| 6 — Mensagem de confirmação | `Confirmation.jsx` exibe o texto fixo especificado |
| 7 — Número do pedido e countdown intactos | Nenhum elemento de `Confirmation.jsx` além da mensagem é alterado |
| 8 — Carrinho vazio redireciona | `useEffect` com `if (items.length === 0) navigate('/')` permanece em `Payment.jsx` |
| 9 — Nome obrigatório | Verificado em `CartDrawer.jsx`, arquivo intocado |
| 10 — Confirmação sem pedido redireciona | `useEffect` com `if (!orderNumber) navigate('/')` permanece em `Confirmation.jsx` |
| Botão Voltar | Sempre navega para `/menu` após a mudança. Verificar ausência de lógica condicional baseada em `method`. |

---

*Aguardando aprovação antes de qualquer implementação.*
