---
name: shipwright-pipeline
description: Autonomous app builder that converts plain-English descriptions into
  fully built, tested applications. Use when the user wants to build a new app, scaffold
  a project, generate a full-stack application, or create an app from a description.
  Trigger with "build me an app", "create a new app", "shipwright build", "scaffold
  a project", "generate an application".
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(pip:*), Bash(python:*), Bash(npm:*),
  Bash(npx:*), Bash(git:*)
version: 1.3.0
author: Nate Nelson <nate@blacksheephq.ai>
license: MIT
tags:
- ai-agency
- app-builder
- code-generator
- autonomous-agent
compatibility: Designed for Claude Code
---
# Shipwright 流水线

## 概述

Shipwright 将纯英文的应用描述转换为一个完整构建、经过测试且可供部署的应用程序。它将执行工作委托给 `product-agent`，这是一个可在 PyPI 上获取的自主式 9 阶段构建引擎。

## 前置条件

- PATH 中可用 Python 3.10+。
- 已安装 `product-agent`（`pip install product-agent`）。
- JavaScript/TypeScript 技术栈需要 Node.js 18+。

## 支持的技术栈

- **Next.js + Supabase** — 包含身份验证、数据库和边缘函数的全栈方案
- **Next.js + Prisma** — 使用类型安全 ORM 的全栈方案
- **SvelteKit** — 基于 Svelte 的轻量级全栈方案
- **Astro** — 以内容为中心的静态和混合网站

## 说明

1. 从用户处收集应用描述。如果描述模糊，请提出澄清问题。
2. 确认目标技术栈。如果未指定，请根据应用类型推荐：
   - 以数据为主且需要身份验证：Next.js + Supabase
   - API 优先且模型复杂：Next.js + Prisma
   - 轻量级交互应用：SvelteKit
   - 内容或营销网站：Astro
3. 使用应用描述和选定的技术栈运行 `product-agent`。
4. 监控 9 阶段流水线：接收、架构、脚手架、实现、测试、集成、优化、验证、发布。
5. 向用户报告结果，包括测试摘要及所有警告。

## 输出

- 一个完整、可构建的项目目录，包含所有源代码、测试和配置。
- 一份汇总通过/失败数量的测试报告。
- 确认项目能够编译并启动的构建验证输出。

## 错误处理

- 如果未安装 `product-agent`，提示用户使用 `pip install product-agent` 安装它。
- 如果某个阶段失败，请报告阶段名称、错误消息和建议的修复方法。
- 如果选定的技术栈不受支持，请列出可用技术栈并要求用户选择。

## 示例

**构建一个 SaaS 仪表盘：**

```
/shipwright-build Build a real-time analytics dashboard with user auth, team workspaces, and Stripe billing. Use Next.js + Supabase.
```

**为现有项目添加功能：**

```
/shipwright-enhance Add dark mode toggle, export-to-CSV on all tables, and email notification preferences.
```

**搭建一个内容网站：**

```
/shipwright-build Create a developer documentation site with search, versioned docs, and a blog. Use Astro.
```

## 资源

- [GitHub 上的 Shipwright](https://github.com/Wynelson94/shipwright)
- [PyPI 上的 product-agent](https://pypi.org/project/product-agent/)
- 有关使用示例，请参阅 `${CLAUDE_SKILL_DIR}/references/examples.md`。