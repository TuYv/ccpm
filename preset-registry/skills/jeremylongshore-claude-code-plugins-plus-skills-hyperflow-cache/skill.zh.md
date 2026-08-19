---
name: hyperflow-cache
description: Hyperflow memory manager. Use to view, search, add, edit, prune, or clear hyperflow project memory — "show memory", "search memory for X", "clear memory", "what does hyperflow remember about Y". CRUD over .hyperflow/memory/ only — never touches source code.
---
# hyperflow-cache — 记忆 CRUD（Antigravity 单代理）

管理 `.hyperflow/memory/` 条目。**仅限记忆文件**——绝不操作源代码。遵循 `hyperflow` 规范。

## 操作

- **view / list** — 打印 `.hyperflow/memory/{decisions,learnings,pitfalls,patterns}.md` 中的条目。
- **search `<term>`** — grep 记忆文件；显示匹配的条目及其文件和标题。
- **add** — 将带标签的条目追加到正确的类别文件（decisions / learnings / pitfalls / patterns）中。使用以下格式：`## <topic>`，然后是 `- <fact> (recorded <YYYY-MM-DD>)`。
- **edit `<entry>`** — 原地更新现有条目（不要重复添加）。
- **prune / clear** — 移除过时或错误的条目。在执行破坏性清除前，通过 AskUserQuestion 进行确认（二选一 Yes/No）。

## 规则

- 范围仅限 `.hyperflow/memory/`。不要记录仓库/git 已经捕获的内容；记录那些不明显的原因。