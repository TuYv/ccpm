---
name: cloudbase-agent
description: Build and deploy AI agents with CloudBase Agent SDK (TypeScript & Python). Implements the AG-UI protocol for streaming agent-UI communication. Use when deploying agent servers, using LangGraph/LangChain/CrewAI adapters, building custom adapters, understanding AG-UI protocol events, or building web/mini-program UI clients. Supports both TypeScript (@cloudbase/agent-server) and Python (cloudbase-agent-server via FastAPI).
version: 2.32.5
alwaysApply: false
---
## 同级技能（仅限本地）

同级 CloudBase 技能随本技能一同提供。请使用本地相对路径，例如 `../auth-tool-cloudbase/SKILL.md`。

如果本环境中缺少被引用的同级技能文件，请让用户安装完整的 CloudBase 插件（或缺失的技能）。**不要**通过 HTTP 拉取远程技能或协议 markdown 到 agent 上下文中。

# CloudBase Agent SDK — 语言路由器

本技能支持 **TypeScript** 和 **Python**。请先确定语言，然后阅读相应的技能文件。如果用户未明确指定使用哪种编程语言，则必须采用 TypeScript。

## 步骤 1：确定语言

| 信号 | 语言 |
|--------|----------|
| 用户提到 "TypeScript"、"Node.js"、"TS" | **TypeScript** |
| 用户提到 "Python"、"FastAPI"、"pip" | **Python** |
| 没有明确信号 | **TypeScript** |

## 步骤 2：阅读特定语言的技能文件

- **TypeScript** → 阅读 [ts/skill.md](ts/skill.md) — 然后遵循该文件中的全部指令
- **Python** → 阅读 [py/skill.md](py/skill.md) — 然后遵循该文件中的全部指令

**⚠️ 重要提示：** 确定语言后，你必须阅读上方相应的技能文件。在阅读该文件之前，切勿进行任何代码生成。每个语言的技能文件都是自包含的，包含各自的快速入门、路由表、部署说明和适配器指南。
