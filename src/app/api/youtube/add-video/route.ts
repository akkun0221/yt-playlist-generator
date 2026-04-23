import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: '未認証' }, { status: 401 });
  }

  try {
    const { playlistId, videoId } = await request.json();

    if (!playlistId || !videoId) {
      return NextResponse.json(
        { error: 'playlistId と videoId が必要です' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&key=${process.env.YOUTUBE_API_KEY}`,
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
      const err = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || `動画追加エラー: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ id: data.id });
  } catch (error) {
    console.error('動画追加エラー:', error);
    return NextResponse.json(
      { error: '動画追加中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
