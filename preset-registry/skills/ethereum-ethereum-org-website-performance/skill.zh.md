---
name: performance
description: Performance patterns and anti-patterns for ethereum.org covering TTFB, LCP, INP, CLS, bundle size, build memory, and RSC payload. Use when diagnosing a perf regression or reviewing proposed code changes for perf landmines.
user-invocable: false
---
# 性能知识

知识库。无运行时操作；以下是面向维护者的编写约定。请通过 Read 工具直接阅读相关的 `references/*.md` 文件。

## 两个入口

- **诊断**现有的性能回退 → `references/diagnose-table.md`（症状 → 类别）。
- 在合并前**审查**拟议的更改 → `references/review-checklist.md`（差异模式 → 要加载的规则）。

两个流程都始终会同时加载 `references/anti-patterns.md`。

## 文件映射

| 主题                            | 文件                             |
| ------------------------------- | -------------------------------- |
| 症状 → 类别路由                 | `references/diagnose-table.md`   |
| 差异模式 → 规则路由             | `references/review-checklist.md` |
| TTFB、边缘缓存、CDN             | `references/edge-caching.md`     |
| Bundle 大小、代码拆分           | `references/bundle.md`           |
| 构建 OOM、ENOSPC、文件追踪      | `references/build.md`            |
| RSC payload、HTML 大小          | `references/rsc.md`              |
| INP、主线程工作                 | `references/inp.md`              |
| LCP、图像                       | `references/images.md`           |
| 跨领域反模式                    | `references/anti-patterns.md`    |

对于数据获取模式（Trigger.dev 任务、Netlify Blobs、`src/lib/data` 缓存、内部 `/api/*` 路由、fetcher 重试），请改用 `data-layer` skill。

## 添加规则的约定

- 每个文件只包含一个主题；不要在文件之间重复内容。
- 当规则来自某个已发布的具体更改时，请引用 PR（`PR #N`）。仅当不存在 PR 时才添加 SHA。
- 面向未来（“这样做，避免那样做”）。条目应保持规范性——不要包含事后分析或事故叙述。
- 新增审查项？请在 `review-checklist.md` 和对应的类别文件中都添加一行。不要在行内重复阐述该规则。