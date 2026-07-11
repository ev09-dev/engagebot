'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Check, AlertCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface SubscriptionManagerProps {
  currentTier: string
}

interface Price {
  id: string
  name: string
  description: string
  price: number
  features: string[]
  priceId: string
}

const PRICES: Price[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for trying out EngageBot',
    price: 0,
    features: [
      'Up to 50 comments per month',
      'Basic spam filtering',
      '1 social account',
      'Email support'
    ],
    priceId: ''
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For growing content creators',
    price: 29,
    features: [
      'Up to 500 comments per month',
      'Advanced spam filtering',
      '3 social accounts',
      'AI response suggestions',
      'Priority support'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For professional creators and teams',
    price: 99,
    features: [
      'Unlimited comments',
      'Premium spam filtering',
      'Unlimited social accounts',
      'Advanced AI features',
      '24/7 dedicated support',
      'Custom integrations'
    ],
    priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise'
  }
]

function CheckoutForm({ price, onSuccess }: { price: Price; onSuccess: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: price.priceId,
        }),
      })

      const { sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (error) {
        toast.error('Failed to redirect to checkout')
      }
    } catch (error) {
      toast.error('Failed to initiate checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="p-3 border border-gray-300 rounded-md">
        <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
      >
        {isProcessing ? 'Processing...' : `Subscribe to ${price.name}`}
      </button>
    </form>
  )
}

export function SubscriptionManager({ currentTier }: SubscriptionManagerProps) {
  const { user } = useAuth()
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null)

  const handleSubscribe = (price: Price) => {
    if (price.id === 'free') {
      // Downgrade to free tier would be handled separately
      toast.info('Contact support to downgrade your plan')
      return
    }
    setSelectedPrice(price)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscription</h2>
        <p className="text-gray-600">Choose the plan that works best for you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PRICES.map((price) => (
          <div
            key={price.id}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              currentTier === price.id ? 'ring-2 ring-primary' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{price.name}</h3>
              {currentTier === price.id && (
                <span className="text-xs bg-primary text-white px-2 py-1 rounded">
                  Current
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-4">{price.description}</p>
            
            <div className="mb-4">
              <span className="text-3xl font-bold text-gray-900">
                ${price.price}
              </span>
              <span className="text-gray-600">/month</span>
            </div>
            
            <ul className="space-y-2 mb-6">
              {price.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              onClick={() => handleSubscribe(price)}
              disabled={currentTier === price.id}
              className={`w-full px-4 py-2 rounded-md text-sm font-medium ${
                currentTier === price.id
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {currentTier === price.id ? 'Current Plan' : 'Subscribe'}
            </button>
          </div>
        ))}
      </div>

      {selectedPrice && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Subscribe to {selectedPrice.name}
            </h3>
            <button
              onClick={() => setSelectedPrice(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm price={selectedPrice} onSuccess={() => setSelectedPrice(null)} />
          </Elements>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900">Billing Information</h4>
            <p className="text-sm text-blue-700 mt-1">
              You can cancel your subscription at any time. Changes to your subscription will take effect immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}