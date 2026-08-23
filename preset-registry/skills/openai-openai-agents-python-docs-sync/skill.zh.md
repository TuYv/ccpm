---
name: docs-sync
description: Analyze main branch implementation and configuration to find missing, incorrect, or outdated documentation in docs/. Use when asked to audit doc coverage, sync docs with code, or propose doc updates/structure changes. Only update English docs under docs/** and never touch translated docs under docs/ja, docs/ko, or docs/zh. Provide a report and ask for approval before editing docs.
---
# 文档同步

## 概述

通过将主分支的功能和配置选项与当前文档结构进行比较，找出文档覆盖缺口和不准确之处，然后提出有针对性的改进建议。

## 工作流程

1. 确认范围和基础分支
   - 确定当前分支和默认分支（通常为 `main`）。
   - 优先分析当前分支，以确保工作与正在进行的更改保持一致。
   - 如果当前分支不是 `main`，则仅分析其相对于 `main` 的差异，以限定文档更新范围。
   - 如果切换分支会干扰本地更改，请避免这样做。优先使用只读检查方式，例如 `git show main:<path>`。如果确实需要单独检出，请先停止操作，并在创建或切换工作树之前，根据 `AGENTS.md` 的要求获得明确批准。

2. 根据选定范围构建功能清单
   - 如果位于 `main`：盘点全部功能范围并全面审查文档。
   - 如果不在 `main`：仅盘点相对于 `main` 的更改（功能新增/变更/移除）。
   - 重点关注面向用户的行为：公共导出、配置选项、环境变量、CLI 命令、默认值以及已记录的运行时行为。
   - 记录每一项的依据（文件路径 + 符号/设置）。
   - 使用有针对性的搜索查找选项类型和功能标志（例如：`rg "Settings"`、`rg "Config"`、`rg "os.environ"`、`rg "OPENAI_"`）。
   - 当主题涉及 OpenAI 平台功能时，调用 `$openai-knowledge`，从 OpenAI Developer Docs MCP 服务器获取最新详细信息，而不是自行猜测；如果信息存在差异，则以 SDK 源代码为准。

3. 文档优先检查：审查现有页面
   - 逐一检查 `docs/` 下的每个相关页面（不包括 `docs/ja`、`docs/ko` 和 `docs/zh`）。
   - 找出未提及的重要受支持选项（选择启用的标志、环境变量）、自定义点，或来自 `src/agents/` 和 `examples/` 的新功能。
   - 在用户合理预期能够找到相关信息的页面中提出补充建议。

4. 代码优先检查：将功能映射到文档
   - 审查 `docs/` 和 `mkdocs.yml` 下当前文档的信息架构。
   - 根据现有模式以及 `docs/ref` 下的 API 参考结构，确定每项功能最合适的页面/章节。
   - 找出完全没有文档页面的功能，或虽有页面但缺少相应内容的功能。
   - 注明哪些结构调整有助于提升内容的可发现性。
   - 改进 `docs/ref/*` 页面时，将 `src/` 中对应的文档字符串/注释视为事实来源。优先更新这些代码注释，而不是手动编辑生成的页面，以确保重新生成的参考文档保持正确。

5. 发现缺口和不准确之处
   - **缺失**：主分支中存在但文档中没有的功能/配置。
   - **不正确/已过时**：名称、默认值或行为与主分支不一致。
   - **结构问题**（可选）：页面内容过载、缺少概述或主题分组不当。

6. 生成文档同步报告并请求批准
   - 提供一份清晰的报告，其中包含依据、建议的文档位置和拟议的编辑内容。
   - 询问用户是否继续进行文档更新。

7. 如果获得批准，则应用更改（仅限英文）
   - 仅编辑 `docs/**` 中的英文文档。
   - **不要**编辑 `docs/ja`、`docs/ko` 或 `docs/zh`。
   - 确保更改与现有文档的风格和导航保持一致。
   - 添加或重命名页面时，更新 `mkdocs.yml`。
   - 使用 `AGENTS.md` 中的文档验证级别对完整差异进行分类，并仅运行该级别要求的检查。
   - 对于内容或结构更改，在编辑和必要审查稳定后运行一次 `make build-docs`。不要为仅编辑性更改运行该命令。

## 输出格式

报告发现时，请使用以下模板：

文档同步报告

- 文档优先的发现
  - 页面 + 缺失内容 -> 证据 + 建议的插入位置
- 代码优先的缺口
  - 功能 + 证据 -> 建议的文档页面/章节（或缺失的页面）
- 不正确或过时的文档
  - 文档文件 + 问题 + 正确信息 + 证据
- 结构性建议（可选）
  - 建议的更改 + 理由
- 建议的编辑
  - 文档文件 -> 简明的更改摘要
- 向用户提出的问题

## 参考资料

- `references/doc-coverage-checklist.md`