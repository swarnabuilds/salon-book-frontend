import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { auth } from '@/lib/auth'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Redirect URLs come from trusted server configuration, never from Origin or
// Referer headers supplied by a browser.
function getAppUrl() {
  const configuredUrl =
    process.env.BETTER_AUTH_URL ||
    process.env.CLIENT_URL ||
    'http://localhost:3000'

  return String(configuredUrl)
    .split(',')[0]
    .trim()
    .replace(/\/$/, '')
}

interface AppointmentResponse {
  success: boolean
  message?: string
  data?: {
    _id: string
    customerId?: string
    customerEmail?: string
    serviceName?: string
    servicePrice?: number
    status?: string
    paymentStatus?: string
  }
}

export async function POST(request: Request) {
  try {
    const headersList = await headers()

    // Retrieve the logged-in user session
    const authSession = await auth.api.getSession({
      headers: headersList,
    })

    if (!authSession?.user) {
      return NextResponse.json(
        { error: 'Please sign in before paying for an appointment.' },
        { status: 401 }
      )
    }

    if (Boolean((authSession.user as { isBlocked?: boolean }).isBlocked)) {
      return NextResponse.json(
        { error: 'This account is blocked.' },
        { status: 403 }
      )
    }

    const role = String(authSession.user.role || 'customer')
      .trim()
      .toLowerCase()

    if (role !== 'customer') {
      return NextResponse.json(
        { error: 'Only customers can pay for appointments.' },
        { status: 403 }
      )
    }

    // Extract the appointment id submitted from the checkout form. The service
    // name and amount are never trusted from the browser.
    let appointmentId = ''

    try {
      const formData = await request.formData()
      appointmentId = String(formData.get('appointmentId') || '').trim()
    } catch {
      // Ignore if request body is not formData
    }

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Missing appointment reference.' },
        { status: 400 }
      )
    }

    // Ask the Express API for the appointment. The session cookie is forwarded
    // so the API can verify that this appointment belongs to the customer.
    const appointmentRes = await fetch(
      `${API_URL}/appointments/${encodeURIComponent(appointmentId)}`,
      {
        headers: {
          cookie: headersList.get('cookie') || '',
        },
        cache: 'no-store',
      }
    )

    const appointmentBody = (await appointmentRes
      .json()
      .catch(() => null)) as AppointmentResponse | null

    if (!appointmentRes.ok || !appointmentBody?.data) {
      return NextResponse.json(
        {
          error:
            appointmentBody?.message || 'Could not find this appointment.',
        },
        { status: appointmentRes.status === 200 ? 400 : appointmentRes.status }
      )
    }

    const appointment = appointmentBody.data

    // Even though the appointment API already scopes reads to the signed-in
    // customer, verify ownership again before creating a Stripe session.
    const sessionEmail = String(authSession.user.email || '')
      .trim()
      .toLowerCase()
    const appointmentEmail = String(appointment.customerEmail || '')
      .trim()
      .toLowerCase()
    const appointmentCustomerId = String(appointment.customerId || '').trim()
    const ownsAppointment =
      (Boolean(sessionEmail) && appointmentEmail === sessionEmail) ||
      (Boolean(authSession.user.id) &&
        appointmentCustomerId === authSession.user.id)

    if (!ownsAppointment) {
      return NextResponse.json(
        { error: 'You can only pay for your own appointments.' },
        { status: 403 }
      )
    }

    const status = String(appointment.status || 'pending').toLowerCase()
    const paymentStatus = String(
      appointment.paymentStatus || 'unpaid'
    ).toLowerCase()
    const amount = Number(appointment.servicePrice || 0)

    if (status !== 'confirmed') {
      return NextResponse.json(
        { error: 'You can only pay for confirmed appointments.' },
        { status: 400 }
      )
    }

    if (paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'This appointment is already paid.' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'This appointment has an invalid price.' },
        { status: 400 }
      )
    }

    // Create Stripe Checkout Session with the trusted amount from the database
    const session = await stripe.checkout.sessions.create({
      ...(authSession.user.email
        ? { customer_email: authSession.user.email }
        : {}),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: appointment.serviceName || 'Salon Service',
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Store the appointment id in metadata so the verified webhook can mark
      // the appointment as paid and save the transaction.
      metadata: {
        appointmentId,
        customerEmail: authSession.user.email || '',
      },
      success_url: `${getAppUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppUrl()}/checkout?appointmentId=${encodeURIComponent(
        appointmentId
      )}&canceled=true`,
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
