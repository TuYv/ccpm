---
name: ROSA Verification Gates
description: "Choose the right local verification steps before claiming a ROSA change is complete."
---
# ROSA 验证门禁

从 `AGENTS.md` 和 `guidelines/testing-guidelines.md` 开始。

在以下情况下使用此技能：

- 准备提交或创建 PR
- 确定某项变更适合执行哪些检查
- 验证文档、命令或生成文件的变更

## 验证映射

### Go 代码变更

- `make fmt`
- 相关软件包测试或 `make test`
- `make lint`
- `make rosa`

### 命令或标志变更

- 上述所有 Go 代码检查
- 验证 `cmd/rosa/structure_test/command_structure.yml` 及其对应的 `command_args.yml`
- 帮助文本或文档发生变更时，运行 `make generate-docs`

### 生成的 mock 或资源

- `make generate`
- 针对受影响软件包或命令的相关测试

### 推送前的信心检查

- `make basic-checks`
- 变更准备就绪后，在推送前运行 `make pre-push-checks`
- 重新阅读 `.github/pull_request_template.md`，并将其中的开发者检查清单作为最终的 PR 就绪情况检查

## 规则

- 在新克隆的仓库中，首次提交前运行 `make install-hooks`。
- 不要绕过钩子。
- 除非任务明确要求更改依赖项状态，否则不要运行 `go mod tidy` 或 `go mod vendor`。
- 如果生成文件发生意外变更，请停止操作并在提交前确认原因。
- 如果命令发生了变更，但结构测试文件未变更，请确认有意省略了相关变更。
- 如果 PR 模板检查清单要求提供文档、手动验证或风险说明，请确保最终的 PR 正文确实涵盖这些内容。