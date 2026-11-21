import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    // Retrieve the logged-in user session
    const authSession = await auth.api.getSession({
      headers: headersList,
    })

    // Extract booking details submitted from the checkout form
    let appointmentId = ''
    let serviceName = 'Salon Service'
    let amount = 0
    let formEmail = ''

    try {
      const formData = await request.formData()
      appointmentId = String(formData.get('appointmentId') || '').trim()
      serviceName = String(formData.get('serviceName') || 'Salon Service').trim()
      amount = Number(formData.get('amount') || 0)
      formEmail = String(formData.get('email') || '').trim()
    } catch {
      // Ignore if request body is not formData
    }

    const customerEmail =
      authSession?.user?.email?.trim() || formEmail || undefined

    // Create Stripe Checkout Session with dynamic service amount and appointment metadata
    const session = await stripe.checkout.sessions.create({
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      line_items:
        amount > 0
          ? [
              {
                price_data: {
                  currency: 'usd',
                  product_data: {
                    name: serviceName,
                  },
                  unit_amount: Math.round(amount * 100),
                },
                quantity: 1,
              },
            ]
          : [
              {
                price: 'price_1Ue9nG9HzANSlDbAClZoTtK4',
                quantity: 1,
              },
            ],
      mode: 'payment',
      // Store appointmentId in metadata to update paymentStatus after checkout
      metadata: {
        appointmentId,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      integration_identifier: 'salon_book_web_001',
    })

    return NextResponse.redirect(session.url as string, 303)
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Something went wrong'
    const statusCode =
      typeof err === 'object' &&
      err !== null &&
      'statusCode' in err &&
      typeof (err as { statusCode?: unknown }).statusCode === 'number'
        ? (err as { statusCode: number }).statusCode
        : 500

    return NextResponse.json(
      { error: message },
      { status: statusCode }
    )
  }
}