import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: '未認証' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const maxResults = searchParams.get('maxResults') || '25';
  const relevanceLanguage = searchParams.get('relevanceLanguage') || '';

  if (!query) {
    return NextResponse.json({ error: 'query パラメータが必要です' }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music カテゴリ
      maxResults,
      key: process.env.YOUTUBE_API_KEY!,
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
      const err = await res.json().catch(() => ({}));
      console.error('YouTube API エラー詳細:', JSON.stringify(err, null, 2));
      return NextResponse.json(
        { error: err.error?.message || `YouTube API エラー: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('YouTube検索エラー:', error);
    return NextResponse.json(
      { error: '検索中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
