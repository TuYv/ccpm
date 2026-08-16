---
name: hyperframes-core
description: The HyperFrames composition contract — build one renderable project. Use for composition structure, the `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback, deterministic-render rules, and validation. Also covers Tailwind projects and the STORYBOARD.md / SCRIPT.md plan formats. Read before writing composition HTML.
---
# HyperFrames 核心

HyperFrames 使用 HTML 渲染视频。合成是一个 HTML 文件，其 DOM 通过 `data-*` 属性声明时间，其动画运行时支持定位，并且媒体播放由框架管理。

此技能是**技术契约**——说明如何构建一个 HyperFrames 项目。下文是构建指南；各主题的详细信息位于 `references/` 中（索引见下文），请按需阅读。其他关注点由同级领域技能负责——`hyperframes-animation`、`hyperframes-creative`、`media-use`、`hyperframes-cli`、`hyperframes-registry`。`/hyperframes` 中的能力映射说明了每项技能涵盖的内容。

## 参考资料

| 文件                                 | 阅读目的…                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/minimal-composition.md`  | 从最小的可渲染合成骨架开始                                                                                                                                                       |
| `references/composition-patterns.md` | 选择单体式或模块化结构；组织模块化 `index.html`；选择子合成原型                                                                                                                  |
| `references/data-attributes.md`      | 查阅任意 `data-*`（根元素 / 剪辑 / 子合成宿主 / 旧版别名）；使用 `class="clip"`                                                                                                  |
| `references/tracks-and-clips.md`     | 选择 `data-track-index`，处理同轨道重叠 / z-index，并设置剪辑相对于另一剪辑的时间                                                                                                |
| `references/sub-compositions.md`     | 接入子合成（宿主属性、`<template>`、各实例变量）并在其中制作动画                                                                                                                 |
| `references/variables-and-media.md`  | 声明变量；放置 `<video>`/`<audio>`，设置音量并裁剪                                                                                                                               |
| `references/determinism-rules.md`    | 构建可定位的时间线；了解确定性禁用规则、可动画属性白名单，以及布局 / 文本适配                                                                                                    |
| `references/full-screen-motion.md`   | 使用共享背景创作全画幅动态效果                                                                                                                                                   |
| `references/storyboard-format.md`    | 编写 `STORYBOARD.md` 计划（以及解析后的清单）                                                                                                                                    |
| `references/review-loop.md`          | 在实时看板上执行计划 → 草图 → 构建的审查流程——供所有故事板规划工作流共享                                                                                                         |
| `references/production-loop.md`      | 将已批准的计划制作成交付视频——自由形式构建直接遵循的阶段依赖关系（音频、帧、组装、转场、字幕、验证、交付）                                                                       |
| `references/brief-contract.md`       | 简报的基本规则——模式推导（协作式 / 自主式）、共享字段注册表、提问不变量（提问本身位于 `/hyperframes` → 意图层）                                                                  |
| `references/brief-format.md`         | 编写 `BRIEF.md`——由工作流的设置阶段写入、并由后续每个步骤读取的已确认意图文档                                                                                                    |
| `references/script-format.md`        | 编写可选的 `SCRIPT.md` 锁定旁白                                                                                                                                                  |
| `references/subagent-dispatch.md`    | 将子代理调度动词（并行扇出 / 后台 / 等待）映射到你的运行框架                                                                                                                     |
| `references/tailwind.md`             | 在 Tailwind v4 项目中工作（`init --tailwind`；运行时契约不同于 Studio 的 v3）                                                                                                    |

有关动画运行时的具体信息（GSAP API、Lottie、Three.js 等），请前往 `hyperframes-animation` → `adapters/<runtime>.md`。

## 构建合成

### 两种根结构（不可互换）

- **独立合成**（顶层 `index.html`）——根 `<div data-composition-id="…">` 直接位于 `<body>` 中，**不使用 `<template>` 包装器**（用它包装会隐藏所有内容并导致渲染失败）。
- **子合成**（通过 `data-composition-src` 加载）——根元素**必须**包装在 `<template>` 中。

> ⚠ 传输规则：运行时**只会克隆 `<template>` 的内容**；其外部的所有内容（包括 `<head>` 中的样式/脚本）都会被丢弃——请将 `<style>`/`<script>` 放在模板**内部**。
> ⚠ 宿主 ID 规则：宿主插槽的 `data-composition-id` 必须与内部模板的 `data-composition-id` **以及** `window.__timelines["<id>"]` 键**完全一致**——不得添加 `-mount`/`-slot`/`-host` 后缀。

文件结构、宿主连接方式和预渲染检查清单 → `references/sub-compositions.md`。

### 根元素必须具有尺寸（无提示的布局错误）

独立合成的根元素需要一个显式的**有尺寸盒子**（以 px 设置 `width`/`height`），而且从根元素到使用 `height:100%` 的元素之间，每一层祖先元素都必须具有已解析的高度——否则 flex/`100%` 子元素会塌缩到接近 0，内容将堆积在左上角。不要只依赖自动化门禁来捕获此问题；请检查快照。骨架示例 → `references/minimal-composition.md`。

### 一条暂停的时间线

每个合成都在 `window.__timelines["<id>"]`（键 = 根元素的 `data-composition-id`）中注册**恰好一条** `gsap.timeline({ paused: true })`，并在页面加载时**同步**构建。渲染时长 = 根元素的 `data-duration`，而不是时间线长度。不要手动将子时间线嵌套进宿主。完整约定（包括非 GSAP 运行时）→ `references/determinism-rules.md` + `hyperframes-animation/adapters/`。

### 不可违反的规则（自动化门禁可能漏掉的无提示错误）

此处列出要点；完整原理请参阅链接的参考文档。请勿违反：

- 不得使用渲染时钟、未设种子的 `Math.random`、网络或输入状态；不得使用 `repeat: -1`（请使用有限次数）。→ `determinism-rules.md`
- 只能对视觉属性白名单中的属性进行动画处理；绝不能对 `display` 或原始 `visibility` 进行补间。GSAP `autoAlpha` 和时间线边界处的零时长设置是仅有的可见性例外，并且只能用于非剪辑元素或剪辑内部的包装器。`.clip` 的可见性仅由框架控制。不要在页面加载时使用 `gsap.set` 设置后续场景的剪辑。→ `determinism-rules.md`
- 正文文本中不得使用 `<br>`；应用变换的元素必须为块级元素且具有明确尺寸；采用脉冲动画的绝对定位装饰元素需要为峰值状态预留空间。→ `determinism-rules.md`
- `<video>`/`<audio>` 必须是宿主根元素的**直接子元素**（绝不能放在子合成的 `<template>`/包装器内部）；播放由框架控制。→ `variables-and-media.md`
- 每个 `id` 在**组装后的**页面中都必须唯一；在子合成内部，请为 ID 添加合成 ID 前缀（`#<id>-hero`）。重复的 `<video>`/`<img>` ID 会渲染为**空白**——生产器通过 `getElementById` 注入帧，而跨文件重复项可能避开 `lint` 检查。→ `composition-patterns.md`
- 全屏场景填充应放在铺满全屏的**子元素**上（`position:absolute; inset:0`），绝不能放在合成根元素本身——即使预览/`snapshot` 中显示正确，生产器的帧合成过程也可能丢弃根元素自身的 `background`（导致帧渲染为**黑色**）。→ `composition-patterns.md`

## 编辑现有合成

- 首先读取文件。保留无关的时间设置、轨道、ID、变量和媒体路径。
- 与现有合成 ID 和时间轴键保持一致。
- 添加剪辑：选择一个不重叠的 `data-track-index`，或有意调整前后内容的时间设置。
- 任何合成元素上的 `data-hidden` 都会在预览和渲染中将其隐藏，并覆盖其时间窗口；此操作是非破坏性且可逆的，可通过 Studio 时间轴中的眼睛图标切换。
- 添加子合成：在连接到宿主合成之前，验证其内部的 `data-composition-id`。

## 验证

使用 `hyperframes-cli` 查看命令详情

- [ ] `npx hyperframes check` 通过（lint、runtime、layout、motion 和 contrast 均为 0 个问题）
- [ ] 包含子合成的项目：运行 `npx hyperframes snapshot --at <midpoints>` 并目视检查每一帧
- [ ] 运行 `npx hyperframes preview` 以供审查（用户可以在 Studio 的时间轴中编辑任何内容）
- [ ] 仅在用户批准后运行 `npx hyperframes render`