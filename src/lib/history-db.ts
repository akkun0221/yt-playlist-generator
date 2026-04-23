import Dexie, { type EntityTable } from 'dexie';

// --- 型定義 ---
export interface HistoryEntry {
  id: string;       // YouTube video ID (primary key)
  genre: string;    // 追加時のジャンル
  addedAt: string;  // ISO 8601 タイムスタンプ
}

// --- DB定義 ---
const db = new Dexie('YTPlaylistHistory') as Dexie & {
  history: EntityTable<HistoryEntry, 'id'>;
};

db.version(1).stores({
  history: 'id, genre, addedAt',
});

export { db };

// --- CSV パース ---
export async function fetchCsvHistory(): Promise<Set<string>> {
  const ids = new Set<string>();
  try {
    const res = await fetch('/history.csv');
    if (!res.ok) return ids;
    const text = await res.text();
    const lines = text.split('\n').slice(1); // ヘッダースキップ
    for (const line of lines) {
      const id = line.trim();
      if (id) ids.add(id);
    }
  } catch {
    console.warn('history.csv の読み取りに失敗（初回は正常）');
  }
  return ids;
}

// --- IndexedDB 全件取得 ---
export async function getIdbHistory(): Promise<Set<string>> {
  const all = await db.history.toArray();
  return new Set(all.map((e) => e.id));
}

// --- マージ（統合 Set 生成） ---
export async function buildExclusionSet(): Promise<Set<string>> {
  const [csvIds, idbIds] = await Promise.all([
    fetchCsvHistory(),
    getIdbHistory(),
  ]);
  return new Set([...csvIds, ...idbIds]);
}

// --- 新規 ID をフィルタリング ---
export function filterNewVideos(
  candidates: string[],
  exclusionSet: Set<string>
): string[] {
  return candidates.filter((id) => !exclusionSet.has(id));
}

// --- 使用済みとして記録 ---
export async function recordUsedVideos(
  videoIds: string[],
  genre: string
): Promise<void> {
  const now = new Date().toISOString();
  const entries: HistoryEntry[] = videoIds.map((id) => ({
    id,
    genre,
    addedAt: now,
  }));
  await db.history.bulkPut(entries);
}

// --- 全履歴 CSV エクスポート ---
export async function exportHistoryCsv(): Promise<string> {
  const all = await db.history.toArray();
  const header = 'id';
  const rows = all.map((e) => e.id);
  return [header, ...rows].join('\n');
}
