# SELFIX — Sistema de Autoatendimento para Tablet

App de autoatendimento (quiosque) + painel admin, feito com React + Vite + TailwindCSS.
Roda 100% no navegador, sem servidor nem banco de dados — todos os dados ficam no `localStorage`.

---

## Início Rápido

```bash
npm install
npm run dev
```

Abra http://localhost:5173 no navegador.

- **Quiosque (cliente):** http://localhost:5173/
- **Painel Admin:** http://localhost:5173/admin
  - Usuário padrão: `admin`
  - Senha padrão: `selfix123`

---

## Configurar para um Novo Cliente

### 1. Nome e logo

Acesse o Painel Admin → aba **Configurações**:

- **Nome do Estabelecimento** — aparece na tela de boas-vindas e no cabeçalho do cardápio.
- **Logo** — faça upload de um arquivo de imagem ou cole uma URL. Recomendamos PNG com fundo transparente, mínimo 200×200 px.
- **Cor Primária** — use o seletor de cor ou digite o hex (ex: `#e11d48`). Afeta botões, destaques e o efeito de brilho na tela inicial.

### 2. Chave PIX

Em **Configurações → PIX**:

- **Chave PIX** — qualquer chave cadastrada no banco (CPF, CNPJ, e-mail ou chave aleatória).
- **URL do QR Code PIX (opcional)** — se deixado vazio, o sistema gera um QR automaticamente a partir da chave. Para cobranças PIX com valor pré-definido e QR oficial, gere o QR no app do seu banco, salve a imagem em algum servidor e cole a URL aqui.

### 3. Cardápio

Em **Configurações → Cardápio**:

- Clique em **+ Novo** para adicionar produtos.
- Cada produto tem: nome, descrição, preço, categoria, foto e status ativo/inativo.
- Produtos **inativos** não aparecem no quiosque.
- A categoria é texto livre; use nomes consistentes para agrupar (ex: `Hambúrgueres`, `Bebidas`).
- Para fotos, você pode fazer upload (convertido para base64) ou colar uma URL.

> ⚠️ O `localStorage` tem limite de ~5 MB. Se usar muitas fotos por upload, prefira URLs de imagens hospedadas.

### 4. Credenciais

Em **Configurações → Credenciais de Acesso**, troque usuário e senha antes de entregar o tablet ao cliente.

### 5. Build para produção

```bash
npm run build
```

Os arquivos ficam em `/dist`. Copie essa pasta para o tablet ou sirva-a com qualquer servidor HTTP estático (ex: `npx serve dist`).

---

## Modo Quiosque no Android

### Opção A — Chrome Modo Quiosque (mais simples)

1. Conecte o tablet ao computador via USB com depuração USB habilitada.
2. Inicie o servidor na sua rede local:
   ```bash
   npm run dev -- --host
   ```
3. Abra o Chrome no tablet, vá até `http://SEU_IP:5173` e toque em **⋮ → Adicionar à tela inicial**.
4. Use o **Fixar Tela** nativo do Android:
   - Configurações → Segurança → Fixação de Tela (ou "App Pinning")
   - Abra o app adicionado à tela inicial
   - Pressione Recentes (botão quadrado) → ícone do pin no card do Chrome → **Fixar**
   - O tablet fica preso no app; para sair, segure Voltar + Recentes ao mesmo tempo.

### Opção B — Fully Kiosk Browser (recomendado para produção)

1. Instale o **Fully Kiosk Browser** na Play Store (gratuito com funcionalidades básicas).
2. Configure a URL de início: `http://localhost:5173` (ou o IP do servidor na rede).
3. Em *Kiosk Mode*: ative **Kiosk Mode Lock Task** para impedir que o usuário saia.
4. Ative **Keep Screen On** e **Start on Boot** para uso contínuo.

### Opção C — ADB (linha de comando)

Com o tablet conectado via USB:

```bash
# Abre Chrome em tela cheia no URL do quiosque
adb shell am start -n com.android.chrome/com.google.android.apps.chrome.Main \
  -a android.intent.action.VIEW \
  -d "http://192.168.1.X:5173"

# Oculta a barra de status
adb shell settings put global policy_control immersive.full=*
```

---

## Estrutura de Arquivos

```
/src
  /pages
    Welcome.jsx       ← Tela inicial com logo e botão "Toque para começar"
    Menu.jsx          ← Cardápio com filtro por categoria e carrinho flutuante
    Payment.jsx       ← Seleção de pagamento (PIX ou Cartão)
    Confirmation.jsx  ← Número do pedido + countdown de 10s
    Admin.jsx         ← Login + dashboard (configurações e cardápio)
  /components
    CategoryBar.jsx       ← Barra de categorias com scroll horizontal
    ProductCard.jsx       ← Card de produto com botão "+"
    CartDrawer.jsx        ← Gaveta deslizante do carrinho
    AdminProductForm.jsx  ← Formulário de criação/edição de produto
  /context
    CartContext.jsx   ← Estado global do carrinho
    StoreContext.jsx  ← Configurações e produtos (persiste em localStorage)
  /data
    seed.js           ← 10 produtos de hamburgeria para demo
```

---

## Dados de Exemplo (Demo)

O sistema vem pré-carregado com 10 produtos de hamburgeria:

| Produto | Categoria | Preço |
|---|---|---|
| Classic Burger | Hambúrgueres | R$ 28,90 |
| Smash Burger | Hambúrgueres | R$ 34,90 |
| BBQ Bacon | Hambúrgueres | R$ 38,90 |
| Veggie Burger | Hambúrgueres | R$ 32,90 |
| Double Smash | Hambúrgueres | R$ 44,90 |
| Batata Frita | Acompanhamentos | R$ 16,90 |
| Onion Rings | Acompanhamentos | R$ 18,90 |
| Milk Shake Chocolate | Bebidas | R$ 22,90 |
| Refrigerante | Bebidas | R$ 8,90 |
| Brownie com Sorvete | Sobremesas | R$ 19,90 |

Para restaurar o demo original: Admin → Cardápio → **Restaurar demo**.

---

## Requisitos

- Node.js 18+
- npm 9+
- Tablet Android 10" com Chrome 90+ (recomendado)
- Conexão de rede local para servir o build

---

## Notas Técnicas

- **Sem banco de dados** — tudo no `localStorage` do navegador.
- **Sem autenticação real** — as credenciais ficam no `localStorage`. Adequado para uso interno em tablet dedicado.
- **QR Code PIX** — gerado automaticamente via `api.qrserver.com`. Para PIX com valor fixo/cobranças reais, use o QR gerado pelo seu banco.
- **Fotos por upload** — convertidas para base64 e armazenadas no `localStorage`. Use fotos comprimidas (< 200 KB cada) para não ultrapassar o limite de 5 MB.
