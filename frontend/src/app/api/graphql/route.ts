import { NextRequest, NextResponse } from 'next/server';

const BACKEND_GRAPHQL_URL =
  process.env.BACKEND_GRAPHQL_URL ??
  process.env.NEXT_PUBLIC_GRAPHQL_URL ??
  'http://localhost:3001/graphql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const authorization = request.headers.get('authorization');

    const response = await fetch(BACKEND_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,
      cache: 'no-store',
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'application/json',
      },
    });
  } catch {
    return NextResponse.json(
      {
        errors: [{ message: 'Backend GraphQL is unavailable. Start backend or check BACKEND_GRAPHQL_URL.' }],
      },
      { status: 502 },
    );
  }
}
