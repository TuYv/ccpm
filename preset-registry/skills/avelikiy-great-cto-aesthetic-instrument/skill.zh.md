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

这是[`skills/committed-aesthetic/SKILL.md`](../committed-aesthetic/SKILL.md)意义上的一种坚定审美：下面的每条规则都可检查，每个数值都**直接从源文件中读取**——
`packages/board/public/index.html` 和 `great_cto-site/styles.css`——而不是为了撰写本文档而选定的。

主题是一台仪器，而不是一份宣传册。一个人通过它读取信息，以决定机器下一步可以做什么。下面的一切都由此而来。

## 规则 0——这是我们的，而不是默认设置

不要因为它就在这里就直接采用它。客户的牙科诊所并不需要一块深色仪表盘。这只适用于**great_cto 自有的界面**；对于客户产品，应当遵循 `committed-aesthetic`，经过审慎选择。

## DNA

**1. 五个表面层级，每层间隔约 5%，深度始终通过层级体现。**
`--bg-page #0a0e0c` → `--bg-card #11161a` → `--bg-muted #161c1f` →
`--bg-elevated #1a2025` → `--bg-strong #1e272c`。凸起元素使用更高的下一层级，而不是添加阴影。

**2. 严格只有一种强调色，而且大多数时候不用于填充。**
`--accent #00d97e` 以 1px 边框、活动导航项上的 3px 轨道，以及 6% 的光晕出现。它只填充徽章计数和色块。两种强调色是另一种设计；添加一种强调色是一项决策，而不是微调。

**3. 整个系统中只有一种阴影带有色彩。**卡片悬停：
`0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,217,126,.06)`——强调色占 6%。
其他地方的深度都遵循规则 1。

**4. 两种字体，按含义而非品味划分。**
Geist 是界面表达的声音——标题、导航、控件、正文。
Geist Mono 是*机器事实*：任何人可能选中并复制粘贴的内容。Id、agent slug、路径、金额、版本、时间戳、判定标记、命令。判断标准只有一个问题：**有人会复制它吗？**实际统计为 115 处等宽字体使用，对比 9 处展示字体使用。任务标题使用 Geist，旁边的 id 使用 Geist Mono——同一行上的两种字体正是重点，而不是不一致。

**5. 数字始终使用等宽数字。** `font-variant-numeric: tabular-nums` 配合
`letter-spacing: -0.02em`。一个数字的值变化时，如果宽度也随之变化，读起来就像是操作员未触发的运动。

**6. 短横线不是零。**未测量的值以较轻字重和 `--text3` 渲染为 `—`；测量结果为零时，则按照数字样式渲染为 `0`。每个界面上的每个计数都带有第三种状态，而且必须在视觉上区别于零。这是整个产品赖以建立的内部规则；在这里，它是一条排版规则。

**7. 十二个字号令牌，绝不使用原始字号。**11 · 12 · 13 · 14 · 15 · 16 · 19 · 22，
以及数值字号 24 · 30 · 36 · 52，均作为 `--fs-*` 使用。如果某个字号不在这个尺度上，要么尺度有误，要么元素有误。

**8. 字距在两端只朝一个方向变化。**≥22px → `-0.02em`。11px 大写字母 →
`+0.10em`。中间的字号不调整字距。

**9. Geist Mono 的字重绝不高于 500。**它是内置的 `wght 400 500`；超过该轴范围后，浏览器会合成出模糊的粗体。Geist 支持 400–700；500 是常用字重，600 用于强调，700 仅用于徽章计数。

**10. 桌面端密度是刻意设计的，不可照搬。** 控件为 30–32px，
chips 为 20px——这是有意低于 44px 触控下限的，因为这里是供单一操作员使用的指针操作界面。**移动端或客户端界面不得继承这些数值**；它应采用规则 1–9 以及自身的尺寸。

**11. 每种含义使用一种色相，且颜色绝不单独承载含义。** 每种状态颜色都配有字形或文字。绿色/红色/灰色分别搭配 ▲/▼/—，这样即使读者无法区分这些颜色，该行仍然有效。

**12. 拉丁字母子集，自托管，52 KB。** 两套可变字体，`font-display: swap`，
不使用 CDN。西里尔字母以及拉丁字母之外的任何字符会在行内回退到系统字体栈——这是为了字节数而做出的已知外观决策，并非需要重新发现的 bug。

## 不要移植的内容

| 不要采用 | 原因 | 应改为 |
|---|---|---|
| 将 30–32px 的控件高度用于任何手指会触碰的界面 | 规则 10——这是供单一操作员使用的指针操作界面 | 最小 44px，保留规则 1–9 |
| 将网站中的 `clamp()` 流式字号用于控制板 | 营销页面需要在各种宽度下阅读；仪表界面则固定在一种宽度下使用 | 采用规则 7 中的固定步进 |
| 将深色阶梯用于客户端产品 | 规则 0——这是我们的身份标识 | 通过 `committed-aesthetic` 进行选择 |
| 将 `--max: 1100px` 用于控制板屏幕 | 控制板的内容是行和卡片，而不是段落 | 只有 Docs 阅读器将文本宽度限制为 72ch |

## 组件图库

在已发布的控制板规范中完成渲染，画板上标注了每一项尺寸——包括基础、组件、外壳、屏幕、排版和未解决的问题。工作源文件位于 `.design-spec/`。添加组件前先阅读图库；这比根据规则推导组件更快，而且这些规则本来就是基于图库编写的。

## 这些规则的来源，以及它们仍然存在的问题

这种美学经过测量，这意味着它也被**测量为不完美**。
`docs/reference/` 以及规范中的问题画板列出了未解决的问题——间距和圆角尚未 token 化（11 个原始 `gap` 值、11 个原始圆角值），网站中有 46 种不同的字号，不符合规则 7，并且浅色主题有三个值低于 AA 下限。本文件声明的规则若与源文件存在冲突，那是一个问题，而不是进一步违反该规则的许可。

相关内容：[`skills/committed-aesthetic/SKILL.md`](../committed-aesthetic/SKILL.md)
了解表单；当这些规则不适用时，请参阅 [`skills/ui-ux-pro-max/SKILL.md`](../ui-ux-pro-max/SKILL.md)
中的目录。