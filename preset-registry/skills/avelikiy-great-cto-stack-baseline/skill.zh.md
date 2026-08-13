---
name: stack-baseline
description: The pinned default technology stack for SMB Product-Builder products. One source of truth so the architect, app-scaffolder, auth-engineer, and senior-dev never re-decide the stack per build — they build ON it. Covers framework, ORM/DB, auth, UI, payments/email/SMS, files, jobs, testing, hosting, and observability, with the chosen default + the one sanctioned alternative for each. Applied whenever a new product is scaffolded or a stack choice would otherwise be improvised. Re-deciding the stack every build is the biggest silent time sink; this kills it.
when_to_use: |
  Apply when:
  - architect writes the Components / stack section of ARCH-{slug}.md
  - app-scaffolder stands up a new product skeleton
  - auth-engineer or senior-dev would otherwise pick a library/provider ad hoc
  Do NOT override a choice already pinned in PROJECT.md (an existing project's stack wins).
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - ".great_cto/**"
---
# 技术栈基线——一次决定，持续构建

除非有不采用的具体理由，否则每个 SMB 产品都基于同一套经过验证的技术栈构建。
每次构建都重新决定框架/ORM/身份验证/托管方案，会浪费每个项目的第一个小时，
并导致不同产品的代码库碎片化。**这是默认方案；只有在 ARCH 中写明理由时
才能偏离。**

## 固定的技术栈

| 层级 | 默认方案 | 认可的替代方案 | 备注 |
|---|---|---|---|
| **框架** | Next.js (App Router, TS) | Remix | Server actions + RSC；前后端位于同一个仓库 |
| **UI** | Tailwind + shadcn/ui | — | 与站点匹配；design-advisor 的 token 可映射至此 |
| **图表**（仪表板/分析） | ECharts（随产品交付） | Recharts | 精致的规范在**构建时通过 Flint 生成 → 编译为原生 ECharts**；Flint 仅用于开发，绝不作为运行时依赖。约定：`references/dashboard-viz.md` |
| **数据库** | Postgres | — | 唯一使用的数据库；金额以整数美分表示，时间戳包含时区信息 |
| **ORM / 迁移** | Drizzle | Prisma | 类型化 schema + SQL 迁移；适用 migration-ready-schema |
| **身份验证** | Auth.js (NextAuth v5) | Clerk（快速路径，按 MAU 收费） | 由 **auth-engineer** 负责；会话 + RBAC + 多租户 |
| **支付** | Stripe (+ Connect) | — | 由 subscription-billing-engineer / integrations-engineer 负责 |
| **电子邮件** | Resend | Postmark | 事务性邮件；通过 lifecycle-messaging 配置 SPF/DKIM/DMARC |
| **短信** | Twilio (Messaging Service) | Telnyx | 10DLC；通过 lifecycle-messaging 管理用户同意 |
| **文件存储** | Cloudflare R2 / S3 | — | 私有存储桶、预签名 URL |
| **后台任务** | Inngest | 基于 Postgres 的队列 | 提醒、同步、催款 |
| **测试** | Vitest（单元测试）+ Playwright（端到端测试） | — | senior-dev 负责单元测试；e2e-test-engineer 负责浏览器测试 |
| **托管** | Vercel | Cloudflare Pages/Workers | 原生支持 Next.js；每个 PR 都有预览环境 |
| **数据库托管** | Neon (serverless PG) | Supabase | 支持分支；由 infra-provisioner 接入环境 |
| **可观测性** | Sentry | — | 记录已部署产品的错误和追踪信息 |
| **分析** | 轻量隐私型（Plausible） | — | 不使用重量级第三方跟踪器 |

## 规则

1. 所有产品统一使用**一个框架、一个数据库、一个 ORM、一个身份验证库**。一致性 >
   针对单个产品的优化。
2. 在搭建脚手架时，**将其固定写入 `.great_cto/PROJECT.md`**（`stack:` 行），以便后续每个
   agent 都能读取，而不是自行猜测——并且现有 PROJECT.md 中的技术栈始终优先。
3. **金额使用整数美分；时间戳包含时区信息；ID 保持稳定**（与
   `migration-ready-schema` 配合使用）。
4. **身份验证、支付、电子邮件/短信、任务均由相应专家负责**（auth-engineer、
   billing/integrations、lifecycle-messaging）——此 skill 只指定默认库；
   具体约定由专家负责。
5. **偏离默认方案必须在 ARCH 的 Components 部分写明理由**（例如：“选择 Clerk 而非 Auth.js，
   因为客户从第一天起就需要 SSO/SCIM”）。

## 输出

应用后，将技术栈写入 ARCH 的 Components 部分和 PROJECT.md：

```
## Stack (baseline)
framework: Next.js (App Router, TS) · UI: Tailwind + shadcn
db: Postgres (Neon) · orm: Drizzle · auth: Auth.js (→ auth-engineer)
payments: Stripe · email: Resend · sms: Twilio · files: R2 · jobs: Inngest
test: Vitest + Playwright · host: Vercel · obs: Sentry
deviations: <none | reason>
```