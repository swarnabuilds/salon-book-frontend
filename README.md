# SalonBook — Client

SalonBook is a role-based salon appointment booking platform. Customers can browse services, request appointments, track their bookings, and pay for confirmed appointments through Stripe. Administrators can manage services, review appointments, manage customers, and monitor payments.

## Important Features

- Public home page with salon banner, featured services, and service categories
- Browse services with name search, category filter, and price sorting
- Protected service details page with appointment booking
- Better Auth email/password and Google sign-in, plus role-based redirects
- Separate customer and admin dashboards with server-side role verification
- Service CRUD with ImgBB image upload and active/inactive control
- Appointment request, confirmation, cancellation, and payment flow
- Stripe Checkout with signature-verified webhook and fallback success verification
- Profile management with name, image, and phone updates
- Loading states, error boundaries, not-found page, and toast notifications
- Fully responsive salon-themed UI

## Technology Stack

- Next.js 16 (App Router)
- React 19 and TypeScript
- Tailwind CSS 4
- Better Auth with MongoDB adapter
- Stripe Checkout
- shadcn/base-nova UI components
- Sonner for toasts

## Installation

```bash
git clone https://github.com/swarnabuilds/salon-book-frontend.git
cd salon-book-frontend
npm install
```

## Run Locally

1. Start the backend API from the server repository (`npm run dev`, port 5000 by default).
2. Create a `.env` file in this folder using the variable names below.
3. Start the frontend:

```bash
npm run dev
```

Open `http://localhost:3000`.

Other commands:

```bash
npm run build
npm run start
npm run lint
npx tsc --noEmit
```

## Required Environment Variables

Names only — never commit actual values.

- `MONGO_URI`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_IMGBB_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

`BETTER_AUTH_SECRET` must be identical in the client and server `.env` files. The Express API and the Stripe webhook use it for internal verification. Use the Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`) during local development to obtain a signing secret.

## Live Website Link

Add the deployed URL here before submission: `https://<your-deployed-salonbook-domain>`

## Repository Links

- Client: https://github.com/swarnabuilds/salon-book-frontend
- Server: https://github.com/swarnabuilds/salon-book-backend

## Deployment Guideline

- Deploy this Next.js app with all environment variables configured in the hosting dashboard.
- Set `BETTER_AUTH_URL` and `CLIENT_URL` (backend) to the deployed client origin.
- Set `NEXT_PUBLIC_API_URL` to the deployed Express API origin.
- Register the Stripe webhook endpoint at `https://<client-domain>/api/webhooks/stripe` and store its signing secret in `STRIPE_WEBHOOK_SECRET`.
- Add the deployed client origin to the backend CORS allowlist.
- Never commit `.env` files or any secret credentials.
- Verify that public routes, private routes after refresh, role redirects, image uploads, and the Stripe test-mode checkout flow all work on the live site.
