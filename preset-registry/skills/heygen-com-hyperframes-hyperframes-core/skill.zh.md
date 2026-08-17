---
name: hyperframes-core
description: The HyperFrames composition contract — build one renderable project. Use for composition structure, the `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback, deterministic-render rules, and validation. Also covers Tailwind projects and the STORYBOARD.md / SCRIPT.md plan formats. Read before writing composition HTML.
---
# HyperFrames 核心

HyperFrames 从 HTML 渲染视频。合成是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时间安排，其动画运行时可跳转定位，其媒体播放由框架接管。

本技能是**技术契约**——说明如何构建一个 hyperframes 项目。下文正文是构建指南；各主题的详细信息位于 `references/` 中（索引如下），请按需阅读。其他相关事项由同级领域技能负责——`hyperframes-animation`、`hyperframes-creative`、`media-use`、`hyperframes-cli`、`hyperframes-registry`。`/hyperframes` 中的能力图说明了每项技能涵盖的内容。

## 参考资料

| 文件                                 | 阅读它以……                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/minimal-composition.md`  | 从最小的可渲染合成骨架开始                                                                                                                                                         |
| `references/composition-patterns.md` | 选择单体式或模块化结构；组织模块化 `index.html`；选择子合成原型                                                                                                                    |
| `references/data-attributes.md`      | 查阅任意 `data-*`（根元素 / 片段 / 子合成宿主 / 旧版别名）；使用 `class="clip"`                                                                                                    |
| `references/tracks-and-clips.md`     | 选择 `data-track-index`，处理同轨重叠 / z-index，使片段相对于另一片段进行计时                                                                                                      |
| `references/sub-compositions.md`     | 连接子合成（宿主属性、`<template>`、每实例变量）并在其中制作动画                                                                                                                   |
| `references/variables-and-media.md`  | 声明变量；放置 `<video>`/`<audio>`，设置音量、裁剪范围                                                                                                                             |
| `references/determinism-rules.md`    | 构建可跳转定位的时间线；了解确定性禁令、可动画属性白名单、布局 / 文本适配                                                                                                          |
| `references/full-screen-motion.md`   | 使用共享背景制作全画幅动态效果                                                                                                                                                     |
| `references/storyboard-format.md`    | 编写 `STORYBOARD.md` 计划（以及解析后的清单）                                                                                                                                       |
| `references/review-loop.md`          | 在实时看板上执行计划 → 草图 → 构建评审流程——由所有分镜规划工作流共享                                                                                                               |
| `references/production-loop.md`      | 将已批准的计划推进为交付视频——自由形式构建直接遵循的阶段依赖关系（音频、帧、组装、转场、字幕、验证、交付）                                                                         |
| `references/brief-contract.md`       | 简报的基本规则——模式推导（协作式 / 自主式）、共享字段注册表、提问不变量（提问本身位于 `/hyperframes` → 意图层）                                                                    |
| `references/brief-format.md`         | 编写 `BRIEF.md`——由工作流的设置阶段写入、供后续每个步骤读取的已确认意图文档                                                                                                        |
| `references/script-format.md`        | 编写可选的 `SCRIPT.md` 锁定版旁白稿                                                                                                                                                 |
| `references/subagent-dispatch.md`    | 将子代理调度动词（并行扇出 / 后台运行 / 等待）映射到你的执行框架                                                                                                                  |
| `references/frame-worker-core.md`    | 共享的帧工作器角色契约——每个叙事工作流的数据包构建器会将其置于该工作流的 `sub-agents/frame-worker.md` 差异说明之前                                                                |
| `references/tailwind.md`             | 在 Tailwind v4 项目中工作（`init --tailwind`；运行时契约与 Studio 的 v3 不同）                                                                                                     |

有关动画运行时的具体信息（GSAP API、Lottie、Three.js 等），请参阅 `hyperframes-animation` → `adapters/<runtime>.md`。

## 构建合成

### 两种根级形式（不可互换）

- **独立合成**（顶层 `index.html`）——根 `<div data-composition-id="…">` 直接位于 `<body>` 中，**不能使用 `<template>` 包裹器**（包裹后会隐藏所有内容并导致渲染失败）。
- **子合成**（通过 `data-composition-src` 加载）——根元素**必须**包裹在 `<template>` 中。

> ⚠ 传输规则：运行时**只会克隆 `<template>` 的内容**；其外部的所有内容（包括 `<head>` 中的样式/脚本）都会被丢弃——请将 `<style>`/`<script>` 放在模板**内部**。
> ⚠ 宿主 ID 规则：宿主插槽的 `data-composition-id` 必须与内部模板的 `data-composition-id` **完全相同**，同时也必须与 `window.__timelines["<id>"]` 的键**完全相同**——不得添加 `-mount`/`-slot`/`-host` 后缀。

文件结构、宿主连接方式和预渲染检查清单 → `references/sub-compositions.md`。

### 根元素必须设置尺寸（静默布局错误）

独立合成的根元素需要一个显式的**有尺寸盒子**（以 px 设置 `width`/`height`），并且从根元素到任何 `height:100%` 元素之间的每个祖先元素都必须具有可解析的高度——否则 flex/`100%` 子元素会折叠至约 0，导致内容堆叠在左上角。不要仅依赖自动化检查来发现此问题；请检查快照。骨架结构 → `references/minimal-composition.md`。

### 一条暂停的时间线

每个合成都应在页面加载时**同步**构建，并在 `window.__timelines["<id>"]`（键 = 根元素的 `data-composition-id`）中注册**恰好一条** `gsap.timeline({ paused: true })`。渲染时长由根元素的 `data-duration` 决定，而不是由时间线长度决定。不要手动将子时间线嵌套到宿主中。完整约定（包括非 GSAP 运行时）→ `references/determinism-rules.md` + `hyperframes-animation/adapters/`。

### 首轮 lint 的常见陷阱（必然导致首次构建失败）

以下两条规则 `lint` **确实会**捕获，但只能在出错后发现——请从一开始就正确编写：

- **根**合成元素必须带有 `data-start="0"`（与 `data-composition-id`/`data-width`/`data-height` 一同设置）；若省略，`lint` 会报 `root_composition_missing_data_start`。
- 切勿在 CSS 中设置初始 `transform`，同时又使用 GSAP 对**同一**属性进行补间——CSS 值会与补间的起始值发生冲突，`lint` 会以 `gsap_css_transform_conflict` 拒绝通过。应使用 `gsap.fromTo(el, { x: -40 }, { x: 0 })` 在补间内部设置初始状态，而不是使用 CSS `transform: translateX(-40px)`。

### 不可违反的规则（自动化检查可能漏掉的静默错误）

此处列出规则概要；完整原理请参阅链接的参考文档。不得违反：

- 禁止使用渲染时钟、未设种子的 `Math.random`、网络或输入状态；禁止使用 `repeat: -1`（请使用有限次数）。→ `determinism-rules.md`
- 只能对视觉属性允许列表中的属性制作动画；切勿对 `display` 或原始 `visibility` 进行补间。GSAP `autoAlpha` 和时间线边界处的零时长设置是仅有的可见性例外，并且只能用于非剪辑元素或剪辑内部的包裹元素。`.clip` 的可见性只能由框架控制。不要在页面加载时对后续场景的剪辑调用 `gsap.set`。→ `determinism-rules.md`
- 正文文本中禁止使用 `<br>`；应用变换的元素必须为块级元素并设置尺寸；具有脉冲动画的绝对定位装饰元素需要为峰值状态预留空间。→ `determinism-rules.md`
- `<video>`/`<audio>` 可用于**任意嵌套深度**（包括子合成的 `<template>` 或包裹元素内部）；无论媒体位于何处，其播放以及定位/解码都由框架负责。唯一的注意事项在于时间线，而非放置位置：子合成时间线无法为宿主根元素制作动画。→ `variables-and-media.md`
- 每个 `id` 在**组装完成的**页面中都必须唯一；在子合成内部，应使用合成 ID 作为 ID 前缀（`#<id>-hero`）。重复的 `<video>`/`<img>` ID 会渲染为**空白**——生成器通过 `getElementById` 注入帧，而跨文件的重复 ID 无法被 `lint` 检出。→ `composition-patterns.md`
- 全屏场景填充应设置在一个全出血**子元素**上（`position:absolute; inset:0`），切勿设置在合成根元素本身——生成器的帧合成过程可能会丢弃根元素自身的 `background`（帧会渲染为**黑色**），即使预览/`snapshot` 中显示正确。→ `composition-patterns.md`

## 编辑现有合成

- 首先读取文件。保留不相关的时间设置、轨道、ID、变量和媒体路径。
- 与现有的合成 ID 和时间线键保持一致。
- 添加剪辑：选择一个不重叠的 `data-track-index`，或有意调整前后内容的时间设置。
- 任何合成元素上的 `data-hidden` 都会在预览和渲染中将其隐藏，无论其时间窗口如何；此操作是非破坏性且可逆的，可通过 Studio 时间线中的眼睛图标切换。
- 添加子合成：在将其连接到宿主合成之前，先验证其内部 `data-composition-id`。

## 验证

使用 `hyperframes-cli` 查看命令详情

- [ ] `npx hyperframes check` 通过（lint、runtime、layout、motion 和 contrast 均为 0 个发现项）
- [ ] 包含子合成的项目：运行 `npx hyperframes snapshot --at <midpoints>` 并目视检查每一帧
- [ ] 使用 `npx hyperframes preview` 进行审查（用户可以在 Studio 的时间线中编辑任何内容）
- [ ] 仅在用户批准后运行 `npx hyperframes render`