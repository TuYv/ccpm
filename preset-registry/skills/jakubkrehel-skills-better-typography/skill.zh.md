---
name: better-typography
description: Web typography from choosing fonts to spacing, wrapping and accessibility. Use when picking or pairing typefaces, configuring variable fonts or OpenType features, setting up a type scale, checking heading hierarchy, styling text in components, truncating text, styling underlines, selection, placeholders or carets, or reviewing frontend code for typography. Triggers on typography, fonts, font formats, woff2, variable fonts, font-weight, opentype, font-feature-settings, letter-spacing, line-height, type scale, heading hierarchy, heading levels, tabular numbers, text-wrap, truncation, line clamp, underlines, text-decoration, text selection, iOS input zoom, scaled input text, font smoothing, text contrast, measure, line length, text-box, smart punctuation, drop cap.
---
# 优秀的排版

优秀的排版大多在于克制。合理的比例、舒适的间距和足够的对比度，胜过任何巧妙的效果。标签、表格单元格、营销标题和文章段落不应共用一套规则。在构建或审查任何包含文本的内容时，都应遵循这些原则。

审查时，应阅读页面，而不是扫描代码：眯起眼睛检查层级是否保持清晰，完整阅读一段段落以感受阅读舒适度，并调整视口大小，以便在真实内容长度下发现不当换行、孤行和截断问题。

文字本身（按钮标签、错误消息、空状态）由 `better-writing` skill 负责；语义标题结构由 `better-accessibility` 负责；空间上的 RTL 布局和逻辑 CSS 属性由 `better-layout` 负责；渲染后成对对比度的测量和颜色修复由 `better-colors` 负责。本 skill 负责文本在混合方向内容中的渲染、换行和行为。

每项修复都应使用项目自身的惯用方式：使用项目已经采用的样式系统，绝不要在旁边再引入第二套系统。[cheat sheet](css-cheat-sheet.md) 对照列出了每个声明对应的 Tailwind 写法。

## 快速参考

| 类别 | 使用场景 | 参考 |
| --- | --- | --- |
| 选择字体 | 字体类别、字体搭配、格式、字形结构 | [choosing-fonts.md](choosing-fonts.md) |
| 可变字体与 OpenType | 字体轴、字重、等宽数字、样式集 | [variable-fonts-and-opentype.md](variable-fonts-and-opentype.md) |
| 间距与尺寸 | 字体比例、标题层级、行高、字母间距、文本裁剪 | [spacing-and-sizing.md](spacing-and-sizing.md) |
| 换行与标点 | 文本宽度、换行、截断、智能标点、RTL | [wrapping-and-punctuation.md](wrapping-and-punctuation.md) |
| 细节与无障碍 | 下划线、选区、表单、装饰性文本、对比度 | [details-and-accessibility.md](details-and-accessibility.md) |
| CSS 速查表 | 所涵盖的每个属性的快速查询，以及对应的 Tailwind 写法 | [css-cheat-sheet.md](css-cheat-sheet.md) |
| 审查输出格式 | 严重性等级、问题表格、验证、结论 | [review-output.md](review-output.md) |

## 核心原则

### 1. 使用正确的格式

在 Web 上使用 `.woff2`（采用 Brotli 压缩，支持范围广）。`.woff` 仅适用于非常老旧的浏览器，作为后备格式；`.ttf` 和 `.otf` 是没有 Web 压缩的原始桌面格式。文件如何加载属于项目自身的事项，本 skill 不作规定。

### 2. 优先使用属性，而不是原始标签

当存在 CSS 属性时，应使用它。使用 `font-weight: 650`，而不是 `font-variation-settings: "wght" 650`；使用 `font-optical-sizing: auto`，而不是 `"opsz"`；使用 `font-variant-numeric: tabular-nums`，而不是 `font-feature-settings: "tnum" 1`。当非可变字体后备字体进行渲染时，属性仍能继续生效。只有在没有对应属性时，才应将原始标签属性用于自定义轴（`"GRAD" 80`）和小众特性（`"ss01" 1`）。

### 3. 加载设计所需的字重和样式

浏览器可能会合成当前字体族未提供的字重或样式，以满足请求。优先加载设计实际使用的字体字面。只有在确认完整的后备字体栈中，每种所需的粗体、斜体、小型大写字母、上标和下标形式都能保持视觉区分后，才设置 `font-synthesis: none`；禁用合成不是诊断手段，也绝不能抹去强调效果。

### 4. 减少字体、字号和字重

很少使用超过三种字体。字重和字号定义层级，但过度使用会迅速损害可读性。应通过对比而不是相似性进行搭配：衬线字体标题搭配无衬线字体正文会显得经过刻意设计，而两种近乎相同的无衬线字体会显得像是错误。低于 `18px` 时，保持使用 `400` 及以上的字重；低于 `300` 的字重仅适用于展示文本（`28px` 及以上），在正文尺寸下会消失。

### 5. 使用带语义名称的字号比例

定义一组精简的字号，并尽可能少地偏离它。没有系统的硬编码字号在规模扩大时会逐渐失控。对于个人项目，只要使用规则清晰，使用 `text-sm` 这类默认名称就足够了。在团队项目中，应根据用途命名字号（`text-body-sm`），而不是根据大小命名，这样规则才能保持一致。

### 6. 标题字号随层级递减

在连贯的页面层级中，将标题层级映射到字号比例中递减的步骤：视觉上从属的标题不应意外压过其父级标题。相邻层级可以在字号比例较小的一端共用字号，只要通过字重或间距使它们保持区分。根据 `better-accessibility` 选择语义化的标题元素；此技能只控制它们的视觉呈现。

### 7. 根据角色设置行高

标题使用更紧凑的行高，约为 `1.1`。正文使用 `1.5` 到 `1.6`。优先使用无单位值，使行高随字号缩放；`24px` 这类固定值则不会。紧凑的行高适用于短文本：任何换行后达到三行或更多行的文本，行高至少需要 `1.4`，即使是在高度受限的行中也是如此。

### 8. 根据字号设置字间距

较大的标题通常使用略微为负的字间距会更好看。较小的全大写标签需要略微为正的字间距，以免字母显得拥挤。阅读字号的正文不需要调整字间距。

### 9. 限制行长

过长的行会让眼睛难以找到下一行。将长篇文本的每行限制在约 60–75 个字符。使用哪种单位都可以；重要的是存在一个上限，并且最终的行长处于这个范围内。[单位选择和对应的像素值](wrapping-and-punctuation.md#measure-line-length)。

### 10. 有意识地控制换行

`text-wrap: balance` 会将文本均匀分布到各行：将它用于标题。`text-wrap: pretty` 可以避免最后一行只剩一个很短的单词：将它用于描述文本。在长篇文本中跳过这两种设置。在长单词、链接或 ID 可能溢出容器的地方使用 `overflow-wrap: break-word`。对于标签和徽章，在换行会显得不协调的地方使用 `white-space: nowrap`。

### 11. 对变化中的数值使用表格数字

数字默认具有不同的宽度，因此计时器、计数器和价格在更新时会导致布局偏移。对任何会变化的数值应用 `font-variant-numeric: tabular-nums`。

### 12. 截断时不要丢失内容

单行文本：使用 `text-overflow: ellipsis`，并配合 `overflow: hidden` 和 `white-space: nowrap`。多行文本：使用 `line-clamp`。截断会隐藏内容，因此如果缺失的文本很重要，应通过工具提示或展开视图保留完整内容的访问途径。

### 13. 自然地撰写文案，使用 CSS 设置样式

将文本以自然大小写存储，并通过 `text-transform` 控制呈现方式，这样重新设计时就不必重写文案。使用智能标点：正文使用弯引号（代码中使用直引号），使用连接号表示 `2010–2020` 这样的范围，用破折号插入补充想法，使用单字符省略号，使用 `&nbsp;` 防止 `16 px` 这样的值被拆开，并使用 `&shy;` 控制长单词可以在哪里换行。

### 14. 来自字体的下划线

默认下划线的位置由浏览器决定。使用 `text-underline-position: from-font` 和 `text-decoration-thickness: from-font` 从字体自身的度量信息中获取位置和粗细，或者使用 `text-decoration-thickness`、`text-underline-offset` 和 `text-decoration-skip-ink` 手动调整。`text-decoration-style` 可以绘制点线、虚线或波浪线；点状下划线通常用于提示某个词包含额外信息，例如缩写或定义术语。除非唯一需要动画的是颜色变化，否则应将下划线构建为独立元素，而不是使用 `text-decoration`：真实下划线中只有颜色能够可靠地实现动画。

### 15. 移动端输入框使用 16px

当输入框中的文本小于 `16px` 时，iOS Safari 会缩放整个页面。有两种方式可以将字体大小保持在 `16px`，它们的效果不同，因此应先确认设计需要哪一种，而不是自行默默选择：在移动端放大输入框（`text-base sm:text-sm`），这会改变它在小屏幕上的外观；或者保持 `font-size: 16px`，再通过 `transform: scale()` 渲染出目标尺寸，同时调整宽度和 `line-height`，使设计在每个视口中保持一致。[两种方案](details-and-accessibility.md)。

### 16. 尺寸和对比度下限

长篇正文文本可以从接近浏览器默认值的 `16px` 开始，然后结合实际使用的字体、字号、平台和产品信息密度进行判断。界面文本可以更小：输入框和菜单可以从 `14px` 开始（输入框在移动端仍需要 `16px`，见原则 15），说明文字可以使用 `13px`，很少低于 `12px`。当文本看起来对比度较低时，使用 `better-colors` 测量渲染后的颜色组合，并使用 `better-accessibility` 判断要求；除非用户提出要求，否则不要更改颜色。

### 17. 在根元素上设置字体平滑

在 macOS 上，文本的渲染效果比预期更粗。只需在根布局上应用一次 `-webkit-font-smoothing: antialiased` 和 `-moz-osx-font-smoothing: grayscale`（Tailwind 的 `antialiased` 同时涵盖两者），不要在每个组件中分别设置。

### 18. 语言和双向文字行为

设置 `lang`，让浏览器和辅助技术选择正确的发音、引号和连字符处理方式。在文档或方向发生变化的内容边界处设置 `dir`，保持数字顺序，并在需要时对方向混合的独立值使用 `<bdi>`。空间镜像和逻辑 CSS 属性属于 `better-layout`。

### 19. 保持有用文本可选中

当选中后的组合仍然清晰易读时，`::selection` 可以将品牌风格延伸到阅读体验中。默认情况下应保持文本可选中。只有在意外选中文本确实会干扰交互时，才在特定的可拖动或手势驱动表面上使用 `user-select: none`；不要在整个界面中禁用文本选择，也不要仅仅因为按钮标签可以被高亮选中就禁用选择。

## 常见错误

| 错误 | 修复方法 |
| --- | --- |
| 在 Web 上提供 `.ttf`/`.otf` | 转换为 `.woff2` |
| 使用 `font-variation-settings: "wght"` 设置字重 | 使用 `font-weight`（可兼容非可变字体回退） |
| `font-feature-settings: "tnum" 1` | `font-variant-numeric: tabular-nums` |
| 合成的字体面与预期设计不一致 | 加载所需的字体面；仅禁用经过验证的合成模式，同时保留强调效果 |
| 硬编码零散的字体大小 | 使用字体比例 |
| 子标题在视觉上压过父级标题 | 将该部分的层级映射到逐级递减的比例步骤 |
| 因默认大小而选择标题元素 | 使用 `better-accessibility` 选择语义，然后在 CSS 中设置视觉大小 |
| 在可缩放文本上使用 `line-height: 24px` | 使用无单位值（`1.5`） |
| 段落占满整行 | 将每行限制在约 60–75 个字符 |
| 段落最后一行出现孤行 | `text-wrap: pretty` |
| 两行标题左右失衡 | `text-wrap: balance` |
| 数字导致布局偏移 | `tabular-nums` |
| 文本被截断且无法查看完整内容 | 使用 Tooltip 或展开视图显示完整值 |
| 在文案中直接输入 `UPPERCASE` | 使用自然大小写 + `text-transform` |
| 在界面中使用两端对齐文本 | 使用 `text-align: start`；仅在特定的编辑型布局中使用 justify |
| 下划线穿过下伸部 | 使用 `text-decoration-skip-ink: auto` 和 `from-font` 度量 |
| iOS 上低于 `16px` 的输入框触发缩放 | 优先考虑：`text-base sm:text-sm`，或使用 `transform` 将 `16px` 缩小，同时保持设计好的尺寸 |
| 根布局未设置字体平滑 | 在根元素上统一应用一次 `antialiased` |
| 混合方向的值按错误顺序渲染 | 设置正确的 `lang`/`dir`；必要时使用 `<bdi>` 隔离该值 |
| 整个应用界面禁用了文本选择 | 恢复文本选择；仅在与拖拽或手势冲突的特定交互中禁止选择 |
| 额外信息提示没有视觉线索 | 使用 `text-decoration-style: dotted` 添加点状下划线 |
| `14px` 界面文本使用 Thin/Light 字重 | `18px` 以下使用 `400`+ 字重；较细字重仅用于展示型文本 |
| 在三行卡片描述上使用 `leading-none` | 对于换行至 3 行及以上的文本，至少使用 `1.4` |

## 报告

当所有已确认的问题都按照 [review-output.md](review-output.md) 中的格式完成报告，并包含验证结果和结论时，独立的排版审查才算完成。在 `better-interface` 下，则以其格式为准。