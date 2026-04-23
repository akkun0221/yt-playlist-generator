'use client';

import { YouTubeIcon } from './icons';

interface PlaylistBannerProps {
  playlistUrl: string;
}

export function PlaylistBanner({ playlistUrl }: PlaylistBannerProps) {
  return (
    <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">🎶 プレイリスト作成済み</p>
          <p className="text-xs text-gray-400 mt-1">全ジャンルの曲が1つのプレイリストにまとめられています</p>
        </div>
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-red-500/20 transition-all hover:shadow-red-500/40 hover:scale-105"
        >
          <YouTubeIcon />
          YouTube Music で開く
        </a>
      </div>
    </div>
  );
}
