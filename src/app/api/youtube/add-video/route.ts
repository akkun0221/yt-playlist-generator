import { NextRequest, NextResponse } from 'next/server';
import { withAuth, handleYouTubeError } from '@/lib/api-helpers';
import { env } from '@/lib/env';

export async function POST(request: NextRequest) {
  return withAuth(async (session) => {
    const { playlistId, videoId } = await request.json();

    if (!playlistId || !videoId) {
      return NextResponse.json(
        { error: 'playlistId と videoId が必要です' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=${env.YOUTUBE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        }),
      }
    );

    if (!res.ok) {
      return handleYouTubeError(res, '動画追加エラー');
    }

    const data = await res.json();
    return NextResponse.json({ id: data.id });
  });
}
