---
name: zenn-scrap
description: 会話や作業で得た学びを Zenn の Scrap へ投稿するためのワークフロー。ユーザーが「Zenn スクラップに投稿して」「今の学びをスクラップに残して」等と依頼したときに使用する。
---

# Zenn スクラップ投稿スキル（GitHub Actions 連携）

このスキルは、スクラップ専用リポジトリ（`araki777/zenn-scraps`）の `docs/スクラップ/` への Markdown 追加＋Push によって GitHub Actions 経由で Zenn Scrap へ投稿するための手順を定義する。ローカルに未チェックアウトの場合は、現在の作業ディレクトリの兄弟ディレクトリ（`../zenn-scraps`）やホーム配下等を探し、見つからなければユーザーへ確認または `gh repo clone araki777/zenn-scraps` する。

## 手順

1. **投稿内容の整理とドラフト提示**
   - ユーザーとの会話や直近の作業から、技術的な学び・ハマりポイント・解決策を整理する。
   - **文体ルール**:
     - AI っぽい定型文、過剰な見出し（`### 背景` `### まとめ` 等の連発）、絵文字や「〜が可能です！」のような解説調を避け、**自分のメモ帳・備忘録のような自然な文体**で書く。
     - 「どんな調査・検証をしたか」「何の一次情報・コマンド出力を見て判断したか」を簡潔に書き残す。
     - ユーザーから明示的な指示がない限り、特定のプロジェクト名（`nagi` 等）は書かず汎用的な技術メモにする。
   - **重要**: API キー、トークン、個人情報、内部ホスト情報など機密情報が本文に含まれないよう必ず確認する。
   - ユーザーに以下を提示して承認を得る（新規作成か既存 Scrap への追記かも確認する。既存の技術雑記メモは `scrap_slug: "b3d4fab667b0d9"`）：
     - タイトル（新規作成時）または投稿先 `scrap_slug`（既存 Scrap 追記時）
     - トピック（例: `zenn,mcp,ai`）
     - 公開設定（公開 / 限定公開 `unlisted: true`）
     - 本文プレビュー

2. **ファイル作成**
   - ファイルパス: `<zenn-scraps-repo>/docs/スクラップ/YYYY-MM-DD-<英語または日本語スラッグ>.md`
   - フォーマット：
     ```markdown
     ---
     title: "スクラップのタイトル"
     scrap_slug: ""
     topics: "ai,dev"
     unlisted: false
     disallow_others_post: false
     ---

     本文（Zenn 記法 / Markdown）
     ```
     - 既存スクラップへコメント追記する場合は `scrap_slug` に既存のスラッグ（または URL）を指定する（`title` は省略可）。

3. **ドライラン確認（任意）**
   - `node <zenn-scraps-repo>/scripts/post-zenn-scrap.mjs <zenn-scraps-repo>/docs/スクラップ/<ファイル名>.md --dry-run` で Frontmatter パースとシークレットスキャンに問題がないか確認できる。

4. **コミット＆プッシュ（`zenn-scraps` リポジトリ）**
   - コミットメッセージは Conventional Commits に従う（例: `docs: Zennスクラップ投稿（<要約>）`）。
   - `main` へプッシュすると `.github/workflows/zenn-scrap.yml` が自動実行され、Zenn へ投稿される。

5. **結果報告**
   - `gh run list -R araki777/zenn-scraps --workflow zenn-scrap.yml --limit 3` 等でワークフローの成否を確認し、投稿完了をユーザーへ報告する。
