---
name: performance
description: Performance patterns and anti-patterns for ethereum.org covering TTFB, LCP, INP, CLS, bundle size, build memory, and RSC payload. Use when diagnosing a perf regression or reviewing proposed code changes for perf landmines.
user-invocable: false
---
# 性能知识

知识库。不执行运行时操作；以下是面向维护者的编写约定。使用 Read 工具直接读取相关的 `references/*.md` 文件。

## 两个入口

- **诊断**现有回归 → `references/diagnose-table.md`（症状 → 分类）。
- **审查**合并前拟议的变更 → `references/review-checklist.md`（diff 模式 → 要加载的规则）。

## 跨领域反模式

这些做法看起来合理，但实际上并非如此。每次审查或诊断时，都要对照此表进行检查。

| 看起来像……                                                  | 实际上……                                                                                                     |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| 添加 `CDN-Cache-Control` 来修复 TTFB                       | Netlify 会剥离这些标头；由于 `max-age=0`，CF 会忽略它们。                                                           |
| 在 MDX 路由中使用 `unstable_cache`                         | 会触发 ISR → 运行时 404。参见 `edge-caching.md`。                                                           |
| ``await import(`.../${locale}/${ns}.json`)``                 | Webpack 会枚举所有组合 → OOM。使用 `fs.readFile`。                                                 |
| 在根 layout 中添加 `useSession` / `cookies()`           | 每个路由都会变为动态路由。Edge 缓存会无声地失效。                                                      |
| 通过 `getImageProps()` 在手动 `<picture>` 中设置 `priority: true` | 不会设置 `fetchPriority` 属性；需要手动添加。                                                        |
| 将 `revalidate` 提升到每小时以“修复过期问题”            | 会提高 edge 未命中率。保持每天重新验证；通过客户端 `/api/*` 获取新鲜数据。                                      |
| 在性能测试中模拟数据库/内容                             | 性能收益必须基于真实的生产构建进行测量（`pnpm build && start`）。                                   |
| 未经审计就移除 `common.json` 中的键                    | 对已移除键的查找会无声地渲染出原始键名（回退行为）。先在 `src/` 和 `app/` 中搜索该键。                    |

## 文件索引

| 主题                           | 文件                             |
| ------------------------------- | -------------------------------- |
| 症状 → 分类路由        | `references/diagnose-table.md`   |
| diff 模式 → 规则路由    | `references/review-checklist.md` |
| TTFB、edge 缓存、CDN         | `references/edge-caching.md`     |
| Bundle 大小、代码拆分、RSC payload | `references/bundle.md`  |
| 构建 OOM、ENOSPC、文件追踪 | `references/build.md`            |
| INP、主线程工作           | `references/inp.md`              |
| LCP、图像                     | `references/images.md`           |

对于数据获取模式（Trigger.dev 任务、Netlify Blobs、`src/lib/data` 缓存、内部 `/api/*` 路由、fetcher 重试），请改用 `data-layer` skill。

## 添加规则的约定

- 每个文件只包含一个主题；不同文件之间不得重复内容。
- 如果规则来源于某个已发布的具体变更，请引用 PR（`PR #N`）。仅在不存在 PR 时添加 SHA。
- 面向未来（“这样做，避免那样做”）。条目应保持规范性——不要写复盘或事故叙述。
- 新增审查检查项？在 `review-checklist.md` 中添加一行，并添加到对应的分类文件中。不要在内联内容中重复该规则。