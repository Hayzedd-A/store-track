import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { connectToDatabase } from '@/lib/mongodb';
import { authConfig } from './auth.config'; // Import the base config
import User from '@/models/User';
import { z } from 'zod';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        try {
          // Validate credentials with Zod
          const { email, password } = await z
            .object({
              email: z.string().email('Invalid email address'),
              password: z.string().min(1, 'Password is required'),
            })
            .parseAsync(credentials);

          // Connect to database
          await connectToDatabase();

          // Find user by email
          let user = await User.findOne({ email: email.toLowerCase() });
          const rootUser = await User.find({})
          if (!rootUser.length) {
            // create base user
            const baseUser = new User({
              email: email,
              name: "Store User"
            })
            const hashedPassword = await baseUser.hashPassword(password)
            baseUser.password = hashedPassword
            await baseUser.save()
            user = baseUser;
          }

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check password
          const isValid = await user.comparePassword(password);

          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          // Return user data
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('Auth error:', error);
          if (error instanceof z.ZodError) {
            throw new Error(error.issues[0].message);
          }
          throw new Error('Invalid email or password');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-super-secret-key-change-in-production',
});

