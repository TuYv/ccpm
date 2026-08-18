---
name: hyperframes-core
description: The HyperFrames composition contract — build one renderable project. Use for composition structure, the `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback, deterministic-render rules, and validation. Also covers Tailwind projects and the STORYBOARD.md / SCRIPT.md plan formats. Read before writing composition HTML.
---
# HyperFrames 核心

HyperFrames 从 HTML 渲染视频。一个合成是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时间信息，其动画运行时可进行 seek，并且其媒体播放由框架负责。

此 skill 是**技术契约**——说明如何构建一个 hyperframes 项目。下面的正文是构建指南；各主题的详细信息位于 `references/` 中（索引见下），按需阅读。其他事项位于同级领域 skills——`hyperframes-animation`、`hyperframes-creative`、`media-use`、`hyperframes-cli`、`hyperframes-registry`。`/hyperframes` 中的能力地图说明了每个 skill 所涵盖的内容。

## 参考资料

| 文件                                    | 阅读它以了解……                                                                                                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/minimal-composition.md`     | 从最小的可渲染合成骨架开始                                                                                                                                                         |
| `references/composition-patterns.md`    | 选择单体式还是模块化；构建模块化的 `index.html`；选择一种子合成原型                                                                                                                |
| `references/data-attributes.md`         | 查找任意 `data-*`（根元素 / 片段 / 子合成宿主 / 旧版别名）；使用 `class="clip"`                                                                                                   |
| `references/tracks-and-clips.md`        | 选择 `data-track-index`，处理同轨道重叠 / z-index，相对于另一个片段设置片段时间                                                                                                   |
| `references/creator-editing-recipes.md` | 复制真实的剪切 / 修剪 / 重排 / 重定时 / 定格 / 摄像机 / 蒙版 / 交叉淡化 / 音频编辑配方及其限制                                                                                |
| `references/sub-compositions.md`        | 连接子合成（宿主属性、`<template>`、每个实例的变量），并在其中制作动画                                                                                                             |
| `references/variables-and-media.md`     | 声明变量；放置 `<video>`/`<audio>`，设置音量，进行修剪                                                                                                                            |
| `references/determinism-rules.md`       | 构建可 seek 的时间线；确定性规则禁令；可动画属性白名单；布局 / 文本适配                                                                                                            |
| `references/full-screen-motion.md`      | 使用共享背景制作全画幅动画                                                                                                                                                         |
| `references/storyboard-format.md`       | 编写 `STORYBOARD.md` 计划（以及解析后的清单）                                                                                                                                      |
| `references/review-loop.md`             | 在实时画板上运行计划 → 草图 → 构建的评审流程——所有故事板规划工作流共用                                                                                                           |
| `references/production-loop.md`         | 将已批准的计划制作成最终交付的视频——阶段依赖包括音频、帧、组装、转场、字幕、验证和交付；自由形式的构建会直接遵循这一流程                                       |
| `references/brief-contract.md`          | brief 的基本规则——模式推导（协作 / 自主）、共享字段注册表、问题不变量（提问本身位于 `/hyperframes` → 意图层）                                                                  |
| `references/brief-format.md`            | 编写 `BRIEF.md`——工作流的 Setup 写入、后续每个步骤读取的已确认意图文档                                                                                                             |
| `references/script-format.md`           | 编写可选的 `SCRIPT.md` 锁定旁白                                                                                                                                                    |
| `references/subagent-dispatch.md`       | 将子代理调度动词（并行扇出 / 后台运行 / 等待）映射到你的 harness                                                                                                                  |
| `references/frame-worker-core.md`       | 共享的帧工作器角色契约——每个叙事工作流的数据包构建器都会将其添加到该工作流的 `sub-agents/frame-worker.md` 增量内容之前                                                          |
| `references/tailwind.md`                | 在 Tailwind v4 项目中工作（`init --tailwind`；运行时契约与 Studio 的 v3 不同）                                                                                                    |

对于动画运行时的具体信息（GSAP API、Lottie、Three.js 等），请参阅 `hyperframes-animation` → `adapters/<runtime>.md`。

## 构建组合

### 两种根形式（不可互换）

- **独立组合**（顶层 `index.html`）——根 `<div data-composition-id="…">` 直接位于 `<body>` 中，**不能使用 `<template>` 包装器**（包装它会隐藏所有内容并导致渲染失败）。
- **子组合**（通过 `data-composition-src` 加载）——根元素**必须**包裹在 `<template>` 中。

> ⚠ 传输规则：运行时**只会克隆 `<template>` 的内容**；外部的所有内容（包括 `<head>` 中的样式和脚本）都会被丢弃——请将 `<style>`/`<script>` **放在模板内部**。
> ⚠ Host-id 规则：宿主插槽的 `data-composition-id` 必须与内部模板的 `data-composition-id` **以及** `window.__timelines["<id>"]` 的键**完全一致**——不能添加 `-mount`/`-slot`/`-host` 后缀。

文件结构、宿主连接方式和预渲染检查清单 → `references/sub-compositions.md`。

### 根元素必须设置尺寸（隐蔽的布局错误）

独立组合的根元素需要一个明确的**有尺寸盒子**（以 px 设置 `width`/`height`），并且一直到某个 `height:100%` 元素之间的每个祖先元素都必须具有已解析的高度——否则 flex/`100%` 子元素会收缩到接近 0，内容会堆积在左上角。不要仅依赖自动化门禁来发现这一问题；请检查快照。骨架示例 → `references/minimal-composition.md`。

### 一个暂停的时间线

每个组合在 `window.__timelines["<id>"]` 注册**且仅注册一个** `gsap.timeline({ paused: true })`，并在页面加载时**同步**构建（键 = 根 `data-composition-id`）。渲染时长 = 根元素的 `data-duration`，而不是时间线长度。不要手动将子时间线嵌套到宿主中。完整契约（包括非 GSAP 运行时）→ `references/determinism-rules.md` + `hyperframes-animation/adapters/`。

### 首轮 lint 易错点（必然导致首次构建失败）

以下两条规则 `lint` **确实会**捕获，但只能事后发现——请一开始就正确编写：

- **根**组合元素必须携带 `data-start="0"`（与 `data-composition-id`/`data-width`/`data-height` 并列）；省略它会导致 `lint` 失败，并报错 `root_composition_missing_data_start`。
- 永远不要在**同一属性**上同时使用 CSS 初始 `transform` 和 GSAP 补间——CSS 值与补间的起始值会相互冲突，`lint` 会以 `gsap_css_transform_conflict` 拒绝。请改为在补间内部设置初始状态，使用 `gsap.fromTo(el, { x: -40 }, { x: 0 })`，而不是使用 CSS `transform: translateX(-40px)`。

### 不可妥协的规则（自动化门禁可能漏掉的隐蔽错误）

此处列出；完整理由请参阅链接的参考文档。不得违反：

- 不得使用渲染时钟、未设种子的 `Math.random`、网络或输入状态；不得使用 `repeat: -1`（请使用有限次数）。→ `determinism-rules.md`
- 只能对视觉属性允许列表中的属性制作动画；绝不要补间 `display` 或原始 `visibility`。GSAP `autoAlpha` 和时间线边界处的零时长设置是唯一的可见性例外，并且只能用于非裁剪元素或裁剪元素内部的包装器。`.clip` 的可见性只能由框架控制。页面加载时不要对后续场景的裁剪元素执行 `gsap.set`。→ `determinism-rules.md`
- 正文中不得使用 `<br>`；经过变换的元素必须是块级元素并设置尺寸；脉冲式绝对定位装饰元素需要预留峰值间距。→ `determinism-rules.md`
- `<video>`/`<audio>` 在**任意嵌套深度**都可正常工作（包括位于子组合 `<template>` 或包装器内部）；框架负责播放，并会在媒体所在位置对媒体进行 seek/解码。唯一的限制与时间线有关，而非元素位置：子组合时间线无法对宿主根元素执行动画。→ `variables-and-media.md`
- 在**组装后的**页面中，每个 `id` 都必须唯一；在子组合内部，请使用组合 id 为 id 添加前缀（`#<id>-hero`）。重复的 `<video>`/`<img>` id 会导致渲染结果**空白**——生产器通过 `getElementById` 注入帧，而跨文件重复会绕过 `lint`。→ `composition-patterns.md`
- 全屏场景填充应放在全出血的**子元素**上（`position:absolute; inset:0`），绝不能放在组合根元素本身上——生产器的帧合成可能会丢弃根元素自身的 `background`（帧会渲染为**黑色**），即使预览/`snapshot` 显示正常。→ `composition-patterns.md`

## 编辑现有合成

- 先读取文件。保留无关的时间安排、轨道、ID、变量和媒体路径。
- 匹配现有的合成 ID 和时间线键。
- 添加片段：选择不重叠的 `data-track-index`，或有意调整周围的时间安排。
- 任何合成元素上的 `data-hidden` 都会在预览和渲染中将其隐藏，并覆盖其时间窗口；这是非破坏性的、可逆的操作，可通过 Studio 的时间线眼睛图标进行切换。
- 添加子合成：在连接宿主之前，确认其内部的 `data-composition-id`。

## 验证

使用 `hyperframes-cli` 获取命令详情

- [ ] `npx hyperframes check` 通过（lint、运行时、布局、运动和对比度检查均为 0 项发现）
- [ ] 包含子合成的项目：运行 `npx hyperframes snapshot --at <midpoints>`，并目视检查每一帧
- [ ] 使用 `npx hyperframes preview` 进行审查（用户可以在 Studio 的时间线中编辑任何内容）
- [ ] 仅在用户批准后运行 `npx hyperframes render`