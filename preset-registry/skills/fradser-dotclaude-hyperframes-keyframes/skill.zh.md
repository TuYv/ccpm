---
name: hyperframes-keyframes
description: >
  Use when a HyperFrames composition needs seek-safe 2D/3D keyframes, GSAP
  timelines, CSS keyframes, Anime.js, WAAPI, FLIP, paths, masks, SVG morph/draw,
  text trails, 3D depth, or `hyperframes keyframes` diagnostics.
  Don't use for broad scene strategy, brand design, media sourcing, captions, or
  general video planning.
---
# HyperFrames 关键帧

关键帧是一种姿态契约：状态可见、主体身份连续、运行时可安全定位、像素经过验证。

使用 `hyperframes-animation` 获取广泛适用的场景方案。使用 `hyperframes-cli` 获取完整的命令文档。仅在选择实现机制时使用 `references/keyframe-patterns.md`，不要用它来选择视觉风格。

## 流程

1. 确定动画主体、可见状态、最终状态和运行时。
2. 选择能够证明提示词要求的最小机制。仅当机制不明确时才阅读 `references/keyframe-patterns.md`。
3. 在声明的运行时中编写可安全定位的关键帧。同步构建并注册运行时实例。
4. 使用 `hyperframes lint`、`hyperframes check`、`hyperframes keyframes`、一个有针对性的 `--shot`，以及证明时间点的快照进行验证。
5. 如果验证失败，请修复源关键帧，并在渲染前重新运行最小范围的失败诊断。

## 契约

- 明确移动主体。
- 明确证明预期运动所需的姿态，包括最终状态。
- 为可见通道设置关键帧，而不是为隐藏的辅助状态设置关键帧。
- 当连续性很重要时，保持对象身份不变。
- 仅当预期运动是替换或溶解时才使用交叉淡化。
- 让可读或具有语义的状态保持足够长的时间，以便看清。
- 最后一帧是动画的一部分，而不是清理步骤。
- 除非有明确要求，否则不要重置为静止状态。
- 除非有明确要求，否则不要以黑屏结束。
- 如果编辑初始场景，除非被要求重新设计，否则应保留布局、文案、素材、颜色和最终状态。

## 运行时规则

GSAP：

- 在页面加载时同步构建
- 使用 `gsap.timeline({ paused: true })`
- 注册为 `window.__timelines[compositionId]`
- 注册表键必须与 `data-composition-id` 匹配
- 不要为渲染关键型运动调用 `tl.play()`
- 保持重复次数有限

CSS 关键帧：

- 使用有限的持续时间和迭代次数
- 使用确定性的延迟
- 使用 `animation-fill-mode: both`
- 当时间安排属于某个剪辑时，使用 `data-start`

Anime.js：

- 同步创建
- 使用 `autoplay: false`
- 使用有限的持续时间和循环次数
- 将每个实例推送到 `window.__hfAnime`

WAAPI：

- 使用有限的 `duration`
- 使用 `fill: "both"`
- 以确定性方式构建
- 文本界面不会列出 WAAPI；请使用 `--shot`（它会定位 WAAPI）和快照进行验证

切勿将以下内容用于渲染关键型运动：

- `Date.now()`
- `performance.now()`
- 未设种子的 `Math.random()`
- 悬停/滚动触发器
- 定时器
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

使用标签表示语义状态。使用位置参数，而不是链式延迟。对于后续涉及同一属性的 `from()`/`fromTo()` 补间动画，使用 `immediateRender: false`。

## 关键帧形式

- 数组关键帧：姿态阶梯，每一步都有各自的时长和缓动。
- 百分比关键帧：在一个补间动画中精确控制时间点。
- 属性数组：紧凑地实现多停靠点变化。
- 当每个停靠点都有自己的缓动时，在父级上使用 `ease: "none"`。
- 当每个分段应具有相同的动感时，使用 `easeEach`。

不要照搬示例中的数值距离或时间。应根据实际构图的几何关系和时长推导这些数值。

对于在两个框之间移动的单个主体，优先使用一个连续的变换补间或 FLIP。只有当观众应感受到清晰的节奏节点时，才将 `x/y/scale` 拆分为多个带缓动的关键帧；每个分段都会改变速度，可能会让人感觉卡顿。

## 通道

优先使用合成器/视觉通道：`x/y/z`、`xPercent/yPercent`、`scale`、`rotationX/Y/Z`、`skew`、`transformOrigin`、`svgOrigin`、`opacity`、`autoAlpha`、`clip-path`、遮罩、CSS 变量、SVG 路径/虚线值、相机变换、着色器 uniform。

避免使用布局/生命周期通道：`top/left/right/bottom`、`width/height`、`margin/padding`、`display`、`visibility`、后期创建 DOM、通过辅助覆盖层实现主体运动。

对于可见性变化，在已注册且可定位播放位置的 GSAP 时间线上使用 `autoAlpha`，或在明确的边界处使用零时长的 `tl.set()`。仅以非裁剪元素或裁剪区域内的包装器为目标；绝不要以 `.clip` 本身为目标。绝不要对原始 `visibility` 进行有时长的补间，也绝不要对 `display` 进行补间。

## 机制选择

选择足以证明提示要求的最小机制：

| 需求                                  | 机制                                               |
| ------------------------------------- | -------------------------------------------------- |
| 同一主体改变容器或层级                | 共享元素 / FLIP                                    |
| 主体沿可见路线移动                    | 路径移动                                           |
| 描边增长或描摹                        | 描边绘制                                           |
| 一个形状变成另一个形状                | 形状插值                                           |
| 显示边界可见                          | 裁剪、遮罩或着色器 uniform                         |
| 多个项目按顺序移动                    | 交错 / 索引延迟                                    |
| 文本本身移动                          | 行、词、字符或带状区域细分                         |
| 表面弯曲、拉伸或裁剪                  | 父/子级反向变换                                    |
| UI 具有多种状态                       | 显式状态机                                         |
| 场景具有纵深                          | DOM 3D、Three.js 或 WebGL 相机/对象关键帧          |

可以组合使用多种机制，但每一种都必须有助于阐明概念。装饰并不能构成证明。

## 时序

- 仅在有助于阐明原因或方向时使用预备动作。
- 从静止状态离开时要有加速。
- 在表现峰值处明确无误地展示机制。
- 跟随动作能够强化能量感和方向感。
- 仅当主体应呈现弹性或触感时才使用过冲。
- 匀速路径移动通常需要 `ease: "none"`。
- 离散的 UI 状态通常需要鲜明的缓出效果。
- 重复元素需要有序的时间偏移，而不是完全相同的时序。
- 最终定格的停留时间需要长于过渡姿态。
- 流畅意味着同一主体的速度连续。
- 除非重叠是有意为之且经过验证，否则不要让多个补间动画同时写入同一变换属性。
- 当同一个主视觉表面还在缩放或移动时，避免对大型 `clip-path`/遮罩变化进行动画处理；应在主要移动稳定后使用嵌套显示效果。

## 文本

保留行框、字间距、可读性和最终适配效果。如果文本在内部移动，应移动字形或遮罩带，而不只是移动文本周围的装饰。截取文字清晰可读的帧。

## SVG

对于描边增长，优先使用 `DrawSVGPlugin`，其次使用 `stroke-dasharray`/`stroke-dashoffset`。对于形状插值，优先使用 `MorphSVGPlugin`；必要时将基本图形转换为路径，并将复杂轮廓拆分为更简单的部分。

## 3D

仅靠缩放产生的是虚假景深。应在稳定的父元素上使用透视、`transform-style: preserve-3d`、z 轴位移、旋转、相机/世界运动、遮挡，以及对象交叉时的图层顺序。

使用一到两个能揭示深度关系的诊断角度。如果倾斜视角的验证无法显示深度交叉，请改进 z 轴、相机或遮挡效果。

## Canvas / WebGL

通过确定性状态为相机位置、相机目标、对象变换、材质不透明度、着色器统一变量和后处理强度设置关键帧。基于 HyperFrames 时间进行渲染。使用 `--ghost`，因为标记框无法检测画布内部的运动。

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

为实际的动画主体选择 `<selector>`。为第一帧、验证姿态、最终停留前一刻以及精确的最终状态选择 `<times>`。仅当必须验证深度时才选择 `<angle>`。

| 工具             | 可验证内容                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `keyframes`      | 目标、显式停顿、路径、轨迹、组合的父/子运动、CSS 停顿、Anime 注册 |
| `--shot`         | 残影、路线形状、时间间距、DOM 3D 投影、聚焦的选择器验证                        |
| `--layout strip` | 原位运动、重叠、接触、细微的缩放/不透明度、文本波动                                |
| `--ghost`        | Canvas、WebGL、着色器运动、渲染后的 3D                                                           |
| `snapshot --at`  | 遮罩、文本可读性、完整状态、最终版式、黑场/重置尾帧                                |

如果选择器验证看起来不正确：

1. 重新运行 `--json`
2. 找到实际的动画目标
3. 拍摄该目标
4. 截取完整帧
5. 相比日志，优先相信绘制出的像素

## 诊断解读

`flat` 表示没有显式的中间姿态。`keyframes` 表示存在显式停顿。`motionPath` 表示存在一条路线。`trace` 表示多描边绘制。`composed with` 表示子元素的运动会继承父元素的运动。

残影间距均匀表示速度恒定。残影聚集表示缓入或趋稳。间距较大表示快速移动。

辅助选择器截图不能作为证明。在有缺陷的完整画面上叠加洋葱皮截图也不能作为证明。

## 错误处理

| 故障               | 修复方法                                                                           |
| ------------------ | ---------------------------------------------------------------------------------- |
| 仅有端点           | 添加中间姿势，保持峰值证明画面，重新运行 `--shot`                                  |
| 标识断裂           | 保持一个元素存活，使用共享的源框和最终框，移除替代元素之间的交叉淡化               |
| 伪 3D              | 添加 z 轴/相机移动、遮挡和倾斜角度的证明画面                                       |
| 最终状态错误       | 添加最终停留，截取最终停留前一刻和精确最终状态的快照                               |
| 运行时无法定位播放 | 暂停自动播放，注册实例，移除计时器，以同步方式构建                                 |
| 文本不可读         | 保留行框，减小位移，添加最终停留，截取文本帧快照                                   |

## 完成

运行 `hyperframes lint`、`hyperframes check`、`hyperframes keyframes`、一次聚焦的 `--shot` 以及快照。确认首帧、证明姿势、最终停留前一刻、精确最终状态、由主体自身产生的运动，并确保没有调试叠加层。