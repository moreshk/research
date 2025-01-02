import { getTokens } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const tokens = await getTokens();
    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: 'Failed to fetch tokens' }, { status: 500 });
  }
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300; 