/**
 * レートリミッター + 指数バックオフ
 * YouTube Data API v3 のクォータ保護用
 */

const MIN_INTERVAL_MS = 200; // 最低200msの間隔
let lastCallTime = 0;
let quotaExhausted = false;

async function throttle(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_INTERVAL_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_INTERVAL_MS - elapsed)
    );
  }
  lastCallTime = Date.now();
}

export class QuotaExceededError extends Error {
  constructor() {
    super('YouTube API の日次クォータ上限に達しました。太平洋時間 0:00（日本時間 午後5時頃）にリセットされます。');
    this.name = 'QuotaExceededError';
  }
}

export function isQuotaExhausted(): boolean {
  return quotaExhausted;
}

export function resetQuotaFlag(): void {
  quotaExhausted = false;
}

export async function withRateLimit<T>(
  fn: () => Promise<T>,
  maxRetries = 5
): Promise<T> {
  // クォータ枯渇済みなら即エラー（無駄なリクエスト防止）
  if (quotaExhausted) {
    throw new QuotaExceededError();
  }

  let retries = 0;
  let backoff = 1000; // 初期1秒

  while (true) {
    await throttle();
    try {
      return await fn();
    } catch (error: unknown) {
      const status =
        error instanceof Error && 'status' in error
          ? (error as { status: number }).status
          : 0;

      const message =
        error instanceof Error ? error.message : '';

      // quotaExceeded はリトライしても無駄 → 即停止
      if (status === 403 && message.toLowerCase().includes('quota')) {
        quotaExhausted = true;
        console.error('🛑 日次クォータ上限に到達。全リクエストを停止します。');
        throw new QuotaExceededError();
      }

      // 429 (rate limited) のみリトライ
      if (status === 429 && retries < maxRetries) {
        retries++;
        console.warn(
          `API制限 (429): ${backoff}ms 後にリトライ... (${retries}/${maxRetries})`
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        backoff *= 2; // 指数バックオフ
        continue;
      }
      throw error;
    }
  }
}
