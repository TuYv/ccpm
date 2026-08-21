---
name: unslop-commit
description: >
  Rewrites commit messages so they sound like a careful human engineer wrote them.
  Strips AI/marketing slop ("comprehensive solution", "robust implementation", "leverage", "enhance",
  "seamlessly", "This commit..."). Keeps Conventional Commits format. Subject ≤72 chars (aim ≤50),
  imperative mood. Body only when "why" isn't obvious from the subject.
  Use when user says "humanize commit", "de-slop commit message", "make this commit sound human",
  "/unslop-commit", "/commit", "write a commit", or pastes a draft commit to clean up.
  Auto-triggers when staging changes.
---
# 去除提交信息中的套话

## 目的

生成或重写提交信息，使其读起来像是一名真正的工程师在忙碌一天结束时写下的内容。采用 Conventional Commits 格式。直接、具体，不使用模板化英语。多说明原因，少描述做了什么。

## 触发方式

`/unslop-commit`、`/commit`、“写一条提交信息”、“提交信息”、“让这条提交信息更自然”、“去除这条提交信息中的套话”。当用户已有暂存的更改并要求生成提交信息时自动触发。

## 规则

### 主题行

- 格式：`<type>(<scope>): <imperative summary>`
- 作用域可选。类型包括：`feat`、`fix`、`chore`、`refactor`、`docs`、`test`、`perf`、`build`、`ci`、`revert`。
- 使用祈使语气：`add`、`fix`、`move`、`remove`，而不是 `added`、`fixes`、`fixing`。
- 尽可能不超过 50 个字符。硬性上限为 72 个字符。
- 结尾不加句号。
- `:` 后使用小写，除非项目约定使用大写。

### 正文（仅在主题行无法完整表达时使用）

- 以下情况需要添加正文：不明显的“原因”、破坏性变更、迁移、安全背景、数据完整性。
- 每行不超过 72 个字符。存在两个或更多独立要点时使用 `-` 项目符号。只有一个要点时使用单段文本。
- 以引用结尾：`Closes #42`、`Refs #17`。除非确实存在破坏性变更，否则不要使用 `BREAKING CHANGE:`；如果确实存在，就明确写出。

### 绝不包含

- 模板化前缀：“此提交……”“此变更……”“我们正在……”“我已经……”
- 营销式词语：全面、稳健、增强、利用、无缝、整体
- 无意义的副词：只是、真的、基本上、简单地、实际上
- 当作用域已经指出文件时，再次复述文件名
- “应……的要求”（如果需要署名，请使用 `Co-authored-by:`）
- AI 署名，除非项目要求
- 表情符号，除非项目惯例如此

### 自动补充说明（始终包含正文）

- 破坏性变更
- 安全修复
- 数据迁移
- 回滚（注明被回滚的提交）

## 示例

### 差 → 好（主题行冗长，无正文）

- 差：`feat: implement a comprehensive, robust solution for user profile retrieval with enhanced error handling`
- 好：`feat(api): return profile fields the mobile client actually needs`

### 差 → 好（正文含糊）

差：
```
fix: fixed the bug

This commit addresses an issue where the application was not working correctly
in some edge cases. We've improved the logic to handle these scenarios.
```

好：
```
fix(checkout): ignore stale cart id from localStorage

Stale cart ids came from tabs that hadn't refreshed after a deploy. Server
now treats unknown ids as empty cart instead of 500.

Closes #842
```

### 破坏性变更

```
feat(api)!: rename /v1/orders to /v1/customer-orders

The old route stays in place until the next major release but logs a
deprecation warning. Internal services have been migrated.

BREAKING CHANGE: third-party integrations using /v1/orders directly need
to switch to /v1/customer-orders by 2026-07-01.

Closes #1290
```

## 边界

- 只输出提交信息，并将其放在单个围栏代码块中，以便直接粘贴。
- 不要运行 `git commit`，也不要暂存或修订提交。
- 如果变更确实微不足道（`docs(readme): fix typo`），就保持简短。不要凑内容。
- 绝不虚构用户未提供的背景。如果“原因”不明确，就询问用户，或省略正文。