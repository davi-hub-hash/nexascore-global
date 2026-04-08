# NexaScore - Gestão Financeira Inteligente

Sistema completo de gestão financeira com IA para empresas.

## Stack

- **Frontend:** React 18 + Vite 5 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (Auth, Database, Edge Functions)
- **Pagamentos:** Stripe (Checkout, Portal, Webhooks)
- **IA:** Google Gemini (via Lovable AI Gateway ou chave própria)
- **E-mail:** Resend
- **APIs:** BrasilAPI (consulta CNPJ)

---

## Variáveis de Ambiente

### Frontend (Vite - `.env` na raiz)

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave anon/pública do Supabase | `eyJhbGci...` |

### Backend (Secrets das Edge Functions - configurar no Supabase Dashboard)

| Secret | Descrição | Onde obter |
|---|---|---|
| `STRIPE_SECRET_KEY` | Chave secreta da Stripe | [dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys) |
| `RESEND_API_KEY` | Chave da API Resend | [resend.com/api-keys](https://resend.com/api-keys) |
| `LOVABLE_API_KEY` | Gateway de IA (Gemini) | Fornecido pelo Lovable Cloud |

> **Nota:** `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY` já são injetados automaticamente nas Edge Functions pelo Supabase.

---

## Instalação Local

```bash
# 1. Clone o repositório
git clone <URL_DO_SEU_REPO>
cd nexascore

# 2. Instale as dependências
npm install

# 3. Crie o arquivo .env na raiz
cat > .env << 'EOF'
VITE_SUPABASE_URL=https://SEU_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_ANON_KEY
EOF

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

---

## Build de Produção

```bash
# Gerar a pasta dist/ pronta para deploy
npm run build

# Testar localmente antes de subir
npx vite preview
```

A pasta `dist/` gerada pode ser arrastada diretamente para:
- **Vercel:** `vercel --prod` ou arraste a pasta no dashboard
- **Netlify:** Arraste a pasta `dist/` no dashboard
- **Qualquer CDN/hosting estático**

---

## Deploy na Vercel (Recomendado)

| Campo | Valor |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

Adicione as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` em **Settings → Environment Variables**.

---

## Edge Functions (Backend)

As Edge Functions ficam em `supabase/functions/` e devem ser deployadas no Supabase:

```bash
# Instale o CLI do Supabase
npm i -g supabase

# Login e link
supabase login
supabase link --project-ref SEU_PROJECT_REF

# Deploy de todas as functions
supabase functions deploy
```

### Functions disponíveis:

| Function | Descrição |
|---|---|
| `create-checkout` | Cria sessão de checkout Stripe |
| `check-subscription` | Valida status de assinatura |
| `customer-portal` | Portal de gestão da assinatura |
| `generate-report` | Gera relatórios com IA |
| `analyze-financial` | Análise financeira com IA |
| `process-bank-statement` | Processa extratos OFX/CSV |
| `send-email` | Envia e-mails via Resend |
| `setup-stripe-products` | Cria produtos/preços na Stripe |

---

## Estrutura do Banco de Dados

Tabelas principais: `profiles`, `clients`, `contracts`, `contract_alerts`, `employees`, `positions`, `bank_imports`, `bank_transactions`, `support_tickets`, `support_messages`.

As migrações SQL estão em `supabase/migrations/`.

---

## Planos e Limites

| Recurso | Grátis | Inicial (R$97) | Profissional (R$197) | Premium (R$397) |
|---|---|---|---|---|
| Clientes | 5 | 50 | 200 | ∞ |
| Contratos | 3 | 10 | 50 | ∞ |
| Funcionários | 5 | 20 | 100 | ∞ |
| Importações/mês | 1 | 10 | 50 | ∞ |
| IA | Básica | Básica | Avançada | Completa |

---

## Licença

Projeto privado - Todos os direitos reservados.
