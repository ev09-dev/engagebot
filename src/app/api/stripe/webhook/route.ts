import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription)
        break

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeletion(deletedSubscription)
        break

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSuccess(invoice)
        break

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice
        await handlePaymentFailure(failedInvoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const supabase = createServerSupabaseClient()

  // Get the customer to find the user
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if (!customer || customer.deleted) {
    console.error('Customer not found for subscription:', subscription.id)
    return
  }

  const supabaseUserId = customer.metadata?.supabase_user_id
  if (!supabaseUserId) {
    console.error('No Supabase user ID found for customer:', customer.id)
    return
  }

  // Determine subscription tier based on price
  const priceId = subscription.items.data[0]?.price?.id
  let subscriptionTier = 'free'

  if (priceId) {
    // You should map your price IDs to subscription tiers
    // This is just an example mapping
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
      subscriptionTier = 'pro'
    } else if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) {
      subscriptionTier = 'enterprise'
    }
  }

  // Update the user's subscription tier
  await supabase
    .from('users')
    .update({
      subscription_tier: subscriptionTier,
    })
    .eq('id', supabaseUserId)
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const supabase = createServerSupabaseClient()

  // Get the customer to find the user
  const customer = await stripe.customers.retrieve(subscription.customer as string)
  
  if (!customer || customer.deleted) {
    console.error('Customer not found for subscription:', subscription.id)
    return
  }

  const supabaseUserId = customer.metadata?.supabase_user_id
  if (!supabaseUserId) {
    console.error('No Supabase user ID found for customer:', customer.id)
    return
  }

  // Downgrade to free tier
  await supabase
    .from('users')
    .update({
      subscription_tier: 'free',
    })
    .eq('id', supabaseUserId)
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  // You can implement additional logic here for successful payments
  // For example, sending a confirmation email or updating usage stats
  console.log('Payment succeeded for invoice:', invoice.id)
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  // You can implement additional logic here for failed payments
  // For example, sending a notification to the user
  console.log('Payment failed for invoice:', invoice.id)
}