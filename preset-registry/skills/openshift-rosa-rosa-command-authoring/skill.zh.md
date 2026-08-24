---
name: ROSA Command Authoring
description: "Add or edit Cobra commands in openshift/rosa while keeping command wiring thin and package logic aligned with repo structure."
---
# ROSA 命令编写

在以下情况下使用此技能：

- 添加新的 `rosa` 命令或子命令
- 更改标志或命令帮助信息
- 在 `cmd/` 和 `pkg/` 之间移动逻辑
- 重构命令执行流程

## 工作流程

1. 阅读 `AGENTS.md` 和 `guidelines/command-guidelines.md`，然后查看最相似的命令实现。
2. 保持 Cobra 命令文件精简，并将非 Cobra 逻辑移至 `pkg/`。
3. 遵循最相似命令区域中已确立的入口点和退出模式。
4. 许多 ROSA 命令使用 `Run: run`；不要在某个命令区域中切换 `Run` 和 `RunE`，也不要添加或移除直接的 `os.Exit()` 调用，除非周围已有相同的模式，并且相关更改能够保持行为一致。
5. 复用周围命令区域中已采用的 `output`、`reporter` 和 `interactive` 模式。
6. 如果命令树发生变化，请更新 `cmd/rosa/structure_test/command_structure.yml`。
7. 如果支持的标志发生变化，请更新对应的 `cmd/rosa/structure_test/command_args/**/command_args.yml`。
8. 当命令帮助信息或文档发生变化时，检查 `make generate-docs` 是否属于必要的验证步骤。

## 验证

- `make fmt`
- 相关的软件包测试或 `make test`
- `make rosa`
- 当命令文档或帮助输出发生变化时，运行 `make generate-docs`

请遵循 `CONTRIBUTING.md` 中规定的具体贡献流程和钩子要求。