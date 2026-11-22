import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Stripe calls this endpoint after a payment is completed. The signature is
// verified before anything is written, so a browser cannot fake a payment.
export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature') || ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''
  const internalSecret = process.env.BETTER_AUTH_SECRET || ''

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured.')
    return NextResponse.json(
      { error: 'Webhook is not configured.' },
      { status: 500 }
    )
  }

  if (!internalSecret) {
    console.error('BETTER_AUTH_SECRET is not configured.')
    return NextResponse.json(
      { error: 'Internal authentication is not configured.' },
      { status: 500 }
    )
  }

  let event: Stripe.Event

  try {
    const rawBody = await request.text()
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    )
  } catch (error) {
    console.error('Invalid Stripe webhook signature:', error)
    return NextResponse.json(
      { error: 'Invalid webhook signature.' },
      { status: 400 }
    )
  }

  if (
    event.type !== 'checkout.session.completed' &&
    event.type !== 'checkout.session.async_payment_succeeded'
  ) {
    return NextResponse.json({ received: true, ignored: true })
  }

  const session = event.data.object as Stripe.Checkout.Session

  // Only a genuinely paid session may mark an appointment as paid.
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true, ignored: true })
  }

  const appointmentId = session.metadata?.appointmentId

  if (!appointmentId) {
    console.error('Stripe webhook received without an appointmentId.')
    return NextResponse.json({ received: true, ignored: true })
  }

  const amount =
    typeof session.amount_total === 'number'
      ? session.amount_total / 100
      : undefined
  const currency = session.currency
    ? session.currency.toUpperCase()
    : 'USD'

  try {
    const response = await fetch(
      `${API_URL}/appointments/${encodeURIComponent(appointmentId)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': internalSecret,
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          stripeSessionId: session.id,
          ...(amount !== undefined ? { amount } : {}),
          currency,
        }),
        cache: 'no-store',
      }
    )

    if (!response.ok) {
      const message = await response.text()

      // Replaying the same webhook should not fail the delivery.
      if (!message.toLowerCase().includes('already paid')) {
        console.error('Failed to update appointment payment:', message)
        return NextResponse.json(
          { error: 'Could not update the appointment.' },
          { status: 502 }
        )
      }
    }
  } catch (error) {
    console.error('Stripe webhook update failed:', error)
    return NextResponse.json(
      { error: 'Could not reach the appointment API.' },
      { status: 502 }
    )
  }

  return NextResponse.json({ received: true })
}
