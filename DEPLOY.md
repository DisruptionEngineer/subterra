# Subterra — Deploy Instructions

## Quick Deploy (5 minutes)

### Step 1: Create GitHub Repo & Push
Open your terminal, navigate to the `subterra` folder, and run:

```bash
gh repo create subterra --public --source=. --push
```

Or if you don't have the GitHub CLI:
```bash
# Create repo on github.com/new manually, then:
git remote add origin https://github.com/YOUR_USERNAME/subterra.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel
1. Go to https://vercel.com/new
2. Import the `subterra` repo
3. Framework: Next.js (auto-detected)
4. Add these environment variables in Vercel's settings:

| Variable | Where to Get It |
|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | clerk.com → Your App → API Keys |
| `CLERK_SECRET_KEY` | clerk.com → Your App → API Keys |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vwvbtlfifflihiutnctb.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (already in .env.local) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API |
| `STRIPE_SECRET_KEY` | stripe.com → Developers → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | stripe.com → Developers → API Keys |
| `STRIPE_WEBHOOK_SECRET` | stripe.com → Developers → Webhooks (create one pointing to your-app.vercel.app/api/stripe/webhook) |
| `STRIPE_PRICE_STARTER` | `price_1T78e3LHWvGGo72eUZuHCORA` |
| `RESEND_API_KEY` | resend.com → API Keys |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |
| `CRON_SECRET` | Any random string |

5. Click Deploy

### Step 3: Create Service Accounts (if not done)

**Clerk** (auth): https://clerk.com
- Create new application
- Enable Email + Password sign-in
- Copy Publishable Key and Secret Key

**Resend** (email): https://resend.com
- Create account
- Generate API key
- Add your sending domain (or use their test domain)

**Stripe Webhook**:
- Go to stripe.com → Developers → Webhooks
- Add endpoint: `https://your-app.vercel.app/api/stripe/webhook`
- Listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Copy the webhook signing secret

### You're Live!
Visit your Vercel URL — you should see the Subterra landing page.
