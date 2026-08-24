---
name: vibe-review
description: Review an AI-generated diff against AGENTS.md, agent_docs, and REVIEW-CHECKLIST.md.
---
# 氛围审查

阅读 `AGENTS.md`、`agent_docs/` 和 `REVIEW-CHECKLIST.md`。审查当前差异。首先给出发现的问题，按严重程度排序，并附上文件和行号引用。重点关注正确性、安全性、AI/工具权限、缺失的测试、数据泄露和可维护性。不要编辑文件。

适用时，还要指出提供商的数据保留/训练、遥测、数据边界、权限以及构建器退出审查方面的缺口。