---
name: google-agents-cli-onboarding
metadata:
  category: DevOps
description: >-
  Onboarding entrypoint for agents-cli in Agent Platform. It should be used
  when the user wants to "create a new agent", "develop an agent", "build an agent using ADK",
  "run the agent locally", "debug agent code", "test an agent", "evaluate an agent",
  "deploy an agent", "publish an agent", "monitor an agent", or needs the ADK (Agent Development Kit)
  development lifecycle.
---
# Google Agents CLI 入门

> [!TIP] **一次性设置**：要安装 CLI 并在编码智能体中启用全部 7 项专业
> 开发技能，请运行设置命令：
>
> ```bash
> uvx google-agents-cli setup
> ```
>
> 或者，如果只想安装专家技能并让智能体负责
> 执行，请运行：
>
> ```bash
> npx skills add google/agents-cli
> ```

## 概述

此技能是 **agents-cli** 的入口。**agents-cli** 是 Google 提供的工具包，用于在 Gemini Enterprise Agent
Platform 上构建、评估和部署 AI 智能体。

使用此技能完成初始设置，并确定适合当前任务的专业工作流。

## 智能体开发生命周期

运行设置后，以下专业技能将变为可用，并会根据你的请求自动激活。请使用此表
确定当前阶段应加载的技能：

| 阶段 | 专业技能 | 用途 / 何时加载 |
| :--- | :--- | :--- |
| **0 — 理解** | `google-agents-cli-workflow` | **明确意图。** 在编码前，于 `.agents-cli-spec.md` 中定义智能体规格。 |
| **1 — 研究** | `google-agents-cli-workflow` | **利用示例。** 在搭建项目框架前，研究现有智能体示例（例如 `ambient-expense`）。 |
| **2 — 搭建** | `google-agents-cli-scaffold` | **创建/增强。** 初始化项目结构、CI/CD 和基础设施模板。 |
| **3 — 构建** | `google-agents-cli-adk-code` | **实现。** 使用 ADK API 编写智能体逻辑、工具和回调，并管理状态。 |
| **4 — 评估** | `google-agents-cli-eval` | **验证质量。** 运行系统化评估（由 LLM 充当评审）。 |
| **5 — 部署** | `google-agents-cli-deploy` | **投入生产。** 部署到 Agent Runtime（Vertex AI）、Cloud Run 或 GKE。 |
| **6 — 发布** | `google-agents-cli-publish` | **注册。** 让你的智能体可在 Gemini Enterprise 中作为工具使用。 |
| **7 — 可观测** | `google-agents-cli-observability` | **监控。** 设置 Cloud Trace、提示词-响应日志记录和 BigQuery 分析。 |

## 主要 CLI 命令

以下是你将在整个开发生命周期中使用的主要命令：

| 命令 | 说明 |
| :--- | :--- |
| `agents-cli setup` | 安装 CLI，并在编码智能体中配置技能。 |
| `agents-cli scaffold <name>` | 根据模板创建新的智能体项目。 |
| `agents-cli eval run` | 在单个步骤中运行智能体并对追踪记录进行评分（生成 + 评分）。 |
| `agents-cli deploy` | 将智能体部署到 Google Cloud（Agent Runtime、Cloud Run、GKE）。 |
| `agents-cli publish gemini-enterprise` | 在 Gemini Enterprise 中注册已部署的智能体。 |

*要查看可用命令和全局选项的完整列表，请运行 `agents-cli
--help`。*

## 后续步骤

请按以下顺序启动开发工作流：

1.  **执行设置：** 运行上方 `[!TIP]` 框中的 `uvx` 或 `npx` 命令，
    安装 CLI 并在你的环境中启用专业技能。
2.  **验证安装：** 运行 `agents-cli info` 以确认安装情况，
    并查看当前生效的项目配置。
3.  **启动阶段 0：** 向用户询问其核心需求（智能体
    用途、外部工具、部署目标），并在编写任何代码前将这些需求记录到
    `.agents-cli-spec.md` 中。

## 报告问题

请在 [Google Agents CLI Issues](https://github.com/google/agents-cli/issues) 中报告错误或改进建议。

## 相关链接

*   [Google Agents CLI 文档](https://github.com/google/agents-cli/tree/main/docs/src)