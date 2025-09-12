import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { startVapiCall } from '@/app/lib/vapi';

export async function POST(req: NextRequest) {
  try {
    console.log('Call API: Starting request');
    
    const { patientId } = await req.json();
    console.log('Call API: Received patientId:', patientId);
    
    if (!patientId) {
      return NextResponse.json({ error: 'patientId required' }, { status: 400 });
    }

    // Check environment variables
    console.log('Call API: Checking environment variables');
    console.log('VAPI_API_KEY exists:', !!process.env.VAPI_API_KEY);
    console.log('VAPI_WORKFLOW_ID exists:', !!process.env.VAPI_WORKFLOW_ID);
    console.log('VAPI_PHONE_NUMBER_ID exists:', !!process.env.VAPI_PHONE_NUMBER_ID);

    // Get patient data from Supabase
    console.log('Call API: Fetching patient data');
    const { data: patient, error } = await supabaseAdmin
      .from('patients')
      .select('id, first_name, last_name, phone_e164')
      .eq('id', patientId)
      .single();

    if (error || !patient) {
      console.error('Call API: Patient fetch error:', error);
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    console.log('Call API: Patient found, phone:', patient.phone_e164);

    // Prepare variables for Vapi call
    const variableValues = {
      pharmacy_name: 'MedMe Pharmacy',
      patient_name: `${patient.first_name} ${patient.last_name}`,
      delivery_date: new Date().toISOString().slice(0, 10),
      security_question: 'What is your date of birth?'
    };

    const hiddenVars = { 
      patientId: patient.id 
    };

    console.log('Call API: Starting Vapi call');
    
    // Start Vapi call
    const call = await startVapiCall({ 
      toE164: patient.phone_e164, 
      variableValues, 
      hiddenVars 
    });

    console.log('Call API: Vapi call result:', call);

    if (call.error) {
      console.error('Call API: Vapi call error:', call.error);
      return NextResponse.json({ error: call.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, call: call.data });
  } catch (error: any) {
    console.error('Call API: Unexpected error:', error);
    console.error('Call API: Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
}
