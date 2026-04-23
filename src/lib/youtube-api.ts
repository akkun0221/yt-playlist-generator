/**
 * YouTube API クライアント（ブラウザ側）
 * サーバーサイドAPIルートを介してYouTube Data API v3を呼び出す
 */

import { withRateLimit } from './rate-limiter';

// --- 日本語文字検出 ---
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

export function containsJapanese(text: string): boolean {
  return JAPANESE_REGEX.test(text);
}

// --- 検索 ---
export interface SearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
}

export async function searchVideos(
  query: string,
  maxResults: number = 25,
  relevanceLanguage?: string
): Promise<SearchResult[]> {
  return withRateLimit(async () => {
    const params = new URLSearchParams({
      query,
      maxResults: String(maxResults),
    });
    if (relevanceLanguage) {
      params.set('relevanceLanguage', relevanceLanguage);
    }

    const res = await fetch(`/api/youtube/search?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.error || `Search failed: ${res.status}`);
      (error as unknown as { status: number }).status = res.status;
      throw error;
    }

    const data = await res.json();
    return (data.items || []).map(
      (item: { id: { videoId: string }; snippet: { title: string; channelTitle: string } }) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
      })
    );
  });
}

// --- プレイリスト作成 ---
export async function createPlaylist(
  title: string,
  description: string = ''
): Promise<string> {
  return withRateLimit(async () => {
    const res = await fetch('/api/youtube/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.error || `Create playlist failed: ${res.status}`);
      (error as unknown as { status: number }).status = res.status;
      throw error;
    }
    const data = await res.json();
    return data.id;
  });
}

// --- 動画追加 ---
export async function addVideoToPlaylist(
  playlistId: string,
  videoId: string
): Promise<void> {
  return withRateLimit(async () => {
    const res = await fetch('/api/youtube/add-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId, videoId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const error = new Error(err.error || `Add video failed: ${res.status}`);
      (error as unknown as { status: number }).status = res.status;
      throw error;
    }
  });
}
