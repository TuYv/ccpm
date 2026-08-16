---
name: impeccable
description: Use when the user wants to design, redesign, shape, critique, audit, polish, clarify, distill, harden, optimize, adapt, animate, colorize, extract, or otherwise improve a frontend interface. Covers websites, landing pages, dashboards, product UI, app shells, components, forms, settings, onboarding, and empty states. Handles UX review, visual hierarchy, information architecture, cognitive load, accessibility, performance, responsive behavior, theming, anti-patterns, typography, fonts, spacing, layout, alignment, color, motion, micro-interactions, UX copy, error states, edge cases, i18n, and reusable design systems or tokens. Also use for bland designs that need to become bolder or more delightful, loud designs that should become quieter, live browser iteration on UI elements, or ambitious visual effects that should feel technically extraordinary. Not for backend-only or non-UI tasks.
version: 3.9.1
user-invocable: true
argument-hint: "[craft|shape · audit|critique · animate|bolder|colorize|delight|layout|overdrive|quieter|typeset · adapt|clarify|distill · harden|onboard|optimize|polish · init|document|extract|live] [target]"
license: Apache 2.0
allowed-tools:
  - Bash(npx impeccable *)
  - Bash(node .claude/skills/impeccable/scripts/*)
---
设计并迭代生产级前端界面。提供真正可运行的代码、明确的设计决策与卓越的工艺水准。

## 设置

在继续之前，你必须完成以下步骤：

1. 每个会话运行一次 `node .claude/skills/impeccable/scripts/context.mjs`；如果运行时显示了此 Skill 加载后的基础目录，则改为运行 `node <skill-base-dir>/scripts/context.mjs`。将 cwd/workdir 保持在用户的项目目录中，而不是 Skill 目录中。如果请求指明或暗示了 monorepo 中的某个文件、路由或应用，请推断出具体路径，并在同一命令后附加 `--target <path>`。如果你已经在本次对话中看过它的输出，请勿再次运行。该脚本要么以 Markdown 块的形式输出项目的 PRODUCT.md（以及存在时的 DESIGN.md），要么告知你该文件缺失。遵循其输出的所有指示。**如果它报告 `NO_PRODUCT_MD`：**当用户调用了 `init`、`teach`、`craft` 或 `shape`，或者其措辞明显对应其中某种从零开始的构建流程时（例如：“构建/创建/制作一个落地页”“设计一个新应用”或“塑造一项功能”），应先转入 `reference/init.md`。获取产品上下文正是这些流程的目的。对于任何其他命令，或针对现有代码的限定范围评估 / 优化 / 增强 / 修复 / 迭代请求，**不要**转入 init。现有代码就是上下文：继续执行请求的命令，根据当前聚焦的界面推断设计语域（第 4 步），并仅建议用户之后可选择运行一次 `/impeccable init`。缺少 PRODUCT.md 绝不能阻碍限定范围的请求。如果输出末尾包含 `UPDATE_AVAILABLE` 指令，请遵循该指令（询问用户一次是否更新，然后继续）。它绝不会阻碍当前任务。
2. 如果用户调用了子命令（`craft`、`shape`、`audit`、`polish`……），接下来你必须阅读该命令的参考文档：**`reference/<command>.md`；当项目平台为原生平台时（依据 `context.mjs` 指令，为 `ios` / `android` / `adaptive`），则阅读命令表中对应的原生变体**（例如 `reference/audit.native.md`）。只读取一个文件，不要两个都读。此步骤不可省略。参考文档定义了该命令的流程；不阅读它，你将遗漏用户期望的步骤。
3. 熟悉代码中所有现有的设计系统、约定和组件。至少阅读一个项目文件（CSS / tokens / theme / 一个有代表性的组件或页面）。**即使你已在第 2 步加载了子命令参考文档，此步骤仍为必需。**不要重复造轮子；现有方案有效时就沿用，只有在能改善用户体验时才另辟路径。
4. 阅读与之匹配的设计语域参考文档。**此步骤不可省略；跳过它会产生千篇一律的输出。**如果项目属于营销、落地页、推广活动、长篇内容或作品集（设计本身就是产品），请阅读 `reference/brand.md`。如果属于应用界面、后台、仪表盘或工具（设计服务于产品），请阅读 `reference/product.md`。按最先匹配的依据选择：(1) 任务线索（“落地页”与“仪表盘”）；(2) 当前聚焦的界面（正在处理的页面、文件或路由）；(3) PRODUCT.md 中的 `register` 字段。
5. **如果 PRODUCT.md 的 `## Platform` 为 `ios` 或 `android`**，还需阅读 `reference/<platform>.md`（HIG / Material 3 规范）。`adaptive`（跨平台，同时在两个平台发布）需同时阅读这两个文件。对于 `web`、缺失或无法识别的平台，无需额外阅读任何文件。适用时，`context.mjs` 会输出相应指令。
6. **如果项目是全新的（第 3 步中未发现现有的 CSS tokens / theme / 已确定的品牌色）**，请运行 `node .claude/skills/impeccable/scripts/palette.mjs`，以获取品牌种子色和构图指导。它是主品牌色的基准。按照脚本的指示，围绕它构建调色板的其余部分（bg、surface、ink、accent、muted）。全程使用 OKLCH。**只有当第 3 步在现有 tokens 中发现已确定的品牌色时才跳过此步骤；在这种情况下，应优先保持品牌识别的一致性。**

## 设计指导

交付可直接发布、生产级别的代码，而不是原型或起点。除非用户明确要求，否则不要走捷径（如有疑问，请询问）。在实现完整方案之前不要停下（美观、响应迅速、性能出色、精准无误、没有缺陷且符合品牌调性）。你应当高度重视细节：使用一切可用工具（浏览器截图、计算机操作等），对制作的每个页面、区块或组件进行实战检验。Claude 能够完成非凡的工作。不要有所保留。

### 通用规则

#### 颜色

- **验证对比度。** 正文文本与背景之间的对比度必须达到 ≥4.5:1；大号文本（≥18px 或加粗且 ≥14px）需要达到 ≥3:1。占位文本同样需要达到 4.5:1，不能使用默认的柔和灰色。最常见的问题是：在带有色调的近白色背景上使用柔和的灰色正文。如果对比度哪怕只是接近临界值，也要将正文颜色向色阶的深色端调整；为了“优雅”而使用浅灰色，是 AI 设计让人感觉难以阅读的首要原因。
- 彩色背景上的灰色文本会显得黯淡。应使用背景自身色相的更深色阶，或使用文本颜色的半透明版本。

#### 字体排印

- 将正文行长限制在 65–75ch。
- 不要搭配相似但不完全相同的字体（两种几何无衬线字体、两种人文主义无衬线字体）。应沿对比维度进行搭配（衬线体 + 无衬线体、几何风格 + 人文主义风格），或使用同一字体家族的不同字重。
- 首屏 / 展示标题的上限：clamp() 的最大值 ≤ 6rem（约 96px）。超过这个尺寸，页面就不是在设计，而是在叫喊。
- 展示标题的字间距下限：≥ -0.04em。再紧凑就会导致字母相互接触；这会显得拥挤，而不是“经过设计”。
- 在 h1–h3 上使用 `text-wrap: balance`，使各行长度均衡；在较长的正文中使用 `text-wrap: pretty`，以减少孤行。

#### 布局

- 通过变化间距来营造节奏。
- 卡片是一种偷懒的答案。只有当卡片确实是最佳交互表达方式时才使用。嵌套卡片永远是错误的。
- 一维布局使用 Flexbox，二维布局使用 Grid。当 `flex-wrap` 更简单时，不要默认使用 Grid。
- 对于无需断点的响应式网格，使用 `repeat(auto-fit, minmax(280px, 1fr))`。
- 构建语义化的 z-index 层级（dropdown → sticky → modal-backdrop → modal → toast → tooltip）。绝不要使用 999 或 9999 之类的任意值。

#### 动效
- 动效应当有明确意图，而不是事后补充。应将其视为构建过程的一部分。
- 除非确实有必要，否则不要为 CSS 布局属性添加动画。
- 使用指数曲线缓出（ease-out-quart / quint / expo）。不要使用弹跳或弹性效果。
- 对于更高级的动效需求，使用相关库（例如 motion、gsap、anime.js、lenis 等）
- 减少动态效果不是可选项。每个动画都需要提供 `@media (prefers-reduced-motion: reduce)` 替代方案：通常是交叉淡化或即时过渡。
- 对一个列表中的项目进行错峰动画是合理的。真正暴露问题的是机械化的统一反应（对每个区块应用完全相同的入场效果），而不是动效本身；每种显现效果都应与其呈现的内容相匹配。抑制这种机械化反应，绝不是发布一个完全没有动效的页面的理由。
- 显现动画必须增强默认情况下已可见的内容。不要将内容可见性依赖于由类触发的过渡效果；过渡在隐藏标签页和无头渲染器中会暂停，因此显现效果永远不会触发，最终发布的区块会一片空白。
- 高级动效材质不应只有 transform/opacity。当模糊、backdrop-filter、clip-path、mask 以及阴影/辉光能够实质性提升效果并保持流畅时，它们也应成为动效设计语言的一部分。

#### 交互

- 在设置了 `overflow: hidden` 或 `overflow: auto` 的容器内，使用 `position: absolute` 渲染的下拉菜单会被裁剪。请使用原生 `<dialog>` / popover API、`position: fixed` 或 portal 来脱离该层叠上下文。

### 仅限新项目（不存在既有工作时）

#### 颜色与主题

- 使用 OKLCH。
- **奶油色 / 沙色 / 米色的页面主体背景，是 2026 年已经泛滥的 AI 默认选择。** 整个暖中性色带（OKLCH L 0.84-0.97、C < 0.06、色相 40-100），无论你如何称呼，给人的感觉都是奶油色、沙色、纸张色或羊皮纸色。像 `--paper`、`--cream`、`--sand`、`--bone`、`--flour`、`--linen`、`--parchment`、`--wheat`、`--biscuit`、`--ivory` 这样的 token 名称，本身就是暴露这一倾向的信号。如果需求是“温暖、传统、家庭式海岸意大利风”，或“杂志式温暖”，或“编辑式克制”，**不要**将其转化为带暖色调的近白色背景；这是典型的 AI 做法。请选择：(a) 使用饱和的品牌色作为页面主体颜色（赤陶色、牛血红、深赭色、近黑色）；(b) 使用色度为 0 的真正灰白色（或者让色度偏向品牌自身的色相，而不是默认偏暖）；或 (c) 使用带色调、较深的中间调中性色，并且明确体现品牌自身的色彩特征。品牌的“温暖感”应由强调色 + 字体排印 + 图像来承载，而不是由页面主体背景来承载。
- 带色调的中性色：朝品牌色相方向增加 0.005–0.015 的色度。不要仅仅“因为品牌给人某种感觉”就默认偏向暖色或冷色；那正是造成跨项目千篇一律的做法。
- 选择主题时：深色与浅色都绝不是默认选项。不要“因为工具用深色看起来很酷”就选择深色。也不要“为了稳妥”就选择浅色。在选择之前，先写一句对实际场景的描述：谁在使用它、在哪里使用、处于怎样的环境光线下、带着怎样的情绪。如果这句话无法决定答案，就说明它还不够具体。继续补充细节，直到它能决定答案为止。
- 先选择一种**颜色策略**，再选择具体颜色。以下是投入程度轴上的四个层级：
  - **克制**：带色调的中性色 + 一种占比 ≤10% 的强调色。适合作为产品默认方案；体现品牌极简主义。
  - **鲜明**：一种饱和色覆盖 30–60% 的界面。适合作为强调身份识别的页面的品牌默认方案。
  - **完整配色**：设置 3–4 个有明确名称的颜色角色，并有意识地使用每一种颜色。适用于品牌活动；产品数据可视化。
  - **全色浸染**：界面本身就是颜色。适用于品牌首屏主视觉、活动页面。

### 绝对禁用

匹配即拒绝。如果你正准备写出以下任何一种设计，请使用不同的结构重写该元素。

- **侧边条纹边框。** 在卡片、列表项、提示框或警告框上，使用大于 1px 的 `border-left` 或 `border-right` 作为彩色强调。绝不要有意采用这种设计。改用完整边框、背景色调、前置数字/图标，或者什么都不加。
- **渐变文字。** 将 `background-clip: text` 与渐变背景结合使用。它只有装饰作用，从不传递实际含义。请使用单一纯色。通过字重或字号来强调。
- **默认使用玻璃拟态。** 将模糊效果和玻璃卡片用于装饰。只能少量且有明确目的地使用，否则就完全不用。
- **首屏核心指标模板。** 大数字、小标签、辅助统计数据、渐变强调。典型的 SaaS 陈词滥调。
- **完全相同的卡片网格。** 不断重复由图标 + 标题 + 文本组成的同尺寸卡片。
- **每个区块上方都有微型大写字母且增加字间距的眉题。** 这种 2023 年风格的引导标签（位于每个标题上方、使用小号全大写文字和较宽字间距的“ABOUT”“PROCESS”“PRICING”）如今已成为泛滥的 AI 脚手架；无论需求是什么，它都会出现在 55-95% 的生成结果中，这正是暴露 AI 痕迹的定义。将一个有明确名称的引导标签作为精心设计的品牌系统，是一种品牌语言；在每个区块上方都放眉题，则是 AI 语法。请选择不同的节奏。
- **默认使用编号式区块标记作为脚手架（01 / 02 / 03）。** 在每个区块上方放置 `01 · About / 02 · Process / 03 · Pricing`，是比眉题套路更深一层的做法：仅仅因为“着陆页都这么做”就使用它，说明你是在条件反射式地搭建脚手架。只有当区块本身确实构成一个序列（真实的三步流程、有序的操作流、明确分类的时间线），并且其顺序承载了读者所需的信息时，编号才有存在的价值。在一个页面上使用一组经过深思熟虑的编号序列，是一种品牌语言；在整个网站的每个区块上方都使用编号眉题，则是 AI 语法。
- **文字溢出容器。** 较长的标题单词 + 较大的 clamp 缩放范围 + 狭窄的网格，会导致标题在平板电脑/移动设备上溢出。请在每个断点测试标题文案；如果发生溢出，请减小 clamp 的最大值或重写文案。视口是设计的一部分。

### AI 粗制滥造测试

如果有人看着这个界面，能够毫不怀疑地说出“这是 AI 做的”，那它就失败了。跨语域的失败情形属于上述绝对禁区。特定语域的失败情形则列在各自的参考文档中。

**类别反射检查。** 从两个层次进行检查；第二个层次能捕捉第一个层次遗漏的问题。

- **一阶：** 如果有人仅凭类别就能猜出主题和配色方案，这就是训练数据引发的第一层反射。重新调整场景描述和色彩策略，直到无法再从领域明显推断出答案。
- **二阶：** 如果有人能根据类别加反例参考猜出美学类型（“不是奶油色 SaaS 风的 AI 工作流工具 → 编辑排版风”“不是海军蓝配金色的金融科技产品 → 终端原生深色模式”），这就是更深一层的陷阱。第一层反射避开了，第二层却没有。继续返工，直到两个答案都无法被明显猜出。品牌语域的[反射性拒用美学路线](reference/brand.md)列表涵盖了当前已过度饱和的类型。

## 命令

| 命令 | 类别 | 描述 | 参考 |
|---|---|---|---|
| `craft [feature]` | 构建 | 先塑造方案，再端到端构建功能 | [reference/craft.md](reference/craft.md) |
| `shape [feature]` | 构建 | 在编写代码之前规划 UX/UI | [reference/shape.md](reference/shape.md) |
| `init` | 构建 | 设置项目上下文：PRODUCT.md、DESIGN.md、实时配置和后续步骤 | [reference/init.md](reference/init.md) |
| `document` | 构建 | 根据现有项目代码生成 DESIGN.md | [reference/document.md](reference/document.md) |
| `extract [target]` | 构建 | 将可复用的令牌和组件提取到设计系统中 | [reference/extract.md](reference/extract.md) |
| `critique [target]` | 评估 | 使用启发式评分进行 UX 设计审查 | [reference/critique.md](reference/critique.md) |
| `audit [target]` | 评估 | 技术质量检查（无障碍、性能、响应式） | [reference/audit.md](reference/audit.md) · 原生：[reference/audit.native.md](reference/audit.native.md) |
| `polish [target]` | 优化 | 发布前的最终质量打磨 | [reference/polish.md](reference/polish.md) |
| `bolder [target]` | 优化 | 强化过于保守或平淡的设计 | [reference/bolder.md](reference/bolder.md) |
| `quieter [target]` | 优化 | 弱化过于激进或刺激过度的设计 | [reference/quieter.md](reference/quieter.md) |
| `distill [target]` | 优化 | 提炼至本质，移除复杂性 | [reference/distill.md](reference/distill.md) |
| `harden [target]` | 优化 | 达到生产就绪：错误处理、国际化、边界情况 | [reference/harden.md](reference/harden.md) |
| `onboard [target]` | 优化 | 设计首次使用流程、空状态和激活体验 | [reference/onboard.md](reference/onboard.md) |
| `animate [target]` | 增强 | 添加有明确目的的动画和动效 | [reference/animate.md](reference/animate.md) |
| `colorize [target]` | 增强 | 为单色 UI 有策略地添加色彩 | [reference/colorize.md](reference/colorize.md) |
| `typeset [target]` | 增强 | 改进字体排印层级和字体 | [reference/typeset.md](reference/typeset.md) |
| `layout [target]` | 增强 | 修正间距、节奏和视觉层级 | [reference/layout.md](reference/layout.md) |
| `delight [target]` | 增强 | 增添个性和令人难忘的细节 | [reference/delight.md](reference/delight.md) |
| `overdrive [target]` | 增强 | 突破常规限制 | [reference/overdrive.md](reference/overdrive.md) |
| `clarify [target]` | 修复 | 改进 UX 文案、标签和错误消息 | [reference/clarify.md](reference/clarify.md) |
| `adapt [target]` | 修复 | 适配不同设备和屏幕尺寸 | [reference/adapt.md](reference/adapt.md) · 原生：[reference/adapt.native.md](reference/adapt.native.md) |
| `optimize [target]` | 修复 | 诊断并修复 UI 性能问题 | [reference/optimize.md](reference/optimize.md) |
| `live` | 迭代 | 可视化变体模式：在浏览器中选择元素并生成替代方案 | [reference/live.md](reference/live.md) |

以及三个管理命令：`pin <command>`、`unpin <command>` 和 `hooks <on|off|status|...>`，详见下文。

### 路由规则

1. **无参数**：用户是在询问“我应该做什么？”应根据上下文动态生成菜单，而不是使用静态菜单。Setup 已经运行过 `context.mjs`；如果它报告了 `NO_PRODUCT_MD`，说明项目尚未捕获任何上下文，因此应将 `/impeccable init` 作为菜单首要推荐项（用一行说明原因），同时仍在下方显示其余菜单；不要直接静默进入 init。否则，运行一次 `node .claude/skills/impeccable/scripts/context-signals.mjs` 并读取其 JSON，然后优先给出**最有价值的 2-3 个后续命令**，每个命令附上一行从信号中得出的原因，之后再显示完整菜单（上表，按类别分组）。**绝不要自动运行命令；推荐只是建议，需要用户确认。**

   应综合分析这些信号；没有必须遵循的分数：
   - `setup.hasDesign` 为 false，而 `setup.hasCode` 为 true → `document`（捕获视觉系统）。
   - `critique.latest` 为 `null` → 项目从未经过评审；对于已经设置好且有实际界面的项目，推荐 `/impeccable critique <surface>` 是一个很好的默认选择。
   - `critique.latest` 的 `score` 较低，或 `p0` / `p1` 非零 → `polish`（它会将该快照作为待办列表读取）；如果快照看起来已经过时，则重新运行 `critique`。
   - `git.changedFiles` 指向单个界面 → 将 `audit` 或 `polish` 的范围明确限定到这些文件，并点名列出它们。
   - `devServer.running` 为 true → 可以使用 `live` 在浏览器中进行迭代；如果为 false，不要优先推荐 `live`。**`live` 和内置的 `detect.mjs` 仅适用于 Web。**如果 `setup.platform` 是 `ios`、`android` 或 `adaptive`，不要优先推荐其中任何一个；浏览器覆盖层和 HTML 规则引擎不适用于原生应用代码。
   - 其他情况下，应完全按照 init 的“Recommend starting points”步骤按意图分组（构建新内容 / 改进现有内容 / 进行可视化迭代），并根据 `setup.register` 进行调整。

   **如果 `scan.targets` 非空，且 `setup.platform` 不是 `ios`/`android`/`adaptive`，则运行一次 `node .claude/skills/impeccable/scripts/detect.mjs --json <scan.targets joined by spaces>`**（这是针对本地文件的内置检测器：不使用网络、不使用 npx；它读取 HTML/CSS，因此原生项目应跳过）。`scan.via` 会说明这些目标的来源：`git-changes`（工作区未提交变更中的标记/样式文件，也是最相关的集合）、`source-dir`（例如 `src`、`app`）、`html` 或 `root`。将检测结果纳入推荐：如果存在大量质量/对比度问题 → `audit` 或 `polish`；如果存在特定类型的粗糙设计 → 使用对应命令（渐变文字或眉题 → `quieter` / `typeset`，扁平或灰暗的调色板 → `colorize`，依此类推）。这是一个真实的当前信号，比猜测更可靠。如果 detect 出错，或文件树规模大、运行缓慢，则跳过它，并建议用户自行运行 `audit`；绝不要因为它而阻塞推荐。

   推荐应控制在 2-3 个明确选项，并给出需要输入的确切命令。菜单仍作为备用选项；推荐内容应置于开头。
2. **第一个单词与某个命令匹配**（上表中的命令或 `pin` / `unpin` / `hooks`）：加载其参考文件（在原生平台上，加载表中对应的原生变体；遵循 Setup 第 2 步的单文件规则），并按照其中的说明操作。命令名称之后的所有内容均为目标。
3. **第一个单词不匹配，但意图明确对应某个命令**（例如，“修复间距”→ `layout`，“重写这条错误消息”→ `clarify`，“颜色看起来很平淡”→ `colorize`）：加载该命令的参考文件（同样遵循原生变体规则），并按该命令已被调用来继续处理。如果可能对应两个命令，只询问一次用户选择哪一个。
4. **没有明确匹配的命令**：视为常规设计调用。应用 setup 步骤、General 规则和已加载的 register 参考文件，并将完整参数作为上下文。

届时，设置（上下文收集、注册）已经加载；子命令不会重新调用 `/impeccable`。

如果第一个单词是 `craft` 或 `shape`，或者路由规则 3 明确将用户意图映射到其中任一命令，仍会先运行设置流程，但后续流程由对应的参考文档（[reference/craft.md](reference/craft.md) 或 [reference/shape.md](reference/shape.md)）负责。两者都是从零开始的构建流程：如果设置流程将调用 `init` 作为阻塞项，请先完成初始化、刷新上下文，然后继续执行原始命令和目标。

`teach` 是 `init` 的弃用别名：如果用户输入该命令，请加载 [reference/init.md](reference/init.md)，并按用户运行了 `init` 的方式继续执行。

## 固定 / 取消固定

**固定**会创建一个独立快捷方式，使 `/<command>` 直接调用 `/impeccable <command>`。**取消固定**会将其移除。该脚本会写入项目中存在的每个工具目录。

```bash
node .claude/skills/impeccable/scripts/pin.mjs <pin|unpin> <command>
```

有效的 `<command>` 可以是上表中的任意命令。请简洁报告脚本的执行结果。成功时确认新快捷方式，出错时逐字转达 stderr。

## 钩子

`/impeccable hooks <on|off|status|ignore-rule|ignore-file|ignore-value|reset>` 用于管理此项目的设计检测器钩子。直接编辑 UI 文件后，该钩子会自动运行检测器，并以系统提醒的形式显示检测结果。完整流程见 [reference/hooks.md](reference/hooks.md)；当用户使用任意参数调用 `/impeccable hooks` 时，请加载该文档。