# skills

複数の AI コーディングエージェント（Antigravity / Claude Code / GitHub Copilot / Cursor 等）間で共通のワークフロー・手順を使い回すための個人用 Agent Skills リポジトリです。

## 構成

- `skills/<skill-name>/SKILL.md`: 自作の Agent Skills 本体
- `external-skills.json`: `gh skill` 経由で取り込む外部公開スキル一覧（例: `obra/superpowers`）
- `scripts/sync-skills.mjs`: 各 AI エージェントの読み込み先へスキルを同期するスクリプト
- `Makefile`: `make sync` / `make sync-all` / `make update` 用のエントリーポイント

## 使い方

```bash
# 自作スキルを Antigravity (~/.gemini/config/skills/) へ同期
make sync

# 外部スキル（external-skills.json）も含めて Antigravity へ同期
make sync-all

# 最新を取得して再同期
make update

# Claude Code や Cursor 等にも自作＋外部スキルを一括配布する場合
node scripts/sync-skills.mjs --agents=claude-code,cursor
```
