---
name: agents-md
description: Creates and maintains concise AGENTS.md and CLAUDE.md project instruction files. Use when asked to create AGENTS.md, update AGENTS.md, maintain agent docs, set up CLAUDE.md, document repository agent conventions, or keep coding-agent instructions minimal and reference-backed.
---
# 维护 AGENTS.md

目标：提供简洁、可操作的代理说明。力求控制在 60 行以内；绝不超过 100 行。

## 工作流程

1. 编写前先检查：
   - 包管理器：锁文件和清单文件
   - 命令：`package.json`、`Makefile`、任务运行器、CI 工作流
   - 文档/规范/策略：`README.md`、`CONTRIBUTING.md`、`docs/`、`specs/`、`policies/`、`SECURITY.md`、`.github/`
   - 约定：当前代码模式、测试布局、生成的文件、应避免修改的旧版区域
2. 选择作用域：
   - 根目录 `AGENTS.md`：仓库范围的默认规则
   - 嵌套的 `AGENTS.md`：仅当某个子树使用不同命令或规则时创建
   - 距离最近的说明文件优先；作用域较窄的文件应比根目录文件更短
3. 编写满足需要的最精简文件。
4. 验证所有确切路径和命令均存在。

## 文件设置

- 在仓库根目录创建 `AGENTS.md`。
- 如果需要与 Claude 兼容的入口点，请将 `CLAUDE.md` 符号链接到 `AGENTS.md`。
- 不要维护内容存在差异的 `AGENTS.md` 和 `CLAUDE.md` 副本。

## 默认章节

仅使用能够提供非显而易见价值的章节。

````markdown
# Agent Instructions

## Package Manager
- Use **pnpm**: `pnpm install`

## Commands
| Task | Command |
|------|---------|
| Test file | `pnpm vitest run path/to/file.test.ts` |
| Lint file | `pnpm eslint path/to/file.ts` |

## External References
| Need | File |
|------|------|
| Setup | `CONTRIBUTING.md` |
| Architecture | `docs/architecture.md` |
| Security policy | `SECURITY.md` |

## Key Conventions
- Generated files: update with `pnpm generate`; do not edit by hand.

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: (the agent's name and attribution byline)
```
````

## 编写规则

- 使用标题、项目符号和表格；避免使用段落。
- 使用仓库相对路径；避免使用“参阅文档”之类的模糊引用。
- 引用现有文档/规范/策略，而不是复制其内容。
- 如果存在设置、架构、API 规范、安全、发布和策略文档，请列出对应的确切外部文件。
- 优先使用文件级测试/代码检查/类型检查命令；仅在没有更小范围的命令时才包含完整构建命令。
- 当命令超过一个时，将其放入表格。
- 每个项目符号仅包含一条规则。
- 除非理由能够避免可能发生的错误，否则不要写入理由。
- 不要复述代码检查器、格式化工具或类型检查器的配置。
- 不要列出已安装的技能或插件。
- 不要包含泛泛的质量口号。

## 外部引用规则

良好示例：

```markdown
## External References
| Need | File |
|------|------|
| API contract | `docs/api.md` |
| Release process | `docs/releasing.md` |
```

## 反面模式

- 欢迎语、介绍、结论或客套话
- 用大段文字解释说明为何这些指令很重要
- 重复 `README.md`、`CONTRIBUTING.md` 或策略文档中的内容
- 在有文件级命令可用时使用项目级命令
- 创建重复根目录说明的嵌套 `AGENTS.md` 文件