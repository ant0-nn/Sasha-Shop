import { NextResponse } from 'next/server';

function empty(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}

export async function GET() {
  return empty();
}

export async function POST() {
  return empty();
}

export async function PUT() {
  return empty();
}

export async function PATCH() {
  return empty();
}

export async function DELETE() {
  return empty();
}

export async function OPTIONS() {
  return empty();
}
