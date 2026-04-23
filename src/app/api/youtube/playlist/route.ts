import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleYouTubeError } from '@/lib/api-helpers';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  return withAuth(async (session) => {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'title が必要です' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,status&key=${env.YOUTUBE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            title,
            description: description || `Auto-generated ${title} playlist`,
          },
          status: {
            privacyStatus: 'public',
          },
        }),
      }
    );

    if (!res.ok) {
      return handleYouTubeError(res, 'プレイリスト作成エラー');
    }

    const data = await res.json();
    return NextResponse.json({ id: data.id, title: data.snippet.title });
  });
}
