// app/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

// In-memory rate limiting (upgrade to Redis for production)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const path = request.nextUrl.pathname;
  const key = `rate-limit:${ip}:${path}`;
  
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Clean old entries
  const keysToDelete: string[] = [];
  for (const [key, entry] of rateLimit.entries()) {
    if (entry.timestamp < windowStart) {
      keysToDelete.push(key);
    }
  }
  keysToDelete.forEach(key => rateLimit.delete(key));
  
  // Get or create entry
  const entry = rateLimit.get(key) || { count: 0, timestamp: now };
  
  if (entry.timestamp < windowStart) {
    entry.count = 1;
    entry.timestamp = now;
  } else {
    entry.count++;
  }
  
  rateLimit.set(key, entry);
  
  // Check if limit exceeded
  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.timestamp + WINDOW_MS - now) / 1000);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Too many requests. Please try again later.',
        retryAfter
      },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': MAX_REQUESTS.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': (entry.timestamp + WINDOW_MS).toString()
        }
      }
    );
  }
  
  // Add rate limit headers
  const headers = new Headers();
  headers.set('X-RateLimit-Limit', MAX_REQUESTS.toString());
  headers.set('X-RateLimit-Remaining', (MAX_REQUESTS - entry.count).toString());
  headers.set('X-RateLimit-Reset', (entry.timestamp + WINDOW_MS).toString());
  
  return null;
}