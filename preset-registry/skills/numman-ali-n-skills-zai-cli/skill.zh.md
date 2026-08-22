---
name: zai-cli
description: |
  Z.AI CLI providing:
  - Vision: image/video analysis, OCR, UI-to-code, error diagnosis (GLM-4.6V)
  - Search: real-time web search with domain/recency filtering
  - Reader: web page to markdown extraction
  - Repo: GitHub code search and reading via ZRead
  - Tools: MCP tool discovery and raw calls
  - Code: TypeScript tool chaining
  Use for visual content analysis, web search, page reading, or GitHub exploration. Requires Z_AI_API_KEY.
---
# ZAI CLI

通过 `npx zai-cli` 使用 Z.AI 的功能。该 CLI 提供自解释文档——可在任意层级使用 `--help`。

## 设置

```bash
export Z_AI_API_KEY="your-api-key"
```

在此获取密钥：https://z.ai/manage-apikey/apikey-list

## 命令

| 命令 | 用途 | 帮助 |
|---------|---------|------|
| vision | 分析图像、屏幕截图和视频 | 使用 `--help` 查看 8 个子命令 |
| search | 实时网页搜索 | 使用 `--help` 查看筛选选项 |
| read | 获取网页并转换为 Markdown | 使用 `--help` 查看格式选项 |
| repo | 搜索和读取 GitHub 代码 | 使用 `--help` 查看 tree/search/read |
| tools | 列出可用的 MCP 工具 | |
| tool | 显示工具架构 | |
| call | 原始 MCP 工具调用 | |
| code | TypeScript 工具链式调用 | |
| doctor | 检查设置和连接性 | |

## 快速开始

```bash
# Analyze an image
npx zai-cli vision analyze ./screenshot.png "What errors do you see?"

# Search the web
npx zai-cli search "React 19 new features" --count 5

# Read a web page
npx zai-cli read https://docs.example.com/api
npx zai-cli read https://docs.example.com/api --with-images-summary --no-gfm

# Explore a GitHub repo
npx zai-cli repo search facebook/react "server components"
npx zai-cli repo search openai/codex "config" --language en
npx zai-cli repo tree openai/codex --path codex-rs --depth 2

# Check setup
npx zai-cli doctor
```

## 输出

默认：**仅数据**（为提高 token 效率而提供的原始输出）。
使用 `--output-format json` 可将输出封装为 `{ success, data, timestamp }`。

## 高级用法

有关原始 MCP 工具调用（`tools`、`tool`、`call`）、代码模式和性能调优（缓存/重试）的信息，
请参阅 `references/advanced.md`。