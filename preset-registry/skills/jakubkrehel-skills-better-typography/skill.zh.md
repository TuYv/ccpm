---
name: better-typography
description: Web typography. Use when picking or pairing typefaces, setting up a type scale, or styling and truncating text in components. Triggers on typography, font loading, woff2, variable fonts, opentype features, type scale, heading hierarchy, line-height, letter-spacing, measure, text-wrap, truncation, tabular numbers, underlines, text selection, iOS input zoom, font smoothing, smart punctuation, text-box, drop cap.
---
# 排版

排版主要在于克制：合理的比例、舒适的间距、足够的对比度。标签、表格单元格、营销标题和文章段落并不共用同一套规则。

审查时，请阅读渲染后的页面，而不是扫描代码。不良换行、孤行和截断只会在真实内容长度下显现。

在项目的样式系统中编写每一项修复，并使用以下精确值，而非看起来相似的常用等价值。[速查表](css-cheat-sheet.md)将每个声明映射到对应的 Tailwind 写法。

文字内容本身属于 `better-writing`。语义化标题结构属于 `better-accessibility`。空间 RTL 布局和逻辑属性属于 `better-layout`。对比度测量属于 `better-colors`。本技能负责文本在混合方向内容中的渲染、换行和行为。

## 提供正确的格式

在 Web 上使用 `.woff2`，以获得 Brotli 压缩和广泛支持。`.woff` 是面向非常旧浏览器的回退格式。`.ttf` 和 `.otf` 是不带 Web 压缩的桌面格式。文件如何加载由项目决定。

## 属性优先于原始标签

当存在 CSS 属性时，请使用它。使用 `font-weight: 650`，而不是 `font-variation-settings: "wght" 650`。使用 `font-optical-sizing: auto`，而不是 `"opsz"`。使用 `font-variant-numeric: tabular-nums`，而不是 `font-feature-settings: "tnum" 1`。

当渲染非可变字体回退时，属性仍然有效。仅将原始标签留给自定义轴（`"GRAD" 80`）以及没有专属属性的小众功能（`"ss01" 1`）。轴和功能标签列于 [variable-fonts-and-opentype.md](variable-fonts-and-opentype.md)。

## 加载预期的字重和样式

浏览器会合成当前字体家族未提供的字重或样式，从而扭曲真实字形。加载设计所使用的字形。

`font-synthesis: none` 会关闭合成，但它会抹去强调效果，而非报告它。只有在检查过回退字体栈中所有必需的粗体、斜体、小型大写字母、上标和下标形式均保持清晰可区分之后，才设置它。

## 减少字体、字号和字重

很少需要使用超过三种字体。字重和字号决定层级；过度使用它们会很快损害可读性。应为对比而搭配，而不是为相似而搭配：衬线标题搭配无衬线正文会显得有意为之，两种近乎相同的无衬线字体则会显得像个错误。

低于 `18px` 时，保持使用 `400` 或更重的字重。低于 `300` 的字重仅适用于 `28px`+ 的展示文本；在正文尺寸下会难以辨识。搭配指南见 [choosing-fonts.md](choosing-fonts.md)。

## 使用具有语义名称的字号比例

定义一小组字号，并尽可能少地偏离它。没有系统支撑的硬编码字号会在规模扩大时失效。

当使用规则明确时，像 `text-sm` 这样的独立默认名称没有问题。在团队中，应按用途命名字号（`text-body-sm`），以便规则在其他人参与时仍能延续。比例构建详见 [spacing-and-sizing.md](spacing-and-sizing.md)。

## 标题字号随层级递减

将标题级别映射到字号比例中递减的步骤，使视觉上从属的标题绝不会压过其父级标题。在比例较小的一端，相邻级别可以共享同一字号，只要字重或间距仍能让它们保持区分。语义元素属于 `better-accessibility`；本技能只设定视觉处理。

## 按角色设置行高

标题更紧凑，约为 `1.1`。正文文本为 `1.5` 到 `1.6`。优先使用无单位的值，使行高随字体大小缩放；固定的 `24px` 则不会。

紧凑行高适用于短文本。任何换行至三行或更多行的内容，即使位于高度受限的行中，也需要至少 `1.4`。

## 按字号设置字间距

大标题通常使用略微负值的字间距会显得更好。小号大写标签需要略微正值的字间距，否则字母会显得拥挤。适合阅读的字号的正文文本两者都不需要。

## 限制行宽

过长的行会让眼睛难以找到下一行。将长文本限制在每行约 60–75 个字符。任何单位都可以，只要存在上限且行长处于该范围内。参见[单位选择及其像素等值](wrapping-and-punctuation.md#measure-line-length)。

## 有意识地换行

四条声明，四项职责：

- `text-wrap: balance` 让文本均匀分布在各行中。用于标题。
- `text-wrap: pretty` 防止单个短词落在最后一行。用于描述。
- `overflow-wrap: break-word` 用于长单词、链接或 ID 可能溢出容器的场景。
- `white-space: nowrap` 用于换行看起来会损坏效果的标签和徽章。

在长文本中跳过 `balance` 和 `pretty`。

## 对变化中的值使用等宽数字

数字默认具有不同宽度，因此计时器、计数器和价格在更新时会导致布局移动。对任何会变化的值应用 `font-variant-numeric: tabular-nums`。

## 截断但不丢失内容

对于单行，使用 `text-overflow: ellipsis`，并配合 `overflow: hidden` 和 `white-space: nowrap`。对于多行，使用 `line-clamp`。截断会隐藏内容。当缺失的文本很重要时，应让完整值能通过工具提示或展开视图访问。

## 自然地编写文案，用 CSS 设置样式

以自然大小写存储文本，并使用 `text-transform` 控制展示形式，这样重新设计时就无需重写文案。

在渲染的文本中使用智能标点：

- 正文使用弯引号，代码使用直引号。
- 范围使用短横线：`2010–2020`。
- 使用单个省略号字符，而非三个句点。
- 使用 `&nbsp;` 让 `16 px` 在线行换行时保持在一起。
- 使用 `&shy;` 指定长单词可在何处断开。

## 使用字体提供的下划线

默认下划线会出现在浏览器决定的位置。使用 `text-underline-position: from-font` 和 `text-decoration-thickness: from-font` 从字体自身的度量信息中获取位置和粗细。使用 `text-decoration-thickness`、`text-underline-offset` 和 `text-decoration-skip-ink` 手动微调。

`text-decoration-style` 将线条绘制为点状、虚线或波浪线。点状下划线通常用于提示某个词带有额外信息，例如缩写或已定义术语。

真实下划线中，只有颜色部分能够可靠地进行动画。因此，除非唯一动画效果是颜色，否则应将下划线构建为独立元素，而不是使用 `text-decoration`。

## 移动端输入框使用 16px

当输入框中的文本小于 `16px` 时，iOS Safari 会缩放整个页面。有两种修复方式都能将大小保持在 `16px`，但视觉效果不同，因此应询问设计需要哪一种：

- 在移动端增大输入框尺寸（`text-base sm:text-sm`）。这会改变它在小屏幕上的外观。
- 保持 `font-size: 16px`，并通过 `transform: scale()` 渲染目标尺寸，同时补偿宽度和 `line-height`。每个视口下都相同，但需要维护更多代码。

两种方案均在 [details-and-accessibility.md](details-and-accessibility.md) 中。

## 尺寸与对比度下限

长篇正文文本应从浏览器默认的 `16px` 开始。只有在你能明确说明原因时才调整：字体显小、行宽较窄，或产品是信息密集的专业工具。

UI 文本可以更小。`14px` 是输入框和菜单的实用起点，`13px` 适合说明文字，并且很少低于 `12px`。移动端输入框仍需使用 `16px`。

当文本看起来对比度不足时，使用 `better-colors` 测量实际渲染的颜色组合，并使用 `better-accessibility` 判定要求。除非被要求，否则不要修改颜色。

## 根节点上的字体平滑

在 macOS 上，文本的渲染会比预期更粗。在根布局上统一应用一次 `-webkit-font-smoothing: antialiased` 和 `-moz-osx-font-smoothing: grayscale`，绝不要逐个组件应用。Tailwind 的 `antialiased` 同时涵盖两者。

## 语言与双向文本行为

设置 `lang`，让浏览器和辅助技术选择正确的发音、引号和断词方式。在文档级别，或方向发生变化的内容边界处设置 `dir`。保留数字顺序，并使用 `<bdi>` 隔离混合方向的值。空间镜像和逻辑 CSS 属性属于 `better-layout`。

## 保持有用文本可选中

默认保持文本可选中。只要选中状态下的组合仍清晰可读，`::selection` 就可以将品牌风格带入阅读体验。

`user-select: none` 应用于可拖拽或手势驱动的表面，此处意外选中文本会造成干扰。绝不能应用于整个界面，也不能仅仅因为按钮标签可能被高亮而使用它。

## 完成之前

| 错误 | 修复方式 |
| --- | --- |
| 合成的字体字形与设计不同 | 加载真实字形；仅禁用已验证的合成模式 |
| 子级标题在视觉上压过其父级 | 将该部分的层级映射到递减的字号步骤 |
| 因默认尺寸而选择标题元素 | 先选择语义，再在 CSS 中设置尺寸 |
| 段落最后一行出现孤行 | `text-wrap: pretty` |
| 两行标题不平衡 | `text-wrap: balance` |
| 在界面中使用两端对齐文本 | `text-align: start`；将两端对齐保留给特定的编辑排版布局 |
| 下划线穿过下行字母 | `text-decoration-skip-ink: auto`，使用 `from-font` 度量 |
| 混合方向的值以错误顺序渲染 | 修正 `lang`/`dir`；用 `<bdi>` 隔离该值 |
| 整个应用界面禁用了文本选择 | 恢复它；仅在与拖拽或手势冲突的地方禁用 |
| 无视觉提示的额外信息提示 | 通过 `text-decoration-style: dotted` 使用点状下划线 |
| `14px` UI 文本使用 Thin/Light 字重 | 在 `18px` 以下使用 `400`+ 字重；细字重仅用于展示文本 |
| 三行卡片描述使用 `leading-none` | 任何换行至 3 行以上的文本至少使用 `1.4` |

## 报告

**严重程度。** `HIGH` 会使文本无法阅读，或截断内容且无法恢复。`MEDIUM` 会破坏排版系统或标题层级。`LOW` 是局部细节优化。

**验证。** 无浏览器时：按标题级别检查计算后的字号和字重，并确认其递减关系；检查声明的行高和行长；依据真实字符串长度检查截断规则。有浏览器时：调整视口大小，以发现实际内容长度下的换行、孤行和截断。将每项无法执行的检查报告为 `Not verified`。

**格式。** 按其违反的原则归类问题，并按严重程度排序；每个根本原因一行，列出其出现的所有位置：

| 严重程度 | 位置 | 修改前 | 修改后 | 原因 |
| --- | --- | --- | --- | --- |

`Location` 为 `path/to/file:line`。`Why` 应说明原则和对用户的影响。

若仍有任何 `HIGH`，则以 `Block` 结束；否则以 `Approve` 结束，并将其余内容保留在表格中作为待完成事项。绝不对未检查的覆盖范围给予 `Approve`。若无内容可报告，则说明“没有可操作的排版问题”，并报告验证情况。