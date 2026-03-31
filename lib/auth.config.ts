import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // This is the middleware-friendly way to handle redirects
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLogin = nextUrl.pathname === '/login';

      if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      } else if (isLoggedIn) return true;
      else return false;

      // if (isOnDashboard) {
      //   if (isLoggedIn) return true;
      //   return false; // Redirect unauthenticated users to login
      // } else if (isLoggedIn && isOnLogin) {
      //   return Response.redirect(new URL('/dashboard', nextUrl));
      // }
      // return true;
    },
  },
  providers: [], // Add an empty array, we'll override this in auth.ts
} satisfies NextAuthConfig;