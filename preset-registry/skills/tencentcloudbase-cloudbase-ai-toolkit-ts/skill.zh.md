---
name: cloudbase-agent
description: "Build and deploy AI agents with Cloudbase Agent (TypeScript), a TypeScript SDK implementing the AG-UI protocol. Use when: (1) deploying agent servers with @cloudbase/agent-server, (2) using LangGraph adapter with ClientStateAnnotation, (3) using LangChain adapter with clientTools(), (4) building custom adapters that implement AbstractAgent, (5) understanding AG-UI protocol events, (6) building web UI clients with @ag-ui/client, (7) building WeChat Mini Program UIs with @cloudbase/agent-ui-miniprogram."
version: 2.21.1
alwaysApply: true
---
# Cloudbase Agent（TypeScript）

使用 AG-UI 协议将 AI 智能体部署为 HTTP 服务的 TypeScript SDK。

> **注意：** 此技能仅适用于 **TypeScript/JavaScript** 项目。

## 何时使用此技能

在**AI 智能体开发**中需要完成以下事项时，请使用此技能：

- 将 AI 智能体部署为支持 AG-UI 协议的 HTTP 服务
- 使用 LangGraph 或 LangChain 框架构建智能体后端
- 创建实现 AbstractAgent 接口的自定义智能体适配器
- 理解 AG-UI 协议事件与消息流式传输
- 构建连接 AG-UI 兼容智能体的 Web UI 客户端
- 构建用于 AI 智能体交互的微信小程序 UI

**请勿用于：**
- 不涉及智能体能力的简单 AI 模型调用（请使用 `ai-model-*` 技能）
- CloudBase 云函数（请使用 `cloud-functions` 技能）
- 不具备智能体功能的 CloudRun 后端服务（请使用 `cloudrun-development` 技能）

## 如何使用此技能（面向编码智能体）

1. **选择合适的适配器**
   - 对于有状态的、基于图的工作流，使用 LangGraph 适配器
   - 对于基于链的智能体模式，使用 LangChain 适配器
   - 针对特殊的智能体逻辑，构建自定义适配器

2. **部署智能体服务器**
   - 使用 `@cloudbase/agent-server` 暴露 HTTP 端点
   - 按需配置 CORS、日志和可观测性
   - **优先使用 `manageAgent` MCP 工具部署到 CloudBase**（参见 [agent-deployment](agent-deployment.md)）
   - **部署前，请阅读 [agent-deployment](agent-deployment.md) 中的依赖对齐策略，以避免云端构建依赖错误**

3. **构建 UI 客户端**
   - Web 应用使用 `@ag-ui/client`
   - 微信小程序使用 `@cloudbase/agent-ui-miniprogram`
   - 连接到智能体服务器的 `/send-message` 或 `/agui` 端点

4. **按照下方路由表**查找各任务的详细文档

## 路由

| 任务 | 请阅读 |
|------|------|
| 将智能体部署到 CloudBase（**请先阅读**） | [agent-deployment](agent-deployment.md) |
| 部署智能体服务器（@cloudbase/agent-server） | [server-quickstart](server-quickstart.md) |
| 使用 LangGraph 适配器 | [adapter-langgraph](adapter-langgraph.md) |
| 使用 LangChain 适配器 | [adapter-langchain](adapter-langchain.md) |
| 构建自定义适配器 | [adapter-development](adapter-development.md) |
| 理解 AG-UI 协议 | [agui-protocol](agui-protocol.md) |
| 构建 UI 客户端（Web 或小程序） | [ui-clients](ui-clients.md) |
| 深入了解 @cloudbase/agent-ui-miniprogram | [ui-miniprogram](ui-miniprogram.md) |

## 快速开始

**前置条件：** 需要 Node.js >= 20。

**1. 安装依赖：**

```bash
npm install @cloudbase/agent-server@latest @cloudbase/agent-adapter-langgraph@latest
```

**关键：** 所有 `@cloudbase/agent-*` 包务必始终使用 `@latest`。依赖版本规则请参见 agent-deployment.md 中的[依赖对齐策略](agent-deployment.md#dependency-alignment-policy-critical)。

**2. 创建并运行你的智能体：**

```typescript
import { run } from "@cloudbase/agent-server";
import { LanggraphAgent } from "@cloudbase/agent-adapter-langgraph";

run({
  createAgent: () => ({ agent: new LanggraphAgent({ workflow }) }),
  port: 9000,
});
```
