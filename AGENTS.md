<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SalonBook agent notes

## What this repo is

- Next.js 16 App Router frontend for a salon booking system (React 19, Tailwind 4, shadcn `base-nova`, React Compiler enabled).
- The Express/Mongo REST API is **not in this repo**. Services, appointments, profiles, and transactions are fetched from `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:5000`). Start or obtain that backend before testing data flows.
- This Next app owns only authentication (Better Auth + MongoDB adapter) and Stripe checkout.

## Commands

- `npm install` — use npm; the lockfile is `package-lock.json` (ignore the yarn/pnpm/bun commands in the README).
- `npm run dev` — Next dev with Turbopack.
- `npm run build` / `npm run start`.
- `npm run lint` — ESLint flat config.
- `npx tsc --noEmit` — there is no `typecheck` script.
- No test framework, CI workflow, or formatter config exists; verify with lint, typecheck, and manual flows.

## Known baseline failures (do not assume your change caused these)

- `npm run lint` currently exits 1: two `react-hooks/set-state-in-effect` errors in `src/components/ui/carousel.tsx` and `src/hooks/use-mobile.ts`, plus many `<img>` warnings. Both files are generated shadcn code.
- `npx tsc --noEmit` currently fails because `src/app/(dashboard)/dashboard/admin/users/page.tsx` is empty and therefore not a module. The route-type validator reports it.
- The `src/app/(dashboard)/dashboard/admin/page.tsx` overview is also still a placeholder.

## Environment

`.env` is gitignored. Required variables:

- `MONGO_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_URL` — external Express API; defaults to `http://localhost:5000`
- `NEXT_PUBLIC_IMGBB_API_KEY` — profile image uploads
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Architecture / data flow

- Route groups: `src/app/(root)` public pages with Navbar/Footer, `src/app/(auth)` signin/signup, `src/app/(dashboard)` authenticated dashboard.
- Auth lives in `src/lib/auth.ts` (server) and `src/lib/auth-client.ts` (client). The Better Auth route is `src/app/api/auth/[...all]/route.ts`; users are stored in the hard-coded MongoDB database `salon-book-system`.
- Better Auth custom user fields `role` (default `customer`) and `isBlocked` are declared `input: false`, so signup cannot set them. Promote admins directly in MongoDB/backend data.
- `src/app/(dashboard)/dashboard/layout.tsx` performs the server-side session guard. Dashboard pages also call `authClient.useSession()` and redirect client-side; role landing is `/dashboard/admin` vs `/dashboard/customer`.
- Only `role === "customer"` can book; `ServiceDetailsView` intentionally blocks admins from booking.
- REST helpers are in `src/lib/api/serviceApi.ts` and `src/lib/action/*.ts`; some pages fetch `NEXT_PUBLIC_API_URL` directly. Endpoints seen: `/services`, `/services/:id`, `/appointments`, `/appointments/:id`, `/users/profile`, `/transactions`. List responses may be a raw array or `{ data: [...] }`; handle both.
- Stripe flow: `/checkout` posts to `/api/checkout_sessions` → Stripe → `/success`, which verifies the session and PATCHes the appointment's `paymentStatus`.
- Service categories are hard-coded as `REQUIRED_CATEGORIES` in `src/app/(root)/services/page.tsx`, with legacy normalization for `Skin & Facial`. Keep new category values aligned with backend data.

## Routes and conventions

- Canonical routes: `/`, `/services`, `/services/[id]`, `/signin`, `/signup`, `/checkout`, `/success`, `/dashboard/{admin,customer}/...`.
- Several stale links still point to `/sign-in`, `/login`, `/browse-services`, and `/profile`, which do not exist. The dashboard layout also redirects unauthenticated users to `/login`; the real sign-in page is `/signin`. Use the canonical routes instead of copying these.
- Next 16: `params` and `searchParams` are Promises in server components — `await` them (see `/checkout` and `/success`). If adding request interception, use `src/proxy.ts`; Next 16 renamed `middleware.ts` to `proxy.ts`.
- Styling: Tailwind 4 is configured in `src/app/globals.css` (`@import "tailwindcss"`); there is no `tailwind.config` or `postcss.config`. `next.config.ts` wires `@tailwindcss/turbopack`.
- UI primitives in `src/components/ui` are shadcn-generated (`components.json` style `base-nova`) and import `cn` from the `cn` package, not `@/lib/utils` (which only re-exports it).
- The README is create-next-app boilerplate and its paths are stale; `src/app/(root)/page.tsx` is the real home page.
