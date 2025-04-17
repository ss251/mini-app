import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Missing search query' }, { status: 400 });
  }

  const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;
  
  if (!NEYNAR_API_KEY) {
    return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          'x-api-key': NEYNAR_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching from Neynar API:', error);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }
} 