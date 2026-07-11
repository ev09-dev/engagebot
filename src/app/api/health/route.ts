import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET() {
  try {
    // Check database connection
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from('comments').select('count', { count: 'exact', head: true })
    
    if (error) {
      throw new Error('Database connection failed')
    }

    // Check environment variables
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'INSTAGRAM_APP_ID',
      'TIKTOK_CLIENT_KEY',
      'STRIPE_PUBLISHABLE_KEY',
      'AI_SERVICE_API_KEY',
    ]

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: {
        missing_vars: missingEnvVars,
        configured: missingEnvVars.length === 0,
      },
      version: process.env.npm_package_version || '1.0.0',
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}