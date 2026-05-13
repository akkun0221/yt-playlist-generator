import { NextRequest } from 'next/server';
import { withAuth, handleYouTubeError } from '@/lib/api-helpers';
import { env } from '@/lib/env';
import { filterPlayableOnYTMusic } from '@/lib/innertube-checker';

/** ISO 8601 duration (PT#H#M#S) を秒数に変換 */
function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

/** 動画の最小許容時間（秒） — 2分 */
const MIN_DURATION_SECONDS = 2 * 60;
/** 動画の最大許容時間（秒） — 10分 */
const MAX_DURATION_SECONDS = 10 * 60;

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

    // --- 1. search.list で候補動画を取得 ---
    const searchP = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      videoCategoryId: '10', // Music カテゴリ
      maxResults,
      key: env.YOUTUBE_API_KEY,
    });

    if (relevanceLanguage) {
      searchP.set('relevanceLanguage', relevanceLanguage);
    }

    const searchRes = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchP}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!searchRes.ok) {
      return handleYouTubeError(searchRes, '検索エラー');
    }

    const searchData = await searchRes.json();
    const items = searchData.items || [];

    if (items.length === 0) {
      const { NextResponse } = await import('next/server');
      return NextResponse.json({ items: [] });
    }

    // --- 2. videos.list で動画の再生時間・再生可否を取得 ---
    const videoIds = items
      .map((item: { id: { videoId?: string } }) => item.id?.videoId)
      .filter(Boolean)
      .join(',');

    const videosP = new URLSearchParams({
      part: 'contentDetails,status',
      id: videoIds,
      key: env.YOUTUBE_API_KEY,
    });

    const videosRes = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?${videosP}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!videosRes.ok) {
      // videos.list 失敗 → フィルタなし結果は危険なのでエラーとして返す
      return handleYouTubeError(videosRes, '動画詳細の取得に失敗しました');
    }

    const videosData = await videosRes.json();

    // 再生時間と再生可否でフィルタした動画IDセットを作成
    const playableVideoIds = new Set<string>();
    for (const v of videosData.items || []) {
      // --- 再生時間チェック (2分〜10分) ---
      const durationSec = parseDurationToSeconds(v.contentDetails?.duration || '');
      if (durationSec < MIN_DURATION_SECONDS || durationSec > MAX_DURATION_SECONDS) {
        continue;
      }

      // --- 再生可否チェック ---
      const status = v.status;
      if (!status) continue;

      // アップロード処理が完了していない動画を除外
      if (status.uploadStatus !== 'processed') continue;

      // 非公開動画を除外
      if (status.privacyStatus === 'private') continue;

      // 日本でリージョン制限されている動画を除外
      const regionRestriction = v.contentDetails?.regionRestriction;
      if (regionRestriction) {
        // blocked に JP が含まれている → 除外
        if (regionRestriction.blocked?.includes('JP')) continue;
        // allowed が設定されていて JP が含まれていない → 除外
        if (regionRestriction.allowed && !regionRestriction.allowed.includes('JP')) continue;
      }

      playableVideoIds.add(v.id);
    }

    // --- 3. YouTube Music での再生可否チェック (InnerTube MUSIC クライアント) ---
    const candidateIds = Array.from(playableVideoIds);
    let ytMusicPlayableIds: Set<string>;
    try {
      ytMusicPlayableIds = await filterPlayableOnYTMusic(candidateIds);
    } catch (err) {
      // InnerTube チェック全体が失敗した場合は既存フィルタ結果をフォールバックとして使用
      console.warn('[InnerTube] チェック全体失敗、既存フィルタのみ適用:', err);
      ytMusicPlayableIds = playableVideoIds;
    }

    // --- 4. 検索結果を全フィルタで絞り込み ---
    const filteredItems = items.filter(
      (item: { id: { videoId?: string } }) =>
        item.id?.videoId && ytMusicPlayableIds.has(item.id.videoId)
    );

    const { NextResponse } = await import('next/server');
    return NextResponse.json({ ...searchData, items: filteredItems });
  });
}

