'use client';

import { useState, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { StatsBar } from './StatsBar';
import { PlaylistBanner } from './PlaylistBanner';
import { GenerationControls } from './GenerationControls';
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
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* 認証前 */}
        {!session && <HeroSection />}

        {/* トークンリフレッシュ失敗時の再ログイン促進 */}
        {session?.error === 'RefreshAccessTokenError' && (
          <div className="mb-6 flex items-center justify-between rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
            <span>ログインの有効期限が切れました。再度ログインしてください。</span>
            <button
              onClick={() => signIn('google')}
              className="ml-4 rounded bg-yellow-500 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-yellow-400"
            >
              再ログイン
            </button>
          </div>
        )}

        {/* 認証後 */}
        {session && session.error !== 'RefreshAccessTokenError' && (
          <>
            <StatsBar
              isLoading={isLoading}
              totalExcluded={totalExcluded}
              done={stats.done}
              selectedCount={selectedGenres.size}
              totalAdded={stats.totalAdded}
              estimatedUnits={estimatedUnits}
            />

            {playlistUrl && <PlaylistBanner playlistUrl={playlistUrl} />}

            <GenerationControls
              isRunning={isRunning}
              isLoading={isLoading}
              selectedCount={selectedGenres.size}
              onStart={() => startGeneration(Array.from(selectedGenres))}
              onStop={stopGeneration}
              onSelectAll={selectAll}
              onSelectNone={selectNone}
              onDownloadCsv={downloadCsv}
            />

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
