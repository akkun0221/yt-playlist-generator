/**
 * YouTube API クライアント（ブラウザ側）
 * サーバーサイドAPIルートを介してYouTube Data API v3を呼び出す
 */

import { ApiError } from './errors';
import { rateLimiter } from './rate-limiter';

// --- 日本語文字検出 ---
const JAPANESE_REGEX = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/;

export function containsJapanese(text: string): boolean {
  return JAPANESE_REGEX.test(text);
}

// --- 共通フェッチ + エラー変換 ---
async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const message = err.error || `API error: ${res.status}`;
    throw new ApiError(message, res.status, message.toLowerCase().includes('quota'));
  }
  return res;
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
  return rateLimiter.execute(async () => {
    const params = new URLSearchParams({
      query,
      maxResults: String(maxResults),
    });
    if (relevanceLanguage) {
      params.set('relevanceLanguage', relevanceLanguage);
    }

    const res = await apiFetch(`/api/youtube/search?${params}`);
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
  return rateLimiter.execute(async () => {
    const res = await apiFetch('/api/youtube/playlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    const data = await res.json();
    return data.id;
  });
}

// --- 動画追加 ---
export async function addVideoToPlaylist(
  playlistId: string,
  videoId: string
): Promise<void> {
  return rateLimiter.execute(async () => {
    await apiFetch('/api/youtube/add-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playlistId, videoId }),
    });
  });
}
