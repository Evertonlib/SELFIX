# SPEC - Menu lateral deslizante no Admin (`/admin`)

**Projeto:** SELFIX  
**Data:** 2026-05-01  
**Base:** `PRD_MENU_LATERAL_ADMIN.md` aprovado  
**Status:** Aguardando aprovação para implementação  

---

## 1. Objetivo técnico

Implementar um drawer lateral administrativo exclusivo da rota `/admin`, visível apenas quando o administrador estiver autenticado.

O drawer deve centralizar os atalhos administrativos hoje espalhados no header do admin:

- Configurações -> `/admin`
- Quiosque -> `/menu`
- Painel da Cozinha -> `/cozinha`
- Painel do Caixa -> `/caixa`
- Sair -> logout administrativo local

Não serão criadas rotas, providers, layouts globais, dependências, arquivos de estilo globais ou componentes compartilhados novos para esta entrega.

---

## 2. Arquivos lidos para validação do PRD

Conforme solicitado, a validação foi feita somente nos arquivos listados pelo PRD como afetados ou explicitamente fora de mudança:

- `src/pages/Admin.jsx`
- `src/App.jsx`
- `src/pages/Menu.jsx`
- `src/pages/Kitchen.jsx`
- `src/pages/Cashier.jsx`
- `src/pages/Welcome.jsx`
- `src/pages/Payment.jsx`
- `src/pages/Confirmation.jsx`
- `src/components/CartDrawer.jsx`
- `src/components/AdminProductForm.jsx`
- `src/components/ThemeToggle.jsx`
- `src/context/StoreContext.jsx`
- `src/context/CartContext.jsx`
- `src/data/seed.js`
- `src/index.css`
- `tailwind.config.js`
- `vite.config.js`
- `postcss.config.js`
- `index.html`
- `public/404.html`

`dist/`, `node_modules/` e `.git/` não foram lidos nem serão alterados, pois são artefatos, dependências ou metadados.

---

## 3. Observações sobre diferenças entre PRD e código real

1. O PRD recomenda navegação interna com React Router para evitar links absolutos. O código atual em `src/pages/Admin.jsx` usa `href="/SELFIX/#/menu"` no link "Ver quiosque".  
   **Código prevalece como diagnóstico:** existe hoje um link absoluto dependente do `base` de deploy.  
   **Especificação:** o novo drawer deve usar navegação interna por React Router, preferencialmente `useNavigate`, e o link absoluto será removido junto com "Ver quiosque".

2. O PRD descreve o projeto como compatível com tema claro/escuro. O código real possui `ThemeToggle` global em `src/App.jsx` e regras globais em `src/index.css` que alteram classes como `bg-white`, `bg-gray-50`, `text-gray-900` e `border-gray-200` quando `#root.dark` está ativo.  
   **Especificação:** o drawer deve usar o mesmo vocabulário de classes já usado no admin para herdar esse comportamento, sem CSS global novo.

3. O PRD menciona "fundo escuro" em `/cozinha` e `/caixa`. O código real usa classes escuras nessas páginas, mas o tema global pode reinterpretá-las no modo claro.  
   **Especificação:** essa entrega não deve alterar cozinha, caixa nem tema global; o drawer permanece exclusivo do admin.

4. O logout atual em `src/pages/Admin.jsx` faz `sessionStorage.removeItem('selfix_admin')` e `setIsLoggedIn(false)`, sem navegação explícita.  
   **Especificação:** o item "Sair" deve reaproveitar esse comportamento local e, se necessário, fechar o drawer antes ou durante o logout. Não deve navegar para `/`.

5. A inicialização de sessão em `Admin.jsx` acessa `sessionStorage` diretamente no inicializador de estado. O PRD possui critério sobre falha de armazenamento no logout, mas o código atual não protege todos os acessos a `sessionStorage` com `try/catch`.  
   **Especificação:** a implementação do drawer não deve ampliar esse risco. O logout acionado pelo drawer deve ser tolerante a erro de `sessionStorage` dentro do possível, mantendo a UI em estado de login administrativo quando o estado React puder ser atualizado.

---

## 4. Arquivo que será alterado

### `src/pages/Admin.jsx`

Alterações previstas:

- importar `useNavigate` de `react-router-dom`;
- adicionar estado local `isDrawerOpen`;
- adicionar handlers locais para abrir, fechar, navegar e sair;
- adicionar botão hamburguer no header autenticado;
- adicionar markup do drawer e backdrop dentro do componente `Admin`;
- remover do header autenticado o link "Ver quiosque";
- remover do header autenticado o botão "Sair";
- manter login, abas, configurações, produtos e formulários sem alteração de regra de negócio.

Nenhum outro arquivo deve ser alterado na implementação.

---

## 5. Design da implementação

### 5.1 Estado local

No componente `Admin`:

- `const [isDrawerOpen, setIsDrawerOpen] = useState(false)`

O estado só existe no fluxo autenticado do admin. Usuários sem sessão continuam recebendo apenas `LoginForm`.

### 5.2 Navegação

Adicionar `const navigate = useNavigate()` no componente `Admin`.

Criar um helper simples:

- `handleDrawerNavigate(path)`: fecha o drawer e chama `navigate(path)`.

Rotas usadas:

- `/admin`
- `/menu`
- `/cozinha`
- `/caixa`

Não adicionar rotas em `src/App.jsx`.

### 5.3 Logout

Atualizar ou envolver o comportamento atual:

- fechar o drawer;
- tentar remover `selfix_admin` do `sessionStorage`;
- chamar `setIsLoggedIn(false)`;
- não navegar para `/`;
- não limpar carrinho, produtos, pedidos ou configurações.

O comportamento deve continuar exibindo `LoginForm` dentro da rota `/admin`.

### 5.4 Botão hamburguer

O botão deve ficar no lado esquerdo do header autenticado, antes do título "Painel SELFIX".

Requisitos:

- `type="button"`;
- `aria-label="Abrir menu administrativo"`;
- `aria-expanded={isDrawerOpen}`;
- área de clique confortável;
- três linhas visuais ou caractere equivalente, sem dependência de biblioteca;
- classes Tailwind compatíveis com o visual atual do admin.

O header deve continuar `sticky top-0`, com `z-index` abaixo do drawer/backdrop.

### 5.5 Drawer e backdrop

Renderização prevista somente quando `isDrawerOpen === true`.

Estrutura:

- backdrop `fixed inset-0 bg-black/70`;
- painel `fixed left-0 top-0 h-full w-72 max-w-[85vw]`;
- painel acima do backdrop;
- fundo branco/cinza compatível com admin;
- borda direita e sombra discreta;
- cabeçalho interno com título curto e botão de fechar;
- lista vertical de ações.

Z-index sugerido:

- backdrop: `z-40`;
- painel: `z-50`;
- `ThemeToggle` existente usa `z-[100]`, então o drawer pode ficar abaixo dele no código atual. Como não há requisito para alterar `ThemeToggle`, isso deve ser aceito ou mitigado apenas dentro de `Admin.jsx` se ficar visualmente problemático, sem editar `ThemeToggle.jsx`.

### 5.6 Itens do drawer

Itens obrigatórios:

- `⚙️ Configurações`
- `🍔 Quiosque`
- `👨‍🍳 Painel da Cozinha`
- `💰 Painel do Caixa`
- `🚪 Sair`

Cada item deve ser um `button` para unificar comportamento:

- navegação via `navigate(path)` nos quatro primeiros;
- logout local no último;
- fechamento do drawer após a ação.

Não usar `a href` absoluto.

### 5.7 Acessibilidade mínima

Implementar:

- rótulo acessível no hamburguer;
- `aria-expanded` no hamburguer;
- botão visível de fechar dentro do drawer;
- fechamento ao clicar no backdrop;
- `aria-label` no botão de fechar;
- texto visível suficiente em todos os itens.

Opcional aceitável:

- fechar com `Esc`, desde que a implementação fique contida em `Admin.jsx` e não adicione complexidade relevante.

### 5.8 Comportamento de abas internas

O estado `activeTab` não deve ser alterado por abrir ou fechar o drawer.

Ao clicar em `Configurações`:

- navegar para `/admin`;
- fechar o drawer;
- não é obrigatório forçar `activeTab = 'settings'`, porque o PRD define que `/admin` leva para a tela administrativa e que a aba atual é controlada por estado interno.

---

## 6. O que não será implementado

- drawer global;
- componente compartilhado de layout;
- proteção de `/cozinha` ou `/caixa`;
- rota nova de login;
- alteração em `src/App.jsx`;
- alteração em `src/index.css`;
- instalação de biblioteca;
- persistência do estado aberto/fechado do menu;
- destaque obrigatório do item ativo;
- refatoração de `CartDrawer`;
- mudanças em pedidos, carrinho, produtos, tema, seed ou build.

---

## 7. Plano de implementação após aprovação

1. Alterar apenas `src/pages/Admin.jsx`.
2. Adicionar `useNavigate`.
3. Adicionar estado e handlers do drawer.
4. Reestruturar o header autenticado para incluir o hamburguer e remover "Ver quiosque" e "Sair".
5. Adicionar drawer/backdrop no JSX autenticado.
6. Garantir que o login administrativo continue sem drawer.
7. Verificar navegação para `/admin`, `/menu`, `/cozinha` e `/caixa`.
8. Verificar logout voltando ao login do admin.

---

## 8. Critérios técnicos de aceite

- `src/App.jsx` permanece sem alteração.
- O drawer aparece apenas no admin autenticado.
- O login do admin não exibe hamburguer nem drawer.
- O drawer abre ao clicar no hamburguer.
- O drawer fecha ao clicar no backdrop.
- O drawer fecha ao clicar em qualquer item.
- Os itens navegam usando React Router, sem `href="/SELFIX/#/..."`.
- O item "Sair" remove a sessão administrativa e renderiza o login do admin.
- O header autenticado não exibe mais "Ver quiosque" nem "Sair".
- `/menu`, `/cozinha` e `/caixa` não exibem drawer.
- As abas "Configurações" e "Cardápio" continuam funcionando.
- Nenhum dado de `localStorage` relacionado a pedidos, carrinho, produtos ou configurações é alterado pelo drawer.
- Nenhuma dependência nova é adicionada.

---

## 9. Verificação recomendada

Após implementação aprovada:

- rodar build ou comando de validação disponível no projeto;
- testar manualmente `/#/admin` sem sessão;
- fazer login e abrir/fechar o drawer;
- navegar por todos os itens;
- confirmar que logout mostra o login administrativo;
- confirmar que o drawer não aparece em `/menu`, `/cozinha` ou `/caixa`.

---

*A implementação só deve começar após aprovação deste Spec.*
