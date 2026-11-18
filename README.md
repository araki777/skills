# skills

複数の AI コーディングエージェント（Antigravity / Claude Code / GitHub Copilot / Cursor 等）間で共通のワークフロー・手順を使い回すための個人用 Agent Skills リポジトリです。

## 構成

- `skills/<skill-name>/SKILL.md`: Agent Skills 仕様に沿ったスキル本体
- `scripts/sync-skills.mjs`: 各 AI エージェントの読み込み先へスキルを同期するスクリプト
- `Makefile`: `make sync` / `make update` 用のエントリーポイント

## 使い方

```bash
# Antigravity (~/.gemini/config/skills/) へスキルを同期
make sync

# 最新を取得して再同期
make update

# Claude Code 等にも gh skill 経由で配布する場合
node scripts/sync-skills.mjs --agents=claude-code,cursor
```
