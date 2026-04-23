'use client';

interface StatsBarProps {
  isLoading: boolean;
  totalExcluded: number;
  done: number;
  selectedCount: number;
  totalAdded: number;
  estimatedUnits: number;
}

export function StatsBar({
  isLoading,
  totalExcluded,
  done,
  selectedCount,
  totalAdded,
  estimatedUnits,
}: StatsBarProps) {
  return (
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
          {done}
          <span className="text-sm text-gray-500">
            /{selectedCount}
          </span>
        </p>
      </div>
      <div className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-4 backdrop-blur-sm">
        <p className="text-xs text-gray-500">追加済み曲数</p>
        <p className="text-2xl font-bold text-violet-400">
          {totalAdded}
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
  );
}
