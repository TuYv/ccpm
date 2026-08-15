---
name: page-visual-tests
description: Playwright + Chromatic full-page visual tests for ethereum.org. Trigger on "add a page to the visual suite", "the snapshot keeps changing", "chromatic pages", "chromatic playwright", or edits to `tests/visual/`, `playwright.visual.config.ts`, or the `page-visual-tests` job in `.github/workflows/ci.yml`. Skip for Storybook Chromatic (the `visual-tests` job in ci.yml), e2e (`tests/e2e/`), unit (`tests/unit/`).
---
# 页面视觉测试（Playwright + Chromatic）

此仓库有两个 Chromatic 项目：Storybook（`.github/workflows/ci.yml` 中的 `visual-tests` 作业，它会直接调用 `chromaui/action`；`pnpm chromatic` 需要 `CHROMATIC_STORYBOOK_TOKEN`）和**页面视觉测试**（ci.yml 中的 `page-visual-tests` 作业 + `pnpm chromatic:pages`，需要 `CHROMATIC_PAGES_TOKEN`）。此 Skill 仅针对后者。

Playwright 测试套件会针对每个页面 × 视口捕获 DOM 归档（而非 PNG）；Chromatic 会在云端重新渲染这些归档并进行差异比较。本地运行 `pnpm test:visual` 显示绿色只表示归档已成功生成——差异比较会在上传后进行。

## 重要文件

- `playwright.visual.config.ts` — 仅用于视觉测试的配置（3 个视口 + `webServer`）
- `playwright.config.ts` — 基础配置（端到端测试 + 单元测试；**无 `webServer`**）
- `tests/visual/pages.spec.ts` — 页面列表 + 就绪检测模式
- `.github/workflows/ci.yml` — CI（`page-visual-tests` 作业）
- `src/components/ui/skeleton.tsx`, `src/components/ui/spinner.tsx` — 加载状态基础组件
- `package.json` 脚本：`test:visual*`、`chromatic:pages`

## 不明显的约束

**双 Playwright 配置。** `webServer` 仅存在于 `playwright.visual.config.ts` 中。将其移入基础配置会导致 CI 中的 `pnpm test:unit` 和 `pnpm test:e2e` 失败——它们会尝试针对缺失的 `.next` 构建启动 Next。

**桌面端视口为 1024，而非 1280。** Chromatic 将快照限制为 `width × height ≤ 25M` 像素。测试中最高的页面约为 22.5k 像素；1280 会超出限制，而 1024 符合要求。在增大视口或添加长页面之前，请测量 `document.documentElement.scrollHeight`。

**加载契约：`data-slot="loading"`。** 共享的 `Skeleton` 和 `Spinner` 基础组件都带有此属性。每个测试都会等到 `document.querySelectorAll('[data-slot="loading"]').length === 0` 后再拍摄快照。任何自定义加载器——原始的 `animate-pulse-light`、本地复制的 Skeleton、自定义 spinner——都无法被该等待逻辑检测到，并会悄无声息地导致测试不稳定。修复方式是改用共享基础组件，或在自定义加载器的根元素上添加 `data-slot="loading"`。

**导入来自 `@chromatic-com/playwright`，而非 `@playwright/test`。** 这两个包重新导出的 `expect` 存在类型偏差，因此 `expect(...).toHaveCount(0)` 会出现异常行为——对于加载等待，请优先使用 `page.waitForFunction`。

**环境。** 构建和测试时都需要 `USE_MOCK_DATA=true` 和 `NEXT_PUBLIC_BUILD_LOCALES`。本地 `test:visual:build` 脚本会设置 `NEXT_PUBLIC_BUILD_LOCALES=en`；CI 在 ci.yml 中的共享构建使用 `NEXT_PUBLIC_BUILD_LOCALES: "en,es,zh,ar"`，因为一个构建产物要供端到端测试、lighthouse 和视觉测试作业共同使用。测试规范中的路径不带前缀（`/wallets/`，而非 `/en/wallets/`），因为 `localePrefix: "as-needed"` 会在根路径提供英语页面——添加 `/en` 只会触发重定向。

**随机排序：`safeShuffle`。** Lodash 的 `shuffle` 和 `.sort(() => Math.random() - 0.5)` 会独立于加载器导致快照不稳定。请使用 `src/lib/utils/random.ts` 中的 `safeShuffle` 对它们进行封装——当 `IS_VISUAL_TEST=true` 时，它会原样返回列表。当前调用位置：`wallets.ts`、`apps.ts`（Highlights/Discover/AppOfTheWeek）、`src/components/Staking/StakingProductsCardGrid/index.tsx`。该环境变量通过 `next.config.js` 的 `env` 块暴露给客户端 bundle；若缺少此配置，客户端组件中的 `process.env.IS_VISUAL_TEST` 会求值为 `undefined`，随机排序仍会执行。

**使用 `domcontentloaded`，不要使用 `networkidle`。** 分析请求和后台数据获取会使网络一直处于繁忙状态。

## 标准测试

```ts
import { takeSnapshot, test } from "@chromatic-com/playwright"

const pages: Array<{ name: string; path: string }> = [
  { name: "Homepage", path: "/" },
  { name: "Docs - Smart Contracts", path: "/developers/docs/smart-contracts/" },
  // ...
]

test.describe("Page Visual Tests", () => {
  for (const { name, path } of pages) {
    test(name, async ({ page }, testInfo) => {
      await page.goto(path, { waitUntil: "domcontentloaded" })
      await page.waitForFunction(
        () => document.querySelectorAll('[data-slot="loading"]').length === 0
      )
      // FeedbackWidget is dynamic({ ssr: false }); waiting for its button proves
      // hydration finished and dynamic chunks landed — same pattern other
      // ssr:false components (Emoji/Twemoji) rely on to render.
      await page.waitForSelector('[data-testid="feedback-widget-button"]')
      await takeSnapshot(page, testInfo)
    })
  }
})
```

## 常见情况

**添加页面。** 每个条目会占用三张快照（每个视口一张），计入 Chromatic 的预算，因此添加前应检查该页面的布局（位于 `src/layouts/` 下）是否已经覆盖。扫描页面子树中是否存在定制的加载器——它们是导致测试不稳定的最大单一原因——并确认整页高度保持在 2500 万像素的预算以内。本地循环：先运行一次 `pnpm test:visual:build`，然后运行 `pnpm test:visual:desktop` 进行迭代，最后运行 `pnpm test:visual` 进行完整测试。

**快照不稳定。** 主要有两个原因。(1) 加载器没有 `data-slot="loading"`——使用 `--trace=on` 运行并检查 `waitForFunction` 步骤；持续时间约为 0 ms 意味着测试没有等待它。(2) 随机排序——在页面子树中搜索 `shuffle(`、`Math.random()` 或 `.sort(() =>`，并改为通过 `safeShuffle` 处理。如果动态内容发生漂移，请再次确认构建和测试步骤中都设置了 `USE_MOCK_DATA=true`。

**本地 `pnpm dev` 掩盖了回归。** `playwright.visual.config.ts` 将 `reuseExistingServer` 设置为 `true`，这对于 CI 是正确的，但也意味着已在 :3000 上运行的 `pnpm dev` 会被静默使用，取代测试套件所假定的生产构建。如果快照差异无法在 CI 中复现，请终止开发服务器，并运行 `pnpm test:visual:build`，基于生产输出重新构建后再重试。

**像素限制错误。** 测量页面在 1024 px 宽度下的整页高度；如果超过约 24,400 px，则需要缩短页面或将其从测试套件中移除。将截图裁剪为视口范围的方案已被考虑并否决——这会失去对首屏以下内容的回归覆盖，而这种覆盖正是在此处使用 Playwright 而非 Storybook 的理由。

**本地正常，但在 CI 中失败。** 通常是测试步骤中缺少 `HOME: /root`——GitHub Actions 会覆盖容器内的 `HOME`，导致 Playwright 无法再找到内置于 `mcr.microsoft.com/playwright` 镜像中的浏览器。还应检查镜像标签是否与 `package.json` 中的 `@playwright/test` 匹配。

分支：`feat/playwright-chromatic-page-visual-tests` · PR：<https://github.com/ethereum/ethereum-org-website/pull/18009>