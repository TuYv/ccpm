---
name: better-typography
description: Web typography. Use when picking or pairing typefaces, setting up a type scale, or styling and truncating text in components. Triggers on typography, font loading, woff2, variable fonts, opentype features, type scale, heading hierarchy, line-height, letter-spacing, measure, text-wrap, truncation, tabular numbers, underlines, text selection, iOS input zoom, font smoothing, smart punctuation, text-box, drop cap.
---
# 字体排印

字体排印主要在于克制：合理的比例、舒适的间距、足够的对比度。标签、表格单元格、营销标题和文章段落不能共用同一套规则。

审查时，应阅读渲染后的页面，而不是浏览代码。糟糕的换行、孤行和截断问题只有在真实内容长度下才会显现。

所有修复都应使用项目的样式系统，并使用下方给出的确切值，而不是看起来相近的等效值。[速查表](css-cheat-sheet.md)列出了每条声明对应的 Tailwind 写法。

文字本身归 `better-writing` 负责。语义化标题结构归 `better-accessibility` 负责。RTL 空间布局和逻辑属性归 `better-layout` 负责。对比度测量归 `better-colors` 负责。本技能负责文本的渲染、换行，以及文本在混合方向内容中的表现。

## 提供正确的格式

在 Web 上使用 `.woff2`，因为它支持 Brotli 压缩且兼容性广泛。`.woff` 是面向非常旧的浏览器的后备格式。`.ttf` 和 `.otf` 是不具备 Web 压缩能力的桌面格式。文件的加载方式由项目决定。

## 优先使用属性，而非原始标签

只要存在对应的 CSS 属性，就应使用它。使用 `font-weight: 650`，而不是 `font-variation-settings: "wght" 650`。使用 `font-optical-sizing: auto`，而不是 `"opsz"`。使用 `font-variant-numeric: tabular-nums`，而不是 `font-feature-settings: "tnum" 1`。

当渲染使用非可变后备字体时，属性仍然有效。仅将原始标签用于没有对应属性的自定义轴（`"GRAD" 80`）和小众特性（`"ss01" 1`）。轴和特性标签列在 [variable-fonts-and-opentype.md](variable-fonts-and-opentype.md) 中。

## 加载设计所需的字重和样式

浏览器会合成当前字体族未提供的字重或样式，从而扭曲字体的真实形态。应加载设计所使用的字形。

`font-synthesis: none` 会关闭合成，但它不会报告问题，而是直接抹除强调效果。只有在检查并确认所有必需的粗体、斜体、小型大写字母、上标和下标形式在整个后备字体栈中仍保持清晰可辨后，才能设置该属性。

## 减少字体、字号和字重

使用的字体通常不要超过三种。字重和字号用于定义层级；过度使用会迅速损害可读性。字体搭配应追求对比，而非相似：无衬线正文上方使用衬线标题会显得是有意为之，而两种几乎相同的无衬线字体则会让人觉得是个错误。

低于 `18px` 时，字重应保持在 `400` 或更高。低于 `300` 的字重仅适用于 `28px` 及以上的展示文字；在正文字号下，它们会难以辨认。字体搭配指南参见 [choosing-fonts.md](choosing-fonts.md)。

## 使用具有语义化名称的字体比例系统

定义一小组字号，并尽可能少地偏离它们。没有系统支撑的硬编码字号无法适应规模化使用。

个人使用时，只要使用规则明确，`text-sm` 这样的默认名称就可以。在团队中，应按用途命名字号（`text-body-sm`），这样即使由其他人接手，规则也能延续。比例系统的构建方法参见 [spacing-and-sizing.md](spacing-and-sizing.md)。

## 标题字号随层级递减

将标题层级映射到字体比例系统中逐级递减的档位，以免视觉上从属的标题压过其上级标题。在比例系统较小的一端，相邻层级可以使用相同的字号，只要通过字重或间距保持区分即可。语义元素归 `better-accessibility` 负责；本技能仅设置视觉呈现。

## 按角色设置行高

标题的行高应更紧凑，约为 `1.1`。正文使用 `1.5` 到 `1.6`。优先使用无单位值，这样行高会随字号缩放；固定的 `24px` 则不会。

紧凑的行高适用于短文本。任何换行后达到三行或更多行的文本，即使位于高度受限的行中，也需要至少 `1.4` 的行高。

## 按字号设置字间距

大标题使用略微负值的字间距通常会更美观。小字号的大写标签需要一点正值字间距，否则字母会显得拥挤。用于阅读的正文字号则不需要调整字间距。

## 限制行长

过长的行会让视线难以找到下一行。将长篇文本限制在每行约 60–75 个字符。使用任何单位都可以，只要设置了上限，并且行长落在该范围内。请参阅[单位选择及其对应的像素值](wrapping-and-punctuation.md#measure-line-length)。

## 有意识地控制换行

四项声明，各司其职：

- `text-wrap: balance` 将文本均匀分布到各行。将其用于标题。
- `text-wrap: pretty` 防止单个短词落在最后一行。将其用于描述文本。
- 在长单词、链接或 ID 可能溢出容器时使用 `overflow-wrap: break-word`。
- 对于换行后会显得不完整的标签和徽章，使用 `white-space: nowrap`。

不要在长篇文本中使用 `balance` 和 `pretty`。

## 对变化的数值使用等宽数字

默认情况下，各个数字的宽度不同，因此计时器、计数器和价格在更新时会导致布局偏移。对任何会变化的数值应用 `font-variant-numeric: tabular-nums`。

## 截断文本，但不要让内容丢失

对于单行文本，将 `text-overflow: ellipsis` 与 `overflow: hidden` 和 `white-space: nowrap` 一起使用。对于多行文本，使用 `line-clamp`。截断会隐藏内容。当缺失的文本很重要时，应确保可以通过工具提示或展开视图访问完整内容。

## 自然地编写文案，使用 CSS 设置样式

以自然的大小写形式存储文本，并使用 `text-transform` 控制呈现形式，这样重新设计时就不必重写文案。

在渲染的文本中使用规范标点：

- 在正文中使用弯引号，在代码中使用直引号。
- 使用短横线表示范围：`2010–2020`。
- 使用单个省略号字符，而不是三个句点。
- 使用 `&nbsp;` 防止 `16 px` 在换行时被拆开。
- 使用 `&shy;` 指定长单词可以断开的位置。

## 使用字体中的下划线

默认下划线的位置由浏览器决定。使用 `text-underline-position: from-font` 和 `text-decoration-thickness: from-font`，从字体自身的度量信息中获取下划线的位置和粗细。通过 `text-decoration-thickness`、`text-underline-offset` 和 `text-decoration-skip-ink` 进行手动微调。

`text-decoration-style` 可将线条绘制为点线、虚线或波浪线。点状下划线通常用于提示某个词包含额外信息，例如缩写或已定义的术语。

颜色是实际下划线中唯一能够可靠实现动画的部分。因此，除非动画只涉及颜色，否则应将下划线构建为独立元素，而不要使用 `text-decoration`。

## 在移动设备上将输入框字号设为 16px

当输入框中的文本小于 `16px` 时，iOS Safari 会缩放整个页面。有两种修复方法可以将字号保持在 `16px`，但视觉效果不同，因此需要询问设计希望采用哪一种：

- 在移动端增大输入框字号（`text-base sm:text-sm`）。这会改变它在小屏幕上的外观。
- 保持 `font-size: 16px`，并使用 `transform: scale()` 渲染预期尺寸，同时补偿宽度和 `line-height`。在每种视口下外观一致，但需要维护更多代码。

这两种方案都在 [details-and-accessibility.md](details-and-accessibility.md) 中。

## 字号与对比度下限

长篇正文应从浏览器默认的 `16px` 开始。只有当你能明确说明原因时才偏离该值：字体本身显小、行宽较窄，或产品属于信息密集的专业工具。

UI 文本可以更小。输入框和菜单可从 `14px` 起步，说明文字可使用 `13px`，但极少应低于 `12px`。移动端输入框仍需使用 `16px`。

当文本看起来对比度较低时，使用 `better-colors` 测量实际渲染的颜色组合，并使用 `better-accessibility` 判定适用的要求。除非明确要求，否则不要更改颜色。

## 根元素上的字体平滑

在 macOS 上，文本渲染效果会比预期更粗。只在根布局上应用一次 `-webkit-font-smoothing: antialiased` 和 `-moz-osx-font-smoothing: grayscale`，切勿在各个组件中分别应用。Tailwind 的 `antialiased` 同时涵盖这两项。

## 语言与双向文本行为

设置 `lang`，以便浏览器和辅助技术选择正确的发音、引号和断词规则。在文档级别设置 `dir`，或在文本方向发生变化的内容边界处设置。保留数字顺序，并使用 `<bdi>` 隔离混合方向的值。空间镜像和 CSS 逻辑属性属于 `better-layout` 的范畴。

## 保持有用文本可选择

默认保持文本可选择。`::selection` 可以将品牌风格融入阅读体验，前提是选中状态下的颜色组合仍然清晰可辨。

`user-select: none` 适用于可拖动或由手势驱动的界面区域，且意外选中文本会干扰操作的情况。切勿将其应用于整个界面，也不要仅仅因为按钮标签可能被选中就使用它。

## 完成前检查

| 错误 | 修复方法 |
| --- | --- |
| 合成字形与设计不符 | 加载真实字形；仅禁用经确认的合成模式 |
| 子标题在视觉上压过其父标题 | 将该部分的层级映射到逐级递减的字号阶梯 |
| 根据标题元素的默认字号选择元素 | 先确定语义，再在 CSS 中设置字号 |
| 段落最后一行出现孤字或孤词 | `text-wrap: pretty` |
| 两行标题视觉不均衡 | `text-wrap: balance` |
| 在界面中使用两端对齐文本 | `text-align: start`；仅在特定的编辑排版中使用两端对齐 |
| 下划线穿过字母降部 | `text-decoration-skip-ink: auto`、`from-font` 度量 |
| 混合方向的值以错误顺序渲染 | 修正 `lang`/`dir`；使用 `<bdi>` 隔离该值 |
| 在整个应用界面框架中禁用文本选择 | 恢复文本选择；仅在与拖动或手势冲突的区域禁用 |
| 附加信息提示没有视觉线索 | 通过 `text-decoration-style: dotted` 使用点状下划线 |
| 在 `14px` UI 文本上使用 Thin/Light 字重 | `18px` 以下使用 `400` 及以上字重；细字重仅用于展示性文本 |
| 对三行的卡片描述使用 `leading-none` | 任何换行达到 3 行及以上的文本至少使用 `1.4` |

## 报告

**严重性。** `HIGH` 表示文本无法阅读，或内容被截断且无法恢复。`MEDIUM` 表示类型系统或标题层级遭到破坏。`LOW` 表示局部的细节问题。

**验证。** 在没有浏览器的情况下：计算每个标题级别的字号和字重，并检查其是否依次递减；检查声明的行高和行长；根据符合实际情况的字符串长度检查截断规则。在有浏览器的情况下：调整视口大小，以便在真实内容长度下发现换行、孤行和截断问题。将每项无法执行的检查报告为 `Not verified`。

**格式。** 按发现项所违反的原则分组，并按严重程度排序；每个根本原因占一行，列出其出现的所有位置：

| 严重性 | 位置 | 修改前 | 修改后 | 原因 |
| --- | --- | --- | --- | --- |

`Location` 的格式为 `path/to/file:line`。`Why` 应注明对应的原则及其对用户的影响。

如果仍存在任何 `HIGH`，则以 `Block` 结尾；否则以 `Approve` 结尾，并将其余问题保留在表格中作为待办事项。切勿对未检查的覆盖范围给出 `Approve`。如果没有任何需要报告的问题，请说明“没有可执行的排版问题”，并报告验证情况。