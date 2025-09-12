import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Pharmacy validation request:', body);
    
    const { pharmacyCode } = body;
    
    if (!pharmacyCode || typeof pharmacyCode !== 'string') {
      console.log('Invalid pharmacy code format:', pharmacyCode);
      return NextResponse.json({ valid: false, error: 'Pharmacy code is required' }, { status: 400 });
    }
    
    const validCode = process.env.PHARMACY_ACCESS_CODE || 'MEDME2024';
    console.log('Comparing codes:', { provided: pharmacyCode, expected: validCode });
    
    if (pharmacyCode.trim() === validCode) {
      console.log('Pharmacy code validation successful');
      const response = NextResponse.json({ valid: true });
      
      // Set the pharmacy access cookie server-side
      response.cookies.set('pharmacyAccess', 'true', {
        maxAge: 86400, // 24 hours
        path: '/',
        httpOnly: false, // Allow client-side access
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      });
      
      return response;
    } else {
      console.log('Pharmacy code validation failed');
      return NextResponse.json({ valid: false, error: 'Invalid pharmacy code' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Pharmacy validation error:', error);
    return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 });
  }
}
