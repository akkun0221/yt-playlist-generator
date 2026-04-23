'use client';

import { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { AuthButton } from './AuthButton';
import { GenreCard } from './GenreCard';
import { useHistoryDB } from '@/hooks/useHistoryDB';
import { usePlaylistGenerator } from '@/hooks/usePlaylistGenerator';
import { GENRES, SONGS_PER_GENRE } from '@/lib/genres';

export function Dashboard() {
  const { data: session } = useSession();
  const { exclusionSet, isLoading, totalExcluded, addToExclusion, downloadCsv } =
    useHistoryDB();
  const { progresses, isRunning, playlistUrl, startGeneration, stopGeneration } =
    usePlaylistGenerator(exclusionSet, addToExclusion);

  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(
    new Set(GENRES.map((g) => g.id))
  );

  const toggleGenre = (id: string) => {
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => setSelectedGenres(new Set(GENRES.map((g) => g.id)));
  const selectNone = () => setSelectedGenres(new Set());

  const stats = useMemo(() => {
    const values = Array.from(progresses.values());
    const done = values.filter((p) => p.status === 'done').length;
    const errors = values.filter((p) => p.status === 'error').length;
    const totalAdded = values.reduce((sum, p) => sum + p.songsAdded, 0);
    return { done, errors, totalAdded };
  }, [progresses]);

  // 共通プレイリスト1つ(50) + ジャンルごとに search(100) + insert×5(250)
  const estimatedUnits = 50 + selectedGenres.size * (100 + SONGS_PER_GENRE * 50);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-violet-950">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 border-b border-gray-800/50 bg-gray-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25">
              <svg
                className="h-6 w-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* 認証前 */}
        {!session && (
          <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
            <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 ring-1 ring-violet-500/30">
              <svg
                className="h-12 w-12 text-violet-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
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
        )}

        {/* 認証後 */}
        {session && (
          <>
            {/* ステータスバー */}
            <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500">履歴件数</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? '...' : totalExcluded}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500">完了ジャンル</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.done}
                  <span className="text-sm text-gray-500">
                    /{selectedGenres.size}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500">追加済み曲数</p>
                <p className="text-2xl font-bold text-violet-400">
                  {stats.totalAdded}
                </p>
              </div>
              <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
                <p className="text-xs text-gray-500">推定API消費</p>
                <p
                  className={`text-2xl font-bold ${
                    estimatedUnits > 10000
                      ? 'text-red-400'
                      : 'text-amber-400'
                  }`}
                >
                  {estimatedUnits.toLocaleString()}
                  <span className="text-sm text-gray-500">/10,000</span>
                </p>
              </div>
            </div>

            {/* 共通プレイリストリンク */}
            {playlistUrl && (
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
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z" />
                    </svg>
                    YouTube Music で開く
                  </a>
                </div>
              </div>
            )}

            {/* コントロール */}
            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() =>
                  startGeneration(Array.from(selectedGenres))
                }
                disabled={isRunning || selectedGenres.size === 0 || isLoading}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    生成中...
                  </span>
                ) : (
                  `🚀 ${selectedGenres.size} ジャンルを生成`
                )}
              </button>
              {isRunning && (
                <button
                  onClick={stopGeneration}
                  className="rounded-xl bg-red-600/80 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600"
                >
                  ⏹ 停止
                </button>
              )}
              <button
                onClick={selectAll}
                disabled={isRunning}
                className="rounded-lg bg-gray-700/60 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-600/60 disabled:opacity-50"
              >
                全選択
              </button>
              <button
                onClick={selectNone}
                disabled={isRunning}
                className="rounded-lg bg-gray-700/60 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-600/60 disabled:opacity-50"
              >
                全解除
              </button>
              <div className="flex-1" />
              <button
                onClick={downloadCsv}
                className="rounded-lg bg-gray-700/60 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-600/60 flex items-center gap-2"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                履歴CSV
              </button>
            </div>

            {/* ジャンルグリッド */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {GENRES.map((genre) => {
                const progress = progresses.get(genre.id);
                if (!progress) return null;
                return (
                  <GenreCard
                    key={genre.id}
                    progress={progress}
                    isSelected={selectedGenres.has(genre.id)}
                    onToggle={() => toggleGenre(genre.id)}
                    disabled={isRunning}
                  />
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="border-t border-gray-800/50 py-6 text-center text-xs text-gray-600">
        YT Playlist Generator — YouTube Data API v3 powered
      </footer>
    </div>
  );
}
