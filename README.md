# SELFIX

Sistema de autoatendimento para restaurantes, lanchonetes e operações de mesa. O projeto é uma SPA feita com React, Vite e TailwindCSS, pensada para rodar como cardápio digital, quiosque ou protótipo operacional sem backend.

O SELFIX permite que o cliente monte o pedido, informe o nome, escolha uma intenção de pagamento e gere uma comanda local. A cozinha acompanha os pedidos em aberto e o caixa fecha comandas por mesa ou balcão.

## Visão Geral

- **Quiosque/Cardápio:** navegação por categorias, carrinho, nome do cliente e envio do pedido.
- **Modo mesa via QR Code:** URLs com `?mesa=` abrem direto no cardápio e vinculam o pedido à mesa.
- **Pagamento simplificado:** PIX, Débito e Crédito são registrados como referência, sem cobrança real no app.
- **Painel Admin:** configuração visual do estabelecimento, credenciais e cadastro de produtos.
- **Painel da Cozinha:** lista pedidos pendentes e marca pedidos como concluídos.
- **Painel do Caixa:** agrupa pedidos por mesa, controla comandas ativas, bloqueia fechamento enquanto houver preparo e mantém histórico encerrado apenas durante a sessão.
- **Tema claro/escuro:** alternância global persistida em `localStorage`.

## Tecnologias

- React 18
- React Router DOM 6 com `HashRouter`
- Vite 5
- TailwindCSS 3
- Persistência local via `localStorage` e `sessionStorage`
- Deploy estático com `gh-pages`

## Como Rodar

Instale as dependências:

```bash
npm install
```

Inicie o ambiente local:

```bash
npm run dev
```

Abra no navegador:

```text
http://localhost:5173/
```

Scripts disponíveis:

```bash
npm run dev       # servidor local de desenvolvimento
npm run build     # gera build estático em dist/
npm run preview   # prévia local do build
npm run deploy    # publica dist/ via gh-pages
```

## Rotas

Em desenvolvimento:

| Área | URL |
|---|---|
| Tela inicial / modo totem | `http://localhost:5173/` |
| Cardápio | `http://localhost:5173/#/menu` |
| Pagamento | `http://localhost:5173/#/payment` |
| Confirmação | `http://localhost:5173/#/confirmation` |
| Admin | `http://localhost:5173/#/admin` |
| Cozinha | `http://localhost:5173/#/cozinha` |
| Caixa | `http://localhost:5173/#/caixa` |

No GitHub Pages, o projeto está configurado com base `/SELFIX/`, então as rotas ficam no formato:

```text
https://SEU_USUARIO.github.io/SELFIX/#/admin
```

## Modo Mesa por QR Code

Para vincular pedidos a uma mesa, gere o QR Code com o parâmetro `mesa` antes do hash:

```text
http://localhost:5173/?mesa=4#/
https://SEU_USUARIO.github.io/SELFIX/?mesa=4#/
```

Quando `?mesa=4` está presente:

- a tela inicial é pulada;
- o cardápio abre diretamente;
- o topo do cardápio exibe `Mesa 4`;
- o pedido salvo recebe `tableNumber: "4"`;
- após a confirmação, o cliente volta ao cardápio para novo pedido.

Se o parâmetro vier depois do hash, por exemplo `/#/menu?mesa=4`, o app não reconhece a mesa porque a leitura é feita por `window.location.search`.

## Fluxo do Cliente

1. O cliente acessa o cardápio pelo totem ou pelo QR Code da mesa.
2. Escolhe produtos ativos do cardápio.
3. Abre o carrinho, ajusta quantidades e informa o nome.
4. Escolhe a referência de pagamento: Débito, Crédito ou PIX.
5. O app gera um número de pedido de quatro dígitos.
6. O pedido é salvo em `localStorage` na chave `selfix_orders`.
7. A tela de confirmação exibe o número do pedido e retorna automaticamente após 10 segundos.

Importante: o app não processa pagamento real. A escolha feita no quiosque serve como referência para atendimento e fechamento no caixa.

## Painel Admin

Rota:

```text
/#/admin
```

Credenciais padrão:

```text
Usuário: admin
Senha: selfix123
```

No painel é possível:

- alterar nome do estabelecimento;
- definir logo por upload ou URL;
- alterar cor primária;
- alterar usuário e senha do admin;
- criar, editar, buscar, ativar/inativar e excluir produtos;
- restaurar o cardápio demo.

As credenciais são armazenadas no `localStorage`. Troque os dados padrão antes de entregar um tablet ou link de demonstração.

## Painel da Cozinha

Rota:

```text
/#/cozinha
```

A cozinha lê `selfix_orders` a cada 5 segundos e exibe pedidos cujo `kitchenStatus` ainda não é `done`.

Cada card mostra:

- número do pedido;
- mesa ou balcão;
- nome do cliente;
- itens e quantidades;
- total;
- botão `Concluído`.

Ao concluir, o pedido não é apagado imediatamente. Ele recebe `kitchenStatus: "done"` para que continue disponível ao caixa até o fechamento da comanda.

## Painel do Caixa

Rota:

```text
/#/caixa
```

O caixa deriva comandas a partir dos pedidos salvos em `selfix_orders`.

Regras principais:

- pedidos com mesa numerada são agrupados por mesa;
- pedidos de `Balcão` viram comandas individuais;
- itens iguais são consolidados por produto e preço;
- a forma escolhida no quiosque aparece como referência;
- o fechamento só é liberado quando todos os pedidos da comanda foram concluídos pela cozinha;
- o caixa confirma a forma final entre Dinheiro, Débito, Crédito e PIX;
- ao fechar, os pedidos da comanda são removidos de `selfix_orders`;
- comandas encerradas ficam em histórico apenas em memória, até recarregar a página.

## Persistência Local

O app usa armazenamento do navegador:

| Chave | Uso |
|---|---|
| `selfix_config` | nome, logo, cor, credenciais e campos legados de configuração |
| `selfix_products` | produtos cadastrados no admin |
| `selfix_orders` | pedidos abertos e status de cozinha |
| `selfix_theme` | tema claro ou escuro |
| `selfix_admin` | sessão do admin em `sessionStorage` |

Como não há backend, os dados pertencem ao navegador/dispositivo onde o app está aberto. Para quiosque, cozinha e caixa compartilharem pedidos em tempo real, eles precisam usar o mesmo armazenamento local ou uma futura camada de servidor.

## Estrutura do Projeto

```text
SELFIX/
  public/
    404.html
  src/
    components/
      AdminProductForm.jsx
      CartDrawer.jsx
      CategoryBar.jsx
      ProductCard.jsx
      ThemeToggle.jsx
    context/
      CartContext.jsx
      StoreContext.jsx
    data/
      seed.js
    pages/
      Admin.jsx
      Cashier.jsx
      Confirmation.jsx
      Kitchen.jsx
      Menu.jsx
      Payment.jsx
      Welcome.jsx
    App.jsx
    index.css
    main.jsx
    theme.js
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
```

Arquivos `PRD_*.md` e `SPEC_*.md` documentam decisões e critérios de aceite das melhorias de mesa por QR Code, pagamento simplificado, painel da cozinha e painel do caixa.

## Build e Deploy

Gerar build:

```bash
npm run build
```

O resultado sai em `dist/`.

Publicar no GitHub Pages:

```bash
npm run deploy
```

O `vite.config.js` usa:

```js
base: '/SELFIX/'
```

Se o repositório ou caminho de publicação mudar, ajuste esse valor antes do build.

## Limitações Conhecidas

- Não há backend, banco de dados, autenticação real ou integração com gateway de pagamento.
- O painel admin usa credenciais salvas no navegador, adequado apenas para demonstração ou dispositivo controlado.
- Uploads de imagens viram base64 e podem estourar o limite do `localStorage`; prefira URLs para fotos grandes.
- O histórico de comandas encerradas no caixa é apenas de sessão e desaparece ao recarregar.
- Polling de cozinha e caixa acontece a cada 5 segundos.
- Pedidos antigos ou dados corrompidos no `localStorage` são tratados com fallback simples, mas podem exigir limpeza manual do armazenamento.

## Dados Demo

O cardápio inicial fica em `src/data/seed.js` e inclui produtos de hamburgeria nas categorias:

- Hambúrgueres
- Acompanhamentos
- Bebidas
- Sobremesas

No Admin, use `Restaurar demo` para substituir o cardápio atual pelos dados de exemplo.
