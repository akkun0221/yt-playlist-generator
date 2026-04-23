'use client';

import { useState, useEffect, useCallback } from 'react';
import { buildExclusionSet, exportHistoryCsv } from '@/lib/history-db';

export function useHistoryDB() {
  const [exclusionSet, setExclusionSet] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [totalExcluded, setTotalExcluded] = useState(0);

  // 初期化: CSV + IndexedDB をマージ
  useEffect(() => {
    async function init() {
      try {
        const set = await buildExclusionSet();
        setExclusionSet(set);
        setTotalExcluded(set.size);
      } catch (error) {
        console.error('履歴DB初期化エラー:', error);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Set を更新（外部から追記用）
  const addToExclusion = useCallback((ids: string[]) => {
    setExclusionSet((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        next.add(id);
      }
      setTotalExcluded(next.size);
      return next;
    });
  }, []);

  // CSV ダウンロード
  const downloadCsv = useCallback(async () => {
    const csv = await exportHistoryCsv();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `history_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    exclusionSet,
    isLoading,
    totalExcluded,
    addToExclusion,
    downloadCsv,
  };
}
