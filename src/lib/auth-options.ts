import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/lib/env';

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshed = await res.json();
    if (!res.ok) throw refreshed;

    return {
      ...token,
      accessToken: refreshed.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (err) {
    console.error('[Auth] アクセストークンのリフレッシュに失敗:', err);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'openid email profile https://www.googleapis.com/auth/youtube',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // 初回ログイン時
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
        };
      }

      // トークンがまだ有効（期限の60秒前まで有効とみなす）
      if (Date.now() < ((token.expiresAt as number) - 60) * 1000) {
        return token;
      }

      // 期限切れ → リフレッシュ
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.error = token.error as string | undefined;
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
};
