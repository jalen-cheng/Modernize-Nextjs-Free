import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    // Verify webhook secret
    const webhookSecret = req.headers.get('x-webhook-secret');
    const expectedSecret = process.env.VAPI_WEBHOOK_SECRET;
    
    if (!expectedSecret || webhookSecret !== expectedSecret) {
      console.error('Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { result, patientId } = await req.json();
    
    console.log('Vapi storeResult called:', { result, patientId });

    if (!patientId || !result) {
      return NextResponse.json({ 
        success: false,
        error: 'Missing required fields: patientId and result' 
      }, { status: 400 });
    }

    // Extract data from the result object
    const callLogData = {
      patient_id: patientId,
      status: 'completed',
      delivery_window: result.delivery_window || null,
      med_change: result.med_change || null,
      shipment_feedback: result.last_shipment_issue ? {
        issue: result.last_shipment_issue,
        note: result.issue_note || null,
        rating: result.shipment_rating || null
      } : null,
      free_text_notes: result.issue_note || result.notes || '',
      available_on_scheduled_date: result.available_on_scheduled_date || null,
      started_at: new Date().toISOString(),
      ended_at: new Date().toISOString(),
      model_raw: result // Store the full result object for reference
    };

    const { data, error } = await supabaseAdmin
      .from('call_log')
      .insert([callLogData])
      .select();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ 
        success: false,
        error: 'Failed to save call result' 
      }, { status: 500 });
    }

    console.log('Call result saved successfully:', data);

    return NextResponse.json({ 
      success: true,
      message: 'Call result stored successfully',
      callLogId: data[0]?.id
    });

  } catch (error: any) {
    console.error('Vapi storeResult error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
