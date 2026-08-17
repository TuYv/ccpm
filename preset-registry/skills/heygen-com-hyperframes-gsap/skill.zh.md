---
name: gsap
description: GSAP animation reference for HyperFrames. Covers gsap.to(), from(), fromTo(), easing, stagger, defaults, timelines (gsap.timeline(), position parameter, labels, nesting, playback), and performance (transforms, will-change, quickTo). Use when writing GSAP animations in HyperFrames compositions.
---
# GSAP

## HyperFrames 契约

HyperFrames 通过其 `gsap` 运行时适配器控制 GSAP。请同步创建一个暂停的时间线，使用准确的 `data-composition-id` 将其注册到 `window.__timelines`，并让 HyperFrames 对其进行定位。

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};
  const tl = gsap.timeline({ paused: true });

  tl.from(".title", { y: 48, opacity: 0, duration: 0.6, ease: "power3.out" }, 0);
  tl.to(".accent", { scaleX: 1, duration: 0.5, ease: "power2.out" }, 0.25);

  window.__timelines["main"] = tl; // key must equal data-composition-id on the composition root
</script>
```

- 注册表键必须与合成根元素的 `data-composition-id` 匹配。
- 不要为渲染关键型动画调用 `tl.play()`。
- 不要在异步代码、定时器或事件处理程序中构建时间线。
- 循环次数必须有限。HyperFrames 渲染的是有限时长的视频。

## 核心补间方法

- **gsap.to(targets, vars)** — 从当前状态动画过渡到 `vars`。最常用。
- **gsap.from(targets, vars)** — 从 `vars` 动画过渡到当前状态（入场动画）。
- **gsap.fromTo(targets, fromVars, toVars)** — 明确指定起始和结束状态。
- **gsap.set(targets, vars)** — 立即应用（持续时间为 0）。

始终使用 **camelCase** 属性名称（例如 `backgroundColor`、`rotationX`）。

## 常用 vars

- **duration** — 秒数（默认为 0.5）。
- **delay** — 开始前的延迟秒数。
- **ease** — `"power1.out"`（默认值）、`"power3.inOut"`、`"back.out(1.7)"`、`"elastic.out(1, 0.3)"`、`"none"`。
- **stagger** — 数值 `0.1` 或对象：`{ amount: 0.3, from: "center" }`、`{ each: 0.1, from: "random" }`。
- **overwrite** — `false`（默认值）、`true` 或 `"auto"`。
- **repeat** — 有限数值；在 HyperFrames 中绝不能使用 `-1`。根据可见时长计算重复次数。**yoyo** — 重复时交替方向。
- **onComplete**、**onStart**、**onUpdate** — 回调函数。
- **immediateRender** — 对 from()/fromTo() 默认为 `true`。对于稍后以相同属性和元素为目标的补间动画，将其设置为 `false` 以避免覆盖。

## 变换与 CSS

优先使用 GSAP 的**变换别名**，而不是原始的 `transform` 字符串：

| GSAP 属性                   | 等效项              |
| --------------------------- | ------------------- |
| `x`, `y`, `z`               | translateX/Y/Z (px) |
| `xPercent`, `yPercent`      | translateX/Y in %   |
| `scale`, `scaleX`, `scaleY` | scale               |
| `rotation`                  | rotate (deg)        |
| `rotationX`, `rotationY`    | 3D rotate           |
| `skewX`, `skewY`            | skew                |
| `transformOrigin`           | transform-origin    |

- **autoAlpha** — 优先使用它而不是 `opacity`。值为 0 时：还会设置 `visibility: hidden`。
- **CSS variables** — `"--hue": 180`。
- **svgOrigin** _（仅限 SVG）_ — 全局 SVG 坐标空间原点。不要与 `transformOrigin` 结合使用。
- **Directional rotation** — `"360_cw"`、`"-170_short"`、`"90_ccw"`。
- **clearProps** — `"all"` 或逗号分隔的值；完成时移除行内样式。
- **Relative values** — `"+=20"`、`"-=10"`、`"*=2"`。

## 基于函数的值

```javascript
gsap.to(".item", {
  x: (i, target, targets) => i * 50,
  stagger: 0.1,
});
```

## 缓动

内置缓动：`power1`–`power4`、`back`、`bounce`、`circ`、`elastic`、`expo`、`sine`。每种缓动都有 `.in`、`.out`、`.inOut`。

## 默认值

```javascript
gsap.defaults({ duration: 0.6, ease: "power2.out" });
```

## 控制补间动画

```javascript
const tween = gsap.to(".box", { x: 100 });
tween.pause();
tween.play();
tween.reverse();
tween.kill();
tween.progress(0.5);
tween.time(0.2);
```

## gsap.matchMedia()（响应式 + 无障碍）

仅在媒体查询匹配时运行设置；当不再匹配时自动还原。

```javascript
let mm = gsap.matchMedia();
mm.add(
  {
    isDesktop: "(min-width: 800px)",
    reduceMotion: "(prefers-reduced-motion: reduce)",
  },
  (context) => {
    const { isDesktop, reduceMotion } = context.conditions;
    gsap.to(".box", {
      rotation: isDesktop ? 360 : 180,
      duration: reduceMotion ? 0 : 2,
    });
  },
);
```

---

## 时间线

### 创建时间线

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });
tl.to(".a", { x: 100 }).to(".b", { y: 50 }).to(".c", { opacity: 0 });
```

### 位置参数

第三个参数控制放置位置：

- **绝对位置**：`1` — 在第 1 秒
- **相对位置**：`"+=0.5"` — 在末尾之后；`"-=0.2"` — 在末尾之前
- **标签**：`"intro"`、`"intro+=0.3"`
- **对齐**：`"<"` — 与前一个动画同时开始；`">"` — 在前一个动画结束后开始；`"<0.2"` — 在前一个动画开始 0.2 秒后开始

```javascript
tl.to(".a", { x: 100 }, 0);
tl.to(".b", { y: 50 }, "<"); // same start as .a
tl.to(".c", { opacity: 0 }, "<0.2"); // 0.2s after .b starts
```

### 标签

```javascript
tl.addLabel("intro", 0);
tl.to(".a", { x: 100 }, "intro");
tl.addLabel("outro", "+=0.5");
tl.play("outro");
tl.tweenFromTo("intro", "outro");
```

### 时间线选项

- **paused: true** — 创建时暂停；调用 `.play()` 开始播放。
- **repeat**、**yoyo** — 应用于整个时间线。
- **defaults** — 将 vars 合并到每个子补间动画中。

### 嵌套时间线

```javascript
const master = gsap.timeline();
const child = gsap.timeline();
child.to(".a", { x: 100 }).to(".b", { y: 50 });
master.add(child, 0);
```

### 播放控制

`tl.play()`、`tl.pause()`、`tl.reverse()`、`tl.restart()`、`tl.time(2)`、`tl.progress(0.5)`、`tl.kill()`。

---

## 性能

### 优先使用变换和不透明度

为 `x`、`y`、`scale`、`rotation`、`opacity` 添加动画时，操作会在合成器上完成。如果变换能实现相同效果，请避免使用 `width`、`height`、`top`、`left`。

### will-change

```css
will-change: transform;
```

仅用于实际执行动画的元素。

### 使用 gsap.quickTo() 进行高频更新

```javascript
let xTo = gsap.quickTo("#id", "x", { duration: 0.4, ease: "power3" }),
  yTo = gsap.quickTo("#id", "y", { duration: 0.4, ease: "power3" });
container.addEventListener("mousemove", (e) => {
  xTo(e.pageX);
  yTo(e.pageY);
});
```

### 交错优于大量补间动画

使用 `stagger`，而不是创建多个带有手动延迟的独立补间动画。

### 清理

暂停或终止屏幕外的动画。

---

## 参考资料（按需加载）

- **[references/effects.md](references/effects.md)** — 可直接使用的效果：打字机文本、音频可视化器。在需要适用于 HyperFrames 的现成效果模式时阅读。

## 最佳实践

- 属性名使用 camelCase；优先使用变换别名和 autoAlpha。
- 优先使用时间线，而不是通过 delay 串联；使用位置参数。
- 使用 `addLabel()` 添加标签，使序列更易读。
- 将默认值传入时间线构造函数。
- 需要控制播放时，存储补间动画/时间线的返回值。

## 请勿

- 在使用变换即可实现时，对布局属性（width/height/top/left）进行动画处理。
- 在同一个 SVG 元素上同时使用 svgOrigin 和 transformOrigin。
- 在可以使用时间线编排动画顺序时，通过 delay 串联动画。
- 在 DOM 存在之前创建补间动画。
- 跳过清理——不再需要补间动画时，务必将其终止。
- 在 HyperFrames 合成中使用无限重复值。应根据可见时长计算有限的重复次数。

## 致谢与参考资料

- HyperFrames 适配器源代码：`packages/core/src/runtime/adapters/gsap.ts`。
- GSAP 文档：https://gsap.com/docs/v3/
- GSAP 时间线的暂停和跳转行为：https://gsap.com/docs/v3/GSAP/Timeline/pause%28%29/