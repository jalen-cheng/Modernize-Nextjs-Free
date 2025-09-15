import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Dispatch endpoint - job scheduling functionality not implemented
  // This endpoint exists for compatibility but doesn't perform any operations
  // since the call_job table doesn't exist in the current database schema
  try {
    return NextResponse.json({ 
      message: 'Dispatch endpoint called successfully',
      processed: 0, 
      results: [],
      note: 'Job scheduling functionality not implemented - use /api/call to initiate calls directly'
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
