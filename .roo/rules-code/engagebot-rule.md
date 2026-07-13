# EngageBot MVP

EngageBot is a smart engagement bot SaaS for content creators on Instagram and TikTok. The tool centralizes all comments from both platforms into a single feed, prioritizes the most relevant ones, and suggests personalized responses in the creator's own tone of voice — AI-generated, human-approved.

## MVP Features

- OAuth Connection for Instagram + TikTok:
  The user connects their account with 1 click. Nothing works without this. Use official APIs (Instagram Graph API + TikTok Display API).
- Unified Comment Feed:
  All comments from both platforms in one place, ordered by relevance (not by date).
- Voice Tone Calibration:
  5-minute onboarding where the creator chooses adjectives for their style (funny, direct, educational…) and pastes 3 examples of responses they have already given. The model learns.
- AI Response Suggestions:
  For each comment, the system suggests 1–2 responses in the calibrated tone. The user approves, edits, or ignores. This is the Aha Moment — the heart of the product.
- Basic Spam Filter:
  Automatically detects and hides comments with repeated emojis, suspicious links, and bot patterns. Cleans the feed and reduces noise immediately.
- Simple Usage Dashboard:
  Shows comments replied to, suggestions used, and remaining plan limit. Reinforces value and creates an upgrade trigger when the limit is approached.
- Automatic Welcome DM:
  Sends a personalized DM to new followers or first-time commenters.
- Weekly Email Report:
  Automatic email every Monday with: most commented posts, weekly engagement, top commenters.
- A professional UI/UX

## Tech Stack

- Next.js: Frontend + Backend (API Routes)
- Supabase: Database + Auth
- Railway: Deployment
- Stripe: Subscription and billing
- Resend: Transactional emails and reports
- Nemotron-3.5-content-safety (LLM): Response generation with tone of voice

## Color Scheme

- Use this color palette: 9FA1FF, AEE2FF, D9F9DF

## Strategy

1. Write plan with success criteria for each phase to be checked off. Include project scaffolding, including .gitignore, and rigorous unit testing.
2. Execute the plan ensuring all criteria are met.
3. Carry out extensive integration testing with Playwright or similar, fixing defects.
4. Only complete when the MVP is finished and tested, with the server running and ready for use.

## Coding Standard
 . Be concise. Keep README minimal. IMPORTANT: no emojis ever.

