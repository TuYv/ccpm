---
name: perplexity
description: Web search and research using Perplexity AI. Use when user says "search", "find", "look up", "ask", "research", or "what's the latest" for generic queries. NOT for library/framework docs (use Context7) or workspace questions.
---
# Perplexity 工具

仅当用户针对一般性查询说出 "search"、"find"、"look up"、"ask"、"research" 或 "what's the latest" 时才使用。不适用于库/框架文档（使用 Context7）、gt CLI（使用 Graphite MCP）或工作区问题（使用 Nx MCP）。

## 快速参考

**该使用哪个 Perplexity 工具？**
- 需要搜索结果/URL？→ **Perplexity Search**
- 需要对话式回答？→ **Perplexity Ask**
- 需要深度研究？→ **Researcher agent**（`/research <topic>`）

**非 Perplexity 场景 - 请改用以下工具：**
- 库/框架文档 → **Context7 MCP**
- Graphite `gt` CLI → **Graphite MCP**
- 本工作区 → **Nx MCP**
- 特定 URL → **URL Crawler**

## Perplexity Search

**何时使用：**
- 一般性搜索、查找资源
- 当前最佳实践、最新信息
- 发现教程/博客文章
- 用户说 "search for..."、"find..."、"look up..."

**默认参数（务必使用）：**
```typescript
mcp__perplexity__perplexity_search({
  query: "your search query",
  max_results: 3,           // Default is 10 - too many!
  max_tokens_per_page: 512  // Reduce per-result content
})
```

**何时提高限制：**
仅在以下情况下：
- 用户明确需要全面的结果
- 初始搜索未找到有用内容
- 复杂主题需要多个来源

```typescript
// Increased limits (use sparingly)
mcp__perplexity__perplexity_search({
  query: "complex topic",
  max_results: 5,
  max_tokens_per_page: 1024
})
```

## Perplexity Ask

**何时使用：**
- 需要对话式解释而非搜索结果
- 综合来自网络的信息
- 结合当前语境解释概念

**用法：**
```typescript
mcp__perplexity__perplexity_ask({
  messages: [
    {
      role: "user",
      content: "Explain how postgres advisory locks work"
    }
  ]
})
```

**不适用于：**
- 库文档（使用 Context7）
- 深度多来源研究（使用 researcher agent）

## 禁止使用的工具

**绝不使用：** `mcp__perplexity__perplexity_research`

**请改用：** Researcher agent（`/research <topic>`）
- Token 成本：30-50k tokens
- 提供带引用的多来源综合分析
- 仅少量用于复杂问题

## 工具选择链

**优先级顺序：**
1. **Context7 MCP** - 库/框架文档
2. **Graphite MCP** - 任何提及 `gt` CLI 的情况
3. **Nx MCP** - 本工作区问题
4. **Perplexity Search** - 一般性搜索
5. **Perplexity Ask** - 对话式回答
6. **Researcher agent** - 深度多来源研究
7. **WebSearch** - 最后手段（在穷尽 Perplexity 之后）

## 示例

**✅ 正确 - 使用 Perplexity Search：**
- "Find postgres migration best practices"
- "Search for React testing tutorials"
- "Look up latest trends in microservices"

**✅ 正确 - 使用 Perplexity Ask：**
- "Explain how postgres advisory locks work"
- "What are the trade-offs of microservices?"

**❌ 错误 - 应改用 Context7：**
- "Search for React hooks documentation" → Context7 MCP
- "Find Next.js routing docs" → Context7 MCP
- "Look up Temporal workflow API" → Context7 MCP

**❌ 错误 - 应改用 Graphite MCP：**
- "Search for gt stack commands" → Graphite MCP
- "Find gt branch workflow" → Graphite MCP

**❌ 错误 - 应改用 Nx MCP：**
- "Search for build config"（本工作区内）→ Nx MCP
- "Find project dependencies"（本工作区内）→ Nx MCP

## 要点

- **默认使用有限的结果** - 避免上下文膨胀
- **库文档 = Context7** - 始终优先尝试 Context7
- **"gt" = Graphite MCP** - 任何提及 "gt" 之处都使用 Graphite
- **深度研究 = /research** - 而非 perplexity_research 工具
- **回退链** - Search → Ask → WebSearch（最后手段）
