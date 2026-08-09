# 🛍️ Portal de Compras PD

**Projeto final acadêmico desenvolvido por Renato Silva** — um portal de
compras completo de eletrônicos e acessórios (capas de celular, carregadores,
notebooks, fones, smartphones…), no estilo de um marketplace como Shopee ou
AliExpress, com preços em **reais (R$)**.

> 📄 Veja também a **[Apresentação do projeto](APRESENTACAO.md)** — resumo
> pronto para compartilhar com a banca/professor.

## 📋 Descrição do projeto

O **Portal de Compras PD** é um marketplace completo: catálogo de produtos com
busca, filtros e ordenação, página de detalhes com avaliações, carrinho,
checkout com endereço e forma de pagamento (Pix, cartão ou boleto — simulado),
histórico de pedidos com acompanhamento de status, anúncios da comunidade
(qualquer usuário pode vender), área do vendedor e painel administrativo.

O backend roda em **Convex**: o catálogo é semeador a partir da Fake Store
API (com preços convertidos de dólar para reais) e os anúncios criados pelos
usuários são armazenados no banco, junto com avaliações e pedidos.

## 🛠️ Tecnologias utilizadas

| Tecnologia      | Finalidade                                      |
| --------------- | ----------------------------------------------- |
| **React 19**    | Biblioteca de interface (componentização)       |
| **Vite**        | Build tool e dev server                         |
| **TypeScript**  | Tipagem estática                                |
| **React Router 7** | Roteamento entre páginas                     |
| **Convex**      | Backend, banco de dados e autenticação          |
| **Convex Auth** | Login e cadastro (email/OTP + anônimo)          |
| **Tailwind CSS 4** | Estilização                                  |
| **shadcn/ui**   | Componentes de interface                        |
| **Framer Motion** | Animações e micro-interações                  |
| **Sonner**      | Toasts de confirmação                           |

> API de semeadura: [Fake Store API](https://fakestoreapi.com/) —
> `https://fakestoreapi.com/products` (preços exibidos em R$).

## 🚀 Como instalar

Pré-requisitos: **Node.js 18+** e **Bun** (ou npm).

```bash
# 1. Instale as dependências
bun install
# ou: npm install

# 2. Configure o Convex (variáveis de ambiente do deployment)
# 3. Inicie o backend local
bun convex dev
```

## ▶️ Como executar

```bash
# Ambiente de desenvolvimento (com hot reload)
bun run dev

# Build de produção
bun run build

# Pré-visualizar o build de produção
bun run preview
```

Abra o endereço indicado no terminal (padrão: `http://localhost:5173`). Na
primeira visita, o catálogo é semeado automaticamente no Convex.

## ✨ Funcionalidades implementadas

- ✅ **Catálogo** — produtos em cards responsivos com imagem, nome, preço em
  R$ e avaliação; busca com debounce, filtro por categoria e ordenação
  (preço/avaliação) sincronizados com a URL.
- ✅ **Página de detalhes** (`/produto/:id`) — imagem, descrição, estoque,
  vendedor, avaliação com estrelas e seção de comentários (login obrigatório
  para avaliar).
- ✅ **Carrinho de compras** — estado global com Context API + persistência em
  `localStorage`: adicionar, remover, alterar quantidade e total em tempo real.
- ✅ **Favoritos** — coração nos cards, página `/favoritos` e persistência no
  navegador.
- ✅ **Checkout** (`/checkout`, protegido por login) — endereço de entrega,
  forma de pagamento (Pix/cartão/boleto, simulado), total calculado no
  servidor e baixa de estoque.
- ✅ **Pedidos** (`/pedido/:id`) — confirmação com status, itens, endereço e
  forma de pagamento; histórico em `Minha conta`.
- ✅ **Anunciar** (`/anunciar`) — qualquer usuário cadastra produtos com upload
  de imagem (Convex Storage), edita, pausa/reativa ou remove seus anúncios.
- ✅ **Minha conta** (`/conta`) — visão geral, pedidos, gestão de anúncios e
  edição de perfil.
- ✅ **Painel administrativo** (`/admin`) — estatísticas (receita), gestão de
  produtos, controle de status de pedidos e funções de usuários.
- ✅ **Experiência do usuário** — skeleton loading, tratamento de erros com
  "tentar novamente", toasts, tema claro/escuro e interface responsiva.

## 🗂️ Estrutura do projeto

```
src/
├─ components/
│  ├─ layout/        → Header, Footer, Logo
│  ├─ store/         → ProductCard, CategoryFilter, SearchBar, CartDrawer…
│  └─ ui/            → shadcn/ui (Button, Badge, Skeleton, Select…)
├─ context/          → cart-context, favorites-context
├─ convex/           → schema, produtos, pedidos, avaliações, usuários, auth
├─ hooks/            → use-debounce, use-local-storage, use-auth
├─ lib/              → format (preços em R$), utils (cn)
├─ pages/            → HomePage, ProductPage, CartPage, CheckoutPage,
│                      OrderPage, AccountPage, SellPage, AdminPage, Auth…
├─ types/            → product.ts (tipos e rótulos de categoria)
└─ main.tsx          → providers, rotas e bootstrap
```

## 🔗 Rotas

| Rota               | Descrição                                     |
| ------------------ | --------------------------------------------- |
| `/`                | Página inicial com o catálogo completo        |
| `/produto/:id`     | Detalhes do produto e avaliações              |
| `/carrinho`        | Carrinho de compras                           |
| `/checkout`        | Finalização da compra (requer login)          |
| `/pedido/:id`      | Confirmação e acompanhamento do pedido        |
| `/favoritos`       | Produtos favoritos                            |
| `/conta`           | Dashboard do usuário (pedidos, anúncios, perfil) |
| `/anunciar`        | Cadastrar/editar anúncios                     |
| `/admin`           | Painel administrativo (apenas administradores) |
| `/auth`            | Login/cadastro                                |
| `*`                | Página 404                                    |

## 🧠 Conceitos aplicados

- Backend como serviço com **Convex** (queries reativas, mutations e actions)
- Autenticação com **Convex Auth** (email/OTP + anônimo) e controle de papéis
  (usuário/administrador)
- Gerenciamento de estado global com Context API + persistência em
  `localStorage`
- Roteamento com React Router, componentes reutilizáveis e responsividade
- Boas práticas de UX: skeletons, toasts, dark mode e micro-interações
