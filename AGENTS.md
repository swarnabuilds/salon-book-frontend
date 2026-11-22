<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook agent notes

## Scope and sources

- Assignment 9 / Category 002 ("SalonBook"). Requirements: https://docs.google.com/document/d/1loJE_WDMtD4_vy2g-hb19i_z8PBJa8Dy-GfLqDHmPpw/edit?tab=t.0
- Next.js 16 App Router frontend (React 19, Tailwind 4, shadcn `base-nova`, React Compiler enabled via `next.config.ts`).
- The Express/Mongo REST API is **not in this repo**. During development it lives at `C:\salon-book-backend` (outside this repo), runs under nodemon, and listens on port 5000. Start it before testing any data flow; `NEXT_PUBLIC_API_URL` defaults to `http://localhost:5000`.
- This Next app owns authentication (Better Auth + MongoDB adapter), Stripe checkout session creation, and the Stripe webhook. The backend owns services, appointments, transactions, user blocking, and its own session checks.

## Commands

- `npm install` — use npm; lockfile is `package-lock.json` (ignore the yarn/pnpm/bun commands in the README).
- `npm run dev` — Next dev with Turbopack.
- `npm run build` / `npm run start`.
- `npm run lint` — ESLint flat config; currently exits 1 on known baseline issues (below). For a clean signal on your own work, run `npx eslint "path/to/file.tsx"` instead.
- `npx tsc --noEmit` — there is no `typecheck` script.
- No test framework, CI workflow, or formatter config exists; verify with targeted lint, typecheck, and manual flows.

### Type-check gotcha after adding a route or layout

`next dev` writes generated routes to `.next/dev/types/`, while `next build` writes them to `.next/types/`. After adding a new route/layout, a stale `.next/types/validator.ts` can make `tsc` fail with `Type 'Route' does not satisfy the constraint 'LayoutRoutes'` even though the source is correct. Fix by deleting the stale directory (`rm -rf .next/types`) and rerunning `npx tsc --noEmit`, or by rebuilding.

## Known baseline lint failures (not your regression)

- `npm run lint` exits 1: two `react-hooks/set-state-in-effect` errors in `src/components/ui/carousel.tsx` and `src/hooks/use-mobile.ts` (generated shadcn code), plus many `@next/next/no-img-element` warnings. Targeted ESLint on app code reports 0 errors.

## Environment

`.env` is gitignored. Variable names used by this app:

- `MONGO_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_URL` — Express API; defaults to `http://localhost:5000`
- `NEXT_PUBLIC_IMGBB_API_KEY` — image uploads (`src/lib/uploadImage.ts`)
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET` — required by `src/app/api/webhooks/stripe/route.ts`; not present in the local `.env` yet (Stripe CLI `stripe listen` supplies a development signing secret).
- `BETTER_AUTH_SECRET` is also sent as the `x-internal-secret` header to the backend's payment-status PATCH; the two apps must use the same value.

## Architecture / data flow

- Route groups: `src/app/(root)` public pages with Navbar/Footer, `src/app/(auth)` signin/signup, `src/app/(dashboard)` authenticated dashboard.
- Server-side guards: `src/app/(dashboard)/dashboard/layout.tsx` checks session + blocked status; `admin/layout.tsx` and `customer/layout.tsx` enforce the role. Dashboard pages additionally call `authClient.useSession()` and redirect client-side. Role landing: `/dashboard/admin` vs `/dashboard/customer`. Do not rely on hiding links alone.
- Auth lives in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client). Better Auth route: `src/app/api/auth/[...all]/route.ts`; users are stored in the hard-coded MongoDB database `salon-book-system`.
- Better Auth custom user fields: `role` (default `customer`) and `isBlocked` are `input: false`, so signup cannot set them; `phone` is a regular editable field. Promote admins directly in MongoDB/backend data.
- Profile updates use `authClient.updateUser({ name, image, phone })`. There is no `PATCH /users/profile` endpoint; never send `role` or `isBlocked` from a profile form.
- Only `role === "customer"` can book; `ServiceDetailsView` intentionally blocks admins from booking.
- Backend verifies sessions by forwarding the request cookie to `${AUTH_URL}/api/auth/get-session` (`AUTH_URL` = `BETTER_AUTH_URL`/`CLIENT_URL`), so fetches from browser code need `credentials: "include"`, and server routes need to forward `headers().get('cookie')`.
- REST helpers: `src/lib/api/serviceApi.ts`, `src/lib/api/userApi.ts`, `src/lib/api/transactionApi.ts`, and `src/lib/action/{serviceActions,appointmentActions}.ts`. List responses may be a raw array or `{ data: [...] }`; handle both. Shared helpers: `src/lib/serviceCategories.ts`, `src/lib/formatServiceDuration.ts`, `src/lib/uploadImage.ts`.
- Services: admin-only create/update/delete and `?includeInactive=true`; public browse shows active only. Service images are ImgBB uploads, not URLs.
- Appointments: default `pending`/`unpaid`. Customers see only their own records (backend scopes by session email); admins see all. Customers may cancel only their own pending appointments; only admins confirm/complete or cancel confirmed ones.
- Payments: `/checkout` posts to `/api/checkout_sessions`, which verifies the signed-in customer, loads the appointment from the backend (`GET /appointments/:id` with forwarded cookie), rejects non-confirmed/paid appointments, and uses the DB `servicePrice` (never a browser-supplied amount) for Stripe. Stripe redirects to `/success`. `/api/webhooks/stripe` verifies the signature with `STRIPE_WEBHOOK_SECRET` and PATCHes the appointment; `/success` also verifies via Stripe session retrieval as a fallback. Both use the `x-internal-secret` header; the backend creates the transaction record.
- Currency: service prices display `৳`; Stripe checkout and transactions use USD (`$`) because checkout is created with `currency: 'usd'`.
- Service categories are hard-coded as `REQUIRED_CATEGORIES` in `src/app/(root)/services/page.tsx`, with legacy normalization for `Skin & Facial`. Keep new values aligned with backend data.

## Routes and conventions

- Canonical routes: `/`, `/services`, `/services/[id]`, `/signin`, `/signup`, `/checkout`, `/success`, `/dashboard/{admin,customer}/...`.
- Stale links still point to `/browse-services` and `/sign-in` in `src/app/(auth)/{signin,signup}/page.tsx`, `src/components/home/BannerSection.tsx`, and `src/components/layout/Footer.tsx`. Those routes do not exist; use `/services` and `/signin`. The dashboard guard redirects unauthenticated users to `/signin` (not `/login`).
- Next 16: `params` and `searchParams` are Promises in server components — `await` them (see `/checkout` and `/success`). Request interception goes in `src/proxy.ts`; Next 16 renamed `middleware.ts` to `proxy.ts`.
- Styling: Tailwind 4 in `src/app/globals.css` (`@import "tailwindcss"`); no `tailwind.config` or `postcss.config`. `next.config.ts` wires `@tailwindcss/turbopack`.
- UI primitives in `src/components/ui` are shadcn-generated (`components.json` style `base-nova`) and import `cn` from the `cn` package, not `@/lib/utils` (which only re-exports it).
- The README is create-next-app boilerplate and its paths are stale; `src/app/(root)/page.tsx` is the real home page.
