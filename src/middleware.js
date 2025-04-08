// src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(request) {
  // Admin routes protection
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ message: 'Unauthorized' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Verify JWT here
    // This is a simplified example
    const token = authHeader.split(' ')[1];
    // Verify token...
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*'],
};