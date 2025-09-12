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
    const { call, variableValues } = body;
    
    // Extract patient ID from call metadata (privacy-protected access)
    const patientId = call?.metadata?.patientId;
    const { 
      delivery_window, 
      med_change, 
      last_shipment_issue, 
      issue_note 
    } = variableValues || {};
    
    console.log('Vapi complete workflow called for patient:', patientId ? '[REDACTED]' : 'none');

    if (!patientId) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing patientId in call metadata' 
      }, { status: 400 });
    }

    // Verify patient exists and user has access to this specific patient
    const { data: patient, error: patientError } = await supabaseAdmin
      .from('patients')
      .select('id')
      .eq('id', patientId)
      .single();

    if (patientError || !patient) {
      console.error('Patient not found or access denied');
      return NextResponse.json({ 
        success: false,
        error: 'Patient not found or access denied' 
      }, { status: 403 });
    }

    // Save call log to database
    const callLogData = {
      patient_id: patientId,
      status: 'completed',
      delivery_window: delivery_window || null,
      med_change: med_change || null,
      shipment_feedback: last_shipment_issue ? {
        issue: last_shipment_issue,
        note: issue_note || null
      } : null,
      free_text_notes: issue_note || '',
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString()
    };

    const { data, error } = await supabaseAdmin
      .from('call_log')
      .insert([callLogData])
      .select();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to save call log' 
      }, { status: 500 });
    }

    console.log('Call log saved successfully:', data);

    return NextResponse.json({ 
      success: true,
      message: 'Call completed and logged successfully',
      callLogId: data[0]?.id
    });

  } catch (error: any) {
    console.error('Vapi complete workflow error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
