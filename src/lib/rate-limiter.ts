/**
 * レートリミッター + 指数バックオフ
 * YouTube Data API v3 のクォータ保護用
 */

import { ApiError, QuotaExceededError } from './errors';

export class RateLimiter {
  private static readonly MIN_INTERVAL_MS = 200;
  private lastCallTime = 0;
  private quotaExhausted = false;

  /**
   * クォータ枯渇フラグをチェック
   */
  isQuotaExhausted(): boolean {
    return this.quotaExhausted;
  }

  /**
   * クォータ枯渇フラグをリセット
   */
  resetQuota(): void {
    this.quotaExhausted = false;
  }

  /**
   * 最低間隔のスロットリング
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < RateLimiter.MIN_INTERVAL_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, RateLimiter.MIN_INTERVAL_MS - elapsed)
      );
    }
    this.lastCallTime = Date.now();
  }

  /**
   * レートリミット付き実行
   * - quotaExceeded (403) → 即停止（リトライ不要）
   * - 429 → 指数バックオフでリトライ
   */
  async execute<T>(fn: () => Promise<T>, maxRetries = 5): Promise<T> {
    if (this.quotaExhausted) {
      throw new QuotaExceededError();
    }

    let retries = 0;
    let backoff = 1000;

    while (true) {
      await this.throttle();
      try {
        return await fn();
      } catch (error: unknown) {
        const status = error instanceof ApiError ? error.status : 0;
        const message = error instanceof Error ? error.message : '';

        // quotaExceeded はリトライしても無駄 → 即停止
        if (status === 403 && message.toLowerCase().includes('quota')) {
          this.quotaExhausted = true;
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
          backoff *= 2;
          continue;
        }
        throw error;
      }
    }
  }
}

// シングルトンインスタンス（クライアント側で共有）
export const rateLimiter = new RateLimiter();
