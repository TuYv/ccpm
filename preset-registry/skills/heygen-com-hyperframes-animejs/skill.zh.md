---
name: animejs
description: Anime.js adapter patterns for HyperFrames. Use when writing Anime.js animations or timelines inside HyperFrames compositions, registering animations on window.__hfAnime, making Anime.js seek-driven and deterministic, or translating Anime.js examples into render-safe HyperFrames HTML.
---
# HyperFrames 中的 Anime.js

HyperFrames 可通过其 `animejs` 运行时适配器定位 Anime.js 实例的时间。合成负责管理动画对象；HyperFrames 负责管理时钟。

## 约定

- 在合成初始化期间同步创建动画或时间线。
- 设置 `autoplay: false`，以免 Anime.js 按自身时钟推进。
- 将返回的每个动画或时间线注册到 `window.__hfAnime`。
- 使用有限的持续时间和循环次数。
- 避免使用基于挂钟时间、网络状态或未设种子的随机性来修改 DOM 的回调。

适配器通过 `instance.seek(timeMs)` 定位每个已注册实例，其中 `timeMs` 是以毫秒为单位的 HyperFrames 时间。

## 基本模式

```html
<script src="https://cdn.jsdelivr.net/npm/animejs@4.0.2/lib/anime.iife.min.js"></script>
<script>
  const anim = anime({
    targets: ".mark",
    translateX: 280,
    rotate: "1turn",
    opacity: [0, 1],
    duration: 1200,
    easing: "easeOutExpo",
    autoplay: false,
  });

  window.__hfAnime = window.__hfAnime || [];
  window.__hfAnime.push(anim);
</script>
```

## 时间线模式

```html
<script>
  const tl = anime.timeline({
    autoplay: false,
    easing: "easeOutCubic",
  });

  tl.add({
    targets: ".title",
    translateY: [40, 0],
    opacity: [0, 1],
    duration: 650,
  }).add(
    {
      targets: ".accent",
      scaleX: [0, 1],
      duration: 450,
    },
    250,
  );

  window.__hfAnime = window.__hfAnime || [];
  window.__hfAnime.push(tl);
</script>
```

## 模块构建版本

如果使用 ES 模块构建版本，适配器并不关心实例是如何创建的。它只需要返回的对象公开 `seek()`、`pause()`，最好还公开 `play()`：

```html
<script type="module">
  import { animate } from "https://cdn.jsdelivr.net/npm/animejs/+esm";

  const anim = animate(".chip", {
    x: "18rem",
    duration: 900,
    autoplay: false,
  });

  window.__hfAnime = window.__hfAnime || [];
  window.__hfAnime.push(anim);
</script>
```

## 适用场景

- Anime.js 语法能够简洁表达的小型 SVG 和 DOM 装饰动画。
- 可改为由时间定位驱动的导入版 Anime.js 示例。
- 推送到同一注册表中的多个独立微动画。

除非用户明确要求使用 Anime.js，否则请使用 GSAP 处理复杂的场景编排。GSAP 仍是 HyperFrames 的主要创作方式。

## 避免事项

- 将 `autoplay` 保留为 Anime.js 的默认值。
- 依赖 `anime.running` 自动发现，而不是显式调用 `window.__hfAnime.push(...)`。
- 无限循环。请根据合成时长计算有限的重复次数。
- 在定时器、Promise、事件处理程序中或异步资源加载完成后构建动画。

## 验证

编辑使用 Anime.js 的合成后：

```bash
npx hyperframes lint
npx hyperframes validate
```

## 致谢与参考资料

- HyperFrames 适配器源代码：`packages/core/src/runtime/adapters/animejs.ts`。
- Anime.js 关于 `autoplay`、`pause()` 和 `seek()` 的文档：https://animejs.com/documentation/