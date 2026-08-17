---
name: hyperframes-animation
description: "All animation knowledge for HyperFrames — atomic motion rules, multi-phase scene blueprints, scene transitions, broader motion-design techniques, AND the seven runtime adapters (GSAP default, plus Lottie, Three.js, Anime.js, CSS keyframes, Web Animations API, TypeGPU). Use for any motion or animation task: pick 2-4 rules and compose, or load a blueprint, or look up runtime-specific API (e.g. GSAP eases / Lottie player / Three.js mixer). Also covers auditing an existing composition's choreography (animation map) and 24 named text-animation effects. HyperFrames-native: single paused timeline, seek-safe, deterministic."
---
# HyperFrames 动画

一个技能涵盖所有动效知识：**规则**（原子级配方）、**蓝图**（多阶段场景模板）、**转场**（场景之间的过渡）、**技法**（更广泛的动效设计模式）以及**适配器**（各运行时 API）。

有关组合规范（数据属性、子组合、确定性），请参阅 `hyperframes-core`。

## 默认：组合原子规则

从 `rules-index.md` 中选择 2-4 条规则，使用一条暂停的 GSAP 时间线将它们组合起来，即可完成。与从蓝图开始相比，这种方式速度更快，生成的代码也更少。

## 以下情况应加载蓝图

- 场景与现有的预设计多阶段模板（品牌展示、社会认同等）相匹配，并且复用其阶段流程能够切实节省编写时间
- 你需要可运行的标准代码，来实现复杂的 4-5 阶段编排

蓝图位于 `blueprints-index.md` 中。每个条目都指向 `blueprints/<id>.md`（配方）。不要在尚未确定需要时提前阅读；只有当你已经决定需要场景级编排时，才加载它。

## 路由

| 想要……                                                                         | 阅读                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| 按触发器 / 标签选择原子动效模式                                                | `rules-index.md`                                    |
| 阅读某条规则的完整 HTML / CSS / GSAP 配方                                      | `rules/<name>.md`                                   |
| 选择多阶段场景模板                                                             | `blueprints-index.md`                               |
| 阅读某个蓝图的完整配方                                                         | `blueprints/<id>.md`                                |
| 编写场景转场（由 CSS 驱动，位于两个片段之间）                                  | `transitions/overview.md`, `transitions/catalog.md` |
| 查找更广泛的动效设计技法                                                       | `techniques.md`                                     |
| 分析现有组合的动画映射                                                         | `scripts/animation-map.mjs`                         |
| GSAP API — 时间线 / 补间 / 位置参数                                            | `adapters/gsap.md`                                  |
| GSAP — 即插即用的效果配方                                                      | `rules/gsap-effects.md`                             |
| GSAP — 变换 / 性能                                                             | `adapters/gsap-transforms-and-perf.md`              |
| GSAP — 缓动 / 交错                                                             | `adapters/gsap-easing-and-stagger.md`               |
| GSAP — 时间线 / 标签                                                           | `adapters/gsap-timeline-and-labels.md`              |
| Lottie / dotLottie（After Effects 导出、`window.__hfLottie`）                  | `adapters/lottie.md`                                |
| Three.js / WebGL（3D 场景、`AnimationMixer`、`hf-seek`）                       | `adapters/three.md`                                 |
| Anime.js（`window.__hfAnime`）                                                 | `adapters/animejs.md`                               |
| CSS 关键帧（`animation-delay` / `play-state` / `fill-mode`）                   | `adapters/css-animations.md`                        |
| Web Animations API（`element.animate()`、`currentTime` 定位）                  | `adapters/waapi.md`                                 |
| TypeGPU / WebGPU（`navigator.gpu`、WGSL、计算管线）                            | `adapters/typegpu.md`                               |
| HTML 作为纹理 + WebGL/GLSL 后期效果（通过 `drawElementImage` 捕获实时 DOM）    | `adapters/html-in-canvas-patterns.md`               |
| 命名文本动画效果（通过外部 `animate-text` 技能提供 24 个 ID）                  | `adapters/animate-text.md`                          |

## 选择运行时

- **GSAP** 是 95% 动效工作的默认选择——涵盖时间线编排、变换、缓动和交错动画。本技能中的所有原子规则均基于 GSAP。
- **Lottie** 适用于资源自带预制时间线的情况（通常是 After Effects 导出文件）。
- **Three.js** 适用于 3D 场景、摄像机运动和着色器驱动的视觉效果。
- **Anime.js** 适用于 GSAP 显得过重时的轻量级补间动画。
- **CSS** 适用于简单的重复图案、装饰和微光效果——没有 JavaScript 动画开销。
- **WAAPI** 适用于不依赖 GSAP 的浏览器原生关键帧动画。
- **TypeGPU / WebGPU** 适用于 GPU 渲染的画布（粒子、液态玻璃、自定义着色器）。

一个合成中可以共存多个运行时。每个运行时都会将其实例注册到对应运行时的全局对象上，以便 HyperFrames 一次性定位所有实例。

## 关键约束

**前置要求：`hyperframes-core` → 不可协商的规则**（单个暂停的时间线、由 `data-duration` 控制时长、不得使用 `Math.random` / `Date.now` / `performance.now`、不得使用 `repeat: -1`、不得在页面加载时对后续场景的剪辑执行 `gsap.set`、不得对 `display` 或原始 `visibility` 进行补间，也不得在 `async` / `setTimeout` / `Promise` 内构建时间线）。核心规则仍允许使用 GSAP `autoAlpha`，以及在明确的时间线边界处执行零时长的可见性设置。仅在非剪辑元素或剪辑内部的包装器上使用这些例外；框架负责管理 `.clip` 的生命周期。不要在此重复完整约定。

在核心约定基础上新增的动画制作要求：

- **预先计算的布局常量**——切勿在补间执行时通过 `getBoundingClientRect()` 推导位置。由于渲染器会并行采样，补间执行时的 DOM 测量会导致不同步；应在合成初始化时一次性计算坐标并重复使用。
- **空间运动只能使用 GSAP 变换别名**（`x`、`y`、`scale`、`rotation`）。对于非空间属性补间，核心规则的允许列表还包括 `opacity` / `color` / `backgroundColor` / `borderRadius`——但切勿使用 `width` / `height` / `top` / `left` 进行布局变更。

## 脚本

```bash
node skills/hyperframes-animation/scripts/animation-map.mjs <composition-dir> \
  --out <composition-dir>/.hyperframes/anim-map
```

读取注册在 `window.__timelines` 上的每条 GSAP 时间线，枚举补间、采样边界框、计算标记，并输出 `animation-map.json`。创作完成后，使用它审查动画编排（空白区间、交错一致性、生命周期警告）。

`animation-map.mjs` 会优先从当前项目解析辅助包，随后可引导安装捆绑的 HyperFrames 软件包版本。仅当在捆绑的 CLI/技能安装之外运行该技能，并且需要显式固定该引导安装版本时，才设置 `HYPERFRAMES_SKILL_PKG_VERSION=<version>`。

## 另请参阅

- `hyperframes-core`——合成结构、数据属性、子合成、确定性渲染约定
- `hyperframes-creative`——调色板、字体排印、旁白、节拍规划（非动画类创意指导）
- `hyperframes-cli`——`npx hyperframes lint / check / snapshot / preview / render`