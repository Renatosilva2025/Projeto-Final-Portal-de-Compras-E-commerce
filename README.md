# 🛍️ Vitrine — Portal de Compras (E-commerce)

Projeto final de Front-End: um **portal de compras completo** que simula um
e-commerce real, consumindo a [Fake Store API](https://fakestoreapi.com/).

## 📋 Descrição do projeto

O **Vitrine** é uma aplicação React que lista produtos de uma API externa,
permite filtrar por categoria, buscar por nome, ordenar por preço/avaliação,
visualizar a página de detalhes de cada produto e gerenciar um **carrinho de
compras persistente** (salvo em `localStorage`). O projeto também inclui um
sistema de favoritos, tema claro/escuro, indicadores de carregamento
(skeleton), tratamento de erros com retry e feedback visual para todas as
ações do usuário (toasts).

## 🛠️ Tecnologias utilizadas

| Tecnologia   | Finalidade                                   |
| ------------ | -------------------------------------------- |
| **React 19** | Biblioteca de interface (componentização)    |
| **Vite**     | Build tool e dev server                      |
| **TypeScript** | Tipagem estática                          |
| **React Router 7** | Roteamento entre páginas                |
| **Fetch API** | Consumo da Fake Store API                  |
| **Context API** | Gerenciamento de estado global (carrinho e favoritos) |
| **localStorage** | Persistência de dados (carrinho e favoritos) |
| **Tailwind CSS 4** | Estilização                              |
| **Framer Motion** | Animações e micro-interações             |
| **Sonner**   | Toasts de confirmação                        |

> API utilizada: [Fake Store API](https://fakestoreapi.com/) —
> `https://fakestoreapi.com/products`

## 🚀 Como instalar

Pré-requisitos: **Node.js 18+** e **Bun** (ou npm).

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd <pasta-do-projeto>

# 2. Instale as dependências
bun install
# ou: npm install
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

Abra o endereço indicado no terminal (padrão: `http://localhost:5173`).

> **Importante:** a aplicação consome a Fake Store API diretamente do
> navegador. O projeto também possui autenticação opcional (email/OTP) via
> Convex — caso queira usar a rota `/auth`, configure as variáveis de
> ambiente do Convex (chave de deployment).

## ✨ Funcionalidades implementadas

### Obrigatórias

- ✅ **Página inicial** — lista todos os produtos da API em cards responsivos
  (imagem, nome, preço formatado e ação para ver detalhes).
- ✅ **Página de detalhes** (`/produto/:id`) — imagem, nome, descrição,
  categoria, preço, avaliação (estrelas + nº de avaliações) e botão de
  adicionar ao carrinho. Navegação com **React Router**.
- ✅ **Filtro por categorias** — chips com `Electronics`, `Jewelery`,
  `Men's Clothing` e `Women's Clothing` (nomes traduzidos em PT-BR).
- ✅ **Carrinho de compras** — estado global com **Context API**:
  adicionar, remover, alterar quantidade e exibir o **total em tempo real**.
  Os itens ficam **salvos em `localStorage`** mesmo após atualizar a página.
- ✅ **Experiência do usuário** — skeleton loading, tratamento de erros com
  botão "tentar novamente", toasts de feedback, interface responsiva.
- ✅ **Organização do projeto** — `components/`, `pages/`, `hooks/`,
  `services/`, `context/` e `lib/` com componentes reutilizáveis.
- ✅ **Documentação** — este `README.md`.

### Extras (opcionais) 🎁

- ✅ Barra de busca com **debounce** (`?q=...`)
- ✅ **Dark Mode** (alternador no cabeçalho, persistido no navegador)
- ✅ Animações entre páginas e micro-interações (Framer Motion)
- ✅ **Ordenação por preço** (menor/maior) e por avaliação (`?ordem=...`)
- ✅ **Sistema de favoritos** (página `/favoritos`, persistido no navegador)
- ✅ **Skeleton Loading** e **Toasts de confirmação**
- ✅ Drawer lateral do carrinho com resumo em tempo real
- ✅ Filtros sincronizados com a URL (compartilháveis)
- ✅ Checkout simulado com diálogo de confirmação

## 🗂️ Estrutura do projeto

```
src/
├─ components/
│  ├─ layout/        → Header, Footer, Logo, StoreLayout
│  ├─ store/         → ProductCard, CategoryFilter, SearchBar, CartDrawer…
│  └─ ui/            → shadcn/ui (Button, Badge, Skeleton, Select…)
├─ context/          → cart-context (Context API + localStorage), favorites-context
├─ hooks/            → use-debounce, use-local-storage
├─ lib/              → format (preços), utils (cn)
├─ pages/            → HomePage, ProductPage, CartPage, FavoritesPage, Auth, NotFound
├─ services/         → api.ts (cliente da Fake Store API)
├─ types/            → product.ts (tipos e rótulos de categoria)
├─ convex/           → autenticação (email/OTP + anônimo)
└─ main.tsx          → providers, rotas e bootstrap
```

## 🔗 Rotas

| Rota               | Descrição                              |
| ------------------ | -------------------------------------- |
| `/`                | Página inicial com o catálogo completo |
| `/produto/:id`     | Detalhes do produto                    |
| `/carrinho`        | Carrinho de compras                    |
| `/favoritos`       | Produtos favoritos                     |
| `/auth`            | Login/cadastro (opcional)              |
| `*`                | Página 404                             |

## 🧠 Conceitos aplicados

- Consumo de API externa com `fetch` + tratamento de erros
- Hooks do React (`useState`, `useEffect`, `useMemo`, `useCallback`, hooks
  customizados)
- Gerenciamento de estado global com Context API
- Persistência de dados com `localStorage`
- Roteamento com React Router
- Componentização e reutilização de componentes
- Responsividade e boas práticas de UX
