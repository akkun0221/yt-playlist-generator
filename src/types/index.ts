// ジャンル定義
export interface Genre {
  id: string;
  name: string;
  searchQueries: string[];
  allowJapanese: boolean;
}

// プレイリスト生成状態
export type GenreStatus = 'idle' | 'searching' | 'creating' | 'adding' | 'done' | 'error';

export interface GenreProgress {
  genre: Genre;
  status: GenreStatus;
  songsAdded: number;
  totalSongs: number;
  playlistId?: string;
  playlistUrl?: string;
  error?: string;
}
