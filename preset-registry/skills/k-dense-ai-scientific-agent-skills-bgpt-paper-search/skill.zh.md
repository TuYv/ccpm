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

BGPT 是一个远程 MCP 服务器，用于搜索一个经过整理的科学论文数据库。该数据库基于从全文研究中提取的原始实验数据构建而成。与返回标题和摘要的传统文献数据库不同，BGPT 返回论文实际内容中的结构化数据——每篇论文包含方法、定量结果、样本量、质量评估以及 25 个以上的元数据字段。

## 何时使用此 Skill

在以下情况下使用此 skill：
- 搜索包含特定实验细节的科学论文
- 开展系统综述或范围综述
- 查找不同研究中的定量结果、样本量或效应量
- 比较不同研究中采用的方法
- 查找包含质量评分或证据分级的论文
- 需要从全文论文中获取结构化数据（而不仅仅是摘要）
- 为荟萃分析或临床指南构建证据表

## 设置

BGPT 是一个远程 MCP 服务器——无需本地安装。在使用前，请在 agent 的 MCP 设置中进行配置；此 skill 会指导 agent 调用 `search_papers` MCP 工具，但不会自行启用 MCP 访问权限。

### Claude Desktop / Claude Code

添加到 MCP 配置中：

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

### npm（替代方案）

```bash
npx bgpt-mcp
```

## 用法

配置好 BGPT MCP 服务器后，通过 agent 的 MCP 接口调用其 `search_papers` 工具（不要通过 Bash 调用）：

```
Search for papers about: "CRISPR gene editing efficiency in human cells"
```

服务器会返回结构化结果，包括：
- **标题、作者、期刊、年份、DOI**
- **方法**：实验技术、模型、方案
- **结果**：包含定量数据的关键发现
- **样本量**：受试者/样本数量
- **质量评分**：研究质量评估
- **结论**：作者的结论及其意义

## 定价

- **免费层级**：每个网络可进行 50 次搜索，无需 API 密钥
- **付费**：使用来自 [bgpt.pro/mcp](https://bgpt.pro/mcp) 的 API 密钥后，每条结果 $0.01