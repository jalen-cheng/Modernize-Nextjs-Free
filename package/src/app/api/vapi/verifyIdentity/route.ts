import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret for security
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.VAPI_WEBHOOK_SECRET;
    
    if (!expectedSecret || webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { call, message } = body;
    
    // Extract patient ID from call metadata (privacy-protected access)
    const patientId = call?.metadata?.patientId;
    const securityAnswer = message?.content || body.securityAnswer;
    
    console.log('Vapi verifyIdentity called for patient:', patientId ? '[REDACTED]' : 'none');

    if (!patientId || !securityAnswer) {
      return NextResponse.json({ 
        variable: "false",
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Get patient data - only for the specific patient in the call
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id, last_name, security_question, security_answer')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('Patient not found or access denied');
      return NextResponse.json({ 
        variable: "false",
        error: 'Patient not found or access denied' 
      });
    }

    // Verify identity using stored security answer or fallback to last name
    const expectedAnswer = (patient.security_answer || patient.last_name).toLowerCase().trim();
    const providedAnswer = securityAnswer.toLowerCase().trim();
    
    const verified = expectedAnswer === providedAnswer;
    
    // Log verification result without exposing sensitive data
    console.log('Identity verification result:', { 
      patientId: '[REDACTED]',
      verified,
      method: patient.security_answer ? 'security_answer' : 'last_name_fallback'
    });

    // Return result in format expected by Vapi workflow
    return NextResponse.json({ 
      variable: verified ? "true" : "false",
      message: verified ? 'Identity verified' : 'Verification failed. Please try again.'
    });

  } catch (error: any) {
    console.error('Vapi verifyIdentity error:', error);
    return NextResponse.json({ 
      variable: "false",
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
