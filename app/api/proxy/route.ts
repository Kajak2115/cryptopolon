import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const cache = new Map<string, { expiry: number, data: any }>();
const CACHE_TTL = 30 * 1000; // 30s cache

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  const now = Date.now();
  const c = cache.get(url);
  if (c && c.expiry > now) {
    return NextResponse.json(c.data);
  }
  try {
    const res = await fetch(url);
    const data = await res.json();
    cache.set(url, { expiry: now + CACHE_TTL, data });
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 });
  }
}