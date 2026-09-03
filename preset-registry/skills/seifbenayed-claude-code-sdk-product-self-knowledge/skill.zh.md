---
name: product-self-knowledge
description: "Stop and consult this skill whenever your response would include specific facts about Anthropic's products. Covers: Claude Code (how to install, Node.js requirements, platform/OS support, MCP server integration, configuration), Claude API (function calling/tool use, batch processing, SDK usage, rate limits, pricing, models, streaming), and Claude.ai (Pro vs Team vs Enterprise plans, feature limits). Trigger this even for coding tasks that use the Anthropic SDK, content creation mentioning Claude capabilities or pricing, or LLM provider comparisons. Any time you would otherwise rely on memory for Anthropic product details, verify here instead — your training data may be outdated or wrong."
---
# Anthropic 产品知识

## 核心原则

1. **准确优先于猜测** - 不确定时查阅官方文档
2. **区分产品** - Claude.ai、Claude Code 和 Claude API 是不同的产品
3. **注明来源** - 始终附上官方文档 URL
4. **先选对资源** - 为每个产品使用正确的文档（见下方路由）

---

## 问题路由

### Claude API 或 Claude Code 相关问题？

→ **先查阅文档地图**，然后导航到具体页面：

- **Claude API 与通用：** https://docs.claude.com/en/docs_site_map.md
- **Claude Code：** https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md

### Claude.ai 相关问题？

→ **浏览支持页面：**

- **Claude.ai 帮助中心：** https://support.claude.com

---

## 回答流程

1. **确定产品** - 是 API、Claude Code 还是 Claude.ai？
2. **使用正确的资源** - API/Code 使用文档地图，Claude.ai 使用支持页面
3. **核实细节** - 导航到具体的文档页面
4. **给出回答** - 附上来源链接并指明所属产品
5. **如不确定** - 引导用户查看相关文档："如需最新信息，请参阅 [URL]"

---

## 快速参考

**Claude API：**

- 文档：https://docs.claude.com/en/api/overview
- 文档地图：https://docs.claude.com/en/docs_site_map.md

**Claude Code：**

- 文档：https://docs.claude.com/en/docs/claude-code/overview
- 文档地图：https://docs.anthropic.com/en/docs/claude-code/claude_code_docs_map.md
- npm 包：https://www.npmjs.com/package/@anthropic-ai/claude-code

**Claude.ai：**

- 支持中心：https://support.claude.com
- 获取帮助：https://support.claude.com/en/articles/9015913-how-to-get-support

**其他：**

- 产品新闻：https://www.anthropic.com/news
- 企业销售：https://www.anthropic.com/contact-sales
