# 🔑 Chaveiro Ocian

Sistema moderno e responsivo para gerenciamento de ordens de serviço do **Chaveiro Ocian**. Desenvolvido com **SvelteKit 5**, **TypeScript** e **Supabase**, projetado para uso ágil em computadores e celulares no balcão de atendimento.

---

## ✨ Funcionalidades

- **📋 Gestão Completa de Ordens de Serviço:**
  - Cadastro rápido de novas ordens com validação em tempo real.
  - Tela de detalhes com todas as informações do pedido (sem exibição de modelo ou prazos desnecessários).
  - Edição de ordens existentes com preenchimento automático.
- **🔍 Busca Rápida:**
  - Filtro em tempo real por **Número da Ordem** ou **WhatsApp** do cliente.
- **🏷 Categorização Visual:**
  - Destaques coloridos por categoria:
    - 🔵 **Carcaça** (Azul)
    - 🟢 **Bateria** (Verde)
    - 🟠 **Serviço** (Âmbar / Laranja)
- **📸 Galeria de Fotos & Anexos:**
  - Envio de múltiplas fotos por ordem (seleção de arquivos ou câmera do celular).
  - Armazenamento automático no **Supabase Storage** (`ordens-imagens`).
  - Visualizador em tela cheia (Lightbox) com navegação por setas, atalhos de teclado e zoom.
- **🗑 Exclusão em Cascata:**
  - Ao excluir uma ordem de serviço, todas as imagens associadas no Supabase Storage são removidas automaticamente.
- **🖨 Impressão de Cupom Térmico (70mm):**
  - Geração de cupom térmico padronizado via `jsPDF`, formatado para impressoras térmicas de 70/80mm com avanço e margens de corte ideais.
- **💬 Envio no WhatsApp:**
  - Formatação automática de mensagem com resumo da ordem para envio ao cliente com um clique.
- **🌓 Suporte a Tema do Sistema (System Theme / Dark Mode):**
  - Detecção nativa do tema do sistema operacional (`prefers-color-scheme`).
  - Botão de alternância rápida no topo (💻 Sistema, 🌙 Escuro, ☀️ Claro).
  - Carregamento sem efeito de tela branca (zero flicker).
- **🚀 Pronto para Deploy no Netlify:**
  - Configurado com `@sveltejs/adapter-netlify` e `netlify.toml` para serverless functions.

---

## 🛠 Tecnologias

- **Frontend:** [SvelteKit 5](https://svelte.dev/) (Runes mode), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Estilo & Ícones:** CSS Vanilla com variáveis customizadas e [Bootstrap Icons](https://icons.getbootstrap.com/)
- **Backend & Banco de Dados:** [Supabase](https://supabase.com/) (PostgreSQL + Storage)
- **Impressão de Documentos:** [jsPDF](https://github.com/parallax/jsPDF)
- **Deploy:** [Netlify](https://www.netlify.com/) (`@sveltejs/adapter-netlify`)
- **Gerenciador de Pacotes:** [pnpm](https://pnpm.io/)

---

## 📁 Estrutura do Projeto

```text
Ocian-Service/
├── netlify.toml               # Configuração de build e deploy no Netlify
├── supabase/
│   └── schema.sql             # Definição das tabelas, RLS e políticas do Supabase
├── src/
│   ├── app.css                # Estilos globais, paleta de cores e temas claro/escuro
│   ├── app.html               # Shell HTML com pré-carregamento do tema sem flicker
│   ├── lib/
│   │   ├── components/        # Componentes reutilizáveis
│   │   │   ├── CurrencyInput.svelte   # Input monetário com máscara R$
│   │   │   ├── ImageLightbox.svelte   # Visualizador de imagens em tela cheia
│   │   │   ├── ImageUploader.svelte   # Upload com thumbnails e câmera
│   │   │   ├── PhoneInput.svelte      # Input de WhatsApp com DDI e validação
│   │   │   └── ThemeToggle.svelte     # Alternador de tema (sistema/escuro/claro)
│   │   ├── services/          # Serviços da aplicação
│   │   │   ├── cupom.ts               # Impressão térmica de 70mm
│   │   │   ├── theme.svelte.ts        # Gerenciador de tema reativo
│   │   │   └── whatsapp.ts            # Formatação de mensagem para envio
│   │   ├── types/
│   │   │   └── ordem.ts               # Tipagens e parser universal de imagens
│   │   ├── utils/
│   │   │   ├── currency.utils.ts      # Utilitários de conversão monetária
│   │   │   └── phone.utils.ts         # Validação e formatação telefônica
│   │   └── supabase.ts        # Cliente Supabase com CRUD e cascata no Storage
│   └── routes/
│       ├── +layout.svelte     # Layout base da aplicação
│       ├── +page.svelte       # Página inicial com listagem e busca
│       ├── nova-ordem/        # Cadastro de nova ordem de serviço
│       └── ordem/[id]/        # Visualização de detalhes e edição
│           ├── +page.svelte
│           └── editar/
│               └── +page.svelte
```

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 20 ou superior)
- [pnpm](https://pnpm.io/) (`corepack enable` ou `npm i -g pnpm`)

### 2. Clonar e Instalar Dependências
```bash
# Entrar no diretório
cd Ocian-Service

# Instalar dependências
pnpm install
```

### 3. Configurar Variáveis de Ambiente
Copie o arquivo de exemplo `.env.example` para `.env`:
```bash
cp .env.example .env
```

Preencha as variáveis com as chaves do seu projeto Supabase:
```env
PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-anon-aqui
```

### 4. Executar Servidor de Desenvolvimento
```bash
pnpm dev
```
Acesse em seu navegador: [http://localhost:5173](http://localhost:5173)

### 5. Compilar para Produção
```bash
pnpm build
```

---

## 🗄 Banco de Dados (Supabase)

O script completo de criação da tabela e do bucket de armazenamento está localizado em [`supabase/schema.sql`](supabase/schema.sql).

### Tabela `ordens`
| Campo | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `BIGSERIAL` | Número identificador único da ordem (Chave Primária) |
| `data_criacao` | `TIMESTAMPTZ` | Data e hora de registro automático |
| `cliente` | `TEXT` | Nome do cliente (opcional) |
| `whatsapp` | `BIGINT` | Número de telefone com DDI e DDD |
| `categoria` | `TEXT` | `Carcaça`, `Bateria` ou `Serviço` |
| `descricao` | `TEXT` | Descrição detalhada do serviço ou peça |
| `imagens` | `JSONB` | Lista de URLs das fotos armazenadas |
| `observacao` | `TEXT` | Observações internas (opcional) |
| `tipo_pagamento`| `TEXT` | `Pix`, `Cartão de Crédito`, `Cartão de Débito`, `Dinheiro`, `A pagar` |
| `valor` | `NUMERIC(10,2)`| Valor total cobrado em R$ |

### Storage Bucket
- **Nome do Bucket:** `ordens-imagens`
- **Acesso:** Público (`public: true`) para visualização direta das fotos anexadas.

---

## 📄 Licença

Este projeto é de uso exclusivo do **Chaveiro Ocian**.
