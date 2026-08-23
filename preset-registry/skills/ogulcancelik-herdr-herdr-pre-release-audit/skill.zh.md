---
name: herdr-pre-release-audit
description: Audit herdr release readiness by comparing commits since the base release against next-release changelog and docs. Use when asked to run or apply the repo's pre-release audit, validate docs/next before release, inspect issue refs that release CI will close, or finalize release docs for herdr.
---
# Herdr 预发布审计

仅在 herdr 仓库内使用此技能。

阅读 `references/pre-release-audit.md` 并遵循其中的工作流。将其视为以下事项的唯一事实来源：

- 选择发布基准引用
- 检查第一父级历史记录和已合并的 PR
- 审计 `docs/next/CHANGELOG.md`
- 审计 `docs/next/README.md` 和已暂存的网站文档
- 根据已发布的 CLI 和代理控制行为检查 `skills/herdr/SKILL.md`
- 检查议题引用行
- 决定何时运行 `just pre-release-check` 或其组成检查
- 运行并评估 `just bench-render-scale`
- 生成最终的发布就绪情况报告

审计期间不要编辑文件，除非用户明确要求应用修复。应用修复时，请将更改范围限制在参考工作流中指定的文件内。