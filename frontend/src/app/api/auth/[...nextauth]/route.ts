import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        identifier: { label: 'Email or Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.identifier || !credentials?.password) {
            throw new Error('Email/Username and password are required');
          }

          const response = await axios.post(`${API_URL}/api/auth/login`, {
            identifier: credentials.identifier,
            password: credentials.password,
          });

          const { user, token } = response.data;

          if (user && token) {
            return {
              id: user.id,
              email: user.email,
              name: user.username,
              accessToken: token,
            };
          }

          return null;
        } catch (error: any) {
          console.error('Auth error:', error.response?.data || error.message);
          throw new Error(error.response?.data?.error || 'Authentication failed');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
        };
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
