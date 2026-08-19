---
name: bgpt-paper-search
description: Search scientific papers and retrieve structured experimental data extracted from full-text studies via the BGPT MCP server. Returns 25+ fields per paper including methods, results, sample sizes, quality scores, and conclusions. Use for literature reviews, evidence synthesis, and finding experimental details not available in abstracts alone.
license: MIT
compatibility: Requires the BGPT MCP server configured in the agent host (npx mcp-remote or npx bgpt-mcp), internet access to bgpt.pro, and an optional BGPT API key for paid usage.
metadata:
  version: "1.1"
  skill-author: BGPT
  website: https://bgpt.pro/mcp
  github: https://github.com/connerlambden/bgpt-mcp
---
# BGPT 论文搜索

## 概述

BGPT 是一个远程 MCP 服务器，可搜索一个经过筛选的科学论文数据库；该数据库由从全文研究中提取的原始实验数据构建而成。与仅返回标题和摘要的传统文献数据库不同，BGPT 返回实际论文内容中的结构化数据——方法、定量结果、样本量、质量评估，以及每篇论文 25 个以上的元数据字段。

## 何时使用此技能

在以下情况下使用此技能：
- 搜索包含特定实验细节的科学论文
- 开展系统综述或范围综述
- 查找跨研究的定量结果、样本量或效应量
- 比较不同研究中使用的方法学
- 查找带有质量评分或证据分级的论文
- 需要来自论文全文的结构化数据（而不只是摘要）
- 为 Meta 分析或临床指南构建证据表

## 设置

BGPT 是一个远程 MCP 服务器——无需本地安装。请在使用前在代理的 MCP 设置中配置它；此技能会指导代理调用 `search_papers` MCP 工具，但本身不会启用 MCP 访问权限。

### Claude Desktop / Claude Code

添加到你的 MCP 配置中：

```json
{
  "mcpServers": {
    "bgpt": {
      "command": "npx",
      "args": ["mcp-remote", "https://bgpt.pro/mcp/sse"]
    }
  }
}
```

### npm（替代方式）

```bash
npx bgpt-mcp
```

## 用法

配置 BGPT MCP 服务器后，请通过代理的 MCP 接口调用其 `search_papers` 工具（而非通过 Bash）：

```
Search for papers about: "CRISPR gene editing efficiency in human cells"
```

服务器会返回结构化结果，包括：
- **标题、作者、期刊、年份、DOI**
- **方法**：实验技术、模型、方案
- **结果**：包含定量数据的关键发现
- **样本量**：受试者/样本数量
- **质量评分**：研究质量评估
- **结论**：作者结论及其意义

## 定价

- **免费层级**：每个网络 50 次搜索，无需 API 密钥
- **付费**：通过 [bgpt.pro/mcp](https://bgpt.pro/mcp) 获取 API 密钥后，每条结果 $0.01