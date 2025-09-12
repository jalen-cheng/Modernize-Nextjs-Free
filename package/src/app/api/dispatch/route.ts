import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';
import { startVapiCall } from '@/app/lib/vapi';

export async function POST(req: NextRequest) {
  // Optional cron endpoint to claim due call_job and start calls
  try {
    // Get pending call jobs that are due
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from('call_job')
      .select('id, patient_id, scheduled_for')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10);

    if (jobsError) {
      return NextResponse.json({ error: jobsError.message }, { status: 500 });
    }

    const results = [];

    for (const job of jobs || []) {
      try {
        // Mark job as claimed
        await supabaseAdmin
          .from('call_job')
          .update({ status: 'claimed', claimed_at: new Date().toISOString() })
          .eq('id', job.id);

        // Get patient details
        const { data: patient, error: patientError } = await supabaseAdmin
          .from('patient')
          .select('id, first_name, last_name, phone_e164')
          .eq('id', job.patient_id)
          .single();

        if (patientError || !patient) {
          results.push({ jobId: job.id, error: 'Patient not found' });
          continue;
        }

        // Start the call
        const variableValues = {
          pharmacy_name: 'DemoCare Pharmacy',
          patient_display: patient.first_name,
          delivery_date: new Date().toISOString().slice(0, 10),
          security_question_text: 'What is the name of your first pet?'
        };
        const hiddenVars = { patientId: patient.id };

        const call = await startVapiCall({ 
          toE164: patient.phone_e164, 
          variableValues, 
          hiddenVars 
        });

        // Update job with call details
        await supabaseAdmin
          .from('call_job')
          .update({ 
            status: 'started', 
            call_id: call.id,
            started_at: new Date().toISOString()
          })
          .eq('id', job.id);

        results.push({ jobId: job.id, callId: call.id, success: true });

      } catch (error: any) {
        // Mark job as failed
        await supabaseAdmin
          .from('call_job')
          .update({ 
            status: 'failed', 
            error_message: error.message,
            failed_at: new Date().toISOString()
          })
          .eq('id', job.id);

        results.push({ jobId: job.id, error: error.message });
      }
    }

    return NextResponse.json({ 
      processed: results.length, 
      results 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
