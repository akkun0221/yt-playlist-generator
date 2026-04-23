'use client';

import type { GenreProgress } from '@/types';
import { ProgressBar } from './ProgressBar';
import { CheckIcon } from './icons';

interface GenreCardProps {
  progress: GenreProgress;
  isSelected: boolean;
  onToggle: () => void;
  disabled: boolean;
}

const STATUS_LABELS: Record<string, string> = {
  idle: '待機中',
  searching: '🔍 検索中...',
  creating: '📋 プレイリスト作成中...',
  adding: '🎵 曲を追加中...',
  done: '✅ 完了',
  error: '❌ エラー',
};

const STATUS_GLOW: Record<string, string> = {
  idle: '',
  searching: 'ring-1 ring-amber-500/30',
  creating: 'ring-1 ring-blue-500/30',
  adding: 'ring-1 ring-violet-500/30',
  done: 'ring-1 ring-emerald-500/30',
  error: 'ring-1 ring-red-500/30',
};

export function GenreCard({
  progress,
  isSelected,
  onToggle,
  disabled,
}: GenreCardProps) {
  const { genre, status, songsAdded, totalSongs, error } = progress;

  const handleCardClick = () => {
    if (disabled) return;
    onToggle();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
        disabled ? 'cursor-default' : 'cursor-pointer'
      } ${
        isSelected
          ? 'border-violet-500/50 bg-violet-950/30'
          : 'border-gray-700/50 bg-gray-800/40'
      } ${!disabled ? 'hover:border-violet-400/60 hover:bg-violet-950/40' : ''} ${STATUS_GLOW[status]} backdrop-blur-sm`}
    >
      {/* 背景グロー */}
      {status === 'done' && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
      )}
      {(status === 'searching' || status === 'adding') && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-violet-500/5 to-transparent" />
      )}

      <div className="relative p-5">
        {/* ヘッダー */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* チェックボックス（視覚のみ、クリックはカード全体） */}
            <div
              className={`h-5 w-5 rounded-md border-2 transition-all flex-shrink-0 ${
                isSelected
                  ? 'border-violet-500 bg-violet-600'
                  : 'border-gray-600 bg-gray-800'
              } ${disabled ? 'opacity-50' : ''}`}
            >
              {isSelected && <CheckIcon className="h-full w-full p-0.5 text-white" />}
            </div>
            <div>
              <h3 className="font-bold text-white">{genre.name}</h3>
              <p className="text-xs text-gray-500">{genre.id}</p>
            </div>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              status === 'done'
                ? 'bg-emerald-500/20 text-emerald-400'
                : status === 'error'
                ? 'bg-red-500/20 text-red-400'
                : status === 'idle'
                ? 'bg-gray-700/50 text-gray-400'
                : 'bg-violet-500/20 text-violet-400'
            }`}
          >
            {STATUS_LABELS[status]}
          </span>
        </div>

        {/* プログレスバー */}
        {status !== 'idle' && (
          <div className="mb-3">
            <ProgressBar
              current={songsAdded}
              total={totalSongs}
              status={status}
            />
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <p className="mb-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
