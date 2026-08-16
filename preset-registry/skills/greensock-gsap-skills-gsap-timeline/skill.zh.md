---
name: gsap-timeline
description: Official GSAP skill for timelines — gsap.timeline(), position parameter, nesting, playback. Use when sequencing animations, choreographing keyframes, or when the user asks about animation sequencing, timelines, or animation order (in GSAP or when recommending a library that supports timelines).
license: MIT
---
# GSAP 时间线

## 何时使用此技能

当构建多步骤动画、按顺序或并行协调多个补间动画，或者用户询问 GSAP 中的时间线、序列编排或关键帧式动画时使用。

**相关技能：**对于单个补间动画和缓动，请使用 **gsap-core**；对于滚动驱动的时间线，请使用 **gsap-scrolltrigger**；对于 React，请使用 **gsap-react**。

## 创建时间线

```javascript
const tl = gsap.timeline();
tl.to(".a", { x: 100, duration: 1 })
  .to(".b", { y: 50, duration: 0.5 })
  .to(".c", { opacity: 0, duration: 0.3 });
```

默认情况下，补间动画会依次**追加**。使用**位置参数**可将补间动画放置在特定时间点，或相对于其他补间动画进行放置。

## 位置参数

第三个参数（或 vars 中的 position 属性）控制放置位置：

- **绝对位置**：`1` — 在第 1 秒开始。
- **相对位置（默认）**：`"+=0.5"` — 在结束后 0.5 秒；`"-=0.2"` — 在结束前 0.2 秒。
- **标签**：`"labelName"` — 位于该标签处；`"labelName+=0.3"` — 位于标签后 0.3 秒。
- **放置方式**：`"<"` — 在最近添加的动画开始时启动；`">"` — 在最近添加的动画结束时启动（默认）；`"<0.2"` — 在最近添加的动画开始后 0.2 秒启动。

示例：

```javascript
tl.to(".a", { x: 100 }, 0);           // at 0
tl.to(".b", { y: 50 }, "+=0.5");      // 0.5s after last end
tl.to(".c", { opacity: 0 }, "<");     // same start as previous
tl.to(".d", { scale: 2 }, "<0.2");    // 0.2s after previous start
```

## 时间线默认值

将默认值传入时间线，使所有子补间动画继承这些值：

```javascript
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: "power2.out" } });
tl.to(".a", { x: 100 }).to(".b", { y: 50 }); // both use 0.5s and power2.out
```

## 时间线选项（构造函数）

- **paused: true** — 创建时处于暂停状态；调用 `.play()` 开始播放。
- **repeat**、**yoyo** — 与补间动画相同；应用于整个时间线。
- **onComplete**、**onStart**、**onUpdate** — 时间线级别的回调。
- **defaults** — 合并到每个子补间动画中的 vars。

## 标签

添加并使用标签，以实现可读且易于维护的序列编排：

```javascript
tl.addLabel("intro", 0);
tl.to(".a", { x: 100 }, "intro");
tl.addLabel("outro", "+=0.5");
tl.to(".b", { opacity: 0 }, "outro");
tl.play("outro");  // start from "outro"
tl.tweenFromTo("intro", "outro"); // pauses the timeline and returns a new Tween that animates the timeline's playhead from intro to outro with no ease.
```

## 嵌套时间线

时间线可以包含其他时间线。

```javascript
const master = gsap.timeline();
const child = gsap.timeline();
child.to(".a", { x: 100 }).to(".b", { y: 50 });
master.add(child, 0);
master.to(".c", { opacity: 0 }, "+=0.2");
```

## 控制播放

- **tl.play()** / **tl.pause()**
- **tl.reverse()** / **tl.progress(1)**，然后调用 **tl.reverse()**
- **tl.restart()** — 从头开始。
- **tl.time(2)** — 跳转到第 2 秒。
- **tl.progress(0.5)** — 跳转到 50%。
- **tl.kill()** — 终止时间线，并且（默认情况下）终止其子动画。

## GSAP 官方最佳实践

- ✅ 对动画时序编排，优先使用时间线
- ✅ 使用 **position 参数**（第三个参数）将补间动画放置在特定时间点或标签的相对位置。
- ✅ 使用 `addLabel()` 添加**标签**，使时序编排易读且易于维护。
- ✅ 将 **defaults** 传入时间线构造函数，使子补间动画继承持续时间、缓动等设置。
- ✅ 将 ScrollTrigger 设置在时间线（或顶层补间动画）上，而不是时间线内部的补间动画上。

## 不要这样做

- ❌ 当可以使用**时间线**进行时序编排时，不要通过 **delay** 串联动画；对于多步骤动画，优先使用 `gsap.timeline()` 和 position 参数。
- ❌ 当多个子补间动画共用相同的持续时间或缓动时，不要忘记传入 **defaults**（例如 `defaults: { duration: 0.5, ease: "power2.out" }`）。
- ❌ 不要忘记，时间线构造函数中的 **duration** 与补间动画的持续时间并不相同；时间线的“持续时间”由其子动画决定。
- ❌ 不要嵌套包含 ScrollTrigger 的动画；ScrollTrigger 应仅设置在顶层补间动画/时间线上。