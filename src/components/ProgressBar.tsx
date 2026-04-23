'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  status: string;
}

export function ProgressBar({ current, total, status }: ProgressBarProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const statusColors: Record<string, string> = {
    idle: 'bg-gray-600',
    searching: 'bg-amber-500',
    creating: 'bg-blue-500',
    adding: 'bg-violet-500',
    done: 'bg-emerald-500',
    error: 'bg-red-500',
  };

  const barColor = statusColors[status] || 'bg-gray-600';

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-gray-400">
          {current}/{total} 曲
        </span>
        <span className="text-gray-400">{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700/50">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
