---
name: observability-baseline
description: Scaffold-time observability so a shipped product is not blind in prod from day one — error capture (Sentry), request-id structured logging, and /healthz + /readyz endpoints. stack-baseline pins Sentry but nothing wires it; this is the wiring. Loaded by app-scaffolder (bake into the scaffold), infra-provisioner (prod env + probes), and consumed by l3-support (traces) and devops (deploy gate).
when_to_use: |
  Apply when:
  - app-scaffolder is generating a new product (any archetype that runs as a service)
  - infra-provisioner is setting prod env vars + health probes
  - l3-support needs traces/logs to triage an incident
  Do NOT apply to:
  - pure library / cli archetypes with no running service
  - static marketing sites with no backend
effort: medium
allowed-tools: Read, Write, Edit, Grep, Glob
paths:
  - "src/**"
  - "app/**"
  - "docs/infra/**"
---
# observability-baseline

stack-baseline 提到了 Sentry，却没有将其接入任何地方——因此每个已发布产品的首次生产环境事故都不可见，而 l3-support 只能在毫无线索的情况下进行分诊。此技能会在搭建脚手架时确保三项能力就位。默认配置已内置；无需询问创始人。

## 1. 错误捕获（Sentry）

- `instrumentation.ts`（Next.js）/ 在进程启动时初始化 SDK；DSN 来自 `SENTRY_DSN` 环境变量（绝不硬编码）。
- CI 在发布时上传 source maps，使堆栈跟踪可读（release = git sha）。
- 捕获未处理的 Promise 拒绝，并在客户端设置全局错误边界。

## 2. 带 request-id 的结构化日志

- 使用一个输出 **JSON**（而非 `console.log` 文本）的日志记录器，并为每个请求附加 `request_id`（在边缘生成，通过 header/async-local-storage 传播）。
- 级别：error / warn / info / debug——诊断信息输出到 **stderr**，绝不与面向用户的 stdout 混在一起。（与 CLI 日志缺口采用相同规范，DEEPEN d94。）
- 每个请求输出一行日志，包含：request_id、method、path、status、latency_ms。

## 3. 健康检查端点

- `GET /healthz`——存活检查（进程已启动）。`GET /readyz`——就绪检查（依赖项可访问：db、cache）。开销低、无需身份验证、不包含 PII。
- infra-provisioner 使用这些端点进行探测，负载均衡器也会检查这些端点。

## 接入（除非使用方加载技能，否则技能只是摆设）

| 使用方 | 如何使用此技能 |
|----------|------------------------------|
| **app-scaffolder** | 将 `instrumentation.ts` + JSON 日志记录器 + `/healthz`+`/readyz` 内置到生成的应用中；将 `SENTRY_DSN` 添加到 `.env.example` |
| **infra-provisioner** | 在生产环境变量列表中设置 `SENTRY_DSN`；将平台健康探针指向 `/readyz`；在 PROVISION 中记录 Sentry 项目 |
| **l3-support** | 分诊的第一步是查看 Sentry + request-id 日志（现在已有可供查看的跟踪信息） |
| **devops** | 如果部署后 `/readyz` 未返回 200，则部署门禁失败 |

## 输出

一个完成脚手架搭建的应用：首次生产环境错误会被捕获，每个请求都可通过 id 追踪，并且平台可以对其执行健康检查。在 `docs/infra/PROVISION-{slug}.md` 中记录 Sentry 项目 + 端点。完成标准 = 这三项能力均已存在并接入生产环境，而不只是出现在代码中。