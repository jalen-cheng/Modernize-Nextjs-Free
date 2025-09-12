import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  console.log('Auth callback called:', {
    url: requestUrl.toString(),
    code: code ? 'present' : 'missing',
    searchParams: Object.fromEntries(requestUrl.searchParams.entries())
  })

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth callback error:', error)
        return NextResponse.redirect(`${requestUrl.origin}/authentication/login?error=exchange_failed&details=${encodeURIComponent(error.message)}`)
      }
      
      if (data.session) {
        console.log('Session created successfully, redirecting to pharmacy step')
        return NextResponse.redirect(`${requestUrl.origin}/authentication/login?step=pharmacy&verified=true`)
      }
    } catch (error: any) {
      console.error('Auth callback exception:', error)
      return NextResponse.redirect(`${requestUrl.origin}/authentication/login?error=callback_exception&details=${encodeURIComponent(error.message)}`)
    }
  }

  // No code provided
  return NextResponse.redirect(`${requestUrl.origin}/authentication/login?error=no_code`)
}
