import { NextRequest, NextResponse } from 'next/server';
import { healthCheck } from '@/lib/db';

export async function GET(request: NextRequest) {
  const isHealthy = await healthCheck();
  
  return NextResponse.json(
    { ok: isHealthy },
    { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}
