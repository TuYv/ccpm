---
name: vc-generate-context
description: Generate or update the project's authoritative repository context at process/context/all-context.md. Use when repo context is missing, stale, or contradicted by code.
trigger_keywords: generate context, update context, refresh context, missing context
layer: contract
metadata:
  author: vibecode-pro-max-kit
  version: "1.0.0"
---
# 生成上下文

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md`——答案先行、使用平实语言、不使用未加解释的术语、较长的回复提供 TL;DR。

使用此技能来维护 `process/context/all-context.md`，即由 Codex 和 Claude 共享的广泛可移植项目知识层。在阅读分组文档之前，先以 `process/context/all-context.md` 作为上下文路由。

可选输入：一个需要优先刷新的包、应用、特性、上下文分组或架构区域。

## 工作流程

1. 阅读 `references/generate-context.md` 以了解完整的上下文契约。
2. 确定模式：
   - 当 `process/context/all-context.md` 不存在时，进行全量扫描。
   - 当它存在时，进行增量更新。
3. 当 `process/context/all-context.md` 存在时，阅读它以识别相关的分组上下文文件。
4. 检查当前仓库状态、进行中的计划、特性文件夹、包脚本、工具链、重要架构文件以及相关的 `process/context/**/*.md` 文档。
5. 生成 `process/context/all-context.md`，并为每个检测到或已批准的分组额外生成 `process/context/{group}/all-{group}.md`（参见下文的“调用模式”）。
6. 包含扫描时间戳、仓库 HEAD（如可用）、自上次更新以来的变更、待解决问题以及来源引用。
7. 校验生成的上下文：
   ```bash
   node .claude/skills/vc-generate-context/scripts/validate-all-context.mjs
   ```
8. 如果路由或分组上下文发生了变化，还需运行：
   ```bash
   node .claude/skills/vc-audit-context/scripts/validate-context-discovery.mjs
   ```

## 规则

- 将 `process/context/` 视为持久的跨智能体知识。
- 将 `process/context/all-context.md` 视为持久的路由协议；不要用生成的散文式文字替代它。
- 不要在这里存储智能体特定的机制细节，除非它们会影响项目工作流。
- 不要重写分组上下文文档；如果它们已过时或分组有误，标记 `audit-context`。
- 优先采用简洁、基于事实、针对具体路径的文档说明。
- 包管理相关表述使用 `pnpm` 术语。
- 在将上下文呈现为已刷新之前，将校验失败视为阻塞性问题。

## 调用模式

| 模式 | 触发条件 | 分组检测 | 输出 |
|---|---|---|---|
| `setup-delegation` | 由 vc-setup 调用并传入已批准的分组列表 | 跳过重新检测；使用所提供的列表 | `all-context.md` + 每个已批准分组对应的 `all-{group}.md` |
| `standalone-full` | 直接调用，无分组列表 | 通过 `references/generate-context.md` 中的检测表自行检测分组 | `all-context.md` + 所有检测到的分组对应的 `all-{group}.md` |
| `delta` | 在上下文已存在时调用；更新上下文 | 自行检测；仅创建缺失的分组；对未识别的分组发出警告；绝不删除 | 更新后的 `all-context.md` + 任何新建的 `all-{group}.md` 文件 |

各模式的详细说明、上下文分组检测表以及增量模式的分组创建规则，请参见 `references/generate-context.md`。
