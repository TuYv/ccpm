---
name: waapi
description: Web Animations API adapter patterns for HyperFrames. Use when authoring element.animate() motion, Animation currentTime seeking, document.getAnimations(), KeyframeEffect timing, fill modes, or native browser animations that must render deterministically in HyperFrames.
---
# HyperFrames 的 Web Animations API

HyperFrames 可以通过其 `waapi` 运行时适配器定位 Web Animations API 动画。当你希望使用浏览器原生关键帧、通过 JavaScript 创建时序，并且不依赖 GSAP 时，WAAPI 非常有用。

## 约定

- 在合成初始化期间同步创建动画。
- 使用具有有限 `duration` 和 `iterations` 的 `element.animate(...)`。
- 使用 `fill: "both"`，以便定位后的状态持续生效。
- 在创建动画后将其暂停，或者让适配器在首次定位时暂停动画。
- 避免使用回调和 promise 来处理对渲染至关重要的状态。

适配器会调用 `document.getAnimations()`，将每个动画的 `currentTime` 设置为以毫秒为单位的 HyperFrames 时间，然后暂停动画。

## 基本模式

```html
<div id="orb" class="clip orb" data-start="2" data-duration="3" data-track-index="2"></div>

<script>
  const orb = document.getElementById("orb");
  const animation = orb.animate(
    [
      { transform: "translate3d(-160px, 0, 0) scale(0.8)", opacity: 0 },
      { transform: "translate3d(0, 0, 0) scale(1)", opacity: 1, offset: 0.35 },
      { transform: "translate3d(120px, 0, 0) scale(1.08)", opacity: 1 },
    ],
    {
      duration: 3000,
      delay: 2000,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "both",
      iterations: 1,
    },
  );

  animation.pause();
</script>
```

## 交错模式

```js
document.querySelectorAll(".token").forEach((token, index) => {
  const animation = token.animate(
    [
      { transform: "translateY(24px)", opacity: 0 },
      { transform: "translateY(0)", opacity: 1 },
    ],
    {
      duration: 620,
      delay: index * 80,
      easing: "cubic-bezier(0.2, 0, 0, 1)",
      fill: "both",
      iterations: 1,
    },
  );
  animation.pause();
});
```

## 适用场景

- CSS 关键帧过于僵化且无需使用 GSAP 的轻量级 DOM 动效。
- 根据结构化数据生成的动画。
- 可以表示为关键帧、延迟和偏移量的简单时间线。

## 应避免

- 无限的 `iterations`。
- 依赖 `animation.finished` 修改对渲染至关重要的 DOM。
- 使用 `requestAnimationFrame`、计时器或 `performance.now()` 运行独立时钟。
- 在变换和不透明度足以表现动作时，对布局属性进行动画处理。
- 假定片段局部的开始时间会自动生效。WAAPI 适配器定位的是文档级动画时间；应使用 `delay` 表示片段偏移，或者在可见性由 HyperFrames 时序控制的元素上创建动画。

## 验证

编辑 WAAPI 合成后：

```bash
npx hyperframes lint
npx hyperframes validate
```

## 致谢与参考资料

- HyperFrames 适配器源代码：`packages/core/src/runtime/adapters/waapi.ts`。
- MDN Web Animations API 指南：https://developer.mozilla.org/docs/Web/API/Web_Animations_API/Using_the_Web_Animations_API
- MDN `Animation.currentTime`：https://developer.mozilla.org/en-US/docs/Web/API/Animation/currentTime