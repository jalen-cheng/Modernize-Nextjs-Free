import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Temporarily disabled - call_job table not implemented yet
  return NextResponse.json({ 
    message: 'Dispatch endpoint temporarily disabled',
    processed: 0,
    results: []
  });
}
