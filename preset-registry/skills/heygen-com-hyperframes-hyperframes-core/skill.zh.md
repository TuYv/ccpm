---
name: hyperframes-core
description: The HyperFrames composition contract — build one renderable project. Use for composition structure, the `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback, deterministic-render rules, and validation. Also covers Tailwind projects and the STORYBOARD.md / SCRIPT.md plan formats. Read before writing composition HTML.
---
# HyperFrames 核心

HyperFrames 从 HTML 渲染视频。一个合成是一个 HTML 文件，其 DOM 通过 `data-*` 属性声明时间，其动画运行时可定位，且其媒体播放由框架负责。

此技能是**技术契约**——说明如何构建一个 HyperFrames 项目。以下正文是构建指南；各主题的详细内容位于 `references/` 中（索引如下），请按需阅读。其他关注点位于同级领域技能中——`hyperframes-animation`、`hyperframes-creative`、`media-use`、`hyperframes-cli`、`hyperframes-registry`。`/hyperframes` 中的能力映射说明了各自涵盖的内容。

## 参考资料

| 文件                                    | 阅读它以便……                                                                                                                                                                        |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/minimal-composition.md`     | 从最小可渲染合成骨架开始                                                                                                                            |
| `references/composition-patterns.md`    | 选择单体还是模块化；构建模块化 `index.html`；选择子合成原型                                                                                          |
| `references/data-attributes.md`         | 查阅任意 `data-*`（根 / 片段 / 子合成宿主 / 旧版别名）；使用 `class="clip"`                                                                                            |
| `references/tracks-and-clips.md`        | 选择 `data-track-index`，处理同轨道重叠 / z-index，使一个片段相对于另一个片段定时                                                                                      |
| `references/creator-editing-recipes.md` | 复制忠实的剪切/裁剪/重新排序/重新定时/冻结/摄像机/遮罩/交叉淡化/音频编辑方案及其限制                                                                          |
| `references/sub-compositions.md`        | 连接子合成（宿主属性、`<template>`、每实例变量）并在其中制作动画                                                                                         |
| `references/variables-and-media.md`     | 声明变量；放置 `<video>`/`<audio>`，设置音量，裁剪                                                                                                                     |
| `references/determinism-rules.md`       | 构建可定位的时间线；确定性禁令；可动画属性白名单；布局 / 文本适配                                                                                  |
| `references/full-screen-motion.md`      | 使用共享背景创作全帧运动                                                                                                                                   |
| `references/storyboard-format.md`       | 编写 `STORYBOARD.md` 计划（以及解析后的清单）                                                                                                                              |
| `references/review-loop.md`             | 在实时面板上运行计划 → 草图 → 构建审查流程——由每个故事板规划工作流共享                                                                         |
| `references/production-loop.md`         | 将获批计划制作成交付视频——自由形式构建直接遵循的阶段依赖关系（音频、帧、组装、转场、字幕、验证、交付）            |
| `references/brief-contract.md`          | 简报的基本规则——模式推导（协作式 / 自主式）、共享字段注册表、问题不变量（提问本身位于 `/hyperframes` → 意图层） |
| `references/brief-format.md`            | 编写 `BRIEF.md`——工作流的 Setup 写入、后续每个步骤读取的已确认意图文档                                                                             |
| `references/script-format.md`           | 编写可选的 `SCRIPT.md` 锁定旁白                                                                                                                                   |
| `references/subagent-dispatch.md`       | 将子代理调度动词（并行扇出 / 后台 / 等待）映射到你的执行环境                                                                                                 |
| `references/frame-worker-core.md`       | 共享的帧工作代理角色契约——每个叙事工作流的数据包构建器都会将其前置于该工作流的 `sub-agents/frame-worker.md` 增量内容                                 |
| `references/tailwind.md`                | 在 Tailwind v4 项目中工作（`init --tailwind`；运行时契约与 Studio 的 v3 不同）                                                                                       |

关于动画运行时的具体信息（GSAP API、Lottie、Three.js 等），请前往 `hyperframes-animation` → `adapters/<runtime>.md`。

## 构建组合

### 两种根形式（不可互换）

- **独立组合**（顶层 `index.html`）— 根 `<div data-composition-id="…">` 直接位于 `<body>` 中，**不使用 `<template>` 包裹**（包裹会隐藏所有内容并破坏渲染）。
- **子组合**（通过 `data-composition-src` 加载）— 根元素**必须**包裹在 `<template>` 中。

> ⚠ 传输规则：运行时**只克隆 `<template>` 内容**；外部的所有内容（包括 `<head>` 中的样式/脚本）都会被丢弃——请将 `<style>`/`<script>` **放在**模板**内部**。
> ⚠ 宿主 id 规则：宿主插槽的 `data-composition-id` 必须与内部模板的 `data-composition-id` **完全一致**，并且与 `window.__timelines["<id>"]` 键一致——不得添加 `-mount`/`-slot`/`-host` 后缀。

文件结构、宿主连接方式和预渲染检查清单 → `references/sub-compositions.md`。

### 根元素必须有尺寸（静默布局错误）

独立组合的根元素需要一个显式的**具有尺寸的盒子**（以 px 指定 `width`/`height`），并且到 `height:100%` 元素为止的每个祖先元素都必须具有已解析的高度——否则 flex/`100%` 子元素会收缩至约 0，内容会堆叠在左上角。不要仅依赖自动化门禁来捕获此问题；请检查快照。骨架示例 → `references/minimal-composition.md`。

### 一条暂停的时间线

每个组合恰好在 `window.__timelines["<id>"]`（键 = 根 `data-composition-id`）注册一条 `gsap.timeline({ paused: true })`，并在页面加载时**同步**构建。渲染时长 = 根元素的 `data-duration`，而不是时间线长度。不要手动将子时间线嵌套进宿主。完整契约（包括非 GSAP 运行时）→ `references/determinism-rules.md` + `hyperframes-animation/adapters/`。

### 首次 lint 常见陷阱（保证导致首次构建失败）

以下两条规则 `lint` **确实**能捕获，但只会在事后发现——第一次编写时就应正确处理：

- **根**组合元素必须带有 `data-start="0"`（与 `data-composition-id`/`data-width`/`data-height` 一并存在）；遗漏会导致 `lint` 以 `root_composition_missing_data_start` 失败。
- 不要将 CSS 初始 `transform` 与同一属性上的 GSAP tween 配对使用——CSS 值会与 tween 的起始状态冲突，`lint` 会以 `gsap_css_transform_conflict` 拒绝。请使用 `gsap.fromTo(el, { x: -40 }, { x: 0 })` 在 tween 内设置初始状态，而不是使用 CSS `transform: translateX(-40px)`。

### 不可协商的规则（自动化门禁可能遗漏的静默问题）

此处仅列出；完整原理见链接的参考文档。不得违反：

- 禁止渲染时钟 / 未设种子的 `Math.random` / 网络 / 输入状态；禁止 `repeat: -1`（请使用有限次数）。→ `determinism-rules.md`
- 只能为视觉属性允许列表中的属性制作动画；绝不能 tween `display` 或原始 `visibility`。GSAP `autoAlpha` 和零时长时间线边界设置是仅有的可见性例外，且仅可用于非 clip 元素或 clip 内部的包装器。框架单独控制 `.clip` 可见性。不要在页面加载时对后续场景的 clip 使用 `gsap.set`。→ `determinism-rules.md`
- 正文文本中禁止使用 `<br>`；带变换的元素必须是块级且具有尺寸；脉冲的绝对定位装饰元素需要为峰值预留空间。→ `determinism-rules.md`
- `<video>`/`<audio>` 可在**任意嵌套深度**下工作（包括子组合 `<template>` 或包装器内部）；框架负责其所在位置的媒体播放和 seek/decode。唯一的注意事项是时间线，而不是放置位置：子组合时间线无法为宿主根元素制作动画。→ `variables-and-media.md`
- 每个 `id` 在**组装后的**页面中都必须唯一；在子组合内，请使用组合 id 作为 id 前缀（`#<id>-hero`）。重复的 `<video>`/`<img>` id 会渲染为**空白**——生产器通过 `getElementById` 注入帧，而跨文件重复项会逃过 `lint`。→ `composition-patterns.md`
- 全屏场景填充应设置在全出血的**子元素**上（`position:absolute; inset:0`），绝不能设置在组合根元素本身——生产器的帧合成可能丢弃根元素自身的 `background`（帧会渲染为**黑色**），即使预览/`snapshot` 显示正确也是如此。→ `composition-patterns.md`

## 编辑现有合成

- 先读取文件。保留无关的时间安排、轨道、ID、变量和媒体路径。
- 匹配现有的合成 ID 和时间线键。
- 添加片段：选择不重叠的 `data-track-index`，或有意调整周围的时间安排。
- 任意合成元素上的 `data-hidden` 都会同时在预览和渲染中将其隐藏，并覆盖其时间窗口；这是非破坏性的、可逆的操作，可通过 Studio 的时间线眼睛图标进行切换。
- 添加子合成：在连接宿主之前，确认其内部的 `data-composition-id`。

## 验证

使用 `hyperframes-cli` 查看命令详情

- [ ] `npx hyperframes check` 通过（lint、runtime、layout、motion 和 contrast 均为 0 个发现项）
- [ ] 包含子合成的项目：运行 `npx hyperframes snapshot --at <midpoints>` 并目视检查每一帧
- [ ] 使用 `npx hyperframes preview --background` 进行审查（用户可以在 Studio 的时间线中编辑任意内容，并且服务器会在调用该命令后继续运行）
- [ ] 仅在用户批准后运行 `npx hyperframes render`