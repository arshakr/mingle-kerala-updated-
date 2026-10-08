# Mingle Kerala — MingleKerala.in

**Mingle Kerala / മിംഗിൾ കേരള — bilingual, privacy-first, anonymous 18+ discovery across Kerala.** A Next.js 15 / TypeScript app with a PostgreSQL/Prisma backend, consent-based messaging, realtime Socket.io, user reporting and manual ₹25 UPI activation.

> **Delivery status:** This repository is a substantial application implementation, **not a certified production deployment**. The workspace in which it was generated lacked npm registry / live database / hosting credentials; the dependencies, Prisma migration, full build, API/database integration, and two-client chat E2E flows must be executed and verified before opening registration to real people. See the launch checklist below.

## What is implemented

| Feature | Location |
|---|---|
| Futuristic landing + responsive UI | `app/page.tsx`, `app/globals.css` |
| 18+ and policy acknowledgement | `/activate` and `/register`, server-side Zod validation |
| UPI ₹25 QR/deep link + payment receipt | `/activate`, `/api/activation/*` |
| Manual bank-checked payment moderation | `/admin`, `/api/admin/payments/*` |
| One-use claim code, atomic paid registration | `/api/auth/register` |
| Password hashing (Argon2id), JWT cookie sessions, rotated refresh | `lib/auth.ts`, `/api/auth/*` |
| District / locality / language / interest filtering | `/dashboard`, `/api/discover`, `lib/kerala-locations.ts` |
| English / Malayalam UI switch, saved on device | `components/LocaleProvider.tsx`, key pages |
| Locality visibility opt-in (private by default) | `/dashboard/settings`, `prisma/schema.prisma` |
| Private chat request accept/decline | `/dashboard/requests`, `/api/chat-requests` |
| Persistent 1-to-1 real-time messaging | `/dashboard/messages`, `server/index.ts` |
| Blocking, reporting and moderation | `/api/blocks`, `/api/reports`, `/admin` |
| User privacy settings and soft account deletion | `/dashboard/settings`, `/api/profile`, `/api/account/delete` |
| PWA manifest + public-assets-only service worker | `public/manifest.webmanifest`, `public/sw.js` |
| Neon/Render deployment starter | `render.yaml`, `Dockerfile` |

### Boundaries to understand

- **Payment confirmation is intentionally manual.** A UPI QR/deep link cannot certify that money was received. The admin must examine actual credits and verify matching amount and UTR in their own UPI/bank account before clicking approval. No payment is ever marked paid merely by clicking *I paid*.
- **UPI transactions are NOT anonymous to the payee.** Payment-account identity may be visible to the receiver/provider even though the profile is anonymous to other members.
- **Chats are NOT end-to-end encrypted.** They are stored in PostgreSQL. Use HTTPS in production. No misleading E2EE claims should be made.
- **18+ self-attestation is not identity/age verification.** More robust age assurance / compliance review is needed before a public adult community launch.
- Privacy/terms/refunds drafts must be reviewed and adapted for the actual Indian business entity, contact information, policies, and applicable law.
- Email verification, automated password recovery, guaranteed offline message delivery, production monitoring and automatic UPI confirmation are not included in this version.
- The current Socket.io service is built for one always-on Node instance. Add Redis Socket.io adapter + presence coordination before horizontal scaling. Render Starter is a paid service; review current provider pricing.

## Local Windows / macOS / Linux setup

Requirements: Node.js >=20.9, npm, PostgreSQL (Neon development DB is fine).

```bash
npm install
cp .env.example .env
```

Windows PowerShell equivalent:

```powershell
Copy-Item .env.example .env
```

Edit `.env`. Supply `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ACTIVATION_CODE_SECRET`. Generate **independent** long secrets; for example:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use distinct values for each secret. Next:

```bash
npm run db:generate
npm run db:deploy
npm run db:seed
npm run dev
```

Open **http://localhost:3000**. The Node custom server serves both Next.js and Socket.io on the same origin.

### Local test accounts

To load a few fictional users *only in development*:

```bash
SEED_DEMO_USERS=true npm run db:seed
```

Windows PowerShell:

```powershell
$env:SEED_DEMO_USERS="true"; npm run db:seed
```

Do not use demo users on production. These sample users are made directly by an explicit local-only script; the real signup API **requires verified payment**. The demo password is printed by the seed script. Turn this off before launch.

Create the first administrator with:

```bash
npm run admin:create
```

Do **not** commit `.env`, admin credentials, banking records or server secrets. Admin creation is a trusted CLI-only operation. The first admin can sign in on `/login` and use `/admin`.

## How ₹25 ID activation works

1. The customer is told clearly that the ₹25 is a **mandatory one-time fee**, not a donation.
2. They send ₹25 to `arshaksfi1-1@okicici` using UPI QR or deep link.
3. They submit their email, UPI transaction reference/UTR and policy acknowledgements.
4. Server creates a `Payment` with `PENDING_VERIFICATION`, random secret proof is returned and saved locally in the browser.
5. Admin reviews `/admin` and independently confirms the **actual receiving account credit** and amount/UTR before approving the payment.
6. The user checks status on `/activate`, which requires the payment ID plus secret proof. After approval they receive a derived single-use code.
7. `/register` verifies payment status, proof and claim code. A database transaction creates the account and atomically marks the payment consumed. Reusing a payment fails.
8. Returning members sign in normally for free.

**Limitations:** Users must keep the browser receipt/secret. If browser storage is lost, provide a manual recovery procedure through a verified support channel. Never approve a fabricated receipt, forwarded screenshot, or reused UTR. Avoid asking customers to pay twice during an unresolved check. Automate confirmation later only with a compliant provider's signed webhooks and reconciliation.

## Environment variables

| Variable | Purpose |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | HTTP and Socket.io server port |
| `APP_URL` | Exact canonical origin for CSRF/CORS, e.g. `https://minglekerala.in` |
| `NEXT_PUBLIC_APP_URL` | Public metadata/canonical URL |
| `DATABASE_URL` | Neon PostgreSQL URL with SSL |
| `JWT_ACCESS_SECRET` | At least 32-character cryptographic secret |
| `JWT_REFRESH_SECRET` | Reserved for future signed refresh token architecture; still generated separately |
| `ACTIVATION_CODE_SECRET` | Secret HMAC key used to derive activation codes |
| `UPI_ID` | `arshaksfi1-1@okicici` by default |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | A working mailbox owned/monitored by project operator |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Production server-side rate limiting. Both required in production. |

## Local checks and release gates

```bash
npm run db:generate
npm run lint
npm run typecheck
npm run test
npm run build
```

Run end-to-end two-account testing with a staging Postgres instance. Verify: duplicate payment reference, manual approval/rejection, same payment reused, role enforcement, unauthorized conversation read/write, blocked communications, read receipts, 15-minute token refresh, deletion, report triage, UI on 320px mobile, and payment & login rate limiting.

**Do not declare this production-ready merely because TypeScript files are syntactically valid.** The live database, real payment verification workflow, dependency integrity, accessibility and deployed HTTPS should be tested.

## Production launch: Neon → GitHub → Render → GoDaddy

**Important: this is a paid-registration service.** Vercel's Hobby plan explicitly disallows sites processing payments/used for financial gain. For this implementation use a compatible **paid Render/Railway Node service** or Vercel Pro plus a separate websocket provider. The bundled Render blueprint targets a persistent Node process so Socket.io works without a separate WebSocket deployment.

1. **Neon:** Create a PostgreSQL project. Copy the pooled/appropriate connection string to a secret manager or Render `DATABASE_URL`. Enable SSL per Neon instructions. Do not print or commit the URL.
2. **GitHub:** Create a private repository and push application source. Generate and commit a lockfile after an actual `npm install` in an internet-connected environment; prefer `npm ci` for reproducible subsequent builds.
3. **Render:** Connect the GitHub repository and provision a paid Node Web Service using `render.yaml` (or settings: build `npm install && npm run build`, start `npm run db:deploy && npm run start`, health `/api/health`). Choose a service appropriate for continuous realtime connections. Set the environment variables. Provision Upstash Redis REST and configure both credentials.
4. **Render custom domains:** Add `minglekerala.in` and `www.minglekerala.in`. The Render UI shows the exact DNS values required for each. Add a canonical redirect for `www` → apex at provider or app layer if needed.
5. **GoDaddy DNS:** Enter **the exact A/ALIAS/CNAME records given by Render**, removing conflicting existing records. Do not copy speculative IPs. Leave registrar ownership and MX/email DNS intact.
6. **HTTPS:** Wait until the host's TLS certificate is active, ensure `APP_URL` / `NEXT_PUBLIC_APP_URL` exactly match `https://minglekerala.in`. Verify website, registration, cookies, CSRF, and Socket.io WSS under the real domain.
7. **Admin:** Run trusted `npm run admin:create` with production credentials via a secure shell on the server, or create an audited one-time admin bootstrap job. Don't expose this script over HTTP.
8. **Prelaunch:** Verify actual ₹25 transfer and its admin reconciliation in staging, then use a controlled production penny test only where legitimate. Complete legal/age assurance/privacy risk review and set up a monitored support mailbox, refund process, database backup/restore, alerting, abuse escalation and emergency contact procedures.

### Health checks

- `/api/health` validates DB connectivity (does not expose secrets).
- `/socket.io` runs from the same host/path as the Next UI (not from a serverless function).
- Main route `/`, `/activate`, `/login`, `/register`, `/dashboard`, `/admin`.

### Scalability and operational caveats

- Current chat online status is best effort; client refresh/polling is a resilience fallback. The app creates individual message notifications but does not yet provide aggregate per-chat unread counters or guaranteed delivery in case of disconnection.
- HTTP message fallback persists without Socket.io broadcasting, but a periodic 12-second refresh picks it up.
- Administrative sessions are verified at API call time; websocket messaging rechecks sender account status and authentication version. Sign-out invalidates access and refresh sessions across all devices for that account, and open sockets are disconnected on their next session validation check.
- Schema and policies should be reviewed for concurrency, abuse cases, retention and legal compliance before scaling.
- Please add end-to-end encrypted messaging only with an audited client-side cryptographic protocol and updated moderation model.

## Project structure

- `app/`: marketing/auth/dashboard/admin screens and Next APIs
- `components/`: original reusable UI, avatars and atmosphere
- `lib/`: Prisma, authentication, validation, moderation, throttling
- `server/index.ts`: custom persistent HTTP + Socket.io server
- `prisma/schema.prisma`, `prisma/migrations/`: database schema and initial SQL migration
- `scripts/create-admin.ts`: CLI admin bootstrap
- `render.yaml`: Render web service blueprint
- `Dockerfile`: alternative self-hosted container

## Design preview

A static visual preview can be supplied with this repository for reviewing design without Node/Postgres. It is **not connected to the database** and is **not a production substitute**.

## Mingle Kerala regionalization (October 2026)

- App brand and PWA are **Mingle Kerala / മിംഗിൾ കേരള**. Canonical URL is still `https://minglekerala.in`.
- The EN / മലയാളം switch works on the landing, activation, registration, sign-in, discovery, chats, requests, notifications, privacy settings and admin overview. Legal policies are maintained in English for legal precision; a Malayalam notice flags this. Translate and legally review authoritative policy text before advertising full legal localization. Some system API error messages still originate in English.
- Kerala has all 14 districts in the selector. The **locality field accepts any village, ward, town, panchayat or neighborhood in Malayalam or English**. `lib/kerala-locations.ts` provides popular district-specific suggestions, not a complete official register. Do not restrict free-text input to the suggestions. User-provided district/locality is not geocoded or location-verified.
- `locality` and `showLocality` were added to `User`. Run the new Prisma migration before launching the updated app. All existing accounts get an empty locality and default `showLocality=false`. User locality is only returned in public discovery when `showLocality=true`. Filter-by-place only includes people who opted in. The account owner's `/api/auth/me` sees their own locality regardless.
- Do not ask for house numbers or precise addresses. The service does not confirm residency in Kerala or cryptographically verify age.
