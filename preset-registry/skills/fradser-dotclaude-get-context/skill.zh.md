---
name: get-context
description: Execute this when the user requests code context for a repository, library, or any natural-language code/technology question using DeepWiki, Context7, Exa, git clone, and/or web search+fetch.
user-invocable: true
argument-hint: "<query | repo-slug | library-name> [more targets...] [--method=deepwiki,context7,exa,clone,web,all]"
allowed-tools: ["Task"]
---
# get-context

启动一个 `code-context:context-researcher` 代理，使其在隔离的上下文中执行完整工作流。输入可以是**任意内容**：自然语言问题、仓库 slug、库名称，或同时包含其中多项。

## 参数解析

1. 将 **`$ARGUMENTS` 拆分**为位置目标和可选的 `--method` 标志。
   - `--method=` 接受由逗号分隔的列表，可选值为 `deepwiki,context7,exa,clone,web,all`。默认值：`all`。
   - 带引号的字符串视为一个目标：`"compare zustand vs jotai state management"` 是一个自然语言查询。
   - 多个位置标记视为多个目标：`facebook/react zustand` = 两个目标。
2. **对每个目标进行分类**：
   - GitHub slug（`owner/repo`）或 git URL → 仓库目标（DeepWiki / clone）。
   - 与已知软件包生态系统匹配的纯名称（`react`、`fastapi`、`next`），或包含版本提示的名称（`react@18`）→ 库目标（Context7）。
   - 其他任何内容（问题、比较、概念）→ 自然语言目标（Exa / web search）。
3. **输入为空**：读取当前工作目录中的依赖清单（`package.json`、`go.mod`、`pyproject.toml`、`Cargo.toml`），并将检测到的依赖项用作目标。

## 提示词模板

将解析后的目标和方法列表原样传递给代理——不要在主上下文中预先解析它们。

```
Code context request.

Targets (classify each as repo / library / natural-language query):
<positional targets, one per line; or "auto-detect from local dependency manifests" if empty>

Methods to use (in priority order; "all" = let agent choose per target):
<comma-separated method list, default "all">

Local context already known: <one line on what the cwd already contains, or "none">
```

## 执行

使用上述提示词模板启动 `code-context:context-researcher`。代理会返回一份综合摘要；无论查询量多大，主上下文都会保持整洁。