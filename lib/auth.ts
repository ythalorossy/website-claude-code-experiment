/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextAuthOptions } from 'next-auth';
// @ts-ignore - Type conflict between next-auth versions
import GoogleProvider from 'next-auth/providers/google';
// @ts-ignore - Type conflict between next-auth versions
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth
    // @ts-ignore
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      async profile(profile) {
        // Check if user exists, if not create them (or return existing)
        let user = await prisma.user.findUnique({
          where: { email: profile.email ?? '' },
          select: { id: true, role: true }
        });

        // If user doesn't exist, create them (as regular user)
        if (!user && profile.email) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              role: 'USER', // Default role for new Google users
            },
            select: { id: true, role: true }
          });
        }

        return {
          id: user?.id ?? profile.sub,
          name: profile.name,
          email: profile.email,
          role: user?.role ?? 'USER',
        };
      }
    }),
    // Credentials provider - enter any email that's in the database
    // @ts-ignore
    CredentialsProvider({
      name: 'Sign in with Email',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@example.com" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, name: true, role: true }
        });

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }
        return null;
      }
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      // Always fetch role from database to ensure it's up to date
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      } else if (user?.email) {
        // First login - fetch from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { id: true, role: true }
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Fetch fresh user data from database
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true, role: true }
        });
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.role = dbUser.role;
        }
      } else if (token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? 'USER';
      }
      return session;
    },
  },
};
