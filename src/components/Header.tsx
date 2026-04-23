'use client';

import { AuthButton } from './AuthButton';
import { MusicIcon } from './icons';
import { SONGS_PER_GENRE } from '@/lib/genres';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
            <MusicIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              YT Playlist Generator
            </h1>
            <p className="text-xs text-gray-500">
              23ジャンル × {SONGS_PER_GENRE}曲 自動生成
            </p>
          </div>
        </div>
        <AuthButton />
      </div>
    </header>
  );
}
