# PRD - Menu lateral deslizante no Admin (`/admin`)

**Projeto:** SELFIX  
**Data:** 2026-05-01  
**Status:** Aguardando aprovação  

---

## 1. Objetivo da melhoria

Adicionar ao painel `/admin` um menu lateral deslizante, aberto por um botão hamburguer no canto superior esquerdo do header.

O menu deve servir como atalho administrativo para as principais áreas internas do sistema:

- Configurações -> `/admin`
- Quiosque -> `/menu`
- Painel da Cozinha -> `/cozinha`
- Painel do Caixa -> `/caixa`
- Sair -> tela de login do admin

O foco desta entrega é navegação simples e previsível, sem redesenhar o painel administrativo, sem mexer no visual do quiosque, sem criar nova arquitetura de layout e sem instalar bibliotecas.

---

## 2. Relação com os componentes existentes

### 2.1 Como a navegação funciona hoje

O projeto já usa React Router com `HashRouter` em `src/App.jsx`. As rotas já existentes são:

- `/`
- `/menu`
- `/payment`
- `/confirmation`
- `/admin`
- `/cozinha`
- `/caixa`

Isso significa que o drawer não precisa criar rotas novas. Ele deve apenas navegar para rotas que já existem.

### 2.2 Estado atual do painel `/admin`

O painel `/admin` já existe em `src/pages/Admin.jsx`.

Ele contém:

- uma tela de login própria, renderizada dentro do próprio componente `Admin`;
- controle de sessão em `sessionStorage` pela chave `selfix_admin`;
- função de login que grava `selfix_admin = "1"`;
- função de logout que remove `selfix_admin` e volta para a tela de login do admin;
- header próprio com o título "Painel SELFIX";
- link atual para "Ver quiosque";
- botão atual "Sair";
- abas internas de Configurações e Cardápio.

Como a tela de login do admin já existe, o item "Sair" deve reaproveitar o comportamento atual de logout: remover a sessão do admin e exibir o login administrativo na própria rota `/admin`. Não deve levar o usuário para a tela inicial do cliente.

### 2.3 Estado atual de `/cozinha` e `/caixa`

As páginas `/cozinha` e `/caixa` já existem e são autônomas.

`src/pages/Kitchen.jsx` possui:

- header próprio com "Painel da Cozinha";
- fundo escuro;
- leitura de pedidos em `localStorage`;
- modal de confirmação próprio para concluir pedido.

`src/pages/Cashier.jsx` possui:

- header próprio com "Painel do Caixa";
- fundo escuro;
- botões próprios de alternância entre comandas ativas e encerradas;
- leitura de pedidos em `localStorage`;
- modal próprio de confirmação de fechamento.

O novo drawer é exclusivo do `/admin` e não deve ser extraído para um layout global, porque cozinha e caixa já têm headers próprios e o requisito pede que o menu não apareça em nenhuma outra tela.

### 2.4 Componentes compartilhados existentes

Não existe hoje um componente compartilhado de layout ou navegação entre as páginas.

Existe `src/components/CartDrawer.jsx`, que já demonstra um padrão útil para esta melhoria:

- renderização condicional quando aberto;
- backdrop escurecido;
- fechamento ao clicar fora;
- camada `fixed` sobre o conteúdo;
- separação entre backdrop e painel.

Esse componente deve servir apenas como referência de padrão visual e comportamental. Ele não deve ser reutilizado diretamente, porque é um drawer inferior de carrinho do cliente, com lógica de pedido, total, nome do cliente e checkout.

---

## 3. Pesquisa de padrões externos

Com React, Vite, Tailwind e React Router, a forma mais simples e consistente para implementar este menu é:

- usar `useState` local no componente `Admin` para controlar se o drawer está aberto;
- renderizar o backdrop e o painel apenas quando necessário, ou manter o painel fixo com classes condicionais de abertura;
- usar `Link` ou `useNavigate` do React Router para navegar dentro do `HashRouter`;
- usar classes Tailwind como `fixed`, `inset-0`, `bg-black/70`, `transition-transform`, `duration-300`, `translate-x-0` e `-translate-x-full`;
- fechar o menu ao clicar no backdrop;
- fechar o menu depois que um item de navegação for acionado;
- não adicionar Headless UI, Radix, Zustand, Redux ou qualquer dependência nova para um caso de uso simples.

Referências externas usadas na pesquisa:

- React `useState`: https://react.dev/reference/react/useState
- React conditional rendering: https://react.dev/learn/conditional-rendering
- React Router `Link`: https://reactrouter.com/api/components/Link
- React Router `useNavigate`: https://reactrouter.com/api/hooks/useNavigate
- Tailwind `translate`: https://tailwindcss.com/docs/translate
- Tailwind `transition-property`: https://tailwindcss.com/docs/transition-property
- WAI-ARIA modal dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

A pesquisa de acessibilidade indica que um painel sobreposto deve deixar o fundo visualmente escurecido, ter um fechamento claro e evitar interação acidental com o conteúdo por trás. Para esta entrega, o mínimo aceitável é backdrop clicável, botão de fechar ou item de fechamento, rótulo acessível no botão hamburguer e sem navegação para fora do menu por clique acidental.

---

## 4. Arquivos afetados

### 4.1 Arquivos que devem mudar

| Arquivo | Motivo |
|---|---|
| `src/pages/Admin.jsx` | Adicionar estado local do drawer, botão hamburguer no header, painel lateral, backdrop, itens de navegação e comportamento do item Sair. |

### 4.2 Arquivos que não devem mudar

| Arquivo | Motivo |
|---|---|
| `src/App.jsx` | As rotas necessárias já existem. Não há necessidade de adicionar rota, provider ou layout global. |
| `src/pages/Menu.jsx` | O drawer é exclusivo do `/admin`; o quiosque não deve receber menu administrativo. |
| `src/pages/Kitchen.jsx` | A cozinha já tem header próprio e não deve exibir o drawer. |
| `src/pages/Cashier.jsx` | O caixa já tem header próprio e não deve exibir o drawer. |
| `src/pages/Welcome.jsx` | Tela inicial do cliente fora do escopo. |
| `src/pages/Payment.jsx` | Fluxo de pagamento fora do escopo. |
| `src/pages/Confirmation.jsx` | Confirmação do cliente fora do escopo. |
| `src/components/CartDrawer.jsx` | Serve apenas como referência; não deve ser alterado nem misturado com navegação admin. |
| `src/components/AdminProductForm.jsx` | Formulário de produtos fora do escopo. |
| `src/components/ThemeToggle.jsx` | Alternância global de tema fora do escopo. |
| `src/context/StoreContext.jsx` | Configurações, produtos e mesa fora do escopo. |
| `src/context/CartContext.jsx` | Carrinho e pedidos fora do escopo. |
| `src/data/seed.js` | Dados demo fora do escopo. |
| `src/index.css` | Não deve haver mudança global de CSS para esta melhoria. |
| `tailwind.config.js` | Não é necessário alterar configuração do Tailwind. |
| `vite.config.js` | Build e base path fora do escopo. |
| `postcss.config.js` | Build CSS fora do escopo. |
| `index.html` | Estrutura HTML base fora do escopo. |
| `public/404.html` | Deploy/redirect fora do escopo. |
| `dist/` | Artefato gerado, não deve ser editado manualmente. |
| `node_modules/` | Dependências instaladas, não devem ser editadas. |
| `.git/` | Metadados do Git, não devem ser editados manualmente. |

---

## 5. O que será adicionado

No `src/pages/Admin.jsx`:

- estado local para controlar abertura e fechamento do menu;
- botão hamburguer no canto superior esquerdo do header do painel autenticado;
- drawer lateral fixo à esquerda, sobreposto à tela;
- backdrop escurecido cobrindo o restante da tela;
- itens de navegação:
  - `⚙️ Configurações` para `/admin`;
  - `🍔 Quiosque` para `/menu`;
  - `👨‍🍳 Painel da Cozinha` para `/cozinha`;
  - `💰 Painel do Caixa` para `/caixa`;
  - `🚪 Sair` para logout do admin;
- fechamento do menu ao clicar no backdrop;
- fechamento do menu ao escolher qualquer item;
- rótulo acessível para o botão hamburguer.

O drawer deve usar o mesmo vocabulário visual já presente no projeto: fundos brancos/cinzas no admin, bordas suaves, sombra discreta e classes Tailwind existentes. Não deve introduzir paleta, fonte, ícones de biblioteca ou estilo novo.

---

## 6. O que será removido

Nenhum arquivo será removido.

Não há necessidade de remover rotas.

O botão atual "Sair" do header será removido. A única forma de fazer logout passa a ser pelo item `🚪 Sair` do drawer, usando o mesmo comportamento de logout já existente.

O link atual "Ver quiosque" do header também será removido. A navegação para o quiosque passa a ficar concentrada no item `🍔 Quiosque` do drawer, evitando redundância no header.

---

## 7. O que não será tocado em hipótese alguma

Não alterar:

- fluxo do cliente;
- visual do `/menu`;
- visual do `/cozinha`;
- visual do `/caixa`;
- lógica de pedidos em `selfix_orders`;
- lógica de carrinho;
- lógica de pagamento;
- dados demo;
- tema global;
- configurações de build;
- dependências;
- `node_modules`;
- `dist`;
- `.git`.

Também não deve ser criado um layout compartilhado global para esta entrega. Isso aumentaria o risco de o drawer aparecer em telas onde ele é proibido.

---

## 8. Premissas assumidas

1. A tela de login do admin já existe dentro de `src/pages/Admin.jsx`, embora não exista como rota separada. Portanto, "Sair" deve remover `selfix_admin` do `sessionStorage` e renderizar o login administrativo na rota `/admin`.

2. O menu lateral só deve existir depois do login no admin. Usuários não autenticados na rota `/admin` devem ver apenas o formulário de login, sem botão hamburguer e sem drawer.

3. Como o projeto usa `HashRouter`, navegar para `/menu`, `/cozinha` e `/caixa` deve usar a navegação interna do React Router, evitando links absolutos dependentes de `/SELFIX/`.

4. A rota `/admin` leva para a tela administrativa com a aba atual controlada por estado interno. O item "Configurações" pode navegar para `/admin` e fechar o drawer. Se o usuário já estiver no admin, o resultado esperado é permanecer no admin.

5. Não existe requisito para destacar o item ativo no drawer nesta primeira entrega. Se for simples e sem risco, pode haver destaque para "Configurações" quando estiver em `/admin`, mas isso não é obrigatório.

6. Não há requisito para fechar o drawer com a tecla `Esc`, mas isso é uma melhoria pequena e aceitável se não gerar complexidade. O critério obrigatório é fechar ao clicar fora.

7. Não será implementada uma tela nova de login admin. A tela atual do `LoginForm` é suficiente para esta melhoria.

---

## 9. Riscos identificados

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Drawer aparecer em outras telas por ser implementado em layout global | Baixa se o escopo for seguido | Alto | Implementar apenas dentro de `src/pages/Admin.jsx`, depois do login. |
| Navegação com `href` absoluto quebrar em desenvolvimento ou GitHub Pages | Média | Médio | Preferir navegação interna com React Router. |
| Item "Sair" levar para a tela inicial do cliente por engano | Média | Alto | Reaproveitar `handleLogout` atual do admin, que remove `selfix_admin` e renderiza o login do admin. |
| Drawer conflitar visualmente com o header atual do admin | Média | Baixo | Inserir botão hamburguer no lado esquerdo do header, sem alterar fonte, paleta ou estrutura principal. |
| Backdrop bloquear conteúdo sem permitir fechamento | Baixa | Médio | Garantir clique no backdrop para fechar e manter uma forma clara de fechamento. |
| Mudança acidental em `/cozinha` ou `/caixa` | Baixa | Alto | Não tocar nesses arquivos; o drawer é exclusivo do admin. |
| Tema claro/escuro global afetar contraste do drawer | Média | Baixo | Usar classes já compatíveis com o admin atual e evitar CSS global novo. |
| Caracteres com emoji renderizarem diferente entre dispositivos | Média | Baixo | Emojis fazem parte do requisito; caso algum dispositivo não suporte, o texto do item ainda deve ser suficiente. |

---

## 10. Critérios de aceitação

Cada critério descreve um cenário com entrada e resultado esperado.

### CA-01 - Botão hamburguer aparece somente no admin autenticado

**Entrada:** O administrador acessa `/#/admin`, faz login com credenciais válidas e vê o painel administrativo.

**Resultado esperado:** Um botão de três linhas aparece no canto superior esquerdo do header do painel. O restante do header permanece visualmente consistente com o estado atual.

### CA-02 - Botão hamburguer não aparece no login do admin

**Entrada:** O usuário acessa `/#/admin` sem sessão ativa em `sessionStorage`.

**Resultado esperado:** A tela de login do admin aparece sem botão hamburguer e sem drawer.

### CA-03 - Drawer abre ao clicar no botão

**Entrada:** O administrador está logado em `/#/admin` e clica no botão hamburguer.

**Resultado esperado:** Um painel lateral desliza da esquerda. O restante da tela fica coberto por um backdrop escurecido.

### CA-04 - Drawer fecha ao clicar fora

**Entrada:** O drawer está aberto.

**Resultado esperado:** Ao clicar no backdrop fora do painel, o drawer fecha e o painel admin volta ao estado normal.

### CA-05 - Configurações navega para admin

**Entrada:** O drawer está aberto e o administrador clica em `⚙️ Configurações`.

**Resultado esperado:** O app navega para `/admin`, o drawer fecha e o painel administrativo permanece disponível. Se o usuário já estava em `/admin`, não ocorre erro nem recarregamento desnecessário.

### CA-06 - Quiosque navega para menu

**Entrada:** O drawer está aberto e o administrador clica em `🍔 Quiosque`.

**Resultado esperado:** O app navega para `/menu`, o drawer fecha e a tela do quiosque aparece. O drawer não aparece no quiosque.

### CA-07 - Cozinha navega para painel da cozinha

**Entrada:** O drawer está aberto e o administrador clica em `👨‍🍳 Painel da Cozinha`.

**Resultado esperado:** O app navega para `/cozinha`, o drawer fecha e o Painel da Cozinha aparece com seu header próprio. O drawer não aparece na cozinha.

### CA-08 - Caixa navega para painel do caixa

**Entrada:** O drawer está aberto e o administrador clica em `💰 Painel do Caixa`.

**Resultado esperado:** O app navega para `/caixa`, o drawer fecha e o Painel do Caixa aparece com seu header próprio. O drawer não aparece no caixa.

### CA-09 - Sair volta para login do admin

**Entrada:** O administrador está logado, abre o drawer e clica em `🚪 Sair`.

**Resultado esperado:** A sessão do admin é removida, o drawer fecha e a tela exibida é o login administrativo do `/admin`, não a tela inicial do cliente.

### CA-10 - Botão Sair existente é removido

**Entrada:** O administrador acessa o painel `/admin` autenticado e observa o header.

**Resultado esperado:** O botão "Sair" existente no header do admin é removido. A única forma de fazer logout passa a ser pelo item `🚪 Sair` do drawer.

### CA-11 - Menu não interfere nas abas internas do admin

**Entrada:** O administrador alterna entre as abas internas "Configurações" e "Cardápio" dentro do `/admin`, abre e fecha o drawer.

**Resultado esperado:** As abas continuam funcionando como antes. Abrir ou fechar o drawer não altera produtos, configurações ou formulários.

### CA-12 - Erro de rota inexistente não é introduzido

**Entrada:** O administrador usa todos os itens do drawer em sequência.

**Resultado esperado:** Nenhum item leva para rota inexistente. As rotas `/admin`, `/menu`, `/cozinha` e `/caixa` já carregam telas existentes.

### CA-13 - Usuário não autenticado não acessa drawer por URL

**Entrada:** O usuário limpa `sessionStorage`, acessa `/#/admin` diretamente e tenta interagir com a página.

**Resultado esperado:** Apenas o login administrativo é exibido. Não existe menu lateral acessível antes do login.

### CA-14 - Clique repetido no hamburguer não quebra a interface

**Entrada:** O administrador clica rapidamente várias vezes no botão hamburguer.

**Resultado esperado:** O drawer alterna entre aberto e fechado sem travar, duplicar backdrop ou deixar camadas presas na tela.

### CA-15 - Navegação para fora do admin não carrega o drawer junto

**Entrada:** O administrador abre o drawer, navega para `/menu`, depois volta manualmente para `/cozinha` ou `/caixa`.

**Resultado esperado:** Nenhuma dessas telas exibe o botão hamburguer ou o drawer. O menu continua exclusivo do `/admin`.

### CA-16 - Backdrop não apaga nem altera dados

**Entrada:** O administrador está editando uma configuração ou produto no admin, abre o drawer e clica fora para fechar.

**Resultado esperado:** O drawer fecha sem salvar, apagar ou modificar dados de configuração, produtos, pedidos ou sessão.

### CA-17 - Estado de armazenamento indisponível no logout

**Entrada:** O navegador bloqueia ou falha ao acessar `sessionStorage` durante o clique em `🚪 Sair`.

**Resultado esperado:** A interface não deve exibir tela branca. O comportamento mínimo aceitável é tentar retornar para o estado de login do admin ou manter o admin em estado seguro sem navegar para a tela inicial do cliente.

### CA-18 - Visual permanece consistente

**Entrada:** O administrador compara o `/admin` antes e depois da melhoria, com o drawer fechado.

**Resultado esperado:** As únicas diferenças visíveis obrigatórias são o botão hamburguer no canto superior esquerdo e a remoção dos itens "Ver quiosque" e "Sair" do header. Fonte, paleta de cores, cards, abas, formulários e espaçamentos principais permanecem consistentes.

---

## 11. Fora do escopo

Não faz parte desta entrega:

- criar nova tela de login admin;
- criar autenticação real;
- proteger `/cozinha` ou `/caixa` por login;
- criar layout compartilhado global;
- adicionar menu lateral no quiosque, cozinha, caixa ou tela inicial;
- refatorar rotas;
- trocar `HashRouter`;
- alterar tema global;
- instalar biblioteca de drawer/modal;
- persistir preferência de menu aberto;
- adicionar permissões por perfil.

---

*Este documento deve ser aprovado antes de qualquer implementação.*
