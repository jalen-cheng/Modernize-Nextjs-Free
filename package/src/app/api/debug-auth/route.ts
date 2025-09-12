import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    console.log('Debug Auth - Attempting login for:', email);
    
    // Test sign up first
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    
    console.log('Sign up result:', { signUpData, signUpError });
    
    // Test sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log('Sign in result:', { signInData, signInError });
    
    // Test current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    console.log('Session result:', { sessionData, sessionError });
    
    return NextResponse.json({
      success: true,
      debug: {
        signUp: { data: signUpData, error: signUpError },
        signIn: { data: signInData, error: signInError },
        session: { data: sessionData, error: sessionError }
      }
    });
    
  } catch (error: any) {
    console.error('Debug auth error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
