---
name: css-animations
description: CSS animation adapter patterns for HyperFrames. Use when authoring CSS keyframes, animation-delay based timing, animation-fill-mode, animation-play-state, or CSS-only motion that HyperFrames must seek deterministically during preview and rendering.
---
# HyperFrames 的 CSS 动画

HyperFrames 可以通过其 `css` 运行时适配器定位 CSS 关键帧动画。它适用于简单的重复图案、背景运动、微光、辉光、遮罩以及非序列式装饰。

对于场景编排，GSAP 通常更清晰。当运动仅属于单个元素且持续时间固定时，CSS 动画最为适用。

## 约定

- 在运行时初始化完成之前，将动画元素放入 DOM。
- 为定时元素提供 `data-start` 值，使局部动画时间与剪辑保持一致。
- 使用有限的 `animation-duration` 和 `animation-iteration-count`，因为在没有基于 WAAPI 的 CSS 动画的环境中，负延迟回退机制无法表示无界持续时间。
- 推荐使用 `animation-fill-mode: both`，使定位后的状态在活动运动之前和之后都能保持。
- 避免使用基于实际时间流逝的 JavaScript、悬停触发的状态，以及依赖用户事件的类切换。

适配器会发现计算样式中包含 `animation-name` 的元素，在浏览器 `Animation` 句柄可用时定位这些句柄，否则回退为使用负 `animation-delay` 并暂停动画。

## 基本模式

```html
<div
  id="pulse-ring"
  class="clip pulse-ring"
  data-start="0"
  data-duration="4"
  data-track-index="2"
></div>

<style>
  .pulse-ring {
    width: 280px;
    height: 280px;
    border: 4px solid rgba(255, 255, 255, 0.7);
    border-radius: 50%;
    animation-name: pulse-ring;
    animation-duration: 1200ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
    animation-iteration-count: 3;
    animation-fill-mode: both;
  }

  @keyframes pulse-ring {
    from {
      opacity: 0;
      transform: scale(0.82);
    }
    35% {
      opacity: 1;
    }
    to {
      opacity: 0;
      transform: scale(1.18);
    }
  }
</style>
```

## 错开模式

使用 CSS 自定义属性来避免重复定义关键帧：

```html
<div class="clip dots" data-start="1" data-duration="3" data-track-index="3">
  <span style="--i: 0"></span>
  <span style="--i: 1"></span>
  <span style="--i: 2"></span>
</div>

<style>
  .dots span {
    display: inline-block;
    width: 18px;
    height: 18px;
    margin-right: 10px;
    border-radius: 50%;
    background: currentColor;
    animation: dot-pop 900ms ease-out both;
    animation-delay: calc(var(--i) * 120ms);
  }

  @keyframes dot-pop {
    from {
      opacity: 0;
      transform: translateY(18px) scale(0.75);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
</style>
```

## 适用场景

- 重复次数已知的装饰性循环。
- 遮罩、辉光、微光、颗粒和细微视差图层。
- 使用完整 JS 时间线显得过度的简单单元素入场动画。

## 避免事项

- 除非已确认浏览器提供可定位的、基于 WAAPI 的 CSS 动画句柄，否则应避免使用无限 CSS 动画。推荐使用能够覆盖可见持续时间的有限迭代次数。
- 在可以使用变换的情况下，为 `top`、`left`、`width` 或 `height` 等布局属性添加动画。
- 依赖悬停、焦点、滚动或媒体查询来触发对渲染至关重要的运动。
- 启动后更改动画类，除非该更改由另一个确定性时间线控制。

## 验证

编辑 CSS 动画组合后：

```bash
npx hyperframes lint
npx hyperframes validate
```

## 致谢与参考资料

- HyperFrames 适配器源码：`packages/core/src/runtime/adapters/css.ts`。
- MDN CSS 动画文档：https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation
- MDN `animation-fill-mode`：https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode