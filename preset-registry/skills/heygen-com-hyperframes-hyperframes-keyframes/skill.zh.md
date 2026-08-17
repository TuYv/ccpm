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

关键帧是一种姿态契约：状态可见、主体身份连续、运行时可安全跳转、像素经过验证。

使用 `hyperframes-animation` 获取通用场景方案。使用 `hyperframes-cli` 获取完整的命令文档。仅在选择实现机制时使用 `references/keyframe-patterns.md`，不要将其用于选择视觉风格。

## 流程

1. 确定动画主体、可见状态、最终状态和运行时。
2. 选择能够验证提示要求的最小机制。仅当机制不明确时，才阅读 `references/keyframe-patterns.md`。
3. 在声明的运行时中编写可安全跳转的关键帧。同步构建并注册运行时实例。
4. 使用 `hyperframes lint`、`hyperframes check`、`hyperframes keyframes`、一次有针对性的 `--shot`，以及验证时间点的快照进行验证。
5. 如果验证失败，请修复源关键帧，并在渲染前重新运行最小范围的失败诊断。

## 契约

- 明确移动主体。
- 明确验证预期动作所需的姿态，包括最终状态。
- 为可见通道设置关键帧，而不是隐藏的辅助状态。
- 当连续性很重要时，保持对象身份不变。
- 仅当预期动作是替换或溶解时，才使用交叉淡化。
- 将可读状态或具有语义的状态保持足够长的时间，以便看清。
- 最后一帧是动画的一部分，而不是清理环节。
- 除非明确要求，否则不要重置为静止状态。
- 除非明确要求，否则不要以黑屏结束。
- 如果编辑初始场景，除非要求重新设计，否则请保留布局、文案、资源、颜色和最终状态。

## 运行时规则

GSAP：

- 在页面加载时同步构建
- 使用 `gsap.timeline({ paused: true })`
- 注册为 `window.__timelines[compositionId]`
- 注册表键必须与 `data-composition-id` 匹配
- 对渲染关键动作，不要调用 `tl.play()`
- 确保重复次数有限

CSS 关键帧：

- 持续时间和迭代次数必须有限
- 延迟必须是确定性的
- `animation-fill-mode: both`
- 当时间设置属于某个片段时，使用 `data-start`

Anime.js：

- 同步创建
- `autoplay: false`
- 持续时间和循环次数必须有限
- 将每个实例推送到 `window.__hfAnime`

WAAPI：

- `duration` 必须有限
- `fill: "both"`
- 以确定性方式构建
- 文本界面不会列出 WAAPI；请使用 `--shot`（它会跳转 WAAPI）和快照进行验证

切勿将以下内容用于渲染关键动作：

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

使用标签标记语义状态。使用位置参数，而不是链式延迟。对于后续会触及相同属性的 `from()`/`fromTo()` 补间动画，使用 `immediateRender: false`。

## 关键帧形式

- 数组关键帧：由各步骤的持续时间/缓动构成的姿态阶梯。
- 百分比关键帧：在单个补间动画中精确控制时间点。
- 属性数组：以紧凑方式实现多停靠点变化。
- 当每个停靠点都有自己的缓动时，在父级上使用 `ease: "none"`。
- 当每个分段都应具有相同的动感时，使用 `easeEach`。

不要照搬示例中的数值距离或时间。应根据实际构图的几何关系和持续时间推导这些值。

当一个主体在两个框之间移动时，优先使用一个连续的变换补间动画或 FLIP。只有当需要让观看者感受到不同节拍时，才将 `x/y/scale` 拆分为多个带缓动的关键帧；每个分段都会改变速度，并可能给人卡顿感。

## 通道

优先使用合成器/视觉通道：`x/y/z`、`xPercent/yPercent`、`scale`、`rotationX/Y/Z`、`skew`、`transformOrigin`、`svgOrigin`、`opacity`、`autoAlpha`、`clip-path`、遮罩、CSS 变量、SVG 路径/虚线值、相机变换、着色器 uniform。

避免使用布局/生命周期通道：`top/left/right/bottom`、`width/height`、`margin/padding`、`display`、`visibility`、延迟创建 DOM、通过辅助覆盖层实现主体移动。

对于可见性变化，应在已注册的可跳转 GSAP 时间轴上使用 `autoAlpha`，或在明确的边界处使用零持续时间的 `tl.set()`。仅将非裁剪元素或裁剪区域内部的包装器作为目标；绝不要将 `.clip` 本身作为目标。绝不要对原始 `visibility` 执行带持续时间的补间动画，也绝不要对 `display` 执行补间动画。

## 机制选择

选择能够证明提示要求的最小机制：

| 需求                                  | 机制                                          |
| ------------------------------------- | -------------------------------------------------- |
| 同一主体更换框或层级 | 共享元素 / FLIP                              |
| 主体沿可见路线移动       | 路径移动                                        |
| 描边增长或描摹                | 描边绘制                                        |
| 一个形状变为另一个形状           | 形状插值                                |
| 显示边界可见            | 裁剪、遮罩或着色器 uniform                      |
| 多个项目按顺序移动            | 交错 / 索引延迟                            |
| 文本本身移动                     | 行、单词、字符或条带细分         |
| 表面弯曲、拉伸或裁切    | 父级/子级反向变换                     |
| UI 具有状态                         | 显式状态机                             |
| 场景具有景深                       | DOM 3D、Three.js 或 WebGL 相机/对象关键帧 |

机制可以组合使用，但每一种机制都必须有助于阐明创意。装饰不能作为证明。

## 时序

- 仅在有助于明确因果关系或方向时使用预备动作。
- 通过加速离开静止状态。
- 证明峰值应清晰无误地展示机制。
- 跟随动作可强化能量感和方向感。
- 仅当主体应该呈现弹性或触感时才使用过冲。
- 匀速路径移动通常需要 `ease: "none"`。
- 离散的 UI 状态通常需要干脆的缓出。
- 重复元素需要有序的偏移，而不是完全相同的时序。
- 最终定格画面需要比过渡姿态停留更长时间。
- 流畅意味着同一主体的速度连续。
- 不要让写入同一变换属性的补间动画重叠，除非这种重叠是有意为之且已经过验证。
- 当同一个主视觉表面也在缩放或移动时，避免同时为大幅度的 `clip-path`/遮罩变化设置动画；应在主要移动稳定后使用嵌套显示效果。

## 文本

保留行框、字间距、可读性和最终适配效果。如果文本在内部移动，应移动字形或遮罩带，而不只是移动文本周围的装饰元素。为可读帧生成快照。

## SVG

对于描边增长，优先使用 `DrawSVGPlugin`，其次使用 `stroke-dasharray`/`stroke-dashoffset`。对于形状插值，优先使用 `MorphSVGPlugin`；必要时将基本图形转换为路径，并将复杂轮廓拆分成更简单的部分。

## 3D

仅缩放会产生虚假的深度感。应在稳定的父元素上使用透视、`transform-style: preserve-3d`、z 轴位移、旋转、相机/世界运动、遮挡，以及对象交叉时的图层顺序。

使用一两个能够清楚展示深度关系的诊断角度。如果倾斜视角的证明未显示深度交叉，请改进 z 轴位置、相机或遮挡效果。

## Canvas / WebGL

通过确定性状态为相机位置、相机目标、对象变换、材质不透明度、着色器 uniform 和后处理强度设置关键帧。基于 HyperFrames 时间进行渲染。使用 `--ghost`，因为标记框无法检测 Canvas 内部的运动。

## CLI 证明

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

为实际的动画主体选择 `<selector>`。为第一帧、证明姿态、最终停留前的时刻以及准确的最终帧选择 `<times>`。仅当必须证明深度时才选择 `<angle>`。

| 工具             | 可证明的内容                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `keyframes`      | 目标、显式停点、路径、轨迹、多笔画绘制、组合的父/子运动、CSS 停点、Anime 注册                      |
| `--shot`         | 残影、路线形状、时间间距、DOM 3D 投影、聚焦选择器证明                                               |
| `--layout strip` | 原地运动、重叠、接触、细微的缩放/不透明度变化、文本波动                                             |
| `--ghost`        | Canvas、WebGL、着色器运动、渲染后的 3D                                                              |
| `snapshot --at`  | 遮罩、文本可读性、完整状态、最终定版、黑屏/重置尾帧                                                  |

如果选择器证明看起来不正确：

1. 重新运行 `--json`
2. 找到实际的动画目标
3. 拍摄该目标
4. 为完整帧生成快照
5. 相比日志，应以绘制出的像素为准

## 诊断解读

`flat` 表示没有显式的中间姿态。`keyframes` 表示存在显式停点。`motionPath` 表示存在路线。`trace` 表示多笔画绘制。`composed with` 表示子元素的运动会继承父元素的运动。

残影间距均匀表示速度恒定。残影聚集表示缓入或稳定过程。间距较大表示快速移动。

辅助选择器截图不能作为证明。叠加在已损坏完整画面上的洋葱皮截图也不能作为证明。

## 错误处理

| 故障 | 修复方法 |
| ------------------ | ---------------------------------------------------------------------------------- |
| 仅有端点 | 添加中间姿势，保持峰值证明画面，重新运行 `--shot` |
| 一致性断裂 | 保持一个元素存续，使用共享的源边界框/最终边界框，移除替代式交叉淡化 |
| 伪 3D | 添加 z 轴/相机移动、遮挡和倾斜角度证明画面 |
| 最终状态错误 | 添加最终状态停留，截取最终状态减去停留时长的画面和精确的最终画面 |
| 运行时无法定位 | 暂停自动播放，注册实例，移除定时器，同步构建 |
| 文本不可读 | 保留行边界框，减小位移，添加最终状态停留，截取文本帧 |

## 完成

运行 `hyperframes lint`、`hyperframes check`、`hyperframes keyframes`、一次有针对性的 `--shot`，并生成快照。确认第一帧、证明姿势、最终状态减去停留时长的画面、精确的最终画面、由主体自身驱动的运动，以及不存在调试叠加层。