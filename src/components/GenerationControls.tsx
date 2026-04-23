'use client';

import { DownloadIcon } from './icons';

interface GenerationControlsProps {
  isRunning: boolean;
  isLoading: boolean;
  selectedCount: number;
  onStart: () => void;
  onStop: () => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onDownloadCsv: () => void;
}

export function GenerationControls({
  isRunning,
  isLoading,
  selectedCount,
  onStart,
  onStop,
  onSelectAll,
  onSelectNone,
  onDownloadCsv,
}: GenerationControlsProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button
        onClick={onStart}
        disabled={isRunning || selectedCount === 0 || isLoading}
        className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
      >
        {isRunning ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            生成中...
          </span>
        ) : (
          `🚀 ${selectedCount} ジャンルを生成`
        )}
      </button>
      {isRunning && (
        <button
          onClick={onStop}
          className="rounded-xl bg-red-600/80 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-red-600"
        >
          ⏹ 停止
        </button>
      )}
      <button
        onClick={onSelectAll}
        disabled={isRunning}
        className="rounded-lg bg-gray-700/60 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-600/60 disabled:opacity-50"
      >
        全選択
      </button>
      <button
        onClick={onSelectNone}
        disabled={isRunning}
        className="rounded-lg bg-gray-700/60 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-600/60 disabled:opacity-50"
      >
        全解除
      </button>
      <div className="flex-1" />
      <button
        onClick={onDownloadCsv}
        className="rounded-lg bg-gray-700/60 px-4 py-2 text-sm text-gray-300 transition-all hover:bg-gray-600/60 flex items-center gap-2"
      >
        <DownloadIcon />
        履歴CSV
      </button>
    </div>
  );
}
