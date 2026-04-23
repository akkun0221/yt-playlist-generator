import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: '未認証' }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: 'title が必要です' },
        { status: 400 }
      );
    }

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet,status&key=${process.env.YOUTUBE_API_KEY}`,
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
      const err = await res.json().catch(() => ({}));
      console.error('YouTube API エラー詳細:', JSON.stringify(err, null, 2));
      return NextResponse.json(
        { error: err.error?.message || `プレイリスト作成エラー: ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json({ id: data.id, title: data.snippet.title });
  } catch (error) {
    console.error('プレイリスト作成エラー:', error);
    return NextResponse.json(
      { error: 'プレイリスト作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
