/**
 * カスタムAPIエラークラス
 * YouTube API のエラーレスポンスを型安全に扱う
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly isQuota: boolean = false
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * クォータ超過エラー
 * 日次クォータ上限に達した場合にスロー
 */
export class QuotaExceededError extends ApiError {
  constructor() {
    super(
      'YouTube API の日次クォータ上限に達しました。太平洋時間 0:00（日本時間 午後5時頃）にリセットされます。',
      403,
      true
    );
    this.name = 'QuotaExceededError';
  }
}
