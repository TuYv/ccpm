---
name: page-visual-tests
description: Playwright + Chromatic full-page visual tests for ethereum.org. Trigger on "add a page to the visual suite", "the snapshot keeps changing", "chromatic pages", "chromatic playwright", or edits to `tests/visual/`, `playwright.visual.config.ts`, or the `page-visual-tests` job in `.github/workflows/ci.yml`. Skip for Storybook Chromatic (the `visual-tests` job in ci.yml), e2e (`tests/e2e/`), unit (`tests/unit/`).
---
# 页面视觉测试（Playwright + Chromatic）

此技能仅涵盖 **页面视觉测试** Chromatic 项目（`ci.yml` 中通过 `chromaui/action` 发布的 `page-visual-tests` job；本地发布命令为 `pnpm chromatic:pages`，使用 `CHROMATIC_PAGES_TOKEN`）——不包括 Storybook Chromatic。

Playwright 测试套件会按页面 × 视口捕获 DOM 存档（而非 PNG）；Chromatic 会在云端重新渲染这些存档并进行差异比较。本地 `pnpm test:visual` 显示绿色，只表示存档已生成——差异比较发生在上传之后。

## 需要关注的文件

- `playwright.visual.config.ts` — 仅用于视觉测试的配置（3 个视口 + `webServer`）
- `playwright.config.ts` — 基础配置（e2e + unit；**没有 `webServer`**）
- `tests/visual/pages.spec.ts` — 页面列表 + 就绪状态模式
- `.github/workflows/ci.yml` — CI（`page-visual-tests` job）
- `src/components/ui/skeleton.tsx`、`src/components/ui/spinner.tsx` — 加载基础组件
- `package.json` 脚本：`test:visual*`、`chromatic:pages`

## 不明显的约束

**双 Playwright 配置。** `webServer` 仅存在于 `playwright.visual.config.ts` 中。将其移入基础配置会导致 CI 中的 `pnpm test:unit` 和 `pnpm test:e2e` 出错——它们会尝试针对缺少 `.next` 构建的环境启动 Next。

**桌面视口为 1024，而不是 1280。** Chromatic 将快照限制为 `width × height ≤ 25M` 像素。经过测试的最高页面高度约为 22.5k 像素；使用 1280 会超出限制，而 1024 可以满足要求。在提高视口宽度或添加长页面之前，请先测量 `document.documentElement.scrollHeight`。

**加载约定：`data-slot="loading"`。** 共享的 `Skeleton` 和 `Spinner` 基础组件都带有此属性。每个测试都会等待 `document.querySelectorAll('[data-slot="loading"]').length === 0`，然后再创建快照。任何自定义加载器——原始的 `animate-pulse-light`、本地复制的 Skeleton、自定义 spinner——都不会被该等待逻辑识别，并会悄悄导致测试间歇性失败。修复方式是改用共享基础组件，或将 `data-slot="loading"` 添加到自定义加载器的根元素上。

**导入来源应为 `@chromatic-com/playwright`，而不是 `@playwright/test`。** 这两个包重新导出了类型存在偏差的 `expect`，因此 `expect(...).toHaveCount(0)` 的行为会异常——对于加载等待，优先使用 `page.waitForFunction`。

**环境。** 在构建和测试时都需要 `USE_MOCK_DATA=true` 和 `NEXT_PUBLIC_BUILD_LOCALES`。本地 `test:visual:build` 脚本会设置 `NEXT_PUBLIC_BUILD_LOCALES=en`；CI 中 `ci.yml` 的共享构建使用 `NEXT_PUBLIC_BUILD_LOCALES: "en,es,zh,ar"`，因为一个构建产物会同时服务于 e2e、lighthouse 和 visual jobs。规范中的路径不带前缀（`/wallets/`，而不是 `/en/wallets/`），因为 `localePrefix: "as-needed"` 会将英语页面提供在根路径下——添加 `/en` 只会触发重定向。

**随机排序：`safeShuffle`。** Lodash 的 `shuffle` 和 `.sort(() => Math.random() - 0.5)` 会在与加载器无关的情况下导致快照间歇性失败。请使用来自 `src/lib/utils/random.ts` 的 `safeShuffle` 包装它们——当 `IS_VISUAL_TEST=true` 时，它会原样返回列表。当前调用位置：`src/lib/utils/wallets.ts`、`src/lib/utils/apps.ts`（Highlights/Discover/AppOfTheWeek）、`src/components/Staking/StakingProductsCardGrid/index.tsx`。该环境变量通过 `next.config.js` 的 `env` 块暴露给客户端 bundle；如果没有这一配置，客户端组件中的 `process.env.IS_VISUAL_TEST` 会被解析为 `undefined`，随机排序仍会执行。

**使用 `domcontentloaded`，不要使用 `networkidle`。** 分析和后台请求会让网络始终处于繁忙状态。

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

**添加页面。** 每个条目会产生三张快照（每个视口一张），占用 Chromatic 的预算，因此添加前请检查该页面的布局（位于 `src/layouts/` 下）是否已经覆盖。扫描页面子树，查找专用加载器——它们是导致不稳定的最大原因——并确认整页高度保持在 25M 像素预算以内。本地循环：先运行一次 `pnpm test:visual:build`，然后运行 `pnpm test:visual:desktop` 进行迭代，最后运行 `pnpm test:visual` 执行完整检查。

**快照不稳定。** 主要有两个原因。(1) 加载器没有 `data-slot="loading"`——使用 `--trace=on` 运行，并检查 `waitForFunction` 步骤；约 0 毫秒的持续时间意味着它没有被等待。(2) 随机排序——在页面子树中搜索 `shuffle(`、`Math.random()` 或 `.sort(() =>`，并通过 `safeShuffle` 处理。如果动态内容发生漂移，请再次确认构建和测试步骤中都设置了 `USE_MOCK_DATA=true`。

**本地 `pnpm dev` 掩盖了回归问题。** `playwright.visual.config.ts` 设置了 `reuseExistingServer: true`，这对 CI 是正确的，但也意味着已经在 :3000 上运行的 `pnpm dev` 会被静默使用，取代测试套件所假定的生产构建。如果快照差异无法在 CI 中复现，请停止开发服务器并运行 `pnpm test:visual:build`，针对生产输出重新构建后再重试。

**像素限制错误。** 在 1024 px 宽度下测量页面的整页高度；如果超过约 24,400 px，则需要缩短页面或将其从测试套件中移除。不要裁剪到视口范围——覆盖首屏以下内容正是该测试套件的目的。

**本地运行正常，但 CI 失败。** 通常是测试步骤缺少 `HOME: /root`——GitHub Actions 会在容器内覆盖 `HOME`，导致 Playwright 无法再找到预置于 `mcr.microsoft.com/playwright` 镜像中的浏览器。还要检查镜像标签是否与 `package.json` 中的 `@playwright/test` 匹配。