import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createServerSupabaseClient = () => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return undefined
      },
      set(name: string, value: string, options: any) {
        // Server-side cookies will be handled by Next.js
      },
      remove(name: string, options: any) {
        // Server-side cookies will be handled by Next.js
      },
    },
  })
}