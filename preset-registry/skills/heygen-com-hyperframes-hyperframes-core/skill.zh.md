---
name: hyperframes-core
description: The HyperFrames composition contract — build one renderable project. Use for composition structure, the `data-*` timing attributes, `class="clip"`, tracks, sub-compositions, variables, framework-owned media playback, deterministic-render rules, and validation. Also covers Tailwind projects and the STORYBOARD.md / SCRIPT.md plan formats. Read before writing composition HTML.
---
# HyperFrames 核心

HyperFrames 从 HTML 渲染视频。一个合成是一个 HTML 文件，其 DOM 使用 `data-*` 属性声明时间安排，其动画运行时可进行定位，并且其媒体播放由框架负责。

此 skill 是**技术契约**——说明如何构建一个 hyperframes 项目。下面的正文是构建指南；每个主题的详细信息位于 `references/` 中（索引见下文），按需阅读。其他相关事项位于同级领域 skills——`hyperframes-animation`、`hyperframes-creative`、`media-use`、`hyperframes-cli`、`hyperframes-registry`。`/hyperframes` 中的能力映射说明了各自涵盖的内容。

## 参考资料

| 文件                                    | 阅读它以了解……                                                                                                                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `references/minimal-composition.md`     | 从最小的可渲染合成骨架开始                                                                                                                                                         |
| `references/composition-patterns.md`    | 选择单体式还是模块化；构建模块化的 `index.html`；选择子合成原型                                                                                                                     |
| `references/data-attributes.md`         | 查阅任意 `data-*`（根元素 / 片段 / 子合成宿主 / legacy 别名）；使用 `class="clip"`                                                                                                 |
| `references/tracks-and-clips.md`        | 理解 `data-track-index` 控制什么（以及不控制什么）、z-index，以及相对于另一个片段设置片段时间                                                                                      |
| `references/creator-editing-recipes.md` | 复制真实有效的剪切/修剪/重排/重新定时/定格/摄像机/蒙版/交叉淡化/音频编辑配方及其限制                                                                                                 |
| `references/sub-compositions.md`        | 接入子合成（宿主属性、`<template>`、每个实例的变量），并在其中制作动画                                                                                                             |
| `references/variables-and-media.md`     | 声明变量；放置 `<video>`/`<audio>`，设置音量、修剪                                                                                                                                  |
| `references/determinism-rules.md`       | 构建可定位的时间线；确定性禁用项；布局 / 文本适配                                                                                                                                   |
| `references/full-screen-motion.md`      | 使用共享背景制作全画幅运动                                                                                                                                                          |
| `references/storyboard-format.md`       | 编写 `STORYBOARD.md` 计划（以及解析后的清单）                                                                                                                                      |
| `references/review-loop.md`             | 在实时画板上运行计划 → 草图 → 构建评审迭代——所有故事板规划工作流共用                                                                                                              |
| `references/production-loop.md`         | 将已批准的计划制作成最终交付的视频——阶段依赖项（音频、帧、组装、转场、字幕、验证、交付），自由形式的构建会直接遵循这些阶段                                        |
| `references/brief-contract.md`          | brief 的基本规则——模式推导（协作 / 自主）、共享字段注册表、问题不变量（提问本身位于 `/hyperframes` → 意图层）                                                                     |
| `references/brief-format.md`            | 编写 `BRIEF.md`——由工作流的 Setup 写入、后续每一步读取的已确认意图文档                                                                                                               |
| `references/script-format.md`           | 编写可选的、锁定的旁白 `SCRIPT.md`                                                                                                                                                  |
| `references/subagent-dispatch.md`       | 将子代理调度动词（并行扇出 / 后台运行 / 等待）映射到你的 harness                                                                                                                    |
| `references/frame-worker-core.md`       | 共享的帧工作器角色契约——每个叙事工作流的 packet builder 都会将其添加到该工作流的 `sub-agents/frame-worker.md` 增量内容之前                                  |
| `references/tailwind.md`                | 在 Tailwind v4 项目中工作（`init --tailwind`；运行时契约与 Studio 的 v3 不同）                                                                                                      |

对于动画运行时的具体信息（GSAP API、Lottie、Three.js 等），请参阅 `hyperframes-animation` → `adapters/<runtime>.md`。

## 构建组合

### 两种根形式（不可互换）

- **Standalone**（顶层 `index.html`）：根 `<div data-composition-id="…">` 直接位于 `<body>` 中，**没有 `<template>` 包装器**。包装 standalone 根节点会隐藏所有内容，并且 `lint` 会拒绝它（`standalone_composition_wrapped_in_template`，error）。
- **Sub-composition**（通过 `data-composition-src` 加载）：将根节点包装在 `<template>` 中。这是应当编写的形式：加载器也接受普通的完整文档，并会回退到其 `<body>`，但示例和工具默认使用模板形式。

> ⚠ 传输规则：对于**模板化的** sub-composition，组装器会丢弃文件自身 `<head>` 中的 `<style>`/`<script>`（`packages/core/src/compiler/compositionAssembly.ts` 中的 `hasTemplate` gate），因此请将 `<style>`/`<script>` 放在模板内部。无论采用哪种形式，`<link>` 都会被提升。
> ⚠ Host-id 约定：让 host slot、内部模板以及 `window.__timelines["<id>"]` 键使用**相同的** id。也支持使用不同的本地 id（组装器会回退到文件中的第一个根节点），但这种不匹配不会产生提示，因此除非有理由不这样做，否则请保持一致。

文件结构、host wiring 以及预渲染检查清单 → `references/sub-compositions.md`。

### 根节点必须设置尺寸（隐蔽的布局错误）

Standalone 根节点需要一个明确的**有尺寸盒子**（以 px 为单位的 `width`/`height`），并且一直到某个 `height:100%` 元素为止的每个祖先元素都必须具有已解析的高度——否则 flex/`100%` 子元素会塌缩到接近 0，内容会堆积在左上角。不要仅依赖自动化 gate 来发现这一点；请检查快照。骨架 → `references/minimal-composition.md`。

### 一个暂停的时间轴

每个组合恰好在 `window.__timelines["<id>"]` 注册一个 `gsap.timeline({ paused: true })`（键 = 根节点的 `data-composition-id`）。支持在异步回调（`document.fonts.ready`）中构建它；关键在于**仅在构建完成后**注册。渲染长度是根节点的 `data-duration`，**而不是**时间轴的长度：超出该长度运行的时间轴会被截断，而提前结束的时间轴会保持其最后一帧。省略根节点的 `data-duration` 后，长度会改为推断得出（时间轴、媒体窗口或适配器）。不需要使用 `window.__timelines = window.__timelines || {}`：运行时会在内联脚本运行前创建注册表，并且 `lint` 不再要求这一行。不要手动将 sub-timeline 嵌套到 host 中；运行时会自动嵌套已注册的子时间轴。完整契约（包括非 GSAP 运行时）→ `references/determinism-rules.md` + `hyperframes-animation/adapters/`。

### 首轮 lint 易错点（必然导致首次构建失败）

以下规则 `lint` **确实会**捕获，但只能事后发现。请一开始就正确编写：

- 永远不要将 CSS 初始 `transform` 与 GSAP 对**同一属性**的 tween 配对使用——CSS 值与 tween 的起始值会相互冲突，`lint` 会以 `gsap_css_transform_conflict` 拒绝它。请改为在 tween 内设置初始状态，例如使用 `gsap.fromTo(el, { x: -40 }, { x: 0 })`，而不是使用 CSS `transform: translateX(-40px)`。
- 永远不要在 `<video>`/`<audio>` 上添加 `crossorigin`。`lint` 会无条件以 `media_crossorigin_breaks_preview`（error）拒绝它，包括 canvas/WebGL/WebAudio 读回场景。没有可用的 suppression。
- 永远不要让带有 `data-start` 的 `<video>` 拥有同样带有 `data-start` 的祖先元素。`lint` 会以 `video_nested_in_timed_element`（error）拒绝它。请为 wrapper **或** video 设置时间，而不是两者都设置。
- 每个 `<audio>` 都需要一个 `id`。`lint` 会以 `media_missing_id` 拒绝它，而且没有 id 的 `<audio>` 永远不会被 mixer 采集，因此渲染结果会**没有声音**。

一个 lint **错误**也会关闭布局和对比度审计：此时 `check` 会报告 `0 sample(s)` 和 `0/0 text checks`，看起来像是一个干净的文件，但实际上什么都没有运行。在相信这些数字之前，请先清除 lint 错误。

### 不可妥协的规则（自动化门禁可能无法发现的静默错误）

此处列出；完整的原理说明请参阅链接的参考文档。不得违反：

- 不得使用渲染时钟、未设定种子的 `Math.random`、网络或输入状态；不得使用 `repeat: -1`（请使用有限次数）。→ `determinism-rules.md`
- 永远不要在 clip 元素上 tween `display` 或原始的 `visibility`。框架负责 clip 的可见性，`lint` 会拒绝这种做法。请使用 GSAP `autoAlpha` 或零时长的边界 `set`。（在 clip 元素上 tween 普通视觉属性没有问题；lint 禁止的是接管其可见性。）→ `determinism-rules.md`
- 正文中不得使用 `<br>`；经过变换的元素必须是块级元素并设置尺寸；脉冲式绝对定位装饰元素需要预留峰值间距。→ `determinism-rules.md`
- `<video>`/`<audio>` 通过扁平的文档查询找到，因此框架会在**任意嵌套深度**对它们执行 seek 和解码（包括位于子合成 `<template>` 或 wrapper 内部的媒体）。唯一的硬性限制是：如果 `<video data-start>` 位于另一个同样具有 `data-start` 的**普通**元素内部，`lint` 会报错；该失败确实会导致问题（源帧错误，随后 clip 会在时段中途消失），因此应将时间设置放在 wrapper 或 video 上，不能两者都设置。子合成宿主不受此限制：子合成内部的媒体能够正确渲染。另一个注意事项与时间线有关，而不是位置：子合成时间线无法为宿主根元素设置动画。→ `variables-and-media.md`
- 确保每个 `id` 在**组装后的**页面中保持唯一（为子合成 id 添加组合 id 前缀，例如 `#<id>-hero`），这样你自己的 `#id` CSS 和 `getElementById` 调用才能正确解析。帧注入不再依赖这一点：编译器会为每个 `video[src]`/`audio[src]`/`img[src]` 添加文档唯一的 `data-hf-render-id`。使用 `<source>` 子元素而非 `src` 属性的媒体**不会**被添加该标记，因此此类媒体仍然需要唯一 id。→ `composition-patterns.md`
- 在普通渲染中，将全屏填充放在合成的**根**上没有问题。只有在分层合成路径上（HDR 内容，或使用着色器转场的合成）才会被丢弃；此时引擎会强制每个合成根保持透明，以便下方图层显示出来。如果你的合成使用着色器转场或 HDR 媒体，请将填充放在一个全出血的**子元素**上（`position:absolute; inset:0`）。→ `composition-patterns.md`

## 编辑现有合成

- 先读取文件。保留无关的时间设置、轨道、ID、变量和媒体路径。
- 匹配现有的合成 ID 和时间线键。
- 添加 clip 时：根据其前后相邻的 clip，有意设置其 `data-start`/`data-duration`。`data-track-index` 是 Studio 的显示轨道，而不是时间约束，因此不必空出该值。
- 任意合成元素上的 `data-hidden` 都会在预览和渲染中同时隐藏该元素，并覆盖其时间窗口；这是非破坏性且可逆的操作，可通过 Studio 时间线中的眼睛图标进行切换。
- 添加子合成时：在连接宿主之前，先确认其内部的 `data-composition-id`。

## 验证

使用 `hyperframes-cli` 获取命令详情

- [ ] `npx hyperframes check` 通过（lint、runtime、layout、motion 和 contrast 均无任何发现）
- [ ] 包含子合成的项目：运行 `npx hyperframes snapshot --at <midpoints>` 并逐帧目视检查
- [ ] 运行 `npx hyperframes preview --background` 进行审查（用户可以在 Studio 的时间轴中编辑任何内容，并且服务器会在调用该命令后继续运行）
- [ ] 仅在用户批准后运行 `npx hyperframes render`