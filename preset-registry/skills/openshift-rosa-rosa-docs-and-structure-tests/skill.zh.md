---
name: ROSA Docs And Structure Tests
description: "Keep CLI docs, structure tests, and user-facing guidance in sync when commands or workflow docs change."
---
# ROSA 文档和结构测试

在以下情况下使用此技能：

- 任务涉及命令树或标志变更
- 帮助文本或生成的 CLI 文档发生变更
- 正在更新 `AGENTS.md`、`CONTRIBUTING.md`、`guidelines/*-guidelines.md`、PR 模板或议题表单

## 工作流程

1. 如果命令树发生变更，请更新 `cmd/rosa/structure_test/command_structure.yml`。
2. 如果标志发生变更，请更新对应的 `cmd/rosa/structure_test/command_args/**/command_args.yml`。
3. 如果命令帮助文本或生成的文档需要变更，请运行 `make generate-docs`。
4. 当工作流程措辞发生变更时，请确保 `AGENTS.md`、`CLAUDE.md`、`GEMINI.md`、`CONTRIBUTING.md`、`guidelines/ARCHITECTURE.md` 和 `.github/pull_request_template.md` 保持一致。
5. 确保议题模板针对真实的 ROSA 工作流程和可复现的问题报告。
6. 对于面向 AWS 的文档，请与 `AGENTS.md` 中链接的 ROSA 和 AWS 官方文档进行交叉核对。

## 验证

- 重新阅读编辑后的文档，检查是否存在过时命令、占位符以及与实际工作流程不一致之处。
- 确认命令和标志文档与结构测试文件一致。
- 执行 `CONTRIBUTING.md` 中要求的所有本地验证。