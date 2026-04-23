/**
 * 環境変数バリデーション
 * サーバー起動時に必須環境変数の存在を検証
 */

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`環境変数 ${key} が設定されていません。.env.local を確認してください。`);
  }
  return value;
}

export const env = {
  YOUTUBE_API_KEY: getRequiredEnv('YOUTUBE_API_KEY'),
  GOOGLE_CLIENT_ID: getRequiredEnv('GOOGLE_CLIENT_ID'),
  GOOGLE_CLIENT_SECRET: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
  NEXTAUTH_SECRET: getRequiredEnv('NEXTAUTH_SECRET'),
} as const;
