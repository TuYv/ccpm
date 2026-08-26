---
name: utility-pm-changelog-curator
description: Draft CHANGELOG entries from git log via the pm-changelog-curator sub-agent. Dispatches natively on Claude Code with the pm-skills plugin (invokes @agent-pm-skills:pm-changelog-curator); on non-Claude clients (Codex CLI, Cursor, Windsurf, Copilot, Gemini CLI) reads agents/pm-changelog-curator.md and executes the system prompt inline. Applies CLAUDE.md hygiene rules (no internal-notes references, no em-dashes, no Claude attribution trailers, public paths only). Returns a layered draft (full CHANGELOG draft + Status Summary prose + Status YAML envelope per master plan D26) with hidden justification comments for maintainer audit. Refuses on dirty working tree unless --committed-only is passed.
license: Apache-2.0
metadata:
  classification: utility
  version: "1.0.0"
  updated: 2026-05-17
  category: release
  frameworks: [triple-diamond]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# PM 变更日志整理器（调度技能）

面向不同客户端的 `pm-changelog-curator` 子代理调度封装。检测运行时环境；在 Claude Code 上调度原生子代理；在非 Claude 客户端上读取 `agents/pm-changelog-curator.md` 并以内联方式执行。

## 适用场景

- 你正在准备一次发布，并希望根据两个标签之间的 git log 生成 CHANGELOG 草稿
- 你运行在不支持原生 `pm-changelog-curator` 子代理的非 Claude AI 客户端上
- 你希望生成的草稿遵循 pm-skills 的 CHANGELOG 规范（不引用 internal-notes、不使用 em-dash、仅使用公开路径），而无需手动应用这些规则

## 不适用场景

- 你想直接提交 CHANGELOG 条目（此技能生成供审阅的草稿，而不是提交）
- 你想审阅 PM 文档 -> 改用 `utility-pm-critic`
- 你想执行全仓库治理审计 -> 改用 `utility-pm-skill-auditor`
- 你想执行完整的引导式发布流程 -> 改用 `utility-pm-release-conductor`（该技能会在 G2 阶段串联此技能）

## 指令

**运行时检测步骤。** 确定调用此技能的是哪个 AI 客户端。

### 如果你在安装了 pm-skills 插件的 Claude Code 中运行

使用用户参数调用 `@agent-pm-skills:pm-changelog-curator`。如果 `$ARGUMENTS` 中存在，则传递 `--since-tag`、`--target-version`、`--committed-only`。将子代理的草稿返回给用户。

### 如果你在任何其他 AI 客户端中运行

Codex CLI、Cursor、Windsurf、Copilot、Gemini CLI，或任何不支持原生 pm-skills 插件子代理的其他客户端：

1. 读取规范的子代理定义 `agents/pm-changelog-curator.md`
2. 将该文件中的系统提示正文作为你的操作指令执行
3. 执行子代理定义中记录的 8 步草稿编写流程（确定范围 -> 阅读规范规则 -> 检查工作树 -> 枚举提交 -> 分类 -> 分组 -> 改写 -> 确定目标版本 -> 输出草稿）
4. 应用 `$ARGUMENTS` 中的 `--since-tag`、`--target-version` 和 `--committed-only` 参数
5. 按照主计划 D26 返回分层输出（完整 CHANGELOG 草稿 + Status Summary + Status YAML）

## 跨客户端说明

调度技能要求 AI 客户端：

1. 执行 Bash，以调用 `git log`、`git describe` 和 `git status`
2. 读取 CLAUDE.md 规范规则以及现有 CHANGELOG.md 的格式参考
3. 读取规范的子代理定义文件
4. 将代理正文视为操作指令

请参阅[子代理兼容性矩阵](../../docs/reference/sub-agent-compatibility.md)，了解规范的跨客户端状态。截至 v2.16.0，此技能的状态摘要为：Claude Code + Codex CLI 上为 PRODUCTION（Codex CLI 已成功运行 git log、读取 CLAUDE.md 规范规则、编写整洁的 CHANGELOG 条目，并正确拒绝脏工作树）；Cursor / Windsurf / Copilot CLI / Gemini CLI 上为 EXPERIMENTAL。如果某个客户端不可靠，请使用手动 `git log`，并以 CLAUDE.md 作为规范参考手动编写草稿。

## 参考文件

- 标准子代理定义：[`agents/pm-changelog-curator.md`](../../agents/pm-changelog-curator.md)
- 行为规范：[`docs/internal/release-plans/v2.16.0/spec_pm-changelog-curator.md`](../../docs/internal/release-plans/v2.16.0/spec_pm-changelog-curator.md)
- CHANGELOG 规范规则来源：`CLAUDE.md`（仓库根目录）
- 现有 CHANGELOG.md 格式：`CHANGELOG.md`（根目录）；v2.15.1 + v2.15.2 条目为标准示例
- 运行时组件目录：[`docs/reference/runtime-components.md`](../../docs/reference/runtime-components.md)
- 输出模板：`references/TEMPLATE.md`
- 完整示例：`references/EXAMPLE.md`