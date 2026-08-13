---
name: changelog
description: "Generate changelogs from git history and validate conventional commits. Usage: /changelog <generate|lint> [options]"
argument-hint: "<generate|lint> [options]"
---
# /changelog

根据 git 历史生成 Keep a Changelog 条目，并验证提交消息格式。

## 用法

```
/changelog generate [--from-tag <tag>] [--to-tag <tag>]    Generate changelog entries
/changelog lint [--from-ref <ref>] [--to-ref <ref>]       Lint commit messages
```

## 示例

```
/changelog generate --from-tag v2.0.0
/changelog lint --from-ref main --to-ref dev
/changelog generate --from-tag v2.0.0 --to-tag v2.1.0 --format markdown
```

## 脚本
- `engineering/skills/changelog-generator/scripts/generate_changelog.py` — 解析提交并呈现变更日志（`--from-tag`、`--to-tag`、`--from-ref`、`--to-ref`、`--format markdown|json`）
- `engineering/skills/changelog-generator/scripts/commit_linter.py` — 验证约定式提交格式（`--from-ref`、`--to-ref`、`--strict`、`--format text|json`）

## Skill 参考
→ `engineering/skills/changelog-generator/SKILL.md`