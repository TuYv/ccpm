---
name: commit
description: Create a git commit with a good message. Use when the user says "commit", "save changes", "commit this", or asks to create a commit after making code changes.
allowed-tools: Bash, Read, Grep, Glob
---
# Git 提交

审查所有已暂存的更改，并撰写一条精心打磨的提交信息。

## 步骤

1. 运行 `git status` 查看已暂存和未暂存的更改
2. 运行 `git diff --cached` 详细审查已暂存的更改
3. 如果没有任何内容被暂存，运行 `git diff` 并根据更改内容建议应暂存哪些文件
4. 运行 `git log --oneline -5` 查看该仓库最近的提交信息风格
5. 按照约定式提交（Conventional Commits）格式起草一条简洁的提交信息：
   - `feat:` — 新功能
   - `fix:` — 缺陷修复
   - `refactor:` — 不改变行为的代码重构
   - `docs:` — 文档变更
   - `test:` — 新增或更新测试
   - `chore:` — 构建、工具链、配置变更
6. 提交信息应聚焦于**为什么**而非**改了什么**——diff 已经展示了改动内容
7. 首行保持在 72 个字符以内
8. 如果改动较为复杂，添加正文段落
9. 创建提交

除非明确要求，否则不要推送（push）。不要使用 `--no-verify` 或跳过钩子（hooks）。

$ARGUMENTS
