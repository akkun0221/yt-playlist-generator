#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# YouTube Music プレイリスト自動生成アプリ
# 初期化 & GitHub Push 自動化スクリプト
# ============================================================
# 使い方:
#   1. 下記の認証情報を自分のものに置き換え
#   2. bash init-and-push.sh
# ============================================================

# --- 設定（★書き換えてください） ---
PROJECT_NAME="yt-playlist-generator"
API_KEY="YOUR_API_KEY"
CLIENT_ID="YOUR_CLIENT_ID"
CLIENT_SECRET="YOUR_CLIENT_SECRET"

# --- 定数 ---
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="${SCRIPT_DIR}"
GITHUB_REPO_NAME="${PROJECT_NAME}"

echo ""
echo "=================================================="
echo " YT Playlist Generator — セットアップ開始"
echo "=================================================="
echo ""

# ============================================================
# 1. プロジェクトが既に存在するか確認
# ============================================================
if [ ! -f "${PROJECT_DIR}/package.json" ]; then
  echo "❌ package.json が見つかりません。"
  echo "   このスクリプトはプロジェクトルートで実行してください。"
  exit 1
fi

echo "✅ プロジェクト確認: ${PROJECT_DIR}"

# ============================================================
# 2. .env.local 生成
# ============================================================
echo ""
echo "🔐 .env.local を生成中..."
SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s)_$(head -c 32 /dev/urandom | base64)")

cat > "${PROJECT_DIR}/.env.local" << EOF
YOUTUBE_API_KEY=${API_KEY}
GOOGLE_CLIENT_ID=${CLIENT_ID}
GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${SECRET}
EOF

echo "   → .env.local 作成完了"

# ============================================================
# 3. 空 history.csv が存在するか確認
# ============================================================
if [ ! -f "${PROJECT_DIR}/public/history.csv" ]; then
  echo "📄 空 history.csv を生成..."
  echo "id" > "${PROJECT_DIR}/public/history.csv"
fi
echo "✅ public/history.csv 確認済み"

# ============================================================
# 4. 依存パッケージインストール
# ============================================================
echo ""
echo "📦 依存パッケージをインストール中..."
cd "${PROJECT_DIR}"
npm install
echo "   → インストール完了"

# ============================================================
# 5. ビルド確認
# ============================================================
echo ""
echo "🔨 ビルド確認中..."
npm run build
echo "   → ビルド成功"

# ============================================================
# 6. .gitignore に .env.local が含まれるか確認
# ============================================================
if ! grep -q "^\.env\.local$" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
  echo "   → .gitignore に .env.local を追加"
fi

# ============================================================
# 7. Git 初期化 & コミット
# ============================================================
echo ""
echo "📝 Git 初期化 & コミット..."

# 既存の .git があればスキップ
if [ ! -d ".git" ]; then
  git init
fi

git add -A
git commit -m "feat: initial commit - YT Playlist Generator

- 23 genres (NightCore, Thrash Metal, Symphonic Metal, etc.)
- YouTube Data API v3 OAuth integration via NextAuth
- IndexedDB + CSV deduplication engine
- Rate limiter with exponential backoff
- 5 songs per genre (~9,200 API units/day budget)
- Public playlist creation
- CSV history export
"

echo "   → コミット完了"

# ============================================================
# 8. GitHub リポジトリ作成 & Push
# ============================================================
echo ""
echo "🐙 GitHub リポジトリ作成 & Push..."

# gh CLI がインストールされているか確認
if ! command -v gh &> /dev/null; then
  echo "❌ GitHub CLI (gh) がインストールされていません。"
  echo "   https://cli.github.com/ からインストールしてください。"
  echo ""
  echo "   手動で Push する場合:"
  echo "   git remote add origin https://github.com/YOUR_USERNAME/${GITHUB_REPO_NAME}.git"
  echo "   git push -u origin main"
  exit 1
fi

# gh auth 確認
if ! gh auth status &> /dev/null; then
  echo "❌ gh が認証されていません。 gh auth login を実行してください。"
  exit 1
fi

# リポジトリ作成 & Push
gh repo create "${GITHUB_REPO_NAME}" \
  --private \
  --source=. \
  --remote=origin \
  --push \
  --description "YouTube Music playlist auto-generator for 23 metal/punk/hardcore genres"

echo ""
echo "=================================================="
echo " ✅ セットアップ完了！"
echo "=================================================="
echo ""
echo "GitHub: https://github.com/$(gh api user -q .login)/${GITHUB_REPO_NAME}"
echo ""
echo "ローカル開発サーバー起動:"
echo "  cd ${PROJECT_DIR}"
echo "  npm run dev"
echo ""
echo "⚠️  .env.local の認証情報を実際の値に書き換えてください"
echo ""
