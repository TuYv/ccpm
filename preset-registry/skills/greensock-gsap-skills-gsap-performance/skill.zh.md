---
name: gsap-performance
description: Official GSAP skill for performance — prefer transforms, avoid layout thrashing, will-change, batching. Use when optimizing GSAP animations, reducing jank, or when the user asks about animation performance, FPS, or smooth 60fps.
license: MIT
---
# GSAP 性能

## 何时使用此技能

在优化 GSAP 动画以实现流畅的 60fps、降低布局/绘制开销，或用户询问性能、卡顿或高性能动画最佳实践时应用此技能。

**相关技能：**使用 **gsap-core**（变换、autoAlpha）和 **gsap-timeline** 构建动画；有关 ScrollTrigger 性能，请参阅 **gsap-scrolltrigger**。

## 优先使用 Transform 和 Opacity

对 **transform**（`x`、`y`、`scaleX`、`scaleY`、`rotation`、`rotationX`、`rotationY`、`skewX`、`skewY`）和 **opacity** 设置动画，可以让工作保持在合成器中进行，并避免布局和大多数绘制操作。如果使用 transform 能达到同样的效果，请避免对布局开销较大的属性设置动画。

- ✅ 优先使用：**x**、**y**、**scale**、**rotation**、**opacity**。
- ❌ 尽可能避免：**width**、**height**、**top**、**left**、**margin**、**padding**（它们会触发布局并可能导致卡顿）。

GSAP 的 **x** 和 **y** 默认使用 transform（translate）；移动元素时，请使用它们而不是 **left**/**top**。

## will-change

在 CSS 中，对将要设置动画的元素使用 **will-change**。它会提示浏览器提升该图层。

```css
will-change: transform;
```

## 批量读取和写入

GSAP 会在内部批量处理更新。当 GSAP 与直接 DOM 读取/写入或依赖布局的代码混合使用时，应避免交错执行读取和写入，以免造成重复的布局抖动。应优先先完成所有读取，再执行所有写入（或者让 GSAP 一次性处理写入）。

## 大量元素（Stagger、列表）

- 当动画相同时，请使用 **stagger**，而不是通过手动延迟创建大量独立的 tween；这样效率更高。
- 对于长列表，请考虑使用**虚拟化**或仅对可见项设置动画；如果创建数百个同时运行的 tween 会导致卡顿，请避免这样做。
- 尽可能复用 timeline；避免每帧都创建新的 timeline。

## 频繁更新的属性（例如鼠标跟随效果）

对于频繁更新的属性（例如鼠标跟随元素的 x/y），优先使用 **gsap.quickTo()**。它会复用单个 tween，而不是每次更新时都创建新的 tween。

```javascript
let xTo = gsap.quickTo("#id", "x", { duration: 0.4, ease: "power3" }),
    yTo = gsap.quickTo("#id", "y", { duration: 0.4, ease: "power3" });

document.querySelector("#container").addEventListener("mousemove", (e) => {
  xTo(e.pageX);
  yTo(e.pageY);
});
```

## ScrollTrigger 与性能

- **pin: true** 会提升被固定元素的图层；只固定必要的元素。
- 使用较小值的 **scrub**（例如 `scrub: 1`）可以减少滚动期间的工作量；请在低端设备上进行测试。
- 仅在布局实际发生变化时（例如内容加载后）调用 **ScrollTrigger.refresh()**，不要在每次调整大小时调用；应尽可能进行防抖处理。

## 减少同时进行的工作

- 当屏幕外或非活动动画不可见时（例如用户离开当前页面），暂停或终止这些动画。
- 避免同时对大量元素的大量属性设置动画；如有必要，请简化动画或按顺序执行。

## 最佳实践

- ✅ 对 **transform** 和 **opacity** 设置动画；仅在 CSS 中对会设置动画的元素使用 **will-change**。
- ✅ 当动画相同时，请使用 **stagger**，而不是通过手动延迟创建大量独立的 tween。
- ✅ 对频繁更新的属性（例如鼠标跟随效果）使用 **gsap.quickTo()**。
- ✅ 清理或终止屏幕外动画；在布局发生变化时调用 **ScrollTrigger.refresh()**，并尽可能进行防抖处理。

## 请勿

- ❌ 当使用 **x**/ **y**/ **scale** 可以实现相同效果时，不要通过动画改变 **width**/ **height**/ **top**/ **left** 来实现移动。
- ❌ 不要“以防万一”就在每个元素上设置 **will-change** 或 **force3D**；仅对实际执行动画的元素使用它们。
- ❌ 未在低端设备上测试时，不要创建数百个相互重叠的补间动画或 ScrollTriggers。
- ❌ 不要忽略清理；遗留的补间动画和 ScrollTriggers 会持续运行，并可能影响性能和正确性。