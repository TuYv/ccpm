---
name: hyperframes-keyframes
description: >
  Use when a HyperFrames composition needs a punch-in, punch-out, zoom, reframe,
  Ken Burns treatment, camera move, visual match/whip handoff, or other seek-safe
  2D/3D keyframes; also for GSAP, CSS keyframes, Anime.js, WAAPI, FLIP, paths,
  masks, SVG morph/draw, text trails, 3D depth, or `hyperframes keyframes` diagnostics.
  Don't use for broad scene strategy, brand design, media sourcing, captions, or
  general video planning.
---
# HyperFrames 关键帧

关键帧是一份姿态契约：可见状态、连续的主体身份、可安全定位的运行时，以及经过验证的像素。

广泛的场景编排请使用 `hyperframes-animation`。完整的命令文档请使用 `hyperframes-cli`。仅在选择实现机制时使用 `references/keyframe-patterns.md`，不要将其用于选择视觉风格。

## 创作者编辑边界

关键帧负责视觉运动，而不是片段组装。源范围的硬切、裁剪、拼接和重排属于 `/hyperframes-core`：每个保留范围编写一个媒体元素，使用 `data-start` 和 `data-duration` 放置它，并使用 `data-media-start` 选择其源偏移量。相邻范围会形成硬切。交叉淡化使用不同轨道上相互重叠的片段，并配合视觉不透明度关键帧；声音淡化使用 `/hyperframes-audio`。

| 创作者请求                         | 真实机制                                                                                                                                                                                                          |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 推近 / 拉远                        | 在片段内非定时的视觉/裁剪包装器上，为 `scale` 添加带 `x`/`y` 的关键帧或百分比平移。硬推拉使用设置/短补间，平滑移动使用补间。                                                                                       |
| 平滑的多状态缩放或重新构图         | 保持一个主体包装器持续存在，并将多个缩放/重新构图状态编写为姿态阶梯，为每个分段设置缓动。                                                                                                                          |
| 平移、重新构图或 Ken Burns 镜头移动 | 为包装器添加平移和缩放动画。几何变换由作者编写；这不是面部跟踪或自动语义重新构图。                                                                                                                                  |
| 链式镜头移动                       | 在一条已注册且可安全定位的时间线上串联带标签的变换节拍。                                                                                                                                                            |
| 匹配剪辑或甩镜                       | `/hyperframes-animation` 负责视觉交接；`/hyperframes-registry` 提供基本构件；关键帧保留已编写的几何形状、方向和速度。不会自动发现匹配帧。                                                                          |
| 裁剪和蒙版重新构图                 | 在内部视觉包装器上插值 `clip-path` 或蒙版，以便在不改变源时间的情况下进行裁剪/重新构图。多边形关键帧可以构成多边形/蒙版过渡。                                                                                       |
| 方向性擦除切换或虹膜/揭示切换      | 在相互重叠的视觉片段上为蒙版/裁剪边界添加动画，使其跨越画面；交接编排由 `/hyperframes-animation` 负责。                                                                                                               |
| 分屏交接                           | 保持两个视觉片段由 core 放置，然后为它们的内部裁剪/蒙版包装器及分隔线几何形状添加关键帧。                                                                                                                           |
| 恒定源重定时                       | `/hyperframes-core` 负责归一化的 `data-playback-rate`（`0.1..5`），以实现适合渲染的画面和保持音高的声音。它对整个媒体元素保持恒定。                                                                                |
| 源速度渐变                         | 不支持：不存在随时间变化的播放速率包络。请预处理派生媒体资源，然后通过 core 放置它。                                                                                                                                |
| 冻结 / 保持                         | 可以保持一个视觉姿态、源的最后一帧或已完成的子合成。不支持任意源中途冻结；请预处理静帧/派生片段，将其作为独立片段放置，然后使用另一个源范围继续播放。                                                        |

同时编辑画面和声音时，加载 `/hyperframes-core`，使用此技能处理视觉运动，并使用 `/hyperframes-audio` 处理已放置轨道上的淡入淡出、交叉淡化、音量自动化、ducking/carve 或效果。

视觉转场或裁剪处理并不是时间源裁剪或拼接。`/hyperframes-core` 负责时间线、片段时序和源范围；关键帧只在这些片段内部的包装器上，对可见的交接或裁剪进行动画处理。
如需可复制的画面/声音组合方案，请使用 `/hyperframes-core` → `references/creator-editing-recipes.md`。

## 流程

1. 确定动画主体、可见状态、最终状态和运行时长。
2. 选择能够证明提示要求的最小机制。只有在机制不明确时，才阅读 `references/keyframe-patterns.md`。
3. 在声明的运行时长内编写可安全跳转的关键帧。同步构建并注册运行时实例。
4. 使用 `hyperframes lint`、`hyperframes check`、`hyperframes keyframes`、一次聚焦的 `--shot`，以及在验证时间点生成的快照进行验证。
5. 如果验证失败，修复源关键帧，然后重新运行最小范围的失败诊断，再进行渲染。

## 约定

- 指明运动主体。
- 指明用于证明预期运动所需的姿势，包括最终状态。
- 对可见通道设置关键帧，而不是对隐藏的辅助状态设置关键帧。
- 当连续性很重要时，保持对象身份不变。
- 只有当预期运动是替换或溶解时，才使用交叉淡化。
- 让易读或具有语义的状态保持足够长的时间，以便看清。
- 最后一帧是动画的一部分，而不是收尾清理。
- 除非有要求，否则不要重置为静止状态。
- 除非有要求，否则不要以黑屏结束。
- 如果编辑的是起始场景，除非要求重新设计，否则保留布局、文案、素材、颜色和最终状态。

## 运行时规则

GSAP：

- 在页面加载时同步构建
- 使用 `gsap.timeline({ paused: true })`
- 注册为 `window.__timelines[compositionId]`
- 注册表键必须与 `data-composition-id` 匹配
- 对于渲染关键运动，不要调用 `tl.play()`
- 保持重复次数有限

CSS 关键帧：

- 使用有限的时长和迭代次数
- 使用确定性的延迟
- 使用 `animation-fill-mode: both`
- 当时序属于片段时，使用 `data-start`

Anime.js：

- 同步创建
- 使用 `autoplay: false`
- 使用有限的时长和循环次数
- 将每个实例都推入 `window.__hfAnime`

WAAPI：

- 使用有限的 `duration`
- 使用 `fill: "both"`
- 以确定性的方式构建
- 文本界面不会列出 WAAPI；请使用 `--shot`（它会跳转 WAAPI）和快照进行验证

渲染关键运动绝不要使用：

- `Date.now()`
- `performance.now()`
- 未设定种子的 `Math.random()`
- 悬停/滚动触发器
- 计时器
- 异步创建的时间线
- 未注册的 `requestAnimationFrame`
- 无限循环

## GSAP 骨架

```js
const root = document.querySelector("[data-composition-id]");
const compositionId = root.dataset.compositionId;
const tl = gsap.timeline({ paused: true });

tl.addLabel("state-a", 0);
tl.to(".subject", {
  keyframes: [
    { x: 0, opacity: 1, duration: 0.2 },
    { x: 120, opacity: 1, duration: 0.4, ease: "power2.out" },
    { x: 100, opacity: 1, duration: 0.2, ease: "power2.inOut" },
  ],
  ease: "none",
});

window.__timelines = window.__timelines || {};
window.__timelines[compositionId] = tl;
```

使用标签表示语义状态。使用位置参数，而不是串联的延迟。对于涉及同一属性的后续 `from()`/`fromTo()` 补间，使用 `immediateRender: false`。

## 关键帧形式

- 数组关键帧：带有逐步时长/缓动的姿态阶梯。
- 百分比关键帧：在一个补间内部指定精确时间。
- 属性数组：紧凑地表示多段变化。
- 当每个停靠点都带有自己的缓动时，在父级上使用 `ease: "none"`。
- 当每个片段都应具有相同的感觉时，使用 `easeEach`。

不要照搬示例中的数值距离或时间。应根据实际构图几何和时长推导这些参数。

对于一个主体在两个框之间移动的情况，优先使用一个连续的变换补间或 FLIP。只有当观众应当感受到清晰的节拍时，才将 `x/y/scale` 拆分为多个带缓动的关键帧；每个片段都会改变速度，可能让运动读起来像卡顿。

## 通道

优先使用合成器/视觉通道：`x/y/z`、`xPercent/yPercent`、`scale`、`rotationX/Y/Z`、`skew`、`transformOrigin`、`svgOrigin`、`opacity`、`autoAlpha`、`clip-path`、蒙版、CSS 变量、SVG 路径/虚线值、摄像机变换、着色器 uniform。

避免使用布局/生命周期通道：`top/left/right/bottom`、`width/height`、`margin/padding`、`display`、`visibility`、延迟 DOM 创建、执行主体运动的辅助叠加层。

对于可见性变化，在已注册且可寻址的 GSAP 时间轴上使用 `autoAlpha`，或在明确的边界处使用零时长的 `tl.set()`。只将目标设为非裁剪元素或裁剪元素内部的包装器；绝不要将 `.clip` 本身作为目标。绝不要对原始 `visibility` 使用带时长的补间，也绝不要补间 `display`。

## 机制选择

选择能够证明提示内容的最小机制：

| 需求                                 | 机制                                  |
| ------------------------------------ | ------------------------------------- |
| 同一主体改变框或层级                 | 共享元素 / FLIP                        |
| 主体沿可见路线移动                   | 路径运动                               |
| 描边增长或描摹                       | 描边绘制                               |
| 一个形状变成另一个形状               | 形状插值                               |
| 可见揭示边界                         | 裁剪、蒙版或着色器 uniform             |
| 许多项目按顺序移动                   | 交错 / 索引延迟                        |
| 文本本身移动                         | 行、单词、字符或带状细分               |
| 表面弯曲、拉伸或裁切                 | 父级/子级反向变换                      |
| UI 具有多种状态                       | 显式状态机                             |
| 场景具有深度                         | DOM 3D、Three.js 或 WebGL 摄像机/对象关键帧 |

机制可以组合，但每个机制都必须阐明创意。装饰不能作为证明。

## 时间安排

- 只有在能够阐明原因或方向时，才使用预备动作。
- 加速之后要留出停顿。
- 关键证明阶段应明确无误地展示机制。
- 后续动作用于强化能量和方向感。
- 只有当主体应当具有弹性或触感时，才使用过冲。
- 匀速路径运动通常需要 `ease: "none"`。
- 离散的 UI 状态通常需要尖锐的缓出。
- 重复元素需要有顺序的偏移，而不是完全相同的时间安排。
- 最终锁定状态的停留时间应长于过渡姿态。
- 流畅意味着同一主体的速度连续。
- 除非重叠是有意为之并经过验证，否则不要让同时写入同一变换属性的补间发生重叠。
- 避免在同一主视觉表面还在缩放或移动时，同时对大型 `clip-path`/蒙版变化进行动画处理；应在主要移动稳定后，使用嵌套揭示。

## 文本

保持文本框、字间距、可读性和最终适配效果。如果文本在内部移动，应移动字形或遮罩带，而不只是移动文本周围的装饰元素。截取文本清晰可读的帧。

## SVG

对于描边生长效果，优先使用 `DrawSVGPlugin`，然后再使用 `stroke-dasharray`/`stroke-dashoffset`。对于形状插值，优先使用 `MorphSVGPlugin`；必要时将基本图形转换为路径，并将复杂轮廓拆分为更简单的部分。

## 3D

仅靠缩放制造的是虚假的深度。应在稳定的父级上使用透视、`transform-style: preserve-3d`、沿 z 轴移动、旋转、摄像机/世界运动、遮挡，以及物体交叉时的图层顺序。

使用一个或两个能够展现深度关系的诊断角度。如果倾斜视角的验证没有显示深度交错，请改进 z 轴、摄像机或遮挡效果。

## Canvas / WebGL

通过确定性状态对摄像机位置、摄像机目标、物体变换、材质不透明度、着色器 uniforms 和后处理强度设置关键帧。使用 HyperFrames 时间进行渲染。使用 `--ghost`，因为标记框无法看到 canvas 内部的运动。

## CLI 验证

```bash
npx hyperframes lint
npx hyperframes check
npx hyperframes keyframes .
npx hyperframes keyframes . --json
npx hyperframes keyframes . --runtime all
npx hyperframes keyframes . --selector "<selector>" --shot "<file>" --samples <n>
npx hyperframes keyframes . --selector "<selector>" --shot "<file>" --layout strip --from <t0> --to <t1>
npx hyperframes keyframes . --shot "<file>" --ghost --angle <angle>
npx hyperframes snapshot . --at <times>
```

为真正的动画主体选择 `<selector>`。为第一帧、验证姿态、最终帧减去保持段，以及精确的最终帧选择 `<times>`。仅当必须验证深度时才选择 `<angle>`。

| 工具             | 验证内容                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `keyframes`      | 目标、显式停留点、路径、轨迹、组合后的父级/子级运动、CSS 停留点、Anime 注册情况 |
| `--shot`         | ghost、路径形状、时间间隔、DOM 3D 投影、聚焦选择器验证                        |
| `--layout strip` | 原位运动、重叠、接触、细微的缩放/不透明度、文本波浪                                |
| `--ghost`        | canvas、WebGL、着色器运动、渲染后的 3D                                                           |
| `snapshot --at`  | 遮罩、文本可读性、完整状态、最终组合、黑屏/重置尾帧                                |

如果选择器验证看起来不正确：

1. 重新运行 `--json`
2. 找到实际的动画目标
3. 对该目标进行拍摄
4. 截取完整帧
5. 相信已绘制的像素，而不是日志

## 诊断解读

`flat` 表示没有显式的中间姿态。`keyframes` 表示存在显式停留点。`motionPath` 表示存在路径。`trace` 表示多笔画绘制。`composed with` 表示子级运动继承了父级运动。

ghost 间距均匀表示速度恒定。ghost 聚集表示慢入或停稳。间距较大表示快速移动。

辅助选择器镜头不是证据。在损坏的完整画面上叠加洋葱皮镜头也不是证据。

## 错误处理

| 失败情况           | 修复                                                                                |
| ------------------ | ----------------------------------------------------------------------------------- |
| 仅有端点           | 添加中间姿态，保持峰值证据，重新运行 `--shot`                                  |
| 身份断裂           | 保留一个元素持续存在，使用共享的源框和最终框，移除替代物交叉淡化 |
| 虚假的 3D          | 添加 z 轴/摄像机移动、遮挡和倾斜角度证据                                       |
| 错误的最终状态     | 添加最终保持，分别截取 final-minus-hold 和精确最终状态                         |
| 运行时无法跳转     | 暂停自动播放，注册实例，移除计时器，以同步方式构建                         |
| 文本不可读         | 保留行框，减少位移，添加最终保持，截取文本帧     |

## 完成

运行 `hyperframes lint`、`hyperframes check`、`hyperframes keyframes`、一次聚焦的 `--shot` 和快照。确认第一帧、证据姿态、final-minus-hold、精确最终状态、由主体控制的运动，以及没有调试叠加层。