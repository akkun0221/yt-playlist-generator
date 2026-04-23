import { NextRequest } from 'next/server';
import { withAuth, handleYouTubeError } from '@/lib/api-helpers';
import { env } from '@/lib/env';

export async function GET(request: NextRequest) {
  return withAuth(async (session) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const maxResults = searchParams.get('maxResults') || '25';
    const relevanceLanguage = searchParams.get('relevanceLanguage') || '';

    if (!query) {
      const { NextResponse } = await import('next/server');
      return NextResponse.json({ error: 'query パラメータが必要です' }, { status: 400 });
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music カテゴリ
      maxResults,
      key: env.YOUTUBE_API_KEY,
    });

    if (relevanceLanguage) {
      params.set('relevanceLanguage', relevanceLanguage);
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!res.ok) {
      return handleYouTubeError(res, '検索エラー');
    }

    const { NextResponse } = await import('next/server');
    const data = await res.json();
    return NextResponse.json(data);
  });
}
