# 📐 Análise UX/UI & Arquitetura Front-end — Portal de Compras PD

**Projeto final acadêmico** · Desenvolvido por **Renato Silva**
**Documento técnico** — análise do sistema sob a ótica de um UX/UI Designer Sênior e de um Arquiteto de Software Front-end de e-commerce.

---

## 1. Análise de UI/UX e Padrões de Design

### 1.1 Página Inicial (Home) — `src/pages/HomePage.tsx`

**Estrutura atual (topo → base):**

| Bloco | Descrição | Papel no funil |
|---|---|---|
| **Header sticky** | Logo, mega menu de categorias, busca, favoritos, notificações, carrinho, conta | Navegação e utilidades |
| **Hero institucional editável** | Badge, título com destaque em itálico, descrição, 3 CTAs e estatísticas; à direita, colagem flutuante de 3 produtos com animação Framer Motion | Primeira impressão + prova social ("N+ produtos") |
| **Barra de filtros sticky** | Chips de categoria + faixa de preço (R$ De/Até) + ordenação + toggle "Só favoritos" | Refinamento da navegação sem perder o contexto |
| **Vitrine em carrosséis** | Uma linha horizontal por categoria (`CategoryCarousel` → `ProductCarousel`), com setas, arraste, âncoras e menu "Ir para" | Descoberta por categoria (padrão marketplace) |
| **Anúncios da comunidade** | Carrossel com produtos cadastrados pelos usuários + CTA "Anunciar também" | Fecho do ciclo vendedor/comprador |

**Avaliação sênior:**

✅ **Pontos fortes**
- **Hero editável pelo admin** (Convex `settings.getHero`): conteúdo institucional não está hardcoded — padrão de CMS que evita deploy para mudar texto.
- **URL como fonte de verdade**: categoria, busca, preço e ordenação vivem em `searchParams` — o estado de filtro é *deep-linkable*, compartilhável e sobrevive ao reload/back-forward (padrão de e-commerce real).
- **Dois modos de navegação bem separados**: `browseMode` (carrosséis) vs. modo filtrado (grid) — a decisão é declarativa e legível.
- **Skeletons por formato**: carrossel mostra skeleton em forma de carrossel; grid mostra skeleton de grid — reduz salto de layout (CLS).

⚠️ **Oportunidades**
- A colagem de produtos do hero usa 3 produtos fixos (`slice(0, 3)`) — ideal seria destacar produtos com selo "Oferta".
- O hero não tem imagem de fundo/vídeo — o uso de blur ou gradiente sutil poderia aumentar a personalidade visual (já existe base com `blur-3xl`).
- Não há trilha de navegação (*breadcrumb*) nem "ofertas do dia" — itens de alta conversão em marketplaces.

### 1.2 Anatomia do Card de Produto — `src/components/store/ProductCard.tsx`

O card segue a anatomia clássica de marketplace (Shopee/AliExpress/Amazon), com camadas de informação do mais escaneável ao mais específico:

```
┌─────────────────────────────────┐
│  [Novo] [Oferta]        ❤️      │  ← camada 1: selos + ação de desejo
│  ┌───────────────────────────┐  │
│  │        IMAGEM 1:1         │  │  ← camada 2: produto (hover: zoom 1.04)
│  └───────────────────────────┘  │
│  Categoria (chip)               │  ← camada 3: contexto
│  Título (máx. 2 linhas)         │  ← camada 4: identidade do item
│  ★★★★☆ (4,2) · 128             │  ← camada 5: prova social
│  ~~R$ 15,90~~  [-18%]           │  ← camada 6: ancoragem de preço
│  R$ 12,90                       │  ← camada 7: preço atual (ênfase)
│  em até 3x de R$ 4,30 sem juros │  ← camada 8: parcelamento (novo)
│  🚚 Frete grátis                │  ← camada 9: gatilho de gratuidade (novo)
│  [👁] [➕]                       │  ← camada 10: ações (visão rápida/carrinho)
└─────────────────────────────────┘
```

**Decisões de design já presentes:**
- Imagem em `aspect-square` com `object-contain` e fundo branco — uniformiza produtos de proporções diferentes.
- `line-clamp-2` no título: evita linhas desiguais entre cards (grade alinhada).
- Preço em `text-xl font-bold` na cor primária: hierarquia visual imediata.
- Selos "Novo / Oferta / Esgotando" com cores distintas (`product-tags.ts`).
- Botões de ação (visão rápida + carrinho) surgem no fluxo do olho após o preço.

**Melhorias implementadas nesta análise (ver §5.1):** badge de **% de desconto** (ex.: `-18%`), **parcelamento simulado** (3x/6x/12x conforme faixa de preço) e indicador de **frete grátis** — os três são gatilhos clássicos de conversão em e-commerce brasileiro.

### 1.3 Psicologia das Cores e Gatilhos — `src/index.css`

**Paleta (CSS variables em OKLCH, tema claro + escuro via `next-themes`):**

| Token | Valor (claro) | Leitura psicológica |
|---|---|---|
| `--background` | `oklch(0.975 0.006 80)` | Off-white **quente** — acolhedor, menos "frio" que branco puro |
| `--primary` | `oklch(0.55 0.15 40)` | **Âmbar/terracota** — quente, alto contraste com o fundo, associado a energia e preço justo |
| `--foreground` | `oklch(0.24 0.02 45)` | Marrom-escuro quente (não preto puro) — reduz fadiga visual |
| `--destructive` | vermelho | **Urgência/escassez** (selo "Esgotando", remover item) |
| `--chart-2`/verde (`emerald`) | verde | **Confiança/gratuidade** (frete grátis, "em estoque") |

**Gatilhos de conversão mapeados no produto:**

| Gatilho | Implementação |
|---|---|
| **Escassez** | Selo "Esgotando" automático quando estoque ≤ 3 |
| **Urgência** | Selo "Oferta" + preço antigo riscado + badge `-X%` |
| **Novidade** | Selo "Novo" |
| **Ancoragem de preço** | Preço antigo riscado antes do preço atual (efeito âncora de Kahneman/Tversky) |
| **Prova social** | Estrelas + número de avaliações em todos os cards |
| **Gratuidade** | "Frete grátis" (custo zero percebido) |
| **Parcelamento** | "em até 12x sem juros" (reduz o custo percebido) |
| **Reciprocidade/descoberta** | Modo escuro, micro-animações Framer Motion (hover, spring no badge do carrinho) |

---

## 2. Arquitetura e Estrutura de Componentes

### 2.1 Árvore de Componentes — `src/main.tsx`

```
createRoot
└─ <RootErrorBoundary>                       ← guarda contra tela branca
   └─ <ToolbarErrorBoundary><VlyToolbar/></ToolbarErrorBoundary>
      └─ <ThemeProvider>                     ← next-themes (claro/escuro)
         └─ <ConvexAuthProvider>             ← auth + backend reativo
            ├─ <AuthBootstrap/>              ← promove 1º admin
            ├─ <CatalogBootstrap/>           ← seed do catálogo / correção de imagens
            ├─ <BrowserRouter>
            │  ├─ <RouteSyncer/>
            │  └─ <CartProvider>             ← estado do carrinho (localStorage)
            │     └─ <FavoritesProvider>     ← favoritos (localStorage)
            │        └─ <Suspense>           ← code splitting por rota
            │           └─ <Routes>
            │              ├─ "/"            → HomePage
            │              │   ├─ <Header> → <MegaMenu>, <SearchBar>, notificações…
            │              │   ├─ Hero (settings.getHero + colagem de produtos)
            │              │   ├─ <CategoryFilter> + <SortSelect> + faixa de preço
            │              │   ├─ <CategoryCarousel> → <ProductCarousel> → <ProductCard>
            │              │   │   └─ <ProductCard> → <ProductImage>, <FavoriteButton>,
            │              │   │       <StarRating>, <ProductQuickView>
            │              │   ├─ <Footer>
            │              │   └─ <CartDrawer>
            │              ├─ "/produto/:id" → ProductPage
            │              ├─ "/carrinho" | "/checkout" | "/pedido/:id"
            │              ├─ "/conta" | "/anunciar" | "/admin" | "/auth" | "*"
            │              └─ …
            └─ <Toaster>                     ← sonner (feedback global)
```

**Princípios observados:**
- **Separação clara**: `components/ui/*` (shadcn, atômicos) ↔ `components/store/*` (domínio do e-commerce) ↔ `components/layout/*` (chrome do app).
- **Estado dividido por natureza**: dados de servidor no **Convex** (queries reativas — nada de duplicar no cliente), estado de sessão no **localStorage** (carrinho/favoritos) via Context Providers.
- **Code splitting por rota** com `React.lazy` — cada página é um chunk próprio.
- **Reutilização real**: `ProductCarousel` é usado pela vitrine por categoria e pela seção da comunidade; `ProductCard` é compartilhado entre grid, carrosséis e visão rápida.

### 2.2 Estrutura de Dados (Mock API) — `src/convex/schema.ts` e `src/convex/products.ts`

O projeto não usa mock estático: o **backend real (Convex)** é semeado a partir de duas fontes na primeira carga:

```
products.seed (action)
├─ CURATED_PRODUCTS (6 anúncios curados do portal)
│   └─ imagem = foto real do produto (Unsplash / Wikimedia Commons)
└─ fetch("https://fakestoreapi.com/products")   ← mock API pública
    ├─ price USD → BRL (× 5.2, arredondado)
    ├─ categoria remapeada (electronics → "Eletrônicos e gadgets", etc.)
    └─ bulkInsert (internalMutation)
```

**Formato do documento `Product` (tabela `products`):**

```ts
{
  _id: Id<"products">,
  title: string,          // título do anúncio
  description: string,    // descrição completa (usada na busca)
  price: number,          // preço atual em R$
  oldPrice?: number,      // preço antigo → desconto riscado
  tags?: string[],        // selos: "Novo" | "Oferta" | "Esgotando"
  category: string,       // uma das 8 categorias do portal
  image: string,          // URL externa OU storageId (Convex Storage)
  rating: { rate: number, count: number },
  stock: number,          // usado no selo "Esgotando" (≤ 3) e no checkout
  status: "active" | "inactive",
  sellerId?: Id<"users">, // undefined = produto semeado pela API
  _creationTime: number,
}
```

**Observações de arquitetura:**
- Imagens externas passam por `resolveProduct` → se for `storageId`, converte em URL via `ctx.storage.getUrl`. Suporta tanto anúncios com upload (Convex Storage) quanto catálogo com URL.
- `categories` é derivado de dados reais (`new Set(products.map(p => p.category))`) — o menu e o mega menu nunca ficam dessincronizados do catálogo.
- Migrações idempotentes (`enrichCatalog`, `fixCatalogImages`) garantem evolução do schema sem reset do banco.

---

## 3. Funcionalidades e Interatividade Específica

### 3.1 Sistema de Busca e Filtros (Facetas) — `SearchBar.tsx`, `HomePage.tsx`

**Como funciona hoje (estado da URL = fonte de verdade):**

| Faceta | Parâmetro | Implementação |
|---|---|---|
| Busca textual | `?q=` | `SearchBar` com **debounce de 300ms** (`useDebounce`); busca em título + descrição + nome da categoria |
| Categoria | `?categoria=` | Chips em `CategoryFilter`; no backend o filtro roda no `products.list` |
| Faixa de preço | `?min=` / `?max=` | Campos R$ De/Até, validados com `Number.isFinite` |
| Ordenação | `?ordem=` | 6 opções: relevância, nome A–Z/Z–A, menor/maior preço, melhor avaliados |
| Só favoritos | `?favoritos=1` | Toggle com `Switch` filtrando pelos IDs do `FavoritesProvider` |

**Vantagens do modelo atual:** cada filtro é independente e combinável; back/forward do navegador funciona; o link pode ser compartilhado com o estado exato.

**Gaps típicos de marketplace (recomendações de evolução):**
- **Facetas com contagem** ("Acessórios para celular · 12") — reduz atrito ao mostrar quantos resultados cada opção tem.
- **Filtro por avaliação mínima** (4★+, 3★+) e **por selo** (Só ofertas).
- **Busca com sugestões/autocomplete** (o debounce já prepara o terreno para chamar um índice de busca como Algolia/Typesense no futuro).

### 3.2 Ofertas Relâmpago (Contadores)

**Status atual:** ❌ não implementado. Existe o selo "Oferta" com preço riscado, mas sem temporizador.

**Proposta de design (padrão de mercado):**
- Seção "Ofertas relâmpago" no topo do catálogo com cards destacados (fundo escuro/âmbar, borda de urgência).
- Cada oferta possui `expiresAt` — o contador regressivo (HH:MM:SS) é o gatilho de **escassez temporal** (mais forte que escassez de estoque).
- Dados: novo campo `dealEndsAt?: number` na tabela `products` (ou tabela `deals`), preenchido no admin.

**Esqueleto do contador (hook reutilizável):**

```tsx
function useCountdown(target: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor(diff / 60_000) % 60,
    seconds: Math.floor(diff / 1000) % 60,
  };
}
```

*(Componente pronto para implementar na próxima iteração.)*

### 3.3 Infinite Scroll e Lazy Loading

**Status atual:**
- ✅ **Lazy loading de imagens**: `ProductImage` usa `loading="lazy"` nativo + fallback amigável no erro.
- ✅ **Lazy loading de rotas**: `React.lazy` + `Suspense` em todas as páginas.
- ❌ **Infinite scroll**: a listagem carrega todos os produtos de uma vez (`ctx.db.query("products").collect()`).

**Recomendação:** com ~26 produtos atuais o volume é baixo, mas para escala a query deveria ser paginada (`paginate()` no Convex) e a UI usar `IntersectionObserver` (a dependência `react-intersection-observer` já está no projeto) para carregar o próximo lote ao rolar — substituindo o "Ver todos" do grid. O catálogo por categoria em carrossel já resolve a descoberta sem paginação.

---

## 4. Performance e SEO (Crucial para E-commerce)

### 4.1 Otimização de Carregamento

**Já implementado:**
- **Code splitting por rota** (`React.lazy`) + **vendor chunks** no `vite.config.ts` (react, convex, radix-ui, framer-motion, recharts, forms em arquivos separados) — primeira pintura carrega só o necessário.
- **Skeletons** em todos os estados de carregamento (grid e carrossel) — sem layout shift brusco.
- **Imagens `loading="lazy"`** fora do primeiro viewport.
- **`sourcemap: false`** em produção (menor payload).
- **Queries reativas do Convex** com cache automático (JWT + invalidação por dependência).

**Oportunidades de melhoria:**
- **Preload** das 3 imagens da colagem do hero (LCP) com `<link rel="preload">`.
- **Dimensões fixas nas imagens** (`aspect-square` já evita CLS) — falta `width`/`height` nos `<img>` para navegadores antigos.
- **Fonte com `font-display: swap`** (se houver webfont) para não travar a renderização.

### 4.2 SEO para E-commerce

**Diagnóstico inicial (corrigido nesta análise):** o `index.html` era genérico — `lang="en"`, título "Custom Web App", sem `meta description`, sem Open Graph, sem `theme-color`.

**Correções aplicadas em `index.html`:**
- `lang="pt-BR"` (sinaliza idioma para buscadores e leitores de tela).
- `<title>` e `meta description` otimizados para o nicho (eletrônicos e acessórios).
- **Open Graph** (`og:type`, `og:locale`, `og:site_name`, `og:title`, `og:description`) para compartilhamento bonito no WhatsApp/redes.
- `meta theme-color` alinhado à cor primária (borda do navegador mobile).

**Recomendações para a próxima fase (limite de um SPA client-side):**
1. **JSON-LD `Product`** na página de produto (nome, preço, disponibilidade, avaliação) — habilitaria *rich results* no Google.
2. **Meta tags dinâmicas por rota**: um componente `Seo` que atualiza `document.title`/`meta[name=description]` via `useEffect` em cada página (título = nome do produto no detalhe).
3. **`sitemap.xml` + `robots.txt`** na raiz pública.
4. Para indexação real de conteúdo dinâmico: **pré-renderização** (SSG/SSR via Vite + `vite-plugin-ssr`/SSR no Node, ou gerar um snapshot estático) — hoje o conteúdo é montado em JS, o que exige renderização no servidor para o Googlebot.

---

## 5. "Mão na Massa" (Geração de Código)

### 5.1 Gerando o Card de Produto — `src/components/store/ProductCard.tsx`

A versão final incorpora os gatilhos analisados em §1.2/§1.3. Trecho-chave do bloco de preço/benefícios:

```tsx
const discountPercent = discount
  ? Math.round((1 - product.price / (product.oldPrice as number)) * 100)
  : 0;

const installment =
  product.price >= 300
    ? { times: 12, value: product.price / 12 }
    : product.price >= 150
      ? { times: 6, value: product.price / 6 }
      : product.price >= 50
        ? { times: 3, value: product.price / 3 }
        : null;

// JSX (resumido)
{discount && (
  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
    <span className="line-through">{formatPrice(product.oldPrice as number)}</span>
    <span className="rounded-full bg-emerald-600/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
      -{discountPercent}%
    </span>
  </p>
)}
<p className="text-xl font-bold tracking-tight text-primary">
  {formatPrice(product.price)}
</p>

{installment && (
  <p className="text-[11px] text-muted-foreground">
    em até <span className="font-semibold text-foreground">
      {installment.times}x de {formatPrice(installment.value)}
    </span> sem juros
  </p>
)}
<p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
  <Truck className="size-3" /> Frete grátis
</p>
```

**O que cada linha entrega ao funil:**
- `-X%` em verde: **economia imediata** (âncora + urgência).
- Parcelamento proporcional ao valor: **redução do custo percebido**.
- Frete grátis: **gratuidade** — maior gatilho de conversão em e-commerce BR.
- Tudo com `text-[11px]` discreto: benefícios sem roubar a hierarquia do preço.

### 5.2 Gerando o Mega Menu / Header — `src/components/layout/MegaMenu.tsx`

Novo componente integrado ao `Header` (desktop). Estrutura:

```
<DropdownMenu>                              ← Radix UI (já no projeto)
├─ <DropdownMenuTrigger>  "Categorias ▾"    ← botão ghost no nav
└─ <DropdownMenuContent w-[680px]>
   ├─ Label "Navegar por categoria"
   ├─ Grid 2 colunas
   │  └─ Por categoria (dados REAIS do Convex):
   │     [ícone]  Nome da categoria
   │              descrição curta ("Capas, películas e proteções")
   │     → Link para /?categoria=… (catálogo já filtrado)
   └─ Rodapé: "Ver catálogo completo" | "Anunciar produto"
```

Destaques da implementação:
- **Fonte única de verdade**: `useQuery(api.products.categories)` — se o catálogo ganhar categoria nova, o menu ganha sozinho.
- **Ícones por categoria** reutilizando `CATEGORY_ICONS` (mesmo mapa dos chips e carrosséis) — consistência visual em todo o app.
- **Fechamento automático** ao clicar (Radix) e **estado de carregamento** com skeleton.
- Link direto ao **catálogo filtrado** — reduz o número de cliques do "quero achar X" ao "comprei X".

---

*Documento elaborado com base no código-fonte real do projeto (arquivos citados entre parênteses). Projeto final desenvolvido por Renato Silva.*
