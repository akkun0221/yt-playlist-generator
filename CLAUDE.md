@AGENTS.md

# 基本ルール

- 返答は常に日本語で行うこと

# アーキテクチャの制約

- インタラクティブなコンポーネントには必ず `'use client'` ディレクティブを付けること
- すべてのAPIルートは [src/lib/api-helpers.ts](src/lib/api-helpers.ts) の `withAuth()` でラップすること
- 状態管理ライブラリは追加しない — React hooksのみを使用する

# エラー処理

- YouTube APIからのHTTP 403（クォータ超過）はリトライ不可 — 即座にすべてのリクエストを停止し `quotaExhausted` フラグをセットすること
- HTTP 429（レートリミット）は `RateLimiter` クラスの指数バックオフで処理する — インラインでリトライしないこと
- エラーは [src/lib/errors.ts](src/lib/errors.ts) の `ApiError` / `QuotaExceededError` を使うこと。生の `Error` を投げないこと

# InnerTube（YouTube Music再生チェック）

- [src/lib/innertube-checker.ts](src/lib/innertube-checker.ts) のInnerTubeインスタンスはキャッシュされている — リクエストごとに再初期化しないこと（コストが高い）
- YouTube Musicでの再生可能性は `client: 'YTMUSIC'` で確認する — YouTube Data APIはMusic固有のライセンス制限を返さないため

# 日本語フィルタリング仕様

- NightCore以外のすべてのジャンルは、タイトルまたはチャンネル名に日本語を含む動画を除外する
- 判定には [src/lib/genres.ts](src/lib/genres.ts) の `containsJapanese()` を使うこと — 正規表現をインラインで書かないこと
- `allowJapanese` フラグはジャンルごとに設定されている。例外を追加する場合は必ず [src/lib/genres.ts](src/lib/genres.ts) を更新すること

# 履歴管理

- 動画の再生履歴は `/public/history.csv`（永続化用）とIndexedDB via Dexie（ランタイム用）の2箇所で管理されている
- 除外セットの取得には必ず [src/lib/history-db.ts](src/lib/history-db.ts) の `buildExclusionSet()` を使うこと — どちらか一方だけを参照しないこと

# プレイリスト生成仕様

- 選択されたすべてのジャンルは1回の実行につき1つの共有プレイリストに追加される（ジャンルごとに別プレイリストにはしない）
- 候補動画はターゲット数の3倍を収集し、多段フィルタリングの歩留まりに対応する
- ジャンルの処理は逐次実行（並列化しない） — クォータとレートリミットの同時爆発を防ぐため
- 動画の長さ制限は固定: 2〜10分（`MIN/MAX_DURATION_SECONDS`）。変更する場合はsearchルートで修正する

# 環境変数

- 起動時に必須変数を検証する処理は [src/lib/env.ts](src/lib/env.ts) にある — 新しい環境変数を追加する場合はここに先に定義すること
- ローカル設定は `.env.local` に記載する（`.env` ではない）。シークレットをコミットしないこと
