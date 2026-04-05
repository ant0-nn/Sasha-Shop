import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const authorization = request.headers.get('authorization');

    const response = await fetch(`${BACKEND_URL}/banners/upload`, {
      method: 'POST',
      headers: authorization ? { Authorization: authorization } : undefined,
      body: formData,
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
      { message: 'Cannot reach backend upload endpoint' },
      { status: 502 },
    );
  }
}
