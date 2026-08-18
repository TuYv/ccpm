---
name: better-colors
description: Color systems for digital products, from building and naming a palette to applying it with meaning and verifying contrast. Use when creating or extending a color palette, naming color tokens, theming light and dark appearances, auditing the colors in a codebase, or reviewing frontend code for color. Triggers on color palette, palette generation, color scale, color ramp, brand color, accent color, neutral palette, gray palette, status colors, design tokens, semantic color tokens, token naming, theming, dark mode colors, contrast ratio, APCA, gamut, display p3, oklch, color conversion, gradients, color meaning, increased contrast.
---
# 颜色

颜色系统由一小组色阶组成，按角色命名，统一应用，并根据其实际渲染的背景进行验证。几乎所有颜色问题本质上都是系统问题：孤立地挑选某个值、因为看起来合适就借用某个令牌，或者使用一对从未经过测量的颜色。对比度要求归属于 `better-accessibility`；表面、阴影和图标颜色归属于 `better-ui`。

## 快速参考

| 类别 | 使用时机 | 参考 |
| --- | --- | --- |
| 结构 | 系统需要哪些色阶、各级角色、中性色、状态颜色、审查现有调色板 | [palette-structure.md](palette-structure.md) |
| 生成 | 根据品牌色构建色阶、多色相系统、深色模式 | [palette-generation.md](palette-generation.md) |
| 命名 | 原始值和语义层级、角色清单、命名语法、反模式 | [token-naming.md](token-naming.md) |
| 使用 | 每种颜色对应一种含义、强调、渐变、文化因素、外观变体 | [color-usage.md](color-usage.md) |
| 对比度 | APCA 和 WCAG 检查、报告失败项、按要求修复 | [contrast.md](contrast.md) |
| 格式 | 选择表示法、转换、色域和 P3 回退方案 | [color-formats.md](color-formats.md) |
| 审查输出格式 | 严重程度等级、发现项表格、验证、结论 | [review-output.md](review-output.md) |

## 核心原则

### 1. 匹配项目的颜色系统

复用项目现有的令牌和表示法。为了修复一个值而引入第二种颜色表示方式，会让调色板更难理解，而不是更容易——统一的十六进制系统优于一个其中散落着 `oklch()` 的十六进制系统。表示法本身不是缺陷。对于真正全新的系统，`oklch()` 是最佳默认选择，因为它的数值行为符合下文描述的色阶规则；在其他情况下，应使用颜色库生成与项目现有写法相同的色阶（[color-formats.md](color-formats.md)）。

### 2. 系统由色阶组成，而不是由颜色组成

使用一个中性色阶、一个强调色阶，以及产品实际渲染的状态色阶。没有任何导入方的 `warning` 色阶，只会为零个像素增加维护成本；只有当两种事物必须一眼区分时，第二种强调色相才有存在的理由。

### 3. 每一级都有其用途

色阶不是供人凭视觉挑选的渐变。每一级的存在，都是因为某个角色需要它——页面背景、组件悬停、边框、实心填充、正文文本；没有任何角色使用的级别就不应生成。Tailwind 的 `50`–`950` 和 Radix 的 `1`–`12` 约定都能映射到这些角色（[palette-structure.md](palette-structure.md)）。

### 4. 原始值按色相命名，语义值按角色命名

原始值用于命名某个数值（`--blue-500`），绝不会直接应用于组件。语义令牌用于命名某项职责（`--color-text-secondary`），指向一个原始值，并且是组件引用的唯一层级。正是这一层连接使主题切换成为可能；没有它，深色模式就意味着审查每个使用位置，逐一判断哪些使用的是“强调色”，哪些只是需要蓝色（[token-naming.md](token-naming.md)）。

### 5. 只在其所属角色中使用令牌

不要因为某个令牌当前的值正合适，就借用它。将分隔线用作文本颜色，直到边框变得更浅，文本也会随之变浅。如果某个角色没有对应的令牌，就添加该令牌。

### 6. 在整个色阶中保持色相

各级色阶应在*感知*亮度上均匀递进，色相从头到尾保持不变，鲜艳度在色阶中段达到峰值，并在两端逐渐降低；与深色端相比，浅色端的各级应更加密集。两端都不要达到纯黑或纯白，因为纯黑和纯白根本无法承载色相。使用颜色库，而不是凭目测调整（[palette-generation.md](palette-generation.md)）。

### 7. 一种颜色，一种含义

在整个界面中，让一种颜色只承担一种用途，并将色相差在 `15°` 以内的颜色视为同一种颜色。如果强调色表示可交互，那么将该色相用于静态文本会让用户误以为某个不可点击的内容可以点击；反过来，将可交互元素渲染为中性色同样会造成误导。颜色永远不是传达含义的唯一方式；`better-accessibility` 负责这一要求。

### 8. 每个视图恰好突出一个操作

当填充色用于表达主要强调时，只给一个主要操作使用该颜色，同级操作保持中性。将颜色放在背景上，而不是标签上：填充按钮即使隔着一段距离也能被看作主要操作，而中性按钮上的强调色文本则会被看作链接。当多个彩色背景用于表达不同状态或类别，而不是作为同级操作相互竞争时，这样做是可以的。

### 9. 测量实际渲染的颜色对，然后报告结果

应将前景色与其实际渲染所在的背景进行测量，而不是与页面背景进行测量。当某个颜色对未通过时，报告该颜色对、测量值以及未达到的阈值，并保持颜色不变。项目的颜色属于设计决策；只有在被要求时才修改它们，并在修改后重新测量（[contrast.md](contrast.md)）。

### 10. 选择渐变的插值空间

插值空间决定的是视觉效果，而不是正确性设置。`in oklab` 是最佳默认选项，能够带来均匀的亮度且不会产生意外的色相变化。`in oklch` 会沿色相环移动，而不是穿过中间区域，因此能够保持鲜艳，并经过两个色标之间的色相：这是一种独特的视觉效果，也是解决双色渐变中间变灰问题的方法。sRGB 默认值是经典选择，其更暗、更低饱和度的中点正是大多数界面已有的样子（[color-usage.md](color-usage.md)）。

## 常见错误

| 错误 | 修复方式 |
| --- | --- |
| 项目已有令牌，却使用了原始值 | 使用项目现有表示法中的正确角色令牌，或添加该令牌 |
| 在以十六进制代码为主的代码库中，单独加入一个 `oklch()` 值 | 除非迁移颜色系统属于当前范围，否则保持既有表示法 |
| 组件直接使用了 `--blue-500` 这类原始令牌 | 让语义令牌指向它，并使用语义令牌 |
| 令牌以外观（`--color-blue-button`）或首次使用位置（`--color-sidebar-gray`）命名 | 根据其角色命名：`--color-accent-solid`、`--color-bg-surface` |
| `--color-primary` 表示品牌，而 `--color-text-primary` 表示正文文本 | 用 `accent` 保留表示品牌；让 `primary` 表示“其所在组中最突出的元素” |
| 在角色之外使用语义令牌（例如将分隔线令牌用于文本） | 为缺失的角色添加令牌；绝不要按值借用 |
| 通过改变 HSL 亮度来构建色阶 | 根据感知亮度重新构建，并保持色相不变 |
| 在完整范围内均匀分布色阶 | 收紧浅色端；`50` 和 `100` 必须能作为两个表面被区分 |
| 在不同色相之间复用相同的饱和度数值 | 匹配各色相自身最大值的相同比例，而不是使用相同的原始数值 |
| 状态色相与强调色相发生冲突 | 调整状态色相，直到破坏性操作和主要操作并排显示时能够区分 |
| 通过机械地反转浅色调色板来制作深色模式 | 先以反转作为起点，然后降低鲜艳度、扩大深色端，并重新检查每个颜色对 |
| `prefers-color-scheme` 设置部分令牌，而 `.dark` 类设置其他令牌 | 选择一种切换机制，并在整个项目中统一使用 |
| 对比度未通过 | 报告颜色对、测量值以及未达到的阈值；只有在被要求时才修改颜色 |
| 通过修改色相来修复对比度 | 修改亮度，因为对比度响应的是亮度这一通道 |
| P3 颜色没有 sRGB 回退值 | 先声明 sRGB 值，然后在 `@media (color-gamut: p3)` 中覆盖它 |
| 互补色之间的渐变在中间变灰 | 切换到极坐标空间（`in oklch`），或在两种颜色之间的色相处添加一个中间色标 |
| 只在浅色模式下验证调色板 | 在两种外观模式下重新检查每个前景色/背景色组合 |

## 报告

当所有已确认的问题都按照 [review-output.md](review-output.md) 中的格式进行报告，并附带验证结果和结论时，独立的颜色审查即告完成。在 `better-interface` 下，则以其中规定的格式为准。