/**
 * APIルートヘルパー
 * 認証チェックとエラーハンドリングの共通処理
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import type { Session } from 'next-auth';

/**
 * 認証付きAPIルートラッパー
 * セッション取得 + 未認証チェックを共通化
 */
export async function withAuth(
  handler: (session: Session & { accessToken: string }) => Promise<NextResponse>
): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: '未認証' }, { status: 401 });
  }
  return handler(session as Session & { accessToken: string });
}

/**
 * YouTube APIレスポンスのエラーハンドリング共通処理
 */
export async function handleYouTubeError(
  res: Response,
  context: string
): Promise<NextResponse> {
  const err = await res.json().catch(() => ({}));
  console.error(`YouTube API エラー詳細 (${context}):`, JSON.stringify(err, null, 2));
  return NextResponse.json(
    { error: err.error?.message || `${context}: ${res.status}` },
    { status: res.status }
  );
}
