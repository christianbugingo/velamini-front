# Release Gate Checklist

Use this checklist before every production deploy.

## 1) Build and Quality
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes.
- [ ] TypeScript checks pass (no blocking type errors).
- [ ] Critical tests pass (`npm run test`), especially auth/billing/chat/admin routes.

## 2) Database and Prisma
- [ ] `DATABASE_URL` points to the correct environment.
- [ ] `prisma generate` succeeds.
- [ ] Migrations are applied and verified on target DB.
- [ ] DB connectivity is healthy from app runtime (no repeated upstream connection failures).

## 3) Auth and Routing
- [ ] Logout redirects to `/` from all app areas.
- [ ] `/signin` is redirected to `/` (no broken route hits).
- [ ] `src/proxy.ts` is used (no deprecated `middleware.ts`).
- [ ] Canonical route redirects are working (`/career -> /careers`, `/Dashboard/* -> /dashboard/*`).

## 4) API Hardening
- [ ] Critical endpoints validate request input at runtime (Zod).
- [ ] No unsafe `any` in critical API routes (`billing`, `chat`, `admin stats`, webhook-related routes).
- [ ] Error responses are consistent and avoid leaking internals.
- [ ] Rate limiting and auth checks are present on protected routes.

## 5) Secrets and Environment
- [ ] No secrets in client bundles (`NEXT_PUBLIC_*` only for public values).
- [ ] Required env vars exist: auth, DB, payment, AI provider, webhook configuration.
- [ ] App origin is consistent across environments (no hardcoded `localhost` or old domains).

## 6) Logging and Privacy
- [ ] No raw PII/message-content logging in production paths.
- [ ] Error logs are structured and redacted.
- [ ] Monitoring/alerting captures auth failures, DB failures, and 5xx spikes.

## 7) SEO and Crawl
- [ ] `robots.txt` is valid and published.
- [ ] `sitemap.xml` includes current public routes and blog posts.
- [ ] Metadata/canonical tags are present on key pages.
- [ ] No placeholder domains/emails remain in public-facing copy.

## 8) Operational Checks
- [ ] Health endpoints respond correctly.
- [ ] Maintenance mode behavior is verified.
- [ ] Rollback plan is documented and tested.

## 9) Manual Smoke Test
- [ ] Sign in / sign out.
- [ ] Dashboard loads.
- [ ] Admin stats and billing pages load.
- [ ] Chat request round-trip works.
- [ ] Payment redirect/webhook flow tested in staging.

