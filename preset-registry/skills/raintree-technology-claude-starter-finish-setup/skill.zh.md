---
name: finish-setup
description: "Finish provisioning a freshly scaffolded SaaS project using the MCP servers wired by agent.json (Neon, Stripe, Resend, PostHog, GitHub). Verifies env vars, creates Stripe products matching the billing plans, checks database migrations, walks email-domain DNS, and confirms analytics. Use when the user says \"finish setup\", \"provision the project\", \"set up stripe/the database\", or after scaffolding a new project."
argument-hint: "[service (optional: stripe, database, email, analytics, github)]"
user-invocable: true
---
完成一个刚脚手架生成的 SaaS 项目的初始化配置。配置已存在的部分，关联缺失的部分——绝不创建用户没有要求的云资源（不新建数据库，不新建 Vercel 项目）。报告每一处做出的改动，以及每一个仍需人工处理的步骤。

如果参数只指定了单个服务，则只运行对应章节。

## 预检

1. 阅读 `.env.example` 以及项目的环境变量加载逻辑（`lib/env.ts` 或等效文件），了解需要哪些集成。
2. 阅读 `.env` / `.env.local`（绝不打印密钥值——只按 key 报告其状态为 SET 或 UNSET）。
3. 列出哪些 MCP 服务器可访问。对于下方某章节所需但无法访问的 MCP，跳过该章节，并在最终报告中注明缺失的环境变量。
4. 探测技术栈：计费套餐定义（`lib/billing/plans.ts` 或类似文件）、迁移配置（`drizzle.config.ts`、`db/migrations/`）、邮件模板（`emails/`）、分析密钥（`NEXT_PUBLIC_POSTHOG_KEY` 或类似变量）。

## 数据库（Neon MCP）

1. 确认 `DATABASE_URL` 已设置，且 Neon MCP 能看到项目的数据库。如果未设置，终止本章节并告知用户自行创建数据库并设置 `DATABASE_URL`——不要代为创建。
2. 将已应用的迁移与本地迁移目录进行比对。如果有待应用的迁移，在本地（而非通过 MCP）运行项目的迁移脚本（`db:migrate` 或等效脚本），并确认结果。
3. 验证认证相关的表是否存在（sessions、users，以及多租户场景下的 organizations）。

## 计费（Stripe MCP）

1. 从计费模块解析套餐定义：套餐名称、价格、计费周期、按席位计费标志。
2. 列出已有的 Stripe 产品。对于没有匹配产品的每个套餐，创建与代码完全一致的产品和价格（金额、货币、周期，以及适用时的按席位 `usage_type`）。未经明确确认，绝不删除或修改已有产品。
3. 将生成的价格 ID 写入 `.env`（或项目实际读取的文件），使用计费模块所期望的环境变量名。
4. 确认项目暴露的 webhook 端点（例如 `/api/auth/stripe/webhook`），并告知用户需要在 Stripe 控制台中为已部署域名注册的确切 URL——webhook 注册需要生产环境 URL，因此除非已知部署 URL，否则留给用户自行完成。

## 邮件（Resend MCP）

1. 检查项目发件地址所对应的发送域名的验证状态。
2. 如果未验证，列出用户必须添加的确切 DNS 记录（类型、名称、值），然后停止——不要代为重试验证。
3. 在用户确认后，向用户自己的邮箱地址发送一封测试邮件。

## 数据分析（PostHog MCP）

1. 确认环境变量中的项目 API 密钥对应一个可访问的 PostHog 项目。
2. 验证该密钥已接入应用（provider 组件或代码片段）。
3. 提议创建一个入门仪表板（注册、激活、收入事件）——仅在用户确认后创建。

## 代码仓库（GitHub MCP）

1. 如果项目没有 `origin` 远程仓库：提议创建一个仓库（询问 org/name/visibility），推送初始提交，并确认 CI 已触发。
2. 如果已有远程仓库：验证默认分支已推送，并检查最新提交的 CI 状态。

## 报告

以清单收尾：每个服务 → 已完成 / 需要人工（附确切下一步操作）/ 已跳过（附缺失的环境变量或 MCP）。保持简洁，确保无需滚动页面即可据此采取行动。
