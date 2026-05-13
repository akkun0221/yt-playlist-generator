/**
 * YouTube Music 再生可否チェック（InnerTube API 経由）
 *
 * YouTube Data API v3 は YouTube 上の再生可否しか返さないため、
 * YouTube Music 固有のライセンス制限を検出できない。
 * InnerTube の MUSIC (WEB_REMIX) クライアントで playabilityStatus を
 * 直接確認することで、YouTube Music での再生可否を判定する。
 */

import { Innertube } from 'youtubei.js';

/** Innertube インスタンスをキャッシュ（初期化コスト軽減） */
let innertubeInstance: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create();
  }
  return innertubeInstance;
}

/**
 * 指定された動画IDリストについて、YouTube Music で再生可能なもののみを返す。
 *
 * InnerTube の MUSIC クライアントで各動画の playabilityStatus を確認し、
 * status === 'OK' のもののみ再生可能と判定する。
 *
 * @param videoIds チェック対象の動画IDリスト
 * @returns YouTube Music で再生可能な動画IDの Set
 */
export async function filterPlayableOnYTMusic(
  videoIds: string[]
): Promise<Set<string>> {
  const playable = new Set<string>();

  if (videoIds.length === 0) return playable;

  const yt = await getInnertube();

  // 並列で各動画の再生可否をチェック（レート制限を考慮して適度にバッチ処理）
  const BATCH_SIZE = 5;
  for (let i = 0; i < videoIds.length; i += BATCH_SIZE) {
    const batch = videoIds.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map(async (videoId) => {
        try {
          const info = await yt.getBasicInfo(videoId, { client: 'YTMUSIC' });
          const status = info.playability_status?.status;
          if (status === 'OK') {
            return videoId;
          }
          console.log(
            `[InnerTube] 再生不可: ${videoId} (status: ${status})`
          );
          return null;
        } catch (err) {
          // チェック自体が失敗した場合は除外せず通す（判定不能 = 許容）
          console.warn(
            `[InnerTube] チェック失敗（通過扱い）: ${videoId}`,
            err instanceof Error ? err.message : err
          );
          return videoId;
        }
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        playable.add(result.value);
      }
    }
  }

  return playable;
}
