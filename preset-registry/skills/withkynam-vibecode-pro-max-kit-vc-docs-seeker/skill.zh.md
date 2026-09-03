---
name: vc-docs-seeker
description: Search library/framework documentation via llms.txt (context7.com). Use for API docs, GitHub repository analysis, technical documentation lookup, latest library features.
argument-hint: "[library-name] [topic]"
trigger_keywords: how does X work, API docs, version, syntax
layer: helper
metadata:
  author: claudekit
  version: "3.1.0"
---
# 文档发现

> **输出风格：** 遵循 `process/development-protocols/communication-standards.md` —— 回答优先、语言平实、不使用未解释的术语，长回复附 TL;DR 摘要。

## 概述

使用 Context7 MCP 作为文档查找的默认路径。当 Context7 无法很好地覆盖目标内容时，本技能中的本地脚本可作为基于 llms.txt 的发现方式的回退辅助工具。

## 主要工作流

**默认工作流：优先使用 Context7**

1. 使用 Context7 解析目标库。
2. 使用 Context7 查询确切的 API/配置/安装问题。
3. 仅当 Context7 覆盖缺失、不完整，或用户明确希望采用 llms.txt/面向仓库的发现方式时，才回退到下面的脚本。

**回退脚本工作流：**

```bash
# 1. DETECT query type (topic-specific vs general)
node scripts/detect-topic.js "<user query>"

# 2. FETCH documentation using script output
node scripts/fetch-docs.js "<user query>"

# 3. ANALYZE results (if multiple URLs returned)
cat llms.txt | node scripts/analyze-llms-txt.js -
```

脚本会自动处理 URL 构造、回退
