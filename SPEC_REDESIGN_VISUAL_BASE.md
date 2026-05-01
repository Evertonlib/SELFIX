# SPEC - Redesign visual base Selfix

**Projeto:** SELFIX  
**Data:** 2026-05-01  
**Status:** Aguardando aprovação  
**PRD de referência:** PRD_REDESIGN_VISUAL_BASE.md  

---

## 0. Observações de divergência entre PRD e código real

As seções seguintes descrevem o que o código realmente faz nos pontos em que a descrição do PRD difere ou precisa de precisão. Onde há divergência, o código prevalece.

**OBS-01 — Escala `gray` proposta é numericamente idêntica ao Tailwind default**  
Os valores hexadecimais listados no PRD (gray-50: `#f9fafb` … gray-950: `#030712`) são exatamente os valores que o Tailwind 3 já usa para a escala `gray` por padrão. Sobrescrever `gray` em `theme.extend.colors` com esses mesmos valores não altera nenhuma cor no output gerado — apenas fixa a escala explicitamente no projeto, tornando-a independente de versões futuras do Tailwind.  
**Impacto no Spec:** a mudança em `tailwind.config.js` é necessária para controle explícito e para abrir caminho para ajustes futuros, mas não causará diferença visual imediata.

**OBS-02 — `src/index.css` usa os mesmos hex hardcoded nas regras de tema**  
As regras de override de tema claro/escuro em `src/index.css` (ex.: `#root:not(.dark) .bg-gray-950 { background-color: #f9fafb }`) já usam valores hex que coincidem com a escala proposta. Após a implementação, esses valores continuarão corretos e não precisam ser alterados.  
**Impacto no Spec:** nenhuma edição nas regras de tema existentes de `src/index.css`.

**OBS-03 — `CategoryBar.jsx` usa hex inline em vez de classes Tailwind**  
O componente usa `style={{ backgroundColor: '#374151', color: '#9ca3af' }}` (equivalentes a `gray-700` e `gray-400`) para botões inativos. Esses valores são hardcoded e não refletem automaticamente mudanças na escala `gray` do Tailwind. Para esta entrega os valores permanecem os mesmos, portanto não há divergência visual. Registrado como ponto de atenção técnica para eventual refatoração futura fora deste escopo.

**OBS-04 — Barra lateral do Admin já está implementada**  
`Admin.jsx` já contém o drawer de navegação lateral (linhas 388–440) que corresponde à entrega de `SPEC_MENU_LATERAL_ADMIN.md`. Esta implementação não deve ser alterada. A aplicação de `font-display` no Admin se limita a elementos específicos dentro da estrutura existente.

**OBS-05 — Confirmação: `font-sans` ausente no código**  
Nenhum dos arquivos afetados contém a classe `font-sans`. A estratégia de aplicar `font-body` globalmente via `body { font-family: ... }` em `src/index.css` está correta e não exige alterar markup.

**OBS-06 — Confirmação: arquivo de fonte existe**  
`public/fonts/Conthrax-SemiBold.otf` confirmado presente (77.528 bytes). Caminho de referenciamento no `@font-face`: `/fonts/Conthrax-SemiBold.otf`.

**OBS-07 — Admin usa tema claro como padrão**  
As páginas do Admin (`LoginForm`, `SettingsTab`, `ProductsTab` e o wrapper `Admin`) usam majoritariamente classes de tema claro (`bg-white`, `bg-gray-50`, `bg-gray-100`, `text-gray-900`). Elementos marcados para `font-display` no Admin estarão sobre fundos claros. A aplicação de `font-display` não altera cores — apenas família tipográfica.

---

## 1. Escopo confirmado

Esta especificação cobre exatamente o que foi aprovado no PRD:

1. Registrar `@font-face` para Conthrax SemiBold em `src/index.css`.
2. Importar DM Sans via Google Fonts em `index.html`.
3. Expor `fontFamily.display` e `fontFamily.body` em `tailwind.config.js`.
4. Fixar a escala `gray` em `theme.extend.colors` de `tailwind.config.js`.
5. Aplicar `font-body` globalmente no `body` em `src/index.css`.
6. Aplicar a classe `font-display` nos elementos identificados abaixo em cada arquivo de página e componente.

O que está fora do escopo: cores, rotas, estado, handlers, dark/light mode, color picker, `config.primaryColor`, dados locais, `vite.config.js`, `postcss.config.js`, `package.json`.

---

## 2. Arquivos e mudanças

### 2.1 `index.html`

**Mudança:** adicionar `<link>` para Google Fonts com DM Sans no `<head>`, antes do fechamento `</head>`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
  rel="stylesheet"
/>
```

**Local de inserção:** após o `<meta name="apple-mobile-web-app-capable">` e antes do `</head>`.

**Restrição:** não alterar nenhuma outra linha do arquivo.

---

### 2.2 `tailwind.config.js`

**Mudança:** substituir o `theme.extend` vazio por três adições: `fontFamily`, `colors.gray`.

```js
theme: {
  extend: {
    fontFamily: {
      display: ['Conthrax', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      body: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    },
    colors: {
      gray: {
        50:  '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
        950: '#030712',
      },
    },
  },
},
```

**Restrição:** não alterar `darkMode`, `content` nem `plugins`.

---

### 2.3 `src/index.css`

**Mudanças:** duas inserções. O restante do arquivo permanece intocado.

**Inserção 1 — `@font-face` Conthrax:**  
Adicionar em `@layer base`, após as diretivas `@tailwind`:

```css
@layer base {
  @font-face {
    font-family: 'Conthrax';
    src: url('/fonts/Conthrax-SemiBold.otf') format('opentype');
    font-weight: 600;
    font-style: normal;
    font-display: swap;
  }
}
```

**Local de inserção:** após `@tailwind utilities;` e antes de `@layer utilities { .scrollbar-none ... }`.

**Inserção 2 — fonte de corpo global no `body`:**  
Dentro do bloco `body { ... }` existente, adicionar `font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;` como primeira propriedade.

Bloco `body` resultante:

```css
body {
  font-family: 'DM Sans', ui-sans-serif, system-ui, sans-serif;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
  touch-action: manipulation;
}
```

**Restrição:** não remover nem reordenar nenhuma regra existente. Não alterar nenhuma regra de `#root`, `.selfix-theme-toggle` ou qualquer seletor de tema.

---

### 2.4 `src/pages/Welcome.jsx`

**Elemento alvo:** `h1` na linha 45.

Classe atual: `text-white text-5xl font-black tracking-tight leading-tight`  
Classe após mudança: `text-white text-5xl font-black tracking-tight leading-tight font-display`

**Apenas este elemento.** Nenhum outro elemento de `Welcome.jsx` recebe `font-display`.

---

### 2.5 `src/pages/Menu.jsx`

**Elemento alvo:** `h1` na linha 54.

Classe atual: `text-white text-2xl font-bold flex-1`  
Classe após mudança: `text-white text-2xl font-bold flex-1 font-display`

**Apenas este elemento.** Nenhum outro elemento de `Menu.jsx` recebe `font-display`.

---

### 2.6 `src/pages/Payment.jsx`

**Elemento alvo:** `h1` na linha 26.

Classe atual: `text-white text-2xl font-bold`  
Classe após mudança: `text-white text-2xl font-bold font-display`

**Apenas este elemento.** Os rótulos dos botões de pagamento ("Débito", "Crédito", "PIX") não recebem `font-display`.

---

### 2.7 `src/pages/Confirmation.jsx`

**Elemento alvo 1:** `h1` na linha 47.

Classe atual: `text-white text-4xl font-black mb-2`  
Classe após mudança: `text-white text-4xl font-black mb-2 font-display`

**Elemento alvo 2:** label "Número do Pedido" — `p` na linha 58.

Classe atual: `text-gray-500 text-base mb-2 uppercase tracking-widest text-sm font-medium`  
Classe após mudança: `text-gray-500 text-base mb-2 uppercase tracking-widest text-sm font-medium font-display`

**Elemento alvo 3:** número do pedido — `p` na linha 62.

Classe atual: `text-8xl font-black tabular-nums`  
Classe após mudança: `text-8xl font-black tabular-nums font-display`

**Justificativa:** o número do pedido é o elemento de maior destaque da tela (número highlight); o label "Número do Pedido" em uppercase/tracking-widest é uma chamada curta de contexto.

---

### 2.8 `src/pages/Kitchen.jsx`

**Elemento alvo 1:** `h1` na linha 48.

Classe atual: `text-white text-2xl font-bold`  
Classe após mudança: `text-white text-2xl font-bold font-display`

**Elemento alvo 2:** identificador de pedido por card — `span` na linha 60.

Classe atual: `text-white text-xl font-bold`  
Classe após mudança: `text-white text-xl font-bold font-display`

**Apenas estes dois elementos.** Itens do pedido, nome do cliente, status e total permanecem como corpo.

---

### 2.9 `src/pages/Cashier.jsx`

**Elemento alvo 1:** `h1` na linha 161.

Classe atual: `text-white text-2xl font-bold`  
Classe após mudança: `text-white text-2xl font-bold font-display`

**Elemento alvo 2:** label da comanda ativa (Mesa X / Balcão) — `span` na linha 201.

Classe atual: `text-white text-xl font-bold`  
Classe após mudança: `text-white text-xl font-bold font-display`

**Elemento alvo 3:** label da comanda encerrada (Mesa X / Balcão) — `span` na linha 294.

Classe atual: `text-white text-xl font-bold`  
Classe após mudança: `text-white text-xl font-bold font-display`

**Apenas estes elementos.** Itens da comanda, totais, timestamps, métodos de pagamento e textos dos botões permanecem como corpo.

---

### 2.10 `src/pages/Admin.jsx`

Esta é a página mais delicada. Somente classes tipográficas em títulos e headers são alteradas. Estado, handlers, color picker, abas, inputs, upload e drawer de navegação permanecem intocados.

**LoginForm:**

Elemento alvo — `h1` na linha 27.  
Classe atual: `text-2xl font-bold text-gray-900`  
Classe após mudança: `text-2xl font-bold text-gray-900 font-display`

**SettingsTab:**

Elemento alvo 1 — `h2` "Identidade do Estabelecimento" na linha 100.  
Classe atual: `font-bold text-gray-900 text-lg mb-4`  
Classe após mudança: `font-bold text-gray-900 text-lg mb-4 font-display`

Elemento alvo 2 — `h2` "Credenciais de Acesso" na linha 170.  
Classe atual: `font-bold text-gray-900 text-lg mb-4`  
Classe após mudança: `font-bold text-gray-900 text-lg mb-4 font-display`

**Admin (componente principal — header sticky):**

Elemento alvo — `h1` "Painel SELFIX" na linha 456.  
Classe atual: `text-xl font-bold text-gray-900`  
Classe após mudança: `text-xl font-bold text-gray-900 font-display`

**Drawer de navegação lateral:**

Elemento alvo — `span` "Menu" na linha 393.  
Classe atual: `font-bold text-gray-900`  
Classe após mudança: `font-bold text-gray-900 font-display`

**O que NÃO recebe `font-display` em `Admin.jsx`:**
- Abas de navegação ("⚙ Configurações", "🍔 Cardápio") — itens de nav, corpo.
- Itens do drawer de navegação (links para Quiosque, Cozinha, Caixa, Sair) — itens de nav, corpo.
- Labels de input, campos de formulário, botões de ação.
- Nomes de produtos na listagem, categorias, preços.
- Qualquer outro elemento não listado acima.

---

### 2.11 `src/components/CartDrawer.jsx`

**Elemento alvo:** `h2` "Seu Pedido" na linha 38.

Classe atual: `text-white text-2xl font-bold`  
Classe após mudança: `text-white text-2xl font-bold font-display`

**Apenas este elemento.** Nomes de itens, preços, label de nome do cliente e botão "Finalizar Pedido" permanecem como corpo.

---

### 2.12 `src/components/ProductCard.jsx`

**Elemento alvo 1:** `h3` com nome do produto na linha 20.

Classe atual: `text-white text-lg font-bold leading-tight`  
Classe após mudança: `text-white text-lg font-bold leading-tight font-display`

**Elemento alvo 2:** `span` com preço na linha 24.

Classe atual: `text-white text-xl font-bold`  
Classe após mudança: `text-white text-xl font-bold font-display`

**Justificativa:** nome e preço são os elementos de escaneamento visual primário do card. Em `text-lg` e `text-xl` Conthrax permanece legível e reforça a identidade nos cards do cardápio.

---

### 2.13 `src/components/CategoryBar.jsx`

**Nenhuma mudança.** Categorias herdam a fonte de corpo pelo `body`. O uso de inline `style` com hex hardcoded (`'#374151'`, `'#9ca3af'`) está fora do escopo e não deve ser tocado.

---

### 2.14 `src/components/AdminProductForm.jsx`

**Elemento alvo 1:** `h2` "Editar Produto" / "Novo Produto" na linha 51.

Classe atual: `text-xl font-bold text-gray-900`  
Classe após mudança: `text-xl font-bold text-gray-900 font-display`

**O que NÃO recebe `font-display` em `AdminProductForm.jsx`:**
- Labels de campo (`label.text-sm font-medium text-gray-700`) — permanecem como corpo para legibilidade em tamanho pequeno.
- Inputs, textareas, selects, checkboxes.
- Botões "Cancelar", "Salvar Alterações", "Criar Produto".
- Qualquer elemento não listado acima.

**Nota de divergência do PRD:** o PRD descreve "titulos e labels do formulario". Após leitura do código, os `label` de campo são `text-sm` — Conthrax SemiBold em tamanho pequeno pode prejudicar a leitura em contexto de formulário. Esta Spec restringe `font-display` ao `h2` do formulário e exclui os `label` de campo. Se o produto quiser incluir os labels, isso requer aprovação explícita.

---

## 3. Ordem de implementação

A sequência abaixo minimiza riscos e facilita revisão incremental:

1. `tailwind.config.js` — fixar `gray` e expor famílias. Sem mudança visual ainda.
2. `index.html` — importar DM Sans. Fonte de corpo disponível.
3. `src/index.css` — `@font-face` Conthrax + `font-family` no `body`. Toda a aplicação passa a usar DM Sans.
4. `src/pages/Welcome.jsx` — primeiro `font-display` em produção.
5. `src/pages/Menu.jsx`
6. `src/pages/Payment.jsx`
7. `src/pages/Confirmation.jsx`
8. `src/pages/Kitchen.jsx`
9. `src/pages/Cashier.jsx`
10. `src/pages/Admin.jsx`
11. `src/components/CartDrawer.jsx`
12. `src/components/ProductCard.jsx`
13. `src/components/AdminProductForm.jsx`

---

## 4. O que não deve ser tocado

- `src/App.jsx`
- `src/main.jsx`
- `src/theme.js`
- `src/context/CartContext.jsx`
- `src/context/StoreContext.jsx`
- `src/data/seed.js`
- `vite.config.js`
- `postcss.config.js`
- `public/404.html`
- `package.json` e `package-lock.json`
- Qualquer arquivo em `FONTES/`
- `SPEC_MENU_LATERAL_ADMIN.md`
- `dist/`, `node_modules/`, `.git/`
- Regras de tema existentes em `src/index.css` (linhas 56 em diante)
- `config.primaryColor` em qualquer arquivo
- Inline styles com `config.primaryColor` ou `primaryColor` em qualquer página ou componente
- Quaisquer classes `gray` existentes no JSX (a substituição de cor ocorre via alias no Tailwind, não via edição de markup)

---

## 5. Mapeamento de critérios de aceitação

| CA | Verificação |
|---|---|
| CA-01 | Abrir `/` e inspecionar `h1` — deve renderizar em Conthrax |
| CA-02 | Renomear temporariamente `public/fonts/Conthrax-SemiBold.otf` e confirmar que o app não quebra; reverter depois |
| CA-03 | Inspecionar qualquer `p`, `span` ou `label` — `font-family` computada deve iniciar com `DM Sans` |
| CA-04 | Bloquear `fonts.googleapis.com` no DevTools (Network > throttle/block) e confirmar fallback sem erro |
| CA-05 | `grep -r "font-sans"` nos arquivos afetados deve retornar vazio |
| CA-06 | Abrir cada rota e confirmar `font-display` nos elementos listados na seção 2 |
| CA-07 | `git diff src/pages/Admin.jsx` e `src/components/AdminProductForm.jsx` — apenas adições de `font-display` nos elementos mapeados |
| CA-08 | `git diff SPEC_MENU_LATERAL_ADMIN.md` — sem alterações |
| CA-09 | Color picker do Admin continua salvando e aplicando cor; inspecionar estilo inline dos botões nas telas |
| CA-10 | Inspecionar `computed styles` de `bg-gray-950` — deve ser `#030712` |
| CA-11 | `git diff` nas páginas e componentes — nenhuma remoção ou substituição de classe `gray-*` |
| CA-12 | Inspecionar `bg-gray-100` no admin — deve ser `#f3f4f6` |
| CA-13 | Alternar para tema claro e confirmar telas legíveis com contraste adequado |
| CA-14 | Alternar para tema escuro e confirmar telas legíveis |
| CA-15 | Executar `npm run build` — sem erro de Tailwind, Vite ou asset |
| CA-16 | Navegar por todas as rotas listadas — sem quebra de rota |
| CA-17 | `localStorage.getItem('selfix_config')` antes e depois — sem diferença |
| CA-18 | `git diff dist/` — nenhuma edição manual; `node_modules` intocado |
| CA-19 | `git diff FONTES/` — sem alterações |
| CA-20 | `git diff` — nenhuma nova classe de cor fora da escala `gray`; `config.primaryColor` intocado |
