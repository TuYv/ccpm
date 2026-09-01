---
name: committed-aesthetic
description: "How to write — and how to use — a skill that IS one aesthetic rather than a catalogue of them. A catalogue lets an agent pick, and it picks the modal option; a committed aesthetic makes it execute one thing precisely, against rules you can check. Use when a design keeps coming out competent and forgettable, when starting a new brand surface with no reference, or when authoring a house style you want executed the same way twice."
when_to_use: |
  Apply when:
  - design-advisor is starting a UI-bearing surface with NO existing system to match
  - output from ui-ux-pro-max keeps landing on "clean modern minimal"
  - you are writing a house style meant to be executed by an agent, not read by a human
  Do NOT apply when:
  - an existing product's design already governs (match it — that is anydesign's job)
  - the surface is one screen inside a system that already has a vocabulary
effort: low
allowed-tools: Read, Write, Grep, Glob
---
# 坚定的审美胜过目录

## 存在的目的

`ui-ux-pro-max` 提供 84 种风格、161 套配色和 57 组字体搭配，而
`design-advisor` 已接入全部内容。目录不是瓶颈。

瓶颈在于，**目录允许模型进行选择，而不受约束的选择往往会趋向同一个模式。**要求制作一个没有品牌的落地页时，任何模型都会选择同一个安全中心：柔和渐变、大号无衬线标题、三个带左侧强调边框的圆角卡片，以及充足的中性灰色空间。训练分布中的每个输入都在为它投票。目录条目中写着*"瑞士极简主义——简洁、基于网格、留白充足"*，也不足以推翻这一点，因为这句话描述的正是安全中心。

对比一条来自坚定审美的规则：

> 每个尺寸都以基准宽度为参照，使用 `calc(fraction * 100vw)`，因此 1024px 下的页面应当呈现为 1920px 下同一页面的完美缩小版

你可以**检查**这一点。一个设计要么遵守它，要么不遵守。这就是全部区别：目录条目是一个*标签*，而坚定的审美是一条*约束*。

## 形式

一个坚定审美技能包含五个部分。第一部分才是真正发挥作用的部分。

### 1. 可迁移的 DNA —— 编号、具体、可证伪

包含 8 到 14 条规则。每一条都必须能够由不在现场的人进行检查。用这个问题检验每条规则：**两位设计师是否可能对一个页面是否遵守它产生分歧？**如果会，那它就是一种氛围描述，请重写。

| 氛围描述（无用） | 约束（可用） |
|---|---|
| "纤细、优雅的字体" | "只使用 100 或 300 字重，绝不使用 400+" |
| "大量留白" | "任何首屏区域约 60% 为空" |
| "克制的动效" | "不使用阴影、渐变或弹跳；系统中只有一个阴影，用于 toast" |
| "技术感" | "产品代码使用 en-dash U+2013，绝不使用连字符" |
| "深色且紧凑" | "五个表面层级，每级相差约 5%；层次感来自表面层级，绝不使用阴影" |

### 2. 这不包含什么 —— 以表格形式明确 IP 边界

审美是*受启发于，而不是克隆*。列出属于借鉴对象的具体资产——文字标志、图标集、信息架构、产品名称、文案——并分别说明原因和替代做法。这不是放在底部的法律免责声明；它是一张代理在构建过程中会读取的工作表，也是致敬与商标问题之间的区别。当来源是真实公司时，默认采用受启发但保持差异化的方式，并在采取克隆路径前先询问。

### 3. 一个可以运行的组件库

提供一个代理可以打开的 HTML 文件，其中渲染出每个组件，并将各自的 CSS 内联，支持复制粘贴。令牌表格会被阅读后重新表述；渲染后的画廊则会被原样复制。这正是这种形式有效的原因。

### 4. 标志性模式的模板

列出两到三个仅凭 DNA 规则无法重建的设计动作——导航形态、分区标题、主视觉。在注释中标记 `swap these for your own brand`。

### 5. 参考截图，标注为“研究，不要逐像素复制”

截图用于理解模式。根据截图进行构建，而不是根据规则进行构建，会产生一个页面的拙劣描摹，而不是属于同一设计体系的一员。

## 禁用清单，以及我们为什么需要它

`ui-ux-pro-max` 的反模式表关注可访问性、触控目标和性能。它们很好，但讨论的不是审美。本仓库中没有任何内容告诉 agent 什么是*陈词滥调*，因此抵御低质量设计的唯一防线，就只剩下 `design-advisor` 中的一句话：“不要使用通用的、干净现代的极简填充物”。

在没有现有系统要求的任何界面上，默认禁用：

- **将渐变作为页面底色。** 尤其是紫色到蓝色的渐变，尤其是 135° 的渐变。
- **三卡片组合**：三个等宽卡片、圆角、彩色左边框，以及一个放在着色圆形中的图标。
- **将 Inter、Roboto、Arial、Open Sans、Fraunces、Poppins 作为展示字体。** 不是因为它们不好，而是因为它们是默认选择。
- **使用 Emoji 作为图标。** 绘制图标。（如果品牌本身使用 Emoji，则可以使用。）
- **描述某个类别而不是表明立场的 Hero。** “面向 X 的现代平台”是模型在没有被告知应该相信什么时写出的句子。
- **除非需求明确指定，否则不要使用玻璃拟态、新拟态和网格渐变色块。**
- **不要默认使用对称的三列功能网格**作为第二个区块。

禁用清单不是一种风格。它移除了中间地带，迫使人做出选择。

## 如何使用

1. 如果已有系统负责约束，本技能不适用，遵循现有系统即可。
2. 如果没有任何系统负责约束，并且**你可以提问**：在开始构建之前，提供 2–4 个真正不同的方向，每个方向都应对应一个可以命名的轴线。不要提供同一种审美的五种变体，那不叫选择。
3. 如果没有任何系统负责约束，并且**你无法提问**：确定一种方向，在交付时用一行说明假设，并在交付物旁边放置 1–2 个低保真备选方案，绝不能用它们替代交付物。
4. 一旦选定方向，加载对应的已确定审美技能，并严格执行其 DNA 规则。为每个选择标注规则编号，方式与 `design-advisor` 已经对 ui-ux-pro-max 规则所做的一样。

## 本仓库中的实例

- [`skills/aesthetic-instrument/SKILL.md`](../aesthetic-instrument/SKILL.md) —
  great_cto 自有的设计，依据 board 和 greatcto.systems 进行测量，而不是为本文档设计。

相关内容：[`skills/ui-ux-pro-max/SKILL.md`](../ui-ux-pro-max/SKILL.md) 是与之并列的目录，而不是它的替代品 —— 当你需要了解某件事时，应查阅该目录；当你已经做出决定后，应加载本技能。