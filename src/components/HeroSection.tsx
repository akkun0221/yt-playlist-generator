'use client';

import { AuthButton } from './AuthButton';
import { MusicIcon } from './icons';

export function HeroSection() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 ring-1 ring-violet-500/30">
        <MusicIcon className="h-12 w-12 text-violet-400" />
      </div>
      <h2 className="mb-3 text-3xl font-bold text-white">
        YouTube Music プレイリスト自動生成
      </h2>
      <p className="mb-8 max-w-md text-gray-400">
        23種類のメタル・パンク・ハードコアジャンルのプレイリストを
        <br />
        YouTube Data API v3 で自動生成します
      </p>
      <AuthButton />
    </div>
  );
}
