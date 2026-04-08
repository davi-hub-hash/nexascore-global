# Deploy NexaScore na Vercel

## 1. Variáveis de Ambiente (Environment Variables)

No painel da Vercel, vá em **Settings → Environment Variables** e adicione:

### Obrigatórias (Frontend)
| Variável | Valor | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | `https://mdjdawranvobzwnlhxza.supabase.co` | URL do backend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOiJIUzI1NiIs...` (sua anon key) | Chave pública do backend |

### Secrets do Backend (já configurados no Lovable Cloud)
Estas chaves já estão configuradas nas Edge Functions e **não precisam** ser adicionadas na Vercel (rodam no servidor):

| Secret | Uso |
|---|---|
| `RESEND_API_KEY` | Envio de e-mails (Resend) |
| `STRIPE_SECRET_KEY` | Pagamentos e assinaturas |
| `STRIPE_WEBHOOK_SECRET` | Validação de webhooks Stripe |
| `LOVABLE_API_KEY` | IA (Gemini via gateway) - funciona automaticamente |

## 2. Configuração do Build

| Campo | Valor |
|---|---|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

## 3. Deploy

```bash
# Opção 1: Conecte o repositório GitHub na Vercel
# Opção 2: CLI
npm i -g vercel
vercel --prod
```

## 4. Notas Importantes

- O **backend (Edge Functions, banco de dados, auth)** continua rodando no Lovable Cloud
- Apenas o **frontend** é servido pela Vercel
- As Edge Functions são deployadas automaticamente pelo Lovable Cloud
- Para domínio customizado, configure o DNS na Vercel
