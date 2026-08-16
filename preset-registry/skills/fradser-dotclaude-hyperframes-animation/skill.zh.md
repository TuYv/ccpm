---
name: hyperframes-animation
description: "All animation knowledge for HyperFrames — atomic motion rules, multi-phase scene blueprints, scene transitions, broader motion-design techniques, AND the seven runtime adapters (GSAP default, plus Lottie, Three.js, Anime.js, CSS keyframes, Web Animations API, TypeGPU). Use for any motion or animation task: pick 2-4 rules and compose, or load a blueprint, or look up runtime-specific API (e.g. GSAP eases / Lottie player / Three.js mixer). Also covers auditing an existing composition's choreography (animation map) and 24 named text-animation effects. HyperFrames-native: single paused timeline, seek-safe, deterministic."
---
# HyperFrames 动画

将所有动效知识整合在一个 skill 中：**规则**（原子化配方）、**蓝图**（多阶段场景模板）、**转场**（场景之间的过渡）、**技术**（更广泛的动效设计模式）以及**适配器**（各运行时 API）。

有关组合约定（数据属性、子组合、确定性），请参阅 `hyperframes-core`。

## 默认方式：组合原子规则

从 `rules-index.md` 中选择 2-4 条规则，使用一条暂停的 GSAP 时间线将它们组合起来，即可完成。与从蓝图开始相比，这种方式更快，生成的代码也更少。

## 何时加载蓝图

- 场景与现有的预设计多阶段模板（品牌展示、社会认同等）相匹配，并且复用其阶段流程确实能够节省编写时间
- 你需要可运行的权威代码，来实现复杂的 4-5 阶段编排

蓝图位于 `blueprints-index.md` 中。每个条目都指向 `blueprints/<id>.md`（配方）。不要预先推测性地阅读它；只有在已经确定需要场景级编排时才加载。

## 路由

| 想要……                                                                       | 阅读                                                |
| ------------------------------------------------------------------------------ | --------------------------------------------------- |
| 按触发器 / 标签选择原子动效模式                                 | `rules-index.md`                                    |
| 阅读某条规则的完整 HTML / CSS / GSAP 配方                                  | `rules/<name>.md`                                   |
| 选择多阶段场景模板                                              | `blueprints-index.md`                               |
| 阅读某个蓝图的完整配方                                               | `blueprints/<id>.md`                                |
| 编写场景转场（由 CSS 驱动，位于两个片段之间）                      | `transitions/overview.md`, `transitions/catalog.md` |
| 查找更广泛的动效设计技术                                      | `techniques.md`                                     |
| 分析现有组合的动画映射                                | `scripts/animation-map.mjs`                         |
| GSAP API — 时间线 / 补间 / 位置参数                             | `adapters/gsap.md`                                  |
| GSAP — 可直接使用的效果配方                                                  | `rules/gsap-effects.md`                             |
| GSAP — 变换 / 性能                                                       | `adapters/gsap-transforms-and-perf.md`              |
| GSAP — 缓动 / 交错                                                         | `adapters/gsap-easing-and-stagger.md`               |
| GSAP — 时间线 / 标签                                                       | `adapters/gsap-timeline-and-labels.md`              |
| Lottie / dotLottie（After Effects 导出、`window.__hfLottie`）                | `adapters/lottie.md`                                |
| Three.js / WebGL（3D 场景、`AnimationMixer`、`hf-seek`）                      | `adapters/three.md`                                 |
| Anime.js（`window.__hfAnime`）                                                  | `adapters/animejs.md`                               |
| CSS 关键帧（`animation-delay` / `play-state` / `fill-mode`）                 | `adapters/css-animations.md`                        |
| Web Animations API（`element.animate()`、`currentTime` 定位）                   | `adapters/waapi.md`                                 |
| TypeGPU / WebGPU（`navigator.gpu`、WGSL、计算管线）                    | `adapters/typegpu.md`                               |
| HTML 作为纹理 + WebGL/GLSL 后期特效（通过 `drawElementImage` 捕获实时 DOM） | `adapters/html-in-canvas-patterns.md`               |
| 具名文本动画效果（通过外部 `animate-text` skill 提供 24 个 ID）        | `adapters/animate-text.md`                          |

## 选择运行时

- **GSAP** 是 95% 动效工作的默认选择——涵盖时间线编排、变换、缓动和交错。本技能中的所有原子规则均基于 GSAP。
- **Lottie** 适用于素材自带预制时间线的情况（通常为 After Effects 导出内容）。
- **Three.js** 适用于 3D 场景、相机运动和着色器驱动的视觉效果。
- **Anime.js** 适用于 GSAP 显得过重时的轻量级补间动画。
- **CSS** 适用于简单的重复图案、装饰和微光效果——无需 JavaScript 动画开销。
- **WAAPI** 适用于不依赖 GSAP 的浏览器原生关键帧动画。
- **TypeGPU / WebGPU** 适用于由 GPU 渲染的画布（粒子、液态玻璃、自定义着色器）。

一个合成中可以共存多个运行时。每个运行时都会将其实例注册到对应运行时的全局对象上，以便 HyperFrames 一次性定位所有实例的时间点。

## 关键约束

**前置要求：`hyperframes-core` → 不可协商的规则**（单一暂停时间线、由 `data-duration` 控制时长、禁止使用 `Math.random` / `Date.now` / `performance.now`、禁止使用 `repeat: -1`、禁止在页面加载时对后续场景剪辑执行 `gsap.set`、禁止对 `display` 或原始 `visibility` 进行补间动画，以及禁止在 `async` / `setTimeout` / `Promise` 内构建时间线）。核心规则仍允许使用 GSAP `autoAlpha`，以及在明确的时间线边界执行零时长可见性设置。这些例外仅可用于非剪辑元素或剪辑内部的包装器；框架负责管理 `.clip` 的生命周期。不要在此重复完整约定。

在核心约定之上，动画制作还需遵循以下附加要求：

- **预先计算的布局常量**——切勿在补间动画执行时通过 `getBoundingClientRect()` 推导位置。由于渲染器会并行采样，在补间动画执行时测量 DOM 会导致不同步；应在合成设置阶段一次性计算坐标并重复使用。
- **空间运动仅使用 GSAP 变换别名**（`x`、`y`、`scale`、`rotation`）。核心规则的允许列表还允许将 `opacity` / `color` / `backgroundColor` / `borderRadius` 用于非空间属性补间动画——但绝不能使用 `width` / `height` / `top` / `left` 更改布局。

## 脚本

```bash
node skills/hyperframes-animation/scripts/animation-map.mjs <composition-dir> \
  --out <composition-dir>/.hyperframes/anim-map
```

读取注册在 `window.__timelines` 上的每条 GSAP 时间线，枚举补间动画、采样边界框、计算标记，并输出 `animation-map.json`。完成创作后，使用它审核动作编排（空白时段、交错一致性、生命周期警告）。

`animation-map.mjs` 会优先从当前项目解析辅助包，随后可以引导安装捆绑的 HyperFrames 包版本。仅当在捆绑的 CLI/技能安装环境之外运行该技能，并且需要显式固定引导安装版本时，才设置 `HYPERFRAMES_SKILL_PKG_VERSION=<version>`。

## 另请参阅

- `hyperframes-core`——合成结构、数据属性、子合成、确定性渲染约定
- `hyperframes-creative`——调色板、排版、旁白、节拍规划（非动画创意指导）
- `hyperframes-cli`——`npx hyperframes lint / check / snapshot / preview / render`