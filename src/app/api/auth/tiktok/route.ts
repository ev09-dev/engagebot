import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  if (error) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${error}`)
  }

  if (!code) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=missing_code`)
  }

  try {
    // Exchange the authorization code for an access token
    const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/v2/access_token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.TIKTOK_REDIRECT_URI!,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (tokenData.error && tokenData.error.code !== 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${tokenData.error.message}`)
    }

    // Get the user's TikTok profile
    const profileResponse = await fetch(
      `https://open-api.tiktok.com/oauth/v2/user/info/?access_token=${tokenData.data.access_token}`
    )
    const profileData = await profileResponse.json()

    if (profileData.error && profileData.error.code !== 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=${profileData.error.message}`)
    }

    // Get the user's session from Supabase
    const supabase = createServerSupabaseClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/?error=not_authenticated`)
    }

    // Save the TikTok account to the database
    const { error: dbError } = await supabase.from('social_accounts').insert({
      user_id: session.user.id,
      platform: 'tiktok',
      platform_user_id: profileData.data.user.open_id,
      platform_username: profileData.data.user.display_name,
      access_token: tokenData.data.access_token,
      refresh_token: tokenData.data.refresh_token,
      expires_at: new Date(Date.now() + tokenData.data.expires_in * 1000).toISOString(),
    })

    if (dbError) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=failed_to_save_account`)
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=tiktok_connected`)
  } catch (error) {
    console.error('TikTok OAuth error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=unknown_error`)
  }
}