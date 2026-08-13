---
name: knowledge-agent
description: Build and query AI-powered knowledge bases from claude-mem observations. Use when users want to create focused "brains" from their observation history, ask questions about past work patterns, or compile expertise on specific topics.
---
# 知识代理

使用来自 `claude-mem` 观察结果构建并查询 AI 驱动的知识库。

## 什么是知识代理？

知识代理是经过筛选的观察结果语料库，汇编为一个对话式 AI 会话。先从你的观察历史中构建一个语料库，再预加载它（将知识加载到 AI 会话中），然后通过对话方式向其提问。

你可以将它们视为定制的“智能体”：如“everything about hooks”“last month 的所有决策”“worker service 的所有 bugfix”。

## 工作流

### 步骤 1：构建语料库

```text
build_corpus name="hooks-expertise" description="Everything about the hooks lifecycle" project="claude-mem" concepts="hooks" limit=500
```

过滤选项：
- `project` — 按项目名称筛选
- `types` — 以逗号分隔：decision, bugfix, feature, refactor, discovery, change
- `concepts` — 以逗号分隔的概念标签
- `files` — 以逗号分隔的文件路径（前缀匹配）
- `query` — 语义搜索查询
- `dateStart` / `dateEnd` — ISO 日期范围
- `limit` — 最大观察条目数（默认 500）

### 步骤 2：预加载语料库

```text
prime_corpus name="hooks-expertise"
```

这会创建一个已加载全部语料知识的 AI 会话。大型语料库可能需要一点时间。

### 步骤 3：查询

```text
query_corpus name="hooks-expertise" question="What are the 5 lifecycle hooks and when does each fire?"
```

知识代理会基于其语料库进行回答。后续追问会保留上下文。

### 步骤 4：列出语料库

```text
list_corpora
```

显示所有语料库及其统计信息和预加载状态。

## 提示

- **专注语料库效果最佳** — “hooks architecture” 比“everything ever”更好
- **预加载一次，多次查询** — 会话在多次查询中保持
- **需要新上下文时重新预加载** — 若对话偏离主题，可重做预加载重置
- **重建以更新内容** — 当新增观察结果后，先重建再重新预加载

## 维护

### 重建语料库（用新观察结果刷新）

```text
rebuild_corpus name="hooks-expertise"
```

重建后，请重新预加载以加载更新后的知识：

### 重新预加载（新建会话）

```text
reprime_corpus name="hooks-expertise"
```

清除先前的问答上下文，并将语料库重新加载到新会话。
