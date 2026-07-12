# EngageBot

A smart engagement bot SaaS for content creators on Instagram and TikTok. The tool centralizes all comments from both platforms into a single feed, prioritizes the most relevant ones, and suggests personalized responses in the creator's own tone of voice — AI-generated, human-approved.

## Features

- **OAuth Connection for Instagram + TikTok**: Connect your account with 1 click using official APIs (Instagram Graph API + TikTok Display API)
- **Unified Comment Feed**: All comments from both platforms in one place, ordered by relevance
- **Voice Tone Calibration**: 5-minute onboarding to calibrate AI response style to your voice
- **AI Response Suggestions**: For each comment, the system suggests 1-2 responses in your calibrated tone
- **Basic Spam Filter**: Automatically detects and hides spam comments
- **Usage Dashboard**: Shows comments replied to, suggestions used, and remaining plan limit
- **Automatic Welcome DM**: Sends personalized DMs to new followers or first-time commenters
- **Weekly Email Report**: Automatic weekly reports with engagement analytics

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Railway
- **Payments**: Stripe
- **Email**: Resend
- **AI**: Nemotron-3.5-content-safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Railway account
- Supabase account
- Stripe account
- Instagram Developer account
- TikTok Developer account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/engagebot.git
cd engagebot
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Configure your environment variables in `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Instagram OAuth Configuration
INSTAGRAM_APP_ID=your-instagram-app-id
INSTAGRAM_APP_SECRET=your-instagram-app-secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/auth/instagram/callback

# TikTok OAuth Configuration
TIKTOK_CLIENT_KEY=your-tiktok-client-key
TIKTOK_CLIENT_SECRET=your-tiktok-client-secret
TIKTOK_REDIRECT_URI=http://localhost:3000/api/auth/tiktok/callback

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
STRIPE_PRO_PRICE_ID=price_your-pro-plan-price-id
STRIPE_ENTERPRISE_PRICE_ID=price_your-enterprise-plan-price-id

# AI Service Configuration
AI_SERVICE_API_KEY=your-ai-service-api-key
AI_SERVICE_BASE_URL=https://api.ai-service.com/v1

# Email Configuration
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=hello@yourapp.com
```

5. Set up the database:
```bash
# Apply Supabase migrations
supabase db push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## Deployment

### Railway Deployment

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Run the deployment script:
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Manual Railway Deployment

1. Initialize Railway project:
```bash
railway init
```

2. Link to your project:
```bash
railway link
```

3. Set environment variables in Railway dashboard:
```bash
railway variables
```

4. Deploy:
```bash
railway up
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `INSTAGRAM_APP_ID` | Instagram app ID | Yes |
| `INSTAGRAM_APP_SECRET` | Instagram app secret | Yes |
| `INSTAGRAM_REDIRECT_URI` | Instagram OAuth redirect URI | Yes |
| `TIKTOK_CLIENT_KEY` | TikTok client key | Yes |
| `TIKTOK_CLIENT_SECRET` | TikTok client secret | Yes |
| `TIKTOK_REDIRECT_URI` | TikTok OAuth redirect URI | Yes |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | Yes |
| `STRIPE_PRO_PRICE_ID` | Stripe Pro plan price ID | Yes |
| `STRIPE_ENTERPRISE_PRICE_ID` | Stripe Enterprise plan price ID | Yes |
| `AI_SERVICE_API_KEY` | AI service API key | Yes |
| `AI_SERVICE_BASE_URL` | AI service base URL | Yes |
| `RESEND_API_KEY` | Resend API key | Yes |
| `RESEND_FROM_EMAIL` | From email for Resend | Yes |

## API Documentation

### Authentication Endpoints

- `GET /api/auth/user` - Get current user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/signup` - Sign up user

### OAuth Endpoints

- `GET /api/auth/instagram` - Initiate Instagram OAuth
- `GET /api/auth/instagram/callback` - Instagram OAuth callback
- `GET /api/auth/tiktok` - Initiate TikTok OAuth
- `GET /api/auth/tiktok/callback` - TikTok OAuth callback

### Comments Endpoints

- `GET /api/comments` - Get user comments
- `POST /api/comments/spam` - Mark comment as spam
- `POST /api/comments/respond` - Respond to comment

### AI Endpoints

- `POST /api/ai/generate-response` - Generate AI response

### Stripe Endpoints

- `POST /api/stripe/checkout` - Create checkout session
- `POST /api/stripe/webhook` - Handle Stripe webhooks

### Health Check

- `GET /api/health` - Health check endpoint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please email support@engagebot.com or create an issue in the repository.