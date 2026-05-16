import { NextRequest, NextResponse } from 'next/server';

const rateLimit = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

export function proxy(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    'unknown';
  const path = request.nextUrl.pathname;
  const key = `rate-limit:${ip}:${path}`;

  const now = Date.now();
  const windowStart = now - WINDOW_MS;

  // Evict expired entries
  for (const [k, entry] of rateLimit.entries()) {
    if (entry.timestamp < windowStart) rateLimit.delete(k);
  }

  const entry = rateLimit.get(key) || { count: 0, timestamp: now };

  if (entry.timestamp < windowStart) {
    entry.count = 1;
    entry.timestamp = now;
  } else {
    entry.count++;
  }

  rateLimit.set(key, entry);

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.timestamp + WINDOW_MS - now) / 1000);
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.', retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (entry.timestamp + WINDOW_MS).toString(),
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  response.headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - entry.count).toString());
  response.headers.set('X-RateLimit-Reset', (entry.timestamp + WINDOW_MS).toString());
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
