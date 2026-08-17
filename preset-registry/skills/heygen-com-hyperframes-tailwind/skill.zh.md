---
name: tailwind
description: Tailwind CSS v4.2 browser-runtime patterns for HyperFrames compositions. Use when scaffolding or editing projects created with `hyperframes init --tailwind`, writing Tailwind utility classes in composition HTML, adding CSS-first Tailwind v4 theme tokens, debugging v3 vs v4 syntax, or deciding when to compile Tailwind to CSS instead of using the browser runtime.
---
# HyperFrames 的 Tailwind CSS

HyperFrames `init --tailwind` 使用固定为 `@tailwindcss/browser@4.2.4` 的 Tailwind 浏览器运行时。应将其视为 Tailwind v4，而不是 v3。

本技能适用于由 CLI 生成的合成 HTML。它不适用于 `packages/studio`，后者内部仍使用 Tailwind v3，以及 `tailwind.config.js`、PostCSS 和 `@tailwind` 指令。

## 何时使用

- 用户要求在 HyperFrames 合成中使用 Tailwind。
- 项目是使用 `hyperframes init --tailwind` 创建的。
- 你在 `index.html` 中看到 `window.__tailwindReady`。
- 你需要实用工具类、CSS 优先的主题令牌、自定义实用工具，或从 v3 迁移到 v4 的指导。
- 渲染结果缺少样式，并且项目依赖浏览器运行时。

## 版本约定

- 固定运行时：`@tailwindcss/browser@4.2.4`。
- 浏览器运行时脚本由 CLI 注入。不要将其替换为 `cdn.tailwindcss.com`。
- HyperFrames 会等待 `window.__tailwindReady`，然后再开始帧捕获。
- 就绪垫片必须保持确定性：不得使用渲染循环轮询 API、基于时钟的重试，也不得在固定的 Tailwind 运行时脚本之外执行运行时网络请求。
- 对于离线、受限或要求生产环境稳定的渲染，应将 Tailwind 编译为 CSS 并直接引入样式表，而不是依赖浏览器运行时。

## v4 规则

Tailwind v4 采用 CSS 优先方式：

```html
<style type="text/tailwindcss">
  @theme {
    --color-brand: oklch(0.68 0.2 252);
    --font-display: "Inter", sans-serif;
  }

  @utility headline-balance {
    text-wrap: balance;
    letter-spacing: 0;
  }
</style>
```

在使用浏览器运行时的合成中，应避免使用 v3 的设置模式：

```css
/* Do not use these in Tailwind v4 browser-runtime compositions. */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

不要仅仅为了给使用 v4 浏览器运行时的合成定义颜色、字体、间距或实用工具而添加 `tailwind.config.js`。请在 `text/tailwindcss` 样式块中使用 `@theme` 和 `@utility`。

如果已编译的 v4 构建确实需要使用现有的 JavaScript 配置，请在 CSS 中使用 `@config` 显式加载它，然后在浏览器中进行验证。不要假定 v4 会自动检测 v3 配置文件。

## HyperFrames 合成模式

让 Tailwind 负责静态布局和视觉样式。让 GSAP 或其他可定位适配器负责动效时间控制。

```html
<section
  class="clip absolute inset-0 grid place-items-center bg-zinc-950 text-white"
  data-start="0"
  data-duration="5"
  data-track-index="1"
>
  <div class="w-[1280px] max-w-[82vw] text-center">
    <p class="mb-6 text-xl font-medium uppercase tracking-[0.18em] text-cyan-300">
      Render-ready Tailwind
    </p>
    <h1 class="text-7xl font-black leading-none text-balance">
      Utility classes, deterministic frames.
    </h1>
  </div>
</section>
```

对于重复项，应优先使用类列表与 CSS 自定义属性，而不是动态生成类名：

```html
<span class="inline-block translate-y-[calc(var(--i)*6px)] opacity-80" style="--i: 0"></span>
<span class="inline-block translate-y-[calc(var(--i)*6px)] opacity-80" style="--i: 1"></span>
<span class="inline-block translate-y-[calc(var(--i)*6px)] opacity-80" style="--i: 2"></span>
```

## 动态类安全性

Tailwind 的浏览器运行时会扫描当前文档，并为它能够识别的类名生成 CSS。不要只在定位时才构建渲染关键类名：

```js
// Risky: Tailwind may not see every generated class before capture.
element.className = `bg-${color}-500`;
```

请改为在 HTML、数据属性或显式 CSS 中使用完整类名：

```html
<div data-tone="blue" class="bg-blue-500 data-[tone=rose]:bg-rose-500"></div>
```

如果无法避免生成类，请确保在验证前，完整的类标记已出现在 `text/tailwindcss` 块中。

## 视频专用防护措施

- 视频布局应使用稳定的尺寸：`w-[...]`、`h-[...]`、`aspect-video`、`grid`、`flex` 和固定内边距。
- 对于动画属性，优先使用变换和不透明度。
- 除非状态由支持定位的运行时管理，否则不要在渲染关键的时序中使用 Tailwind 过渡效果。
- 对于必须以确定性方式渲染的内容，请避免使用悬停、焦点、滚动、视口或指针变体。
- 使用显式边框颜色。Tailwind v4 更改了 v3 中的默认边框行为，因此 `border border-white/20` 比单独使用 `border` 更安全。
- 使用 v4 实用工具名称：在适用这些替代项时，使用 `shadow-xs`、`rounded-xs`、`outline-hidden`、`shrink-*` 和 `grow-*`。
- 如果输出需要支持旧版浏览器，请谨慎使用现代 CSS 实用工具。Tailwind v4 面向现代浏览器。

## 验证

编辑启用了 Tailwind 的合成项目后：

```bash
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
```

要获得渲染证明：

```bash
npx hyperframes render . --workers 1 --quality draft --output tailwind-proof.mp4
```

验证流程应显示第 0 帧没有样式缺失闪烁。如果样式在预览中出现但在渲染中未出现，请检查 `window.__tailwindReady` 是否存在并在捕获前完成解析。

## 快速调试检查清单

1. 确认项目是使用 `hyperframes init --tailwind` 搭建的。
2. 确认脚本指向 `@tailwindcss/browser@4.2.4`。
3. 确认 `window.__tailwindReady` 存在。
4. 将 v3 `@tailwind` 指令替换为 v4 浏览器运行时 CSS。
5. 将自定义标记从 `tailwind.config.js` 移至 `@theme`。
6. 将动态拼接的类替换为完整的静态标记。
7. 运行 `npx hyperframes validate` 并渲染一段简短的证明视频。

## 致谢与参考资料

- Tailwind CSS 官方 v4 安装、升级和兼容性文档：https://tailwindcss.com/docs
- Tailwind CSS v4 发布说明：https://tailwindcss.com/blog/tailwindcss-v4
- 参考了社区 Tailwind 技能，以了解 v4 的易错点和技能结构，但本技能将持久契约保留在仓库中，并专用于 HyperFrames。