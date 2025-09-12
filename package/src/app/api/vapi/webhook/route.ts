import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  if (req.headers.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const payload = await req.json();

  // Accept either { variables: { patientId } } or top-level { patientId }
  const patientId =
    payload?.variables?.patientId ??
    payload?.patientId ??
    null;

  if (!patientId) {
    return NextResponse.json({ error: 'missing patientId' }, { status: 400 });
  }

  // Accept either { resultJson: {...} } or { result: {...} }
  const result =
    payload?.resultJson ??
    payload?.result ??
    null;

  if (!result || typeof result !== 'object') {
    return NextResponse.json({ error: 'missing RESULT json' }, { status: 400 });
  }

  const insert = {
    patient_id: patientId,
    status: result.verified ? 'completed' : 'abandoned',
    available_on_scheduled_date: result.available_on_scheduled_date ?? null,
    delivery_window: result.delivery_window ?? null,
    med_change: result.med_change ?? null,
    shipment_feedback: result.shipment_feedback ?? null,
    free_text_notes: result.free_text_notes ?? '',
    transcript: payload?.transcript ?? null,
    model_raw: payload ?? null
  };

  const { error } = await supabaseAdmin.from('call_log').insert(insert);
  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ ok: true });
}
