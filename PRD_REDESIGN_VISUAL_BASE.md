# PRD - Redesign visual base Selfix

**Projeto:** SELFIX  
**Data:** 2026-05-01  
**Status:** Aguardando aprovacao  

---

## 1. Objetivo da melhoria

Aplicar a identidade visual base do Selfix ao projeto existente sem redesenhar fluxos, sem alterar regras de negocio e sem renomear classes de cor nas paginas.

A melhoria tem tres frentes:

- registrar a fonte local Conthrax como fonte de destaque;
- registrar DM Sans como fonte principal de corpo;
- substituir a escala `gray` do Tailwind por tons definidos para a identidade Selfix, mantendo as classes atuais como `bg-gray-950`, `text-gray-400` e `border-gray-800`.

Esta entrega deve preparar uma base visual consistente, nao um redesenho completo de telas.

---

## 2. Pesquisa da base de codigo

### 2.1 Estrutura e tecnologias atuais

O projeto e uma SPA em React 18, Vite 5 e TailwindCSS 3.4.10.

Arquivos principais lidos:

- `index.html`
- `vite.config.js`
- `postcss.config.js`
- `tailwind.config.js`
- `package.json`
- `src/main.jsx`
- `src/App.jsx`
- `src/index.css`
- `src/theme.js`
- `src/pages/Welcome.jsx`
- `src/pages/Menu.jsx`
- `src/pages/Payment.jsx`
- `src/pages/Confirmation.jsx`
- `src/pages/Kitchen.jsx`
- `src/pages/Cashier.jsx`
- `src/pages/Admin.jsx`
- `src/components/CartDrawer.jsx`
- `src/components/CategoryBar.jsx`
- `src/components/ProductCard.jsx`
- `src/components/AdminProductForm.jsx`
- `src/components/ThemeToggle.jsx`
- `src/context/CartContext.jsx`
- `src/context/StoreContext.jsx`
- `src/data/seed.js`
- `public/404.html`
- arquivos `PRD_*.md`, `SPEC_*.md`, `README.md` e `FONTES/*.md`
- `FONTES/Logo Selfix.png`, como referencia visual de identidade

`node_modules/`, `dist/` e `.git/` existem no projeto, mas sao dependencia, artefato gerado e metadados. Nao devem ser usados como fonte de verdade para esta melhoria nem alterados manualmente.

### 2.2 Tipografia atual

Hoje nao existe configuracao tipografica customizada.

Constatacoes:

- `tailwind.config.js` possui `theme.extend` vazio.
- Nao existe `fontFamily.display`.
- Nao existe `fontFamily.body`.
- Nao existe `@font-face` em `src/index.css`.
- Nao existe import de Google Fonts em `index.html`.
- Nao existe referencia a Conthrax ou DM Sans no codigo.
- Nao ha uso explicito de `font-sans` nas paginas ou componentes.
- O corpo usa a fonte padrao do Tailwind/Preflight por heranca.

Classes tipograficas usadas hoje:

- pesos: `font-black`, `font-bold`, `font-semibold`, `font-medium`, `font-normal`, `font-mono`;
- tamanhos: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-4xl`, `text-5xl`, `text-6xl`, `text-8xl`;
- outras: `tracking-tight`, `tracking-widest`, `leading-tight`, `leading-snug`, `leading-none`, `tabular-nums`, `uppercase`, `truncate`, `text-center`, `text-right`, `whitespace-nowrap`.

### 2.3 Cores atuais

O projeto usa intensamente a escala `gray` do Tailwind nas telas do cliente e nos paineis operacionais.

Classes `gray` encontradas:

- fundos: `bg-gray-50`, `bg-gray-100`, `bg-gray-200`, `bg-gray-700`, `bg-gray-800`, `bg-gray-900`, `bg-gray-950`;
- textos: `text-gray-300`, `text-gray-400`, `text-gray-500`, `text-gray-600`, `text-gray-700`, `text-gray-800`, `text-gray-900`;
- bordas: `border-gray-100`, `border-gray-200`, `border-gray-300`, `border-gray-700`, `border-gray-800`;
- gradientes: `from-gray-950`, `via-gray-950/80`;
- placeholders: `placeholder-gray-600`.

Outras cores usadas e fora da estrategia de alias `gray`:

- `white` e `black`, incluindo `bg-white`, `text-white`, `bg-black/70` e `bg-black/60`;
- `blue` no painel admin e formularios;
- `green` para estados positivos;
- `red` para erro/remocao;
- `yellow` para aviso;
- `indigo` nos botoes de alternancia do caixa;
- `orange` em hover pontual;
- valores inline derivados de `config.primaryColor`.

### 2.4 Tema claro/escuro atual

O projeto usa `darkMode: 'class'` no Tailwind e aplica a classe `dark` no elemento `#root` por `src/theme.js`.

`src/index.css` tambem possui regras globais que reinterpretam classes Tailwind em modo claro/escuro, por exemplo:

- `#root:not(.dark) .bg-gray-950`
- `#root:not(.dark) .bg-gray-900`
- `#root:not(.dark) .text-gray-400`
- `#root.dark .bg-white`
- `#root.dark .text-gray-900`

Essas regras sao importantes para o comportamento atual do tema e precisam ser consideradas ao trocar a escala `gray`.

### 2.5 Fonte Conthrax

Foi pesquisado o projeto inteiro por arquivos de fonte e por `Conthrax`.

Resultado:

- originalmente nao existia `public/fonts/`;
- originalmente nao existia `public/fonts/Conthrax-SemiBold.otf`;
- apos a revisao deste PRD, o arquivo foi copiado para `public/fonts/Conthrax-SemiBold.otf`.

Portanto, a implementacao futura ja pode registrar Conthrax apontando para `/fonts/Conthrax-SemiBold.otf`.

### 2.6 Cor primaria dinamica do Admin

A cor primaria dinamica vive em `src/context/StoreContext.jsx` como `config.primaryColor`, com valor padrao `#f97316`, e e editada no color picker de `src/pages/Admin.jsx`.

Ela tambem e usada por `Welcome`, `Menu`, `CartDrawer`, `ProductCard`, `CategoryBar`, `Kitchen` e `Confirmation` via `style={{ backgroundColor: config.primaryColor }}` ou propriedades similares.

Essa cor nao deve ser trocada, renomeada, removida, convertida para classe Tailwind nem substituida pela nova escala `gray`.

### 2.7 Logo Selfix em `FONTES/`

Foi adicionado o arquivo `FONTES/Logo Selfix.png`.

A imagem mostra a identidade visual Selfix com:

- fundo preto/escuro;
- simbolo de QR code com monograma `S`;
- branco como cor de alto contraste;
- azul vivo e roxo/violeta em gradiente como acentos de marca;
- lettering geometrico/tecnologico para `SELFIX`;
- tagline `AUTOATENDIMENTO QUE VENDE MAIS`.

Impacto no PRD:

- a logo reforca que a base visual deve permanecer escura, tecnologica e de alto contraste;
- a direcao da fonte Conthrax continua coerente com o lettering geometrico da marca;
- a paleta `gray` proposta continua valida para a base neutra;
- a logo sugere acentos azul/roxo, mas esta entrega nao deve criar uma paleta nova para essas cores, porque o escopo aprovado pede apenas substituir `gray` e preservar a cor primaria dinamica do Admin;
- o arquivo esta em `FONTES/`, que hoje e uma pasta de referencia/documentacao e esta no `.gitignore`; portanto ele nao deve ser tratado como asset publico da aplicacao sem decisao explicita.

---

## 3. Pesquisa de padroes externos

### 3.1 Fonte local via `@font-face` e Tailwind

Para Vite, assets em `public/` sao servidos a partir da raiz do site. Assim, um arquivo em `public/fonts/Conthrax-SemiBold.otf` deve ser referenciado como `/fonts/Conthrax-SemiBold.otf`.

Para Tailwind 3, a forma simples de expor uma fonte customizada e registrar a familia em `theme.extend.fontFamily`, criando utilitarios como `font-display`.

O carregamento real da fonte continua sendo responsabilidade do CSS, via `@font-face`, preferencialmente em `@layer base` dentro do CSS principal.

Referencias:

- Tailwind 3 - Font Family: https://v3.tailwindcss.com/docs/font-family
- Vite - Public Directory: https://vite.dev/guide/assets.html#the-public-directory

### 3.2 Google Fonts via `index.html` e Tailwind

O padrao mais simples e adicionar um `<link rel="stylesheet">` no `head` do `index.html` apontando para a API CSS2 do Google Fonts.

Depois disso, a familia deve ser exposta no Tailwind como `fontFamily.body`, gerando o utilitario `font-body`.

Como o projeto nao usa `font-sans` explicitamente hoje, a forma mais simples e consistente e definir `font-body` globalmente no `body` em `src/index.css`, em vez de espalhar classes por todos os elementos.

Referencia:

- Google Fonts CSS2 API: https://developers.google.com/fonts/docs/css2

### 3.3 Substituir a escala `gray` sem renomear classes

Tailwind 3 permite estender o tema em `theme.extend.colors`. Ao definir `gray` dentro de `extend.colors`, as classes existentes como `bg-gray-900`, `text-gray-400` e `border-gray-800` passam a apontar para os novos valores.

Essa abordagem preserva o markup existente e evita uma troca manual de classes em paginas e componentes.

Referencia:

- Tailwind 3 - Customizing Colors: https://v3.tailwindcss.com/docs/customizing-colors

---

## 4. Relacao com arquivos existentes

### 4.1 Arquivos que devem ser alterados na implementacao futura

| Arquivo | Motivo |
|---|---|
| `index.html` | Importar DM Sans via Google Fonts no `head`. |
| `src/index.css` | Registrar `@font-face` da Conthrax e definir a fonte de corpo global. |
| `tailwind.config.js` | Expor `fontFamily.display`, `fontFamily.body` e sobrescrever `gray` em `theme.extend.colors`. |
| `public/fonts/Conthrax-SemiBold.otf` | Arquivo de fonte local necessario para Conthrax. Ja foi copiado para o caminho esperado. |
| `src/pages/Welcome.jsx` | Aplicar `font-display` nos titulos visiveis. |
| `src/pages/Menu.jsx` | Aplicar `font-display` no titulo/header do cardapio. |
| `src/pages/Payment.jsx` | Aplicar `font-display` no titulo/header e opcoes principais de pagamento, se aprovado. |
| `src/pages/Confirmation.jsx` | Aplicar `font-display` no titulo e numero do pedido, se aprovado. |
| `src/pages/Kitchen.jsx` | Aplicar `font-display` no header e titulos de pedidos. |
| `src/pages/Cashier.jsx` | Aplicar `font-display` no header, labels principais de comanda e totais. |
| `src/pages/Admin.jsx` | Aplicar `font-display` nos titulos e headers do painel admin. |
| `src/components/CartDrawer.jsx` | Aplicar `font-display` no titulo do drawer e textos principais de acao, se aprovado. |
| `src/components/ProductCard.jsx` | Aplicar `font-display` no nome do produto e preco, se aprovado. |
| `src/components\CategoryBar.jsx` | Avaliar se categorias devem herdar corpo ou receber display. Recomendacao: manter como corpo para legibilidade. |
| `src/components/AdminProductForm.jsx` | Aplicar `font-display` nos titulos e labels do formulario de produto do admin. |

### 4.2 Arquivos com escopo protegido

Nao ha mais conflito de escopo entre o requisito visual e `src/pages/Admin.jsx`: o painel admin esta dentro da implementacao futura apenas para aplicacao de `font-display` em titulos e headers.

`src/components/AdminProductForm.jsx` tambem esta dentro da implementacao futura apenas para aplicacao de `font-display` em titulos e labels.

O arquivo `SPEC_MENU_LATERAL_ADMIN.md` permanece protegido: ele documenta outra melhoria e nao deve ser alterado por este redesign visual base.

### 4.3 Arquivos que nao precisam mudar

| Arquivo | Motivo |
|---|---|
| `src/App.jsx` | Rotas e providers nao mudam. |
| `src/main.jsx` | Bootstrap React nao muda. |
| `src/theme.js` | Logica de tema claro/escuro nao muda. |
| `src/context/CartContext.jsx` | Carrinho e pedidos fora do escopo. |
| `src/context/StoreContext.jsx` | Configuracao e cor primaria dinamica fora do escopo. |
| `src/data/seed.js` | Dados demo fora do escopo. |
| `vite.config.js` | Base path e plugin React nao mudam. |
| `postcss.config.js` | Pipeline CSS nao muda. |
| `public/404.html` | Fallback de deploy fora do escopo. |
| `README.md`, `PRD_*.md`, `SPEC_*.md`, `FONTES/*.md` | Documentacao historica/operacional fora da implementacao visual, salvo se voce pedir uma atualizacao documental depois. |
| `FONTES/Logo Selfix.png` | Referencia visual de marca. Nao deve ser consumido diretamente pela aplicacao enquanto estiver em `FONTES/`. |

---

## 5. O que sera adicionado

- Pasta `public/fonts/`, ja criada.
- Arquivo `public/fonts/Conthrax-SemiBold.otf`, ja copiado.
- Registro `@font-face` para Conthrax em `src/index.css`.
- Familia `display` no Tailwind apontando para Conthrax com fallbacks.
- Import de DM Sans no `index.html`.
- Familia `body` no Tailwind apontando para DM Sans com fallbacks.
- Aplicacao global da fonte de corpo no `body`.
- Classe `font-display` em titulos e headers das telas/componentes, incluindo o painel admin.
- Escala `gray` customizada em `theme.extend.colors`.

Nao sera adicionado uso da imagem `FONTES/Logo Selfix.png` na interface nesta entrega. Se a logo precisar aparecer no app, deve haver uma decisao separada para copiar ou exportar um asset apropriado para `public/` e definir onde ele sera usado.

Escala `gray` prevista:

| Classe | Cor |
|---|---|
| `gray-950` | `#030712` |
| `gray-900` | `#111827` |
| `gray-800` | `#1f2937` |
| `gray-700` | `#374151` |
| `gray-600` | `#4b5563` |
| `gray-500` | `#6b7280` |
| `gray-400` | `#9ca3af` |
| `gray-300` | `#d1d5db` |
| `gray-200` | `#e5e7eb` |
| `gray-100` | `#f3f4f6` |
| `gray-50` | `#f9fafb` |

Observacao: o projeto tambem usa `gray-100` e `gray-200`, por isso esses tons foram incluidos na escala para manter consistencia no admin e nas regras globais de tema.

---

## 6. O que sera removido

Nenhum arquivo sera removido.

Nao deve ser removida nenhuma classe de cor nas paginas apenas para adaptar a nova paleta.

Nao deve ser removida a cor primaria dinamica (`config.primaryColor`).

Nao deve ser removido o tema claro/escuro existente.

---

## 7. O que nao sera tocado

Nao alterar em hipotese alguma nesta entrega:

- `SPEC_MENU_LATERAL_ADMIN.md`;
- color picker do Admin;
- `config.primaryColor`;
- logica de `StoreContext`;
- logica de `CartContext`;
- pedidos em `selfix_orders`;
- produtos em `selfix_products`;
- configuracoes em `selfix_config`;
- rotas em `src/App.jsx`;
- tema em `src/theme.js`;
- build config em `vite.config.js`;
- dependencias em `package.json` e `package-lock.json`, salvo se uma aprovacao futura pedir explicitamente;
- `dist/`;
- `node_modules/`;
- `.git/`;
- arquivos em `FONTES/`.

Tambem nao alterar paginas ou componentes apenas para trocar classes de cor. A estrategia de cor e via alias `gray` no Tailwind.

---

## 8. Premissas assumidas

1. O projeto continuara em TailwindCSS 3, nao TailwindCSS 4.
2. A fonte Conthrax deve ser local e carregada a partir de `public/fonts/Conthrax-SemiBold.otf`.
3. O arquivo Conthrax ja esta no projeto em `public/fonts/Conthrax-SemiBold.otf`.
4. DM Sans sera carregada por Google Fonts no `index.html`.
5. Como nao ha `font-sans` explicito hoje, aplicar `font-body` globalmente no `body` e mais simples do que alterar cada elemento de texto.
6. `font-display` deve ser aplicado em titulos e headers das paginas/componentes afetados, incluindo o painel admin.
7. `Admin.jsx` pode ser alterado somente para aplicar `font-display` em titulos e headers; regras, estado, navegacao, color picker e estrutura funcional permanecem fora de mudanca.
8. `AdminProductForm.jsx` pode ser alterado somente para aplicar `font-display` em titulos e labels; comportamento do formulario permanece fora de mudanca.
9. A escala `gray` sera sobrescrita sem renomear classes existentes.
10. Os tons `gray-100` e `gray-200`, usados hoje no admin e no CSS global, entram na paleta Selfix para evitar lacunas visuais.
11. `FONTES/Logo Selfix.png` e uma referencia visual de marca, nao um asset publico pronto para consumo pelo Vite.
12. A presenca de azul/roxo na logo nao autoriza alterar `config.primaryColor` nem criar novas classes de cor nesta entrega.

---

## 9. Riscos identificados

| Risco | Probabilidade | Impacto | Mitigacao |
|---|---|---|---|
| Arquivo Conthrax ausente ou removido acidentalmente | Baixa | Alto | Manter `public/fonts/Conthrax-SemiBold.otf` no projeto. Se ausente, build deve continuar com fallback, mas identidade visual fica incompleta. |
| Alterar comportamento do admin por engano ao aplicar `font-display` | Media | Alto | Limitar `Admin.jsx` a classes de tipografia em titulos/headers, sem mexer em estado, handlers, color picker ou regras de negocio. |
| Alterar comportamento do formulario de produto por engano | Media | Alto | Limitar `AdminProductForm.jsx` a classes de tipografia em titulos/labels, sem mexer em inputs, validacao, upload ou callbacks. |
| Aplicar Conthrax em textos longos do admin | Media | Medio | Restringir `font-display` a titulos, headers e labels definidos no escopo; manter textos longos em DM Sans. |
| Regras globais de tema em `src/index.css` conflitarem com a nova escala `gray` | Media | Medio | Testar modo claro e escuro depois da implementacao. Nao remover regras existentes sem aprovacao. |
| Conthrax prejudicar legibilidade em textos longos | Media | Medio | Usar Conthrax somente em titulos, headers, numeros de destaque e chamadas curtas. |
| Google Fonts falhar offline ou ser bloqueado | Baixa/Media | Medio | Definir fallbacks no Tailwind para `fontFamily.body`. |
| Caminho da fonte quebrar no GitHub Pages com `base: '/SELFIX/'` | Baixa | Medio | Usar asset em `public/` conforme regra do Vite e validar build/preview. |
| Mudanca de `gray` afetar contraste do admin | Media | Medio | Isso e esperado pela estrategia de alias global. Validar contraste do admin apos implementacao. |
| Modificacao acidental da cor primaria dinamica | Baixa | Alto | Nao tocar em `config.primaryColor`, inputs de color picker nem styles inline que usam essa cor. |
| Confundir `FONTES/Logo Selfix.png` com asset de runtime | Media | Medio | Manter a logo como referencia. So copiar para `public/` se houver requisito explicito para exibir a logo no app. |
| Tentar adaptar a paleta para azul/roxo fora do escopo | Media | Medio | Registrar que a logo informa direcao visual, mas a entrega tecnica continua limitada a fontes e escala `gray`. |

---

## 10. Criterios de aceitacao

Cada criterio descreve entrada e resultado esperado.

### CA-01 - Conthrax local carregada com arquivo presente

**Entrada:** O arquivo `public/fonts/Conthrax-SemiBold.otf` existe e a aplicacao e aberta em uma rota com titulo ou header previsto no escopo.

**Resultado esperado:** Titulos e headers definidos para identidade Selfix usam a familia de destaque Conthrax via classe `font-display`, com fallback caso a fonte ainda esteja carregando.

### CA-02 - Conthrax ausente nao quebra a aplicacao

**Entrada:** O arquivo `public/fonts/Conthrax-SemiBold.otf` nao existe, mas a aplicacao e executada.

**Resultado esperado:** A tela nao fica branca, nao ha erro de JavaScript e os textos usam a pilha de fallback. A identidade visual fica incompleta, mas o app continua utilizavel.

### CA-03 - DM Sans e aplicada como fonte de corpo

**Entrada:** A aplicacao e aberta com acesso normal a internet.

**Resultado esperado:** Textos de corpo, labels, paragrafos, botoes e conteudos gerais herdam DM Sans pela configuracao global de corpo.

### CA-04 - Falha do Google Fonts tem fallback

**Entrada:** A rede bloqueia ou falha ao carregar Google Fonts.

**Resultado esperado:** A aplicacao continua legivel usando a pilha de fallback definida para `font-body`, sem tela branca e sem erro funcional.

### CA-05 - `font-sans` nao precisa ser substituido

**Entrada:** A base de codigo atual e pesquisada por `font-sans`.

**Resultado esperado:** Como nao existem usos explicitos de `font-sans`, a implementacao usa a fonte de corpo global no `body`, sem espalhar classes desnecessarias.

### CA-06 - `font-display` aparece nos titulos e headers principais

**Entrada:** O usuario abre `/`, `/menu`, `/payment`, `/confirmation`, `/cozinha`, `/caixa` e `/admin`.

**Resultado esperado:** Titulos, headers e chamadas principais dessas telas usam `font-display` quando fizer sentido visual, sem alterar textos, rotas ou regras de negocio.

### CA-07 - Admin recebe apenas alteracao tipografica

**Entrada:** A implementacao futura e comparada via diff.

**Resultado esperado:** `src/pages/Admin.jsx` possui somente alteracoes de classe para aplicar `font-display` em titulos e headers. `src/components/AdminProductForm.jsx` possui somente alteracoes de classe para aplicar `font-display` em titulos e labels. Color picker, estado, login, drawer, abas, produtos, inputs, upload, handlers, callbacks e regras de negocio permanecem intactos.

### CA-08 - Spec do menu lateral permanece intocado

**Entrada:** A implementacao futura e comparada via diff.

**Resultado esperado:** `SPEC_MENU_LATERAL_ADMIN.md` nao possui alteracoes.

### CA-09 - Cor primaria dinamica permanece funcionando

**Entrada:** O administrador altera a cor primaria no color picker do admin.

**Resultado esperado:** A cor primaria continua sendo salva e aplicada nos botoes/elementos que usam `config.primaryColor`, sem ser substituida por classes `gray` ou por valor fixo.

### CA-10 - Classes `gray` existentes mudam por alias

**Entrada:** Uma tela usa `bg-gray-950`, `bg-gray-900`, `text-gray-400` ou `border-gray-800`.

**Resultado esperado:** A classe permanece no JSX, mas passa a usar o valor definido na nova escala `gray` do Tailwind.

### CA-11 - Nenhuma pagina e alterada apenas para trocar cor

**Entrada:** O diff da implementacao futura e revisado.

**Resultado esperado:** Nao existem alteracoes em JSX cujo unico objetivo seja trocar `bg-gray-*`, `text-gray-*` ou `border-gray-*` por outro nome de classe.

### CA-12 - Escala gray inclui tons usados pelo admin

**Entrada:** Elementos com `bg-gray-100`, `bg-gray-200` ou `border-gray-200` aparecem no admin ou em regras globais.

**Resultado esperado:** Esses tons usam os valores definidos na escala Selfix: `gray-100: #f3f4f6` e `gray-200: #e5e7eb`.

### CA-13 - Tema claro continua renderizando

**Entrada:** O usuario alterna para tema claro.

**Resultado esperado:** As regras existentes de `#root:not(.dark)` continuam funcionando, com contraste suficiente e sem sumir textos principais.

### CA-14 - Tema escuro continua renderizando

**Entrada:** O usuario alterna para tema escuro.

**Resultado esperado:** As regras existentes de `#root.dark` continuam funcionando, com fundos, bordas e textos legiveis.

### CA-15 - Build nao quebra

**Entrada:** O comando de build do projeto e executado depois da implementacao.

**Resultado esperado:** O build termina sem erro de Tailwind, Vite ou importacao de asset.

### CA-16 - Rotas continuam iguais

**Entrada:** O usuario acessa `/`, `/#/menu`, `/#/payment`, `/#/confirmation`, `/#/admin`, `/#/cozinha` e `/#/caixa`.

**Resultado esperado:** Todas as rotas continuam carregando as mesmas telas de antes. Nenhuma rota nova e exigida.

### CA-17 - Dados locais nao sao alterados

**Entrada:** Existem dados em `selfix_config`, `selfix_products`, `selfix_orders`, `selfix_theme` e `selfix_admin`.

**Resultado esperado:** A melhoria visual nao apaga, migra, renomeia nem modifica esses dados.

### CA-18 - `dist` e `node_modules` nao sao alterados manualmente

**Entrada:** O diff da implementacao futura e revisado.

**Resultado esperado:** Nao ha edicoes manuais em `dist/` ou `node_modules/`.

### CA-19 - Logo em FONTES permanece como referencia

**Entrada:** A implementacao futura e comparada via diff.

**Resultado esperado:** `FONTES/Logo Selfix.png` nao e movido, editado, convertido nem usado diretamente no codigo. Se for necessario usar a logo na interface, isso deve ser tratado em outro PRD ou em uma aprovacao explicita.

### CA-20 - Acentos azul/roxo da logo nao alteram escopo de cor

**Entrada:** A implementacao futura e revisada visualmente e por diff.

**Resultado esperado:** A existencia de azul/roxo na logo nao cria novas alteracoes de paleta fora da escala `gray` nem substitui a cor primaria dinamica configurada no Admin.

---

## 11. Fora do escopo

Nao faz parte desta entrega:

- redesenhar layout das telas;
- mudar classes de cor pagina por pagina;
- alterar o spec do menu lateral admin;
- alterar a cor primaria dinamica;
- substituir tema claro/escuro;
- instalar biblioteca de UI;
- trocar React, Vite ou Tailwind;
- migrar para TailwindCSS 4;
- alterar dados demo;
- alterar persistencia local;
- criar backend;
- atualizar documentacao comercial em `FONTES/`;
- usar `FONTES/Logo Selfix.png` como asset de runtime sem aprovacao explicita.

---

## 12. Aprovacao necessaria antes da implementacao

Antes de escrever codigo, confirmar:

1. Se a logo Selfix deve continuar apenas como referencia visual ou se deve virar asset publico em uma entrega separada.

*A implementacao so deve comecar apos aprovacao deste PRD.*
