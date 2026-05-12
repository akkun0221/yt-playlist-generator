'use client';

import { useState, useCallback, useRef } from 'react';
import type { Genre, GenreProgress } from '@/types';
import { GENRES, SONGS_PER_GENRE } from '@/lib/genres';
import {
  searchVideos,
  createPlaylist,
  addVideoToPlaylist,
  containsJapanese,
} from '@/lib/youtube-api';
import { recordUsedVideos } from '@/lib/history-db';
import { QuotaExceededError } from '@/lib/errors';

// Fisher-Yates シャッフル
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function usePlaylistGenerator(
  exclusionSet: Set<string>,
  addToExclusion: (ids: string[]) => void
) {
  const [progresses, setProgresses] = useState<Map<string, GenreProgress>>(
    () => {
      const map = new Map<string, GenreProgress>();
      for (const genre of GENRES) {
        map.set(genre.id, {
          genre,
          status: 'idle',
          songsAdded: 0,
          totalSongs: SONGS_PER_GENRE,
        });
      }
      return map;
    }
  );
  const [isRunning, setIsRunning] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState<string | null>(null);
  const abortRef = useRef(false);

  const updateProgress = useCallback(
    (genreId: string, updates: Partial<GenreProgress>) => {
      setProgresses((prev) => {
        const next = new Map(prev);
        const current = next.get(genreId);
        if (current) {
          next.set(genreId, { ...current, ...updates });
        }
        return next;
      });
    },
    []
  );

  // 単一ジャンルの曲を検索して共通プレイリストに追加
  const generateForGenre = useCallback(
    async (genre: Genre, playlistId: string, localExclusion: Set<string>) => {
      try {
        updateProgress(genre.id, { status: 'searching' });

        // 1. 候補動画を検索（補充用に多めに取得）
        const POOL_MULTIPLIER = 3;
        const targetPoolSize = SONGS_PER_GENRE * POOL_MULTIPLIER;
        const allCandidates: { videoId: string; title: string; channelTitle: string }[] = [];

        for (const query of genre.searchQueries) {
          if (abortRef.current) return;

          const relevanceLanguage = genre.allowJapanese ? undefined : 'en';
          const results = await searchVideos(query, 15, relevanceLanguage);

          for (const r of results) {
            // NightCore以外: 日本語タイトル/チャンネルを除外
            if (!genre.allowJapanese) {
              if (containsJapanese(r.title) || containsJapanese(r.channelTitle)) {
                continue;
              }
            }

            // 重複チェック
            if (!localExclusion.has(r.videoId)) {
              allCandidates.push(r);
              localExclusion.add(r.videoId);
            }
          }

          if (allCandidates.length >= targetPoolSize) break;
        }

        if (allCandidates.length === 0) {
          updateProgress(genre.id, {
            status: 'error',
            error: '候補動画が見つかりませんでした',
          });
          return;
        }

        // 2. 共通プレイリストに動画追加（失敗時は候補プールから補充）
        updateProgress(genre.id, { status: 'adding', playlistId });
        const addedIds: string[] = [];
        let candidateIndex = 0;

        while (
          addedIds.length < SONGS_PER_GENRE &&
          candidateIndex < allCandidates.length
        ) {
          if (abortRef.current) break;
          const video = allCandidates[candidateIndex];
          candidateIndex++;

          try {
            await addVideoToPlaylist(playlistId, video.videoId);
            addedIds.push(video.videoId);
            updateProgress(genre.id, {
              songsAdded: addedIds.length,
            });
          } catch (err) {
            // クォータ超過は即座に上位に伝播
            if (err instanceof QuotaExceededError) throw err;
            console.warn(
              `動画追加スキップ（補充候補で再試行）: ${video.videoId}`,
              err
            );
            // → ループ継続で次の候補を試行
          }
        }

        // 3. 履歴記録
        if (addedIds.length > 0) {
          await recordUsedVideos(addedIds, genre.id);
          addToExclusion(addedIds);
        }

        const url = `https://music.youtube.com/playlist?list=${playlistId}`;
        updateProgress(genre.id, {
          status: 'done',
          songsAdded: addedIds.length,
          playlistId,
          playlistUrl: url,
        });
      } catch (error) {
        // クォータ超過は上位に伝播
        if (error instanceof QuotaExceededError) throw error;
        const message =
          error instanceof Error ? error.message : '不明なエラー';
        updateProgress(genre.id, { status: 'error', error: message });
      }
    },
    [updateProgress, addToExclusion]
  );

  // 選択されたジャンルを1つのプレイリストにまとめて生成（ランダム順）
  const startGeneration = useCallback(
    async (selectedGenreIds: string[]) => {
      setIsRunning(true);
      setPlaylistUrl(null);
      abortRef.current = false;

      // ★ ランダムにシャッフル
      const selectedGenres = shuffle(
        GENRES.filter((g) => selectedGenreIds.includes(g.id))
      );

      const localExclusion = new Set(exclusionSet);

      // Reset selected genres
      for (const genre of selectedGenres) {
        updateProgress(genre.id, {
          status: 'idle',
          songsAdded: 0,
          playlistId: undefined,
          playlistUrl: undefined,
          error: undefined,
        });
      }

      try {
        // ★ 1つの共通プレイリストを最初に作成
        const today = new Date().toISOString().slice(0, 10);
        const playlistTitle = `Auto Generated Mix (${today})`;
        const playlistId = await createPlaylist(
          playlistTitle,
          `${selectedGenres.length}ジャンル × ${SONGS_PER_GENRE}曲の自動生成プレイリスト`
        );

        const url = `https://music.youtube.com/playlist?list=${playlistId}`;
        setPlaylistUrl(url);

        // ★ 順次実行（1つのプレイリストなので並列不要）
        for (const genre of selectedGenres) {
          if (abortRef.current) break;
          await generateForGenre(genre, playlistId, localExclusion);
        }
      } catch (error) {
        if (error instanceof QuotaExceededError) {
          // 未処理のジャンルにクォータエラーを設定
          for (const genre of selectedGenres) {
            const current = progresses.get(genre.id);
            if (current && current.status !== 'done' && current.status !== 'error') {
              updateProgress(genre.id, {
                status: 'error',
                error: 'クォータ上限に到達しました。午後5時頃にリセットされます。',
              });
            }
          }
        } else {
          console.error('生成エラー:', error);
        }
      }

      setIsRunning(false);
    },
    [exclusionSet, generateForGenre, updateProgress, progresses]
  );

  const stopGeneration = useCallback(() => {
    abortRef.current = true;
  }, []);

  return {
    progresses,
    isRunning,
    playlistUrl,
    startGeneration,
    stopGeneration,
  };
}
