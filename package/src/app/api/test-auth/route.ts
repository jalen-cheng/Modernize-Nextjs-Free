import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ 
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey
      }, { status: 500 });
    }

    // Test Supabase connection
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Try to get the current session (should be null for anonymous)
    const { data, error } = await supabase.auth.getSession();
    
    return NextResponse.json({ 
      success: true,
      url: supabaseUrl,
      keyLength: supabaseAnonKey.length,
      keyPrefix: supabaseAnonKey.substring(0, 20) + '...',
      sessionError: error?.message || null,
      hasSession: !!data.session
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Connection test failed',
      message: error.message 
    }, { status: 500 });
  }
}
