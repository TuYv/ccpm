---
name: aesthetic-instrument
description: "great_cto's own committed aesthetic — the instrument panel. Dark five-step surface ladder, exactly one accent, two faces divided by MEANING (Geist speaks, Geist Mono is machine-truth), tabular numerals, and a dash that is not a nought. Twelve checkable rules measured from packages/board and greatcto.systems, not designed for this file. Use when building or extending any great_cto surface — the board, the site, a report, a share page."
when_to_use: |
  Apply when:
  - building or extending ANY great_cto surface (board screen, site section, share report)
  - a new element must sit beside existing ones without re-deciding the system
  Do NOT apply when:
  - designing a CLIENT product — this is our identity, not a default. See rule 0.
effort: low
allowed-tools: Read, Write, Edit, Grep, Glob
---
# 仪表盘

在[`skills/committed-aesthetic/SKILL.md`](../committed-aesthetic/SKILL.md)所定义的“坚定美学”意义上：下面的每条规则都可以检查，每个数值都**直接读取自源文件**——
`packages/board/public/index.html` 和 `great_cto-site/styles.css`——而不是为了撰写本文档而选定的。

主题是仪器，而不是宣传册。一个人通过它读取信息，以决定机器下一步可以做什么。以下一切都由此而来。

## 规则 0 ——这是类别默认风格，把它称为我们的风格是错误的

这个文件的第一个版本以“这是我们的风格，而不是默认风格”开头。以 2026-09-01 的真实语料库进行衡量，这个说法是错误的，而修正这一点比下面的任何内容都更重要。

Refero 针对深色技术开发者落地页的十大风格描述了以下特征：
近黑色画布（Depot、Warp、Supabase、Trunk、Checkly、Cron、Linear、Eraser），通过表面变化或边框来营造层次，**而不是阴影**（Warp、Supabase、Trunk、Linear），以及**谨慎使用的单一绿色强调色**（Depot、Warp、Supabase、Trunk）。其中四个被描述为“仪表盘”“指挥中心”或“驾驶舱”。

这些特征中的每一项都是下面的一条规则。这种美学不是 great_cto 的身份——它是所有基础设施产品的共同样貌，而这个文件却将这种模态选择编纂成规则，并把它标记为差异化。声称自己没有制作模板化作品的 skill，实际上正是在制作模板化作品。

**下面的内容仍然正确，其正确性来自功能，而不是独特性。**深色、紧凑、单一强调色、表格式数字，以及不是零的短横线，对于一个操作员全天候读取、用来决定机器下一步可以做什么的界面来说，都是正确的。将它们保留给 BOARD。但不要误以为它们代表一种声音。

类别默认风格真正造成代价的地方是 LANDING：见过 Depot、Warp 和 Supabase 的访客无法分辨我们。这里的差异化应当是通过 `committed-aesthetic` 做出的品牌决策，而不是重新涂改这个文件。至于面向客户的产品——牙科诊所并不需要仪表盘——应当通过 `committed-aesthetic` 进行审慎选择。

## DNA

**1. 五个表面层级，每层相差约 5%，层次始终通过层级体现。**
`--bg-page #0a0e0c` → `--bg-card #11161a` → `--bg-muted #161c1f` →
`--bg-elevated #1a2025` → `--bg-strong #1e272c`。凸起元素使用更高的下一个层级。它不使用阴影。

**2. 恰好一个强调色，而且大部分情况下不用于填充。**
`--accent #00d97e` 会显示为 1px 边框、活动导航项上的 3px 导轨，以及 6% 的辉光。它只填充徽章计数和色板。两个强调色代表另一种设计；添加一个强调色是一项决策，而不是微调。

**3. 系统中只有一个阴影带有颜色。**卡片悬停：
`0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,217,126,.06)`——强调色的强度为 6%。
其他地方的层次都遵循规则 1。

**4. 两种字体面孔，按意义而不是按品味划分。**
Geist 是界面所使用的声音——标题、导航、控件、正文。
Geist Mono 是*机器事实*：任何人会选择并粘贴的内容。ID、agent slug、路径、金额、版本、时间戳、裁决令牌、命令。判断标准只有一个问题：**有人会复制它吗？**实际测量结果是 115 处等宽字体用法，而展示字体只有 9 处。任务标题使用 Geist，旁边的 ID 使用 Geist Mono——同一行上的两种面孔正是设计意图，而不是不一致。

**5. 数字始终使用等宽数字。** 在
`letter-spacing: -0.02em` 下使用 `font-variant-numeric: tabular-nums`。数值变化时宽度也随之变化的数字，会让人感觉像是操作员未触发的运动。

**6. 短横线不是零。** 未测量值渲染为较浅字重和
`--text3` 的 `—`；已测量的零则按照数字样式渲染为 `0`。每个界面上的每个计数都带有第三种状态，并且必须与零有明显区别。这是整个产品所遵循的内部规则；在这里，它是一条排版规则。

**7. 十二个字体大小标记，绝不使用原始字号。** 11 · 12 · 13 · 14 · 15 · 16 · 19 · 22，
以及数字字号 24 · 30 · 36 · 52，均作为 `--fs-*` 使用。如果某个字号不在这个比例中，要么比例有误，要么元素有误。

**8. 两端的字距调整各自只朝一个方向变化。** ≥22px → `-0.02em`。11px 大写字母 →
`+0.10em`。中间的字号不调整字距。

**9. Geist Mono 的字重绝不高于 500。** 它是内置的 `wght 400 500`；超过该轴范围后，浏览器会合成出模糊的粗体。Geist 支持 400–700；500 是常用字重，600 用于强调，700 仅用于徽章计数。

**10. 桌面端密度是刻意设计的，不会直接迁移。** 控件为 30–32px，
标签为 20px，刻意低于 44px 的触控下限，因为这是供单个操作员使用的指针界面。**移动端或客户端界面不得继承这些数值**；它应采用规则 1–9 以及自身的尺寸。

**11. 每种含义使用一种色相，且颜色绝不单独承载含义。** 每种状态颜色都要与字形或文字配对。绿色/红色/灰色分别配合 ▲/▼/—，这样即使读者无法区分这些颜色，行内容仍然有效。

**12. Latin 子集，自托管，52 KB。** 两个可变字体，使用 `font-display: swap`，
不使用 CDN。西里尔字母以及任何 Latin 之外的字符会在行内回退到系统字体栈，这是为字节数做出的已知外观决策，而不是需要重新发现的缺陷。

## 不要移植的内容

| 不要采用 | 原因 | 应改为 |
|---|---|---|
| 将 30–32px 的控件高度用于任何手指会触碰的元素 | 规则 10——这是供单个操作员使用的指针界面 | 最小 44px，保留规则 1–9 |
| 将站点中的 `clamp()` 流式字号用于看板 | 营销页面需要在所有宽度下阅读；仪表界面则固定在一种宽度 | 使用规则 7 中的固定步长 |
| 将深色阶梯用于客户端产品 | 规则 0——这是我们的身份标识 | 通过 `committed-aesthetic` 选择 |
| 将 `--max: 1100px` 用于看板页面 | 看板内容是行和卡片，而不是段落 | 只有 Docs 阅读器限制内容宽度，为 72ch |

## 组件画廊

已在发布的看板规范中完成渲染，画板中包含所有尺寸标注——基础样式、组件、外壳、页面、排版以及未解决的问题。工作源文件位于 `.design-spec/`。在添加组件前先阅读画廊；这比根据规则推导组件更快，而且这些规则本来就是从画廊中提炼出来的。

## 规则的来源，以及仍然存在问题的地方

这种美学经过测量，这意味着它也被**测量为不完美**。
`docs/reference/` 和规范中的问题画板记录了未解决的问题列表——间距和圆角尚未标记化（有 11 个原始 `gap` 值、11 个原始圆角值），站点中有 46 个不同的字号，违反了规则 7，并且浅色主题有三个值低于 AA 下限。本文件陈述的规则如果被源代码违反，那是一个问题，而不是继续违反它的许可。

相关：[`skills/committed-aesthetic/SKILL.md`](../committed-aesthetic/SKILL.md) 用于形式 · [`skills/ui-ux-pro-max/SKILL.md`](../ui-ux-pro-max/SKILL.md) 用于在此不适用时你查阅的目录。