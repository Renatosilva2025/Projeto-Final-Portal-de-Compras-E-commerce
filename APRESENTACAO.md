# 🛍️ Portal de Compras PD — Apresentação do Projeto

**Projeto final acadêmico** · Desenvolvido por **Renato Silva**

> E-commerce completo de acessórios e dispositivos eletrônicos, inspirado em
> marketplaces como Shopee e AliExpress. Capas de celular, carregadores,
> notebooks, fones de ouvido, smartphones e muito mais — tudo com preços em
> reais (R$).

---

## 📌 Resumo

O **Portal de Compras PD** é um marketplace funcional de ponta a ponta: o
visitante navega por um catálogo com busca, filtros e ordenação, abre a página
de detalhes de cada produto, avalia com estrelas e comentários, adiciona ao
carrinho, faz checkout com endereço e forma de pagamento (Pix, cartão ou
boleto) e acompanha o pedido. Qualquer usuário pode se cadastrar, comprar e
também **anunciar seus próprios produtos**, com gestão completa de anúncios
em sua conta. O sistema conta ainda com um **painel administrativo** para
controle de produtos, pedidos e usuários.

## ✨ Funcionalidades

- **Catálogo inteligente** — vitrine com **carrosséis por categoria** (estilo
  marketplace), cards responsivos com preço em R$, avaliação e estoque; busca
  com debounce, filtro por categoria e ordenação (preço e avaliação)
  sincronizadas com a URL.
- **Detalhes do produto** — imagem, descrição, vendedor, estoque, avaliação
  com estrelas e seção de comentários (login obrigatório para avaliar).
- **Carrinho de compras** — adicionar, remover, alterar quantidade e total em
  tempo real, com persistência no navegador.
- **Favoritos** — produtos salvos para consulta rápida.
- **Checkout completo** — endereço de entrega, forma de pagamento
  (Pix/cartão/boleto), total calculado no servidor e baixa de estoque.
- **Acompanhamento de pedidos** — confirmação com status, histórico na conta.
- **Venda na comunidade** — qualquer usuário anuncia produtos com upload de
  imagem, edita, pausa/reativa ou remove seus anúncios.
- **Área administrativa** — estatísticas de receita, gestão de produtos,
  controle de status de pedidos e permissões de usuários.
- **Experiência do usuário** — skeletons de carregamento, tratamento de
  erros, toasts, tema claro/escuro e design responsivo.

## 🛠️ Tecnologias

| Tecnologia          | Finalidade                                    |
| ------------------- | --------------------------------------------- |
| React 19            | Interface de usuário (componentização)        |
| TypeScript          | Tipagem estática                              |
| Vite                | Build e desenvolvimento                       |
| React Router 7      | Navegação entre páginas                       |
| Convex              | Backend, banco de dados e storage de imagens  |
| Convex Auth         | Login e cadastro (e-mail/OTP + anônimo)       |
| Tailwind CSS 4      | Estilização                                   |
| shadcn/ui           | Componentes de interface                      |
| Framer Motion       | Animações e micro-interações                  |
| Sonner              | Notificações (toasts)                         |

## 🔗 Acesso

| Recurso        | Link                                                            |
| -------------- | --------------------------------------------------------------- |
| **Código-fonte** | https://github.com/Renatosilva2025/Projeto-Final-Portal-de-Compras-E-commerce |

> Para rodar localmente, siga as instruções do [`README.md`](README.md).

## 🧠 Conceitos aplicados

- Backend como serviço com **Convex**: queries reativas, mutations e actions
- Autenticação com controle de papéis (usuário/administrador)
- Estado global com Context API e persistência em `localStorage`
- Roteamento, componentes reutilizáveis e interface responsiva
- Boas práticas de UX: skeletons, toasts, dark mode e micro-interações

## 🖼️ Créditos das imagens

As fotos do catálogo são ilustrativas e pertencem aos seus respectivos
autores:

- **Unsplash** — fotos de carregador, notebook, fone de ouvido e smartphone
  (licença gratuita para uso comercial, sem atribuição obrigatória).
- **Wikimedia Commons** — foto de capa de celular
  ([Mobile phone case](https://commons.wikimedia.org/wiki/File:Mobile_phone_case.jpg),
  CC BY-SA 4.0) e película de vidro
  ([Screen protector](https://commons.wikimedia.org/wiki/File:Screen_protector.png),
  domínio público).
- **Fake Store API** — demais produtos do catálogo semeado (fotos
  ilustrativas dos produtos da API).

---

*Projeto final desenvolvido por Renato Silva.*
