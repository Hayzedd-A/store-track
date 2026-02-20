// middleware.ts
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// This initializes NextAuth using ONLY the edge-compatible config
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};