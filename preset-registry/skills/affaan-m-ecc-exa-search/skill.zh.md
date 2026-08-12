---
name: exa-search
description: Neural search via Exa MCP for web, code, and company research. Use when the user needs web search, code examples, company intel, people lookup, or AI-powered deep research with Exa's neural search engine.
---
# Exa 搜索

通过 Exa MCP 服务器对网页内容、代码、公司和人员进行神经搜索。

## 何时启用

- 用户需要当前的网络信息或新闻
- 搜索代码示例、API 文档或技术参考资料
- 研究公司、竞争对手或市场参与者
- 查找某一领域的职业档案或人员
- 为任何开发任务开展背景研究
- 用户说“搜索”“查一下”“查找”或“……的最新动态是什么”

## MCP 要求

必须配置 Exa MCP 服务器。添加到 `~/.claude.json`：

```json
"exa-web-search": {
  "command": "npx",
  "args": ["-y", "exa-mcp-server"],
  "env": { "EXA_API_KEY": "YOUR_EXA_API_KEY_HERE" }
}
```

在 [exa.ai](https://exa.ai) 获取 API 密钥。

## 核心工具

### web_search_exa
用于获取当前信息、新闻或事实的常规网页搜索。

```
web_search_exa(query: "latest AI developments 2026", numResults: 5)
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------|
| `query` | string | required | 搜索查询 |
| `numResults` | number | 8 | 结果数量 |

### web_search_advanced_exa
支持域名和日期条件的筛选搜索。

```
web_search_advanced_exa(
  query: "React Server Components best practices",
  numResults: 5,
  includeDomains: ["github.com", "react.dev"],
  startPublishedDate: "2025-01-01"
)
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------|
| `query` | string | required | 搜索查询 |
| `numResults` | number | 8 | 结果数量 |
| `includeDomains` | string[] | none | 仅限特定域名 |
| `excludeDomains` | string[] | none | 排除特定域名 |
| `startPublishedDate` | string | none | ISO 日期筛选条件（开始） |
| `endPublishedDate` | string | none | ISO 日期筛选条件（结束） |

### get_code_context_exa
从 GitHub、Stack Overflow 和文档网站中查找代码示例和文档。

```
get_code_context_exa(query: "Python asyncio patterns", tokensNum: 3000)
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------|
| `query` | string | required | 代码或 API 搜索查询 |
| `tokensNum` | number | 5000 | 内容 token 数量（1000-50000） |

### company_research_exa
研究公司以获取商业情报和新闻。

```
company_research_exa(companyName: "Anthropic", numResults: 5)
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------|
| `companyName` | string | required | 公司名称 |
| `numResults` | number | 5 | 结果数量 |

### people_search_exa
查找职业档案和个人简介。

```
people_search_exa(query: "AI safety researchers at Anthropic", numResults: 5)
```

### crawling_exa
从 URL 提取完整的页面内容。

```
crawling_exa(url: "https://example.com/article", tokensNum: 5000)
```

**参数：**

| 参数 | 类型 | 默认值 | 说明 |
|-------|------|---------|-------|
| `url` | string | required | 要提取内容的 URL |
| `tokensNum` | number | 5000 | 内容 token 数量 |

### deep_researcher_start / deep_researcher_check
启动一个异步运行的 AI 研究智能体。

```
# Start research
deep_researcher_start(query: "comprehensive analysis of AI code editors in 2026")

# Check status (returns results when complete)
deep_researcher_check(researchId: "<id from start>")
```

## 使用模式

### 快速查询
```
web_search_exa(query: "Node.js 22 new features", numResults: 3)
```

### 代码研究
```
get_code_context_exa(query: "Rust error handling patterns Result type", tokensNum: 3000)
```

### 公司尽职调查
```
company_research_exa(companyName: "Vercel", numResults: 5)
web_search_advanced_exa(query: "Vercel funding valuation 2026", numResults: 3)
```

### 技术深度研究
```
# Start async research
deep_researcher_start(query: "WebAssembly component model status and adoption")
# ... do other work ...
deep_researcher_check(researchId: "<id>")
```

## 提示

- 使用 `web_search_exa` 进行宽泛查询，使用 `web_search_advanced_exa` 获取经过筛选的结果
- 对于聚焦的代码片段，使用较低的 `tokensNum`（1000-2000）；对于全面的上下文，使用较高的值（5000+）
- 将 `company_research_exa` 与 `web_search_advanced_exa` 结合使用，以进行全面的公司分析
- 使用 `crawling_exa` 获取搜索结果中特定 URL 的完整内容
- `deep_researcher_start` 最适合需要 AI 综合分析的全面主题

## 相关技能

- `deep-research` — 结合使用 firecrawl + exa 的完整研究工作流
- `market-research` — 使用决策框架的商业导向研究