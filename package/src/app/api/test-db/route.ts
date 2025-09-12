import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlxpccffiulkaoxpotvn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhseHBjY2ZmaXVsa2FveHBvdHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NTkwNzQsImV4cCI6MjA1MjIzNTA3NH0.Kwn6VvQwkvq-dtsDceMBquRmRMTV_API_KEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    // Test database connection
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .limit(5);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: 'Failed to connect to database'
      }, { status: 500 });
    }

    // Test call_log table
    const { data: callLogs, error: callError } = await supabase
      .from('call_log')
      .select('*')
      .limit(5);

    if (callError) {
      console.error('Call log error:', callError);
      return NextResponse.json({ 
        success: false, 
        error: callError.message,
        details: 'Failed to access call_log table'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        patients: patients || [],
        callLogs: callLogs || [],
        patientsCount: patients?.length || 0,
        callLogsCount: callLogs?.length || 0
      },
      message: 'Database connection successful'
    });

  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: 'Unexpected server error'
    }, { status: 500 });
  }
}
