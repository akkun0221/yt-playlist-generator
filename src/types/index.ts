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

// YouTube API レスポンス型
export interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
  };
}

export interface YouTubeSearchResponse {
  items: YouTubeSearchItem[];
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubePlaylistResponse {
  id: string;
  snippet: {
    title: string;
  };
}

// API リクエスト/レスポンス型
export interface SearchRequest {
  query: string;
  maxResults?: number;
  pageToken?: string;
  relevanceLanguage?: string;
}

export interface CreatePlaylistRequest {
  title: string;
  description?: string;
}

export interface AddVideoRequest {
  playlistId: string;
  videoId: string;
}
